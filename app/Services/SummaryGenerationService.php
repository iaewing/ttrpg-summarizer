<?php

namespace App\Services;

use Exception;
use App\Models\Summary;
use App\Models\Campaign;
use App\Models\GameSession;
use App\Models\Transcription;
use Illuminate\Support\Facades\Log;

class SummaryGenerationService
{
    public function __construct(
        private GeminiService $geminiService
    ) {}

    /**
     * Generate a summary for a game session
     */
    public function generateSessionSummary(GameSession $session, string $type = 'full'): Summary
    {
        // Validate summary type
        $validTypes = ['full', 'highlights', 'character_actions', 'plot_points'];
        if (!in_array($type, $validTypes)) {
            throw new Exception("Invalid summary type: {$type}");
        }

        // Get all transcriptions for this session
        $transcriptions = $this->getSessionTranscriptions($session);
        
        if ($transcriptions->isEmpty()) {
            throw new Exception("No transcriptions found for session: {$session->title}");
        }

        // Combine all transcripts
        $combinedTranscript = $this->combineTranscripts($transcriptions);
        
        // Build context for AI
        $context = [
            'campaign_name' => $session->campaign->name,
            'session_title' => $session->title,
            'session_number' => $session->session_number,
            'game_system' => $session->campaign->game_system,
        ];

        try {
            // Generate summary using AI
            $aiResponse = $this->geminiService->generateSummary($combinedTranscript, $type, $context);
            
            // Create and save summary
            $summary = Summary::create([
                'game_session_id' => $session->id,
                'title' => $this->generateSummaryTitle($session, $type),
                'type' => $type,
                'content' => $aiResponse['content'],
                'metadata' => $this->extractMetadata($aiResponse['content'], $context),
                'confidence' => $this->calculateConfidence($aiResponse),
                'generated_by' => 'ai',
                'status' => 'draft',
            ]);

            Log::info("Generated {$type} summary for session {$session->id}");
            
            return $summary;

        } catch (Exception $e) {
            Log::error("Failed to generate summary for session {$session->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate a campaign-level summary
     */
    public function generateCampaignSummary(int $campaignId): Summary
    {
        $campaign = Campaign::query()
            ->with(['sessions.summaries'])
            ->findOrFail($campaignId);

        // Get all full summaries from sessions
        $sessionSummaries = [];
        foreach ($campaign->sessions as $session) {
            $fullSummary = $session->summaries()->where('type', 'full')->first();
            if ($fullSummary) {
                $sessionSummaries[] = [
                    'session_number' => $session->session_number,
                    'title' => $session->title,
                    'content' => $fullSummary->content,
                ];
            }
        }

        if (empty($sessionSummaries)) {
            throw new Exception("No session summaries found for campaign: {$campaign->name}");
        }

        $context = [
            'campaign_name' => $campaign->name,
            'game_system' => $campaign->game_system,
        ];

        try {
            $aiResponse = $this->geminiService->generateCampaignSummary($sessionSummaries, $context);
            
            // For campaign summaries, we'll create a special entry linked to the most recent session
            $latestSession = $campaign->sessions()->orderBy('session_date', 'desc')->first();
            
            $summary = Summary::create([
                'game_session_id' => $latestSession->id,
                'title' => "Campaign Overview: {$campaign->name}",
                'type' => 'campaign_overview',
                'content' => $aiResponse['content'],
                'metadata' => [
                    'campaign_id' => $campaign->id,
                    'sessions_included' => count($sessionSummaries),
                    'summary_scope' => 'campaign',
                ],
                'confidence' => $this->calculateConfidence($aiResponse),
                'generated_by' => 'ai',
                'status' => 'draft',
            ]);

            Log::info("Generated campaign summary for campaign {$campaign->id}");
            
            return $summary;

        } catch (Exception $e) {
            Log::error("Failed to generate campaign summary for campaign {$campaign->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate a "Previously on..." recap
     */
    public function generatePreviouslyOn(int $campaignId, int $sessionCount = 3): Summary
    {
        $campaign = Campaign::query()
            ->with(['sessions.summaries'])
            ->findOrFail($campaignId);

        // Get recent session summaries
        $recentSessions = [];
        $sessions = $campaign->sessions()
            ->orderBy('session_date', 'desc')
            ->take($sessionCount)
            ->get();

        foreach ($sessions as $session) {
            $fullSummary = $session->summaries()->where('type', 'full')->first();
            if ($fullSummary) {
                $recentSessions[] = [
                    'session_number' => $session->session_number,
                    'title' => $session->title,
                    'content' => $fullSummary->content,
                ];
            }
        }

        if (empty($recentSessions)) {
            throw new Exception("No recent session summaries found for campaign: {$campaign->name}");
        }

        $context = [
            'campaign_name' => $campaign->name,
            'game_system' => $campaign->game_system,
        ];

        try {
            $aiResponse = $this->geminiService->generatePreviouslyOn($recentSessions, $context);
            
            $latestSession = $sessions->first();
            
            $summary = Summary::create([
                'game_session_id' => $latestSession->id,
                'title' => "Previously on {$campaign->name}...",
                'type' => 'previously_on',
                'content' => $aiResponse['content'],
                'metadata' => [
                    'campaign_id' => $campaign->id,
                    'sessions_included' => count($recentSessions),
                    'summary_scope' => 'recap',
                ],
                'confidence' => $this->calculateConfidence($aiResponse),
                'generated_by' => 'ai',
                'status' => 'draft',
            ]);

            Log::info("Generated 'Previously on' recap for campaign {$campaign->id}");
            
            return $summary;

        } catch (Exception $e) {
            Log::error("Failed to generate 'Previously on' recap for campaign {$campaign->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get all transcriptions for a session
     */
    private function getSessionTranscriptions(GameSession $session): \Illuminate\Database\Eloquent\Collection
    {
        return Transcription::query()
            ->whereHas('recording', function ($query) use ($session) {
                $query->where('game_session_id', $session->id);
            })
            ->where('status', 'completed')
            ->with('recording')
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Combine multiple transcripts into one text
     */
    private function combineTranscripts(\Illuminate\Database\Eloquent\Collection $transcriptions): string
    {
        $combined = '';
        
        foreach ($transcriptions as $transcription) {
            $combined .= "\n\n--- Recording: {$transcription->recording->name} ---\n\n";
            $combined .= $transcription->transcript;
        }
        
        return trim($combined);
    }

    /**
     * Generate an appropriate title for the summary
     */
    private function generateSummaryTitle(GameSession $session, string $type): string
    {
        $baseTitle = "Session {$session->session_number}: {$session->title}";
        
        return match ($type) {
            'full' => $baseTitle . " - Full Summary",
            'highlights' => $baseTitle . " - Highlights",
            'character_actions' => $baseTitle . " - Character Actions",
            'plot_points' => $baseTitle . " - Plot Points",
            default => $baseTitle . " - Summary",
        };
    }

    /**
     * Extract metadata from the generated content
     */
    private function extractMetadata(string $content, array $context): array
    {
        // This could be enhanced with more sophisticated NLP
        // For now, we'll extract basic metrics
        return [
            'word_count' => str_word_count($content),
            'character_count' => strlen($content),
            'estimated_reading_time' => max(1, ceil(str_word_count($content) / 200)),
            'context' => $context,
            'generated_at' => now()->toISOString(),
        ];
    }

    /**
     * Calculate confidence score from AI response
     */
    private function calculateConfidence(array $aiResponse): float
    {
        // For now, return a base confidence
        // This could be enhanced based on AI response metadata
        $contentLength = strlen($aiResponse['content'] ?? '');
        
        if ($contentLength < 100) {
            return 0.3; // Very short content, low confidence
        } elseif ($contentLength < 500) {
            return 0.6; // Medium content
        } else {
            return 0.8; // Longer content, higher confidence
        }
    }

    /**
     * Check if summary generation is available
     */
    public function isAvailable(): bool
    {
        try {
            return !empty(config('services.gemini.api_key'));
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Get available summary types
     */
    public function getAvailableSummaryTypes(): array
    {
        return [
            'full' => 'Full Session Summary',
            'highlights' => 'Key Highlights',
            'character_actions' => 'Character Actions',
            'plot_points' => 'Plot Points',
        ];
    }
} 
<?php

namespace App\Services;

use Exception;

class GeminiService
{
    private string $apiKey;
    private string $model;
    private string $apiUrl;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
        $this->model = config('services.gemini.model', 'gemini-2.0-flash-exp');
        $this->apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' . $this->model . ':generateContent';
        
        if (empty($this->apiKey)) {
            throw new Exception('Gemini API key not configured. Please set GEMINI_API_KEY in your environment.');
        }
    }

    /**
     * Generate content using Gemini API
     */
    public function generateContent(string $prompt, array $options = []): array
    {
        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => array_merge([
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 8192,
            ], $options['generationConfig'] ?? [])
        ];

        return $this->makeRequest($payload);
    }

    /**
     * Generate a structured summary from transcription data
     */
    public function generateSummary(string $transcriptText, string $summaryType, array $context = []): array
    {
        $prompt = $this->buildSummaryPrompt($transcriptText, $summaryType, $context);
        
        return $this->generateContent($prompt, [
            'generationConfig' => [
                'temperature' => 0.5, // Lower temperature for more consistent summaries
                'topK' => 20,
                'topP' => 0.8,
            ]
        ]);
    }

    /**
     * Build the appropriate prompt based on summary type
     */
    private function buildSummaryPrompt(string $transcriptText, string $summaryType, array $context): string
    {
        $campaignName = $context['campaign_name'] ?? 'Unknown Campaign';
        $sessionTitle = $context['session_title'] ?? 'Unknown Session';
        $sessionNumber = $context['session_number'] ?? '';
        $gameSystem = $context['game_system'] ?? 'tabletop RPG';

        $baseContext = "You are analyzing a {$gameSystem} session transcript from the campaign '{$campaignName}'. ";
        if ($sessionNumber) {
            $baseContext .= "This is session #{$sessionNumber} titled '{$sessionTitle}'. ";
        }

        switch ($summaryType) {
            case 'full':
                return $baseContext . "Please provide a comprehensive summary of this entire session. Include:
                - Main story events and plot developments
                - Character actions and decisions
                - Important NPCs introduced or featured
                - Key locations visited
                - Combat encounters or challenges
                - Treasure, items, or rewards obtained
                - Cliffhangers or unresolved plot threads
                
                Structure your response with clear sections and be detailed but concise.
                
                Transcript:
                {$transcriptText}";

            case 'highlights':
                return $baseContext . "Please extract the key highlights and memorable moments from this session. Focus on:
                - The 3-5 most important story beats
                - Epic character moments or critical successes/failures
                - Major plot revelations
                - Memorable quotes or roleplay moments
                - Significant character development
                
                Keep it engaging and focus on what players would remember most.
                
                Transcript:
                {$transcriptText}";

            case 'character_actions':
                return $baseContext . "Please summarize what each character accomplished in this session. For each character mentioned, include:
                - Key actions they took
                - Important decisions they made
                - Character development or growth
                - Relationships with other characters or NPCs
                - Combat contributions
                - Any character-specific plot advancement
                
                Organize by character name.
                
                Transcript:
                {$transcriptText}";

            case 'plot_points':
                return $baseContext . "Please extract the main plot points and story progression from this session. Focus on:
                - Main quest advancement
                - Side quest developments
                - New plot hooks introduced
                - Mysteries revealed or deepened
                - Faction developments
                - World-building elements
                - Connections to previous sessions
                - Setup for future sessions
                
                Organize chronologically or by plot thread.
                
                Transcript:
                {$transcriptText}";

            default:
                return $baseContext . "Please provide a summary of this session.
                
                Transcript:
                {$transcriptText}";
        }
    }

    /**
     * Generate a campaign-level summary from multiple sessions
     */
    public function generateCampaignSummary(array $sessionSummaries, array $context = []): array
    {
        $campaignName = $context['campaign_name'] ?? 'Unknown Campaign';
        $gameSystem = $context['game_system'] ?? 'tabletop RPG';
        $sessionCount = count($sessionSummaries);

        $summariesText = '';
        foreach ($sessionSummaries as $summary) {
            $summariesText .= "Session #{$summary['session_number']}: {$summary['title']}\n";
            $summariesText .= $summary['content'] . "\n\n";
        }

        $prompt = "You are creating a campaign overview for '{$campaignName}', a {$gameSystem} campaign spanning {$sessionCount} sessions.

        Please provide a comprehensive campaign summary that includes:
        - Overall story arc and progression
        - Major character development across sessions
        - Key NPCs and their roles in the story
        - Important locations and world-building
        - Major plot threads and how they've evolved
        - Significant items, treasures, or powers gained
        - Current status and ongoing mysteries
        - Character relationships and party dynamics

        Base your summary on these session summaries:

        {$summariesText}";

        return $this->generateContent($prompt);
    }

    /**
     * Generate a "Previously on..." style recap
     */
    public function generatePreviouslyOn(array $recentSessions, array $context = []): array
    {
        $campaignName = $context['campaign_name'] ?? 'Unknown Campaign';
        
        $recentText = '';
        foreach ($recentSessions as $session) {
            $recentText .= "Session #{$session['session_number']}: {$session['title']}\n";
            $recentText .= $session['content'] . "\n\n";
        }

        $prompt = "Create an exciting 'Previously on {$campaignName}...' style recap. This should:
        - Be engaging and dramatic, like a TV show recap
        - Highlight the most important recent events
        - Build anticipation for the next session
        - Use present tense and active voice
        - Keep it concise but exciting (2-3 paragraphs max)
        - End with a cliffhanger or hook if possible

        Base the recap on these recent sessions:

        {$recentText}";

        return $this->generateContent($prompt);
    }

    /**
     * Make HTTP request to Gemini API
     */
    private function makeRequest(array $payload): array
    {
        $curl = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL => $this->apiUrl . '?key=' . $this->apiKey,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
            ],
            CURLOPT_TIMEOUT => 60,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $response = curl_exec($curl);
        
        if (curl_error($curl)) {
            $error = curl_error($curl);
            curl_close($curl);
            throw new Exception("cURL error: {$error}");
        }

        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);

        if ($httpCode !== 200) {
            throw new Exception("Gemini API error {$httpCode}: {$response}");
        }

        $data = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Failed to parse JSON response: " . json_last_error_msg());
        }

        return $this->processGeminiResponse($data);
    }

    /**
     * Process Gemini API response
     */
    private function processGeminiResponse(array $data): array
    {
        $result = [
            'content' => '',
            'full_response' => $data
        ];

        if (isset($data['candidates'][0]['content']['parts'][0]['text'])) {
            $result['content'] = $data['candidates'][0]['content']['parts'][0]['text'];
        }

        return $result;
    }

    /**
     * Get available models
     */
    public function getAvailableModels(): array
    {
        return [
            'gemini-2.5-flash',
        ];
    }
} 
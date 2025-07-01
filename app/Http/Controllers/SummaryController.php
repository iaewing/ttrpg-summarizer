<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\GameSession;
use App\Models\Summary;
use App\Services\SummaryGenerationService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SummaryController extends Controller
{
    public function __construct(
        private SummaryGenerationService $summaryService
    ) {}

    /**
     * Display summaries for a campaign
     */
    public function index(Request $request, Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $summaries = Summary::query()
            ->whereHas('gameSession', function ($query) use ($campaign) {
                $query->where('campaign_id', $campaign->id);
            })
            ->with(['gameSession'])
            ->latest()
            ->paginate(20);

        return Inertia::render('summaries/index', [
            'campaign' => $campaign,
            'summaries' => $summaries,
            'summaryTypes' => $this->summaryService->getAvailableSummaryTypes(),
            'canGenerate' => $this->summaryService->isAvailable(),
        ]);
    }

    /**
     * Show a specific summary
     */
    public function show(Summary $summary)
    {
        $summary->load(['gameSession.campaign']);
        
        if ($summary->gameSession->campaign->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('summaries/show', [
            'summary' => $summary,
            'campaign' => $summary->gameSession->campaign,
            'session' => $summary->gameSession,
        ]);
    }

    /**
     * Generate a session summary
     */
    public function generateSession(Request $request, GameSession $session)
    {
        if ($session->campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'type' => 'required|in:full,highlights,character_actions,plot_points',
        ]);

        if (!$this->summaryService->isAvailable()) {
            return back()->withErrors(['summary' => 'Summary generation is not available. Please configure Gemini API key.']);
        }

        try {
            $summary = $this->summaryService->generateSessionSummary($session, $request->type);

            return redirect()->route('summaries.show', $summary)
                ->with('success', 'Summary generated successfully!');

        } catch (Exception $e) {
            return back()->withErrors(['summary' => 'Failed to generate summary: ' . $e->getMessage()]);
        }
    }

    /**
     * Generate a campaign overview
     */
    public function generateCampaign(Request $request, Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            abort(403);
        }

        if (!$this->summaryService->isAvailable()) {
            return back()->withErrors(['summary' => 'Summary generation is not available. Please configure Gemini API key.']);
        }

        try {
            $summary = $this->summaryService->generateCampaignSummary($campaign->id);

            return redirect()->route('summaries.show', $summary)
                ->with('success', 'Campaign overview generated successfully!');

        } catch (Exception $e) {
            return back()->withErrors(['summary' => 'Failed to generate campaign overview: ' . $e->getMessage()]);
        }
    }

    /**
     * Generate a "Previously on..." recap
     */
    public function generateRecap(Request $request, Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'session_count' => 'sometimes|integer|min:1|max:10',
        ]);

        if (!$this->summaryService->isAvailable()) {
            return back()->withErrors(['summary' => 'Summary generation is not available. Please configure Gemini API key.']);
        }

        try {
            $sessionCount = $request->input('session_count', 3);
            $summary = $this->summaryService->generatePreviouslyOn($campaign->id, $sessionCount);

            return redirect()->route('summaries.show', $summary)
                ->with('success', 'Recap generated successfully!');

        } catch (Exception $e) {
            return back()->withErrors(['summary' => 'Failed to generate recap: ' . $e->getMessage()]);
        }
    }

    /**
     * Update summary status
     */
    public function updateStatus(Request $request, Summary $summary)
    {
        $summary->load('gameSession.campaign');
        
        if ($summary->gameSession->campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:draft,reviewing,approved,published',
        ]);

        $summary->update([
            'status' => $request->status,
        ]);

        return back()->with('success', 'Summary status updated successfully!');
    }

    /**
     * Edit summary content
     */
    public function edit(Summary $summary)
    {
        $summary->load(['gameSession.campaign']);
        
        if ($summary->gameSession->campaign->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('summaries/edit', [
            'summary' => $summary,
            'campaign' => $summary->gameSession->campaign,
            'session' => $summary->gameSession,
        ]);
    }

    /**
     * Update summary content
     */
    public function update(Request $request, Summary $summary)
    {
        $summary->load('gameSession.campaign');
        
        if ($summary->gameSession->campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'status' => 'sometimes|in:draft,reviewing,approved,published',
        ]);

        $summary->update([
            'title' => $request->title,
            'content' => $request->content,
            'status' => $request->input('status', $summary->status),
            'generated_by' => $summary->generated_by === 'ai' ? 'hybrid' : 'user',
        ]);

        return redirect()->route('summaries.show', $summary)
            ->with('success', 'Summary updated successfully!');
    }

    /**
     * Delete a summary
     */
    public function destroy(Summary $summary)
    {
        $summary->load('gameSession.campaign');
        
        if ($summary->gameSession->campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $campaignId = $summary->gameSession->campaign->id;
        $summary->delete();

        return redirect()->route('campaigns.summaries.index', $campaignId)
            ->with('success', 'Summary deleted successfully!');
    }

    /**
     * Get session summaries for API
     */
    public function sessionSummaries(GameSession $session)
    {
        if ($session->campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $summaries = $session->summaries()
            ->select(['id', 'title', 'type', 'status', 'confidence', 'created_at'])
            ->get();

        return response()->json($summaries);
    }
} 
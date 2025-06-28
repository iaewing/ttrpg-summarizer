<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CampaignController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $campaigns = Campaign::query()
            ->where('user_id', Auth::id())
            ->withCount(['sessions', 'activePlayers', 'activeCharacters'])
            ->orderBy('is_active', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('campaigns/index', [
            'campaigns' => $campaigns,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('campaigns/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'game_system' => 'nullable|string|max:255',
            'settings' => 'nullable|array',
        ]);

        $campaign = Campaign::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'description' => $request->description,
            'game_system' => $request->game_system,
            'settings' => $request->settings ?? [],
            'is_active' => true,
        ]);

        return redirect()->route('campaigns.show', $campaign)
            ->with('success', 'Campaign created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $campaign->load([
            'sessions' => function ($query) {
                $query->orderBy('session_number', 'desc')->orderBy('session_date', 'desc');
            },
            'sessions.recordings.transcription',
            'activePlayers',
            'activeCharacters.player'
        ]);

        return Inertia::render('campaigns/show', [
            'campaign' => $campaign,
            'stats' => [
                'total_sessions' => $campaign->sessions_count ?? $campaign->sessions->count(),
                'completed_sessions' => $campaign->sessions->where('status', 'completed')->count(),
                'active_players' => $campaign->activePlayers->count(),
                'active_characters' => $campaign->activeCharacters->count(),
                'total_recordings' => $campaign->sessions->sum(fn($session) => $session->recordings->count()),
                'transcribed_recordings' => $campaign->sessions->sum(fn($session) => 
                    $session->recordings->whereNotNull('transcription')->count()
                ),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('campaigns/edit', [
            'campaign' => $campaign,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'game_system' => 'nullable|string|max:255',
            'settings' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $campaign->update([
            'name' => $request->name,
            'description' => $request->description,
            'game_system' => $request->game_system,
            'settings' => $request->settings ?? [],
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->route('campaigns.show', $campaign)
            ->with('success', 'Campaign updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $campaignName = $campaign->name;
        $campaign->delete();

        return redirect()->route('campaigns.index')
            ->with('success', "Campaign '{$campaignName}' deleted successfully!");
    }
}

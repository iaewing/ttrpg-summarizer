<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Player;
use App\Models\Campaign;
use App\Models\Character;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

        $allPlayers = Player::all();
        $availablePlayers = $allPlayers->whereNotIn('id', $campaign->activePlayers->pluck('id'));
        
        $allCharacters = Character::with('player')->get();
        $availableCharacters = $allCharacters->whereNotIn('id', $campaign->activeCharacters->pluck('id'));

        return Inertia::render('campaigns/show', [
            'campaign' => $campaign,
            'availablePlayers' => $availablePlayers->values(),
            'availableCharacters' => $availableCharacters->values(),
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

    /**
     * Add a player to the campaign
     */
    public function addPlayer(Request $request, Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'player_id' => 'required|exists:players,id',
            'role' => 'required|in:player,dm',
            'notes' => 'nullable|string',
        ]);

        // Check if player is already in the campaign
        if ($campaign->players()->where('player_id', $request->player_id)->exists()) {
            return back()->withErrors(['player_id' => 'Player is already in this campaign.']);
        }

        $campaign->players()->attach($request->player_id, [
            'role' => $request->role,
            'is_active' => true,
            'joined_at' => now(),
            'notes' => $request->notes,
        ]);

        $player = Player::find($request->player_id);
        
        return back()->with('success', "Added {$player->name} to the campaign!");
    }

    /**
     * Remove a player from the campaign
     */
    public function removePlayer(Request $request, Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'player_id' => 'required|exists:players,id',
        ]);

        $player = Player::find($request->player_id);
        
        if (!$campaign->players()->where('player_id', $request->player_id)->exists()) {
            return back()->withErrors(['player_id' => 'Player is not in this campaign.']);
        }

        $campaign->players()->detach($request->player_id);
        
        return back()->with('success', "Removed {$player->name} from the campaign!");
    }

    /**
     * Add a character to the campaign
     */
    public function addCharacter(Request $request, Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'character_id' => 'required|exists:characters,id',
            'campaign_notes' => 'nullable|string',
        ]);

        // Check if character is already in the campaign
        if ($campaign->characters()->where('character_id', $request->character_id)->exists()) {
            return back()->withErrors(['character_id' => 'Character is already in this campaign.']);
        }

        $campaign->characters()->attach($request->character_id, [
            'introduced_at' => now(),
            'is_active' => true,
            'campaign_notes' => $request->campaign_notes,
        ]);

        $character = Character::find($request->character_id);
        
        return back()->with('success', "Added {$character->name} to the campaign!");
    }

    /**
     * Remove a character from the campaign
     */
    public function removeCharacter(Request $request, Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'character_id' => 'required|exists:characters,id',
        ]);

        $character = Character::find($request->character_id);
        
        if (!$campaign->characters()->where('character_id', $request->character_id)->exists()) {
            return back()->withErrors(['character_id' => 'Character is not in this campaign.']);
        }

        $campaign->characters()->detach($request->character_id);
        
        return back()->with('success', "Removed {$character->name} from the campaign!");
    }
}

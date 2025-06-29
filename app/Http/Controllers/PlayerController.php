<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlayerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $players = Player::query()
            ->withCount(['characters', 'activeCampaigns'])
            ->with(['activeCharacters', 'activeCampaigns'])
            ->orderBy('name')
            ->get();

        return Inertia::render('players/index', [
            'players' => $players,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('players/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'is_dm' => 'boolean',
            'notes' => 'nullable|string',
            'preferences' => 'nullable|array',
        ]);

        $player = Player::create([
            'name' => $request->name,
            'email' => $request->email,
            'is_dm' => $request->is_dm ?? false,
            'notes' => $request->notes,
            'preferences' => $request->preferences ?? [],
        ]);

        return redirect()->route('players.show', $player)
            ->with('success', 'Player created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Player $player)
    {
        $player->load([
            'characters' => function ($query) {
                $query->with('campaigns')->orderBy('is_active', 'desc')->orderBy('name');
            },
            'campaigns' => function ($query) {
                $query->withPivot(['role', 'is_active'])->orderBy('name');
            }
        ]);

        return Inertia::render('players/show', [
            'player' => $player,
            'stats' => [
                'total_characters' => $player->characters->count(),
                'active_characters' => $player->characters->where('is_active', true)->count(),
                'total_campaigns' => $player->campaigns->count(),
                'active_campaigns' => $player->campaigns->where('pivot.is_active', true)->count(),
                'dm_campaigns' => $player->campaigns->where('pivot.role', 'dm')->where('pivot.is_active', true)->count(),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Player $player)
    {
        return Inertia::render('players/edit', [
            'player' => $player,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Player $player)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'is_dm' => 'boolean',
            'notes' => 'nullable|string',
            'preferences' => 'nullable|array',
        ]);

        $player->update([
            'name' => $request->name,
            'email' => $request->email,
            'is_dm' => $request->is_dm ?? false,
            'notes' => $request->notes,
            'preferences' => $request->preferences ?? [],
        ]);

        return redirect()->route('players.show', $player)
            ->with('success', 'Player updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Player $player)
    {
        $playerName = $player->name;
        $player->delete();

        return redirect()->route('players.index')
            ->with('success', "Player '{$playerName}' deleted successfully!");
    }
} 
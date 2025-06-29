<?php

namespace App\Http\Controllers;

use App\Models\GameSession;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GameSessionController extends Controller
{
    public function index(Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $sessions = $campaign->sessions()
            ->withCount(['recordings'])
            ->orderBy('session_number', 'desc')
            ->orderBy('session_date', 'desc')
            ->get();

        return Inertia::render('sessions/index', [
            'campaign' => $campaign,
            'sessions' => $sessions,
        ]);
    }

    public function create(Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            abort(403);
        }

        // Get next session number
        $nextSessionNumber = $campaign->sessions()->max('session_number') + 1;

        return Inertia::render('sessions/create', [
            'campaign' => $campaign,
            'nextSessionNumber' => $nextSessionNumber,
        ]);
    }

    public function store(Request $request, Campaign $campaign)
    {
        if ($campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'session_number' => 'nullable|integer|min:1',
            'session_date' => 'nullable|date',
            'duration_minutes' => 'nullable|integer|min:1',
            'notes' => 'nullable|array',
            'status' => 'required|in:planned,in_progress,completed,cancelled',
        ]);

        $session = GameSession::create([
            'campaign_id' => $campaign->id,
            'title' => $request->title,
            'description' => $request->description,
            'session_number' => $request->session_number,
            'session_date' => $request->session_date,
            'duration_minutes' => $request->duration_minutes,
            'notes' => $request->notes ?? [],
            'status' => $request->status ?? 'planned',
        ]);

        return redirect()->route('campaigns.sessions.show', [$campaign, $session])
            ->with('success', 'Game session created successfully!');
    }

    public function show(Campaign $campaign, GameSession $session)
    {
        if ($campaign->user_id !== Auth::id() || $session->campaign_id !== $campaign->id) {
            abort(403);
        }

        $session->load([
            'recordings' => function ($query) {
                $query->orderBy('recording_order');
            },
            'recordings.transcription.speakers.player',
            'recordings.transcription.speakers.character',
            'summaries' => function ($query) {
                $query->orderBy('created_at', 'desc');
            }
        ]);

        // Get campaign players and characters for speaker identification
        $campaign->load(['activePlayers.activeCharacters']);

        // Collect all speakers from all transcriptions in this session
        $allSpeakers = $session->recordings
            ->filter(fn($recording) => $recording->transcription !== null)
            ->flatMap(fn($recording) => $recording->transcription->speakers ?? collect());

        // Group speakers by their identification status and create session-level speaker summary
        $sessionSpeakers = $this->getSessionSpeakers($allSpeakers);

        return Inertia::render('sessions/show', [
            'campaign' => $campaign,
            'session' => $session,
            'sessionSpeakers' => $sessionSpeakers,
            'players' => $campaign->activePlayers,
            'stats' => [
                'total_recordings' => $session->recordings->count(),
                'transcribed_recordings' => $session->recordings->filter(fn($recording) => $recording->transcription !== null)->count(),
                'total_summaries' => $session->summaries->count(),
                'identified_speakers' => $allSpeakers->filter(fn($speaker) => $speaker->player_id !== null)->count(),
                'total_unique_speakers' => $sessionSpeakers->count(),
            ]
        ]);
    }

    /**
     * Get session-level speaker summary
     */
    private function getSessionSpeakers($allSpeakers)
    {
        // Group speakers by their current identification
        $speakerGroups = [];

        foreach ($allSpeakers as $speaker) {
            $groupKey = $this->getSpeakerGroupKey($speaker);

            if (!isset($speakerGroups[$groupKey])) {
                $speakerGroups[$groupKey] = [
                    'id' => $groupKey,
                    'speakers' => [],
                    'player' => $speaker->player,
                    'character' => $speaker->character,
                    'speaker_type' => $speaker->speaker_type,
                    'total_segments' => 0,
                    'recordings' => [],
                ];
            }

            $speakerGroups[$groupKey]['speakers'][] = $speaker;
            $speakerGroups[$groupKey]['total_segments'] += count($speaker->segments ?? []);

            $recordingName = $speaker->transcription->recording->name ?? 'Unknown Recording';
            if (!in_array($recordingName, $speakerGroups[$groupKey]['recordings'])) {
                $speakerGroups[$groupKey]['recordings'][] = $recordingName;
            }
        }

        return collect($speakerGroups)->values();
    }

    /**
     * Create a group key for speakers that should be considered the same person
     */
    private function getSpeakerGroupKey($speaker)
    {
        // If speaker is identified, group by player+character combination
        if ($speaker->player_id || $speaker->character_id) {
            return "identified_{$speaker->player_id}_{$speaker->character_id}";
        }

        // If unidentified, group by speaker_id (this assumes same speaker_id across recordings = same person)
        // This is a simplification - in reality, you might want more sophisticated matching
        return "unidentified_speaker_{$speaker->speaker_id}";
    }

    public function edit(Campaign $campaign, GameSession $session)
    {
        if ($campaign->user_id !== Auth::id() || $session->campaign_id !== $campaign->id) {
            abort(403);
        }

        return Inertia::render('sessions/edit', [
            'campaign' => $campaign,
            'session' => $session,
        ]);
    }

    public function update(Request $request, Campaign $campaign, GameSession $session)
    {
        if ($campaign->user_id !== Auth::id() || $session->campaign_id !== $campaign->id) {
            abort(403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'session_number' => 'nullable|integer|min:1',
            'session_date' => 'nullable|date',
            'duration_minutes' => 'nullable|integer|min:1',
            'notes' => 'nullable|array',
            'status' => 'required|in:planned,in_progress,completed,cancelled',
        ]);

        $session->update([
            'title' => $request->title,
            'description' => $request->description,
            'session_number' => $request->session_number,
            'session_date' => $request->session_date,
            'duration_minutes' => $request->duration_minutes,
            'notes' => $request->notes ?? [],
            'status' => $request->status,
        ]);

        return redirect()->route('campaigns.sessions.show', [$campaign, $session])
            ->with('success', 'Game session updated successfully!');
    }

    public function destroy(Campaign $campaign, GameSession $session)
    {
        if ($campaign->user_id !== Auth::id() || $session->campaign_id !== $campaign->id) {
            abort(403);
        }

        $sessionTitle = $session->title;
        $session->delete();

        return redirect()->route('campaigns.show', $campaign)
            ->with('success', "Session '{$sessionTitle}' deleted successfully!");
    }

    /**
     * Update speaker identification for all matching speakers in the session
     */
    public function updateSessionSpeaker(Request $request, Campaign $campaign, GameSession $session)
    {
        if ($campaign->user_id !== Auth::id() || $session->campaign_id !== $campaign->id) {
            abort(403);
        }

        $request->validate([
            'speaker_group_id' => 'required|string',
            'player_id' => 'nullable|exists:players,id',
            'character_id' => 'nullable|exists:characters,id',
            'speaker_type' => 'required|in:dm,player,npc,unknown',
        ]);

        // If character is provided, ensure it belongs to the player
        if ($request->character_id && $request->player_id) {
            $character = \App\Models\Character::find($request->character_id);
            if ($character->player_id !== (int) $request->player_id) {
                return back()->withErrors(['character_id' => 'Character must belong to the selected player.']);
            }
        }

        // Get all speakers in this session that match the group
        $allSpeakers = $session->recordings()
            ->whereHas('transcription')
            ->with('transcription.speakers')
            ->get()
            ->flatMap(fn($recording) => $recording->transcription->speakers ?? collect());

        // Find speakers that match the group criteria
        $speakersToUpdate = $allSpeakers->filter(function ($speaker) use ($request) {
            $currentGroupKey = $this->getSpeakerGroupKey($speaker);
            return $currentGroupKey === $request->speaker_group_id;
        });

        // Update all matching speakers
        foreach ($speakersToUpdate as $speaker) {
            $speaker->update([
                'player_id' => $request->player_id,
                'character_id' => $request->character_id,
                'speaker_type' => $request->speaker_type,
            ]);
        }

        return back()->with('success', 'Session speaker identification updated successfully!');
    }
}

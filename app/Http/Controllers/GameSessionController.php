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

        return Inertia::render('sessions/show', [
            'campaign' => $campaign,
            'session' => $session,
            'stats' => [
                'total_recordings' => $session->recordings->count(),
                'transcribed_recordings' => $session->recordings->filter(fn($recording) => $recording->transcription !== null)->count(),
                'total_summaries' => $session->summaries->count(),
                'identified_speakers' => $session->recordings
                    ->filter(fn($recording) => $recording->transcription !== null)
                    ->flatMap(fn($recording) => $recording->transcription->speakers ?? collect())
                    ->filter(fn($speaker) => $speaker->player_id !== null)
                    ->count(),
            ]
        ]);
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

        return redirect()->route('campaigns.sessions.index', $campaign)
            ->with('success', "Session '{$sessionTitle}' deleted successfully!");
    }
}

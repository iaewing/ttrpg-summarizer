<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Recording;
use App\Models\GameSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\TranscriptionController;

class RecordingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(GameSession $session)
    {
        // Verify user owns this session through campaign
        if ($session->campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $recordings = $session->recordings()->with('transcription')->orderBy('recording_order')->get();

        return Inertia::render('recordings/index', [
            'session' => $session->load('campaign'),
            'recordings' => $recordings,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(GameSession $session)
    {
        // Verify user owns this session through campaign
        if ($session->campaign->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('recordings/create', [
            'session' => $session->load('campaign'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, GameSession $session)
    {
        // Verify user owns this session through campaign
        if ($session->campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'file' => [
                'required',
                'file',
                'max:102400', // 100MB
                'mimes:mp3,wav,m4a,aac,ogg,webm,flac'
            ],
            'name' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $file = $request->file('file');
        $filename = time() . '_' . $file->getClientOriginalName();
        
        // Store the file
        $path = $file->storeAs('recordings', $filename, 'local');

        // Get next recording order
        $nextOrder = $session->recordings()->max('recording_order') + 1;

        // Create recording record
        $recording = Recording::create([
            'game_session_id' => $session->id,
            'name' => $request->name,
            'original_filename' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'recording_order' => $nextOrder,
            'notes' => $request->notes,
        ]);

        return redirect()->route('campaigns.sessions.show', [$session->campaign_id, $session->id])
            ->with('success', 'Recording uploaded successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(GameSession $session, Recording $recording)
    {
        // Verify user owns this recording through campaign
        if ($session->campaign->user_id !== Auth::id() || $recording->game_session_id !== $session->id) {
            abort(403);
        }

        $recording->load(['transcription.speakers.player', 'transcription.speakers.character']);

        return Inertia::render('recordings/show', [
            'session' => $session->load('campaign'),
            'recording' => $recording,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GameSession $session, Recording $recording)
    {
        // Verify user owns this recording through campaign
        if ($session->campaign->user_id !== Auth::id() || $recording->game_session_id !== $session->id) {
            abort(403);
        }

        // Delete the audio file
        if (Storage::exists($recording->file_path)) {
            Storage::delete($recording->file_path);
        }

        $recording->delete();

        return redirect()->route('sessions.recordings.index', $session)
            ->with('success', 'Recording deleted successfully!');
    }

    public function transcribe(GameSession $session, Recording $recording)
    {
        // Verify user owns this recording through campaign
        if ($session->campaign->user_id !== Auth::id() || $recording->game_session_id !== $session->id) {
            abort(403);
        }

        // Check if transcription already exists
        if ($recording->transcription) {
            return redirect()->route('transcriptions.show', $recording->transcription)
                ->with('info', 'Transcription already exists for this recording.');
        }

        // Create a request with the recording_id and forward to TranscriptionController
        $transcriptionRequest = new Request(['recording_id' => $recording->id]);
        $transcriptionController = new TranscriptionController(app(\App\Services\DeepgramService::class));
        
        return $transcriptionController->store($transcriptionRequest);
    }
}

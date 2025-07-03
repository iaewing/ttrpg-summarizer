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

        $recordings = $session->recordings()
            ->with('transcription')
            ->orderBy('recording_order')
            ->get()
            ->map(function ($recording) {
                $recording->append('audio_url');
                return $recording;
            });

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
        
        // Store the file in the public disk
        $path = $file->storeAs('recordings', $filename, 'public');
        
        // Get the public URL for the stored file
        $publicPath = 'recordings/' . $filename;

        // Get next recording order
        $nextOrder = $session->recordings()->max('recording_order') + 1;

        // Create recording record
        $recording = Recording::create([
            'game_session_id' => $session->id,
            'name' => $request->name,
            'original_filename' => $file->getClientOriginalName(),
            'file_path' => $publicPath,
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
        // Verify user has access to this recording
        if ($session->campaign->user_id !== Auth::id() || $recording->game_session_id !== $session->id) {
            abort(403, 'You do not have permission to view this recording.');
        }

        // Eager load relationships with necessary fields
        $recording->load([
            'transcription' => function($query) {
                $query->select(['id', 'recording_id', 'status', 'transcript', 'metadata']);
            },
            'transcription.speakers' => function($query) {
                $query->select(['id', 'transcription_id', 'player_id', 'character_id', 'name', 'color']);
            },
            'transcription.speakers.player' => function($query) {
                $query->select(['id', 'name']);
            },
            'transcription.speakers.character' => function($query) {
                $query->select(['id', 'name']);
            }
        ]);
        
        // Append the audio URL and other accessors
        $recording->append(['audio_url', 'formatted_duration', 'formatted_file_size']);

        // Prepare the session data with only what's needed
        $sessionData = [
            'id' => $session->id,
            'title' => $session->title,
            'campaign' => [
                'id' => $session->campaign->id,
                'name' => $session->campaign->name,
            ]
        ];

        return Inertia::render('recordings/show', [
            'session' => $sessionData,
            'recording' => $recording->makeVisible(['audio_url', 'formatted_duration', 'formatted_file_size']),
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

        // Delete the audio file from public disk
        if (Storage::disk('public')->exists($recording->file_path)) {
            Storage::disk('public')->delete($recording->file_path);
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

    /**
     * Serve an audio file
     */
    public function serveAudio(GameSession $session, Recording $recording)
    {
        // Verify user has access to this recording
        if ($session->campaign->user_id !== Auth::id() || $recording->game_session_id !== $session->id) {
            abort(403, 'You do not have permission to access this recording.');
        }

        // Get the full path to the file
        $publicPath = storage_path('app/public/' . $recording->file_path);
        $localPath = storage_path('app/' . $recording->file_path);
        
        // Determine which path to use
        $path = null;
        if (file_exists($publicPath)) {
            $path = $publicPath;
        } elseif (file_exists($localPath)) {
            $path = $localPath;
        } else {
            // Log the error for debugging
            \Log::error('Audio file not found in storage', [
                'recording_id' => $recording->id,
                'file_path' => $recording->file_path,
                'public_path' => $publicPath,
                'local_path' => $localPath,
                'exists_public' => file_exists($publicPath),
                'exists_local' => file_exists($localPath)
            ]);
            
            abort(404, 'Audio file not found. Please check if the file exists in the storage.');
        }

        try {
            // Get the file size
            $fileSize = filesize($path);
            $mimeType = mime_content_type($path);
            
            // Set headers for partial content support (for seeking)
            $headers = [
                'Content-Type' => $mimeType,
                'Content-Length' => $fileSize,
                'Accept-Ranges' => 'bytes',
                'Cache-Control' => 'public, max-age=31536000',
            ];

            // Handle range requests (for seeking in audio)
            if (isset($_SERVER['HTTP_RANGE'])) {
                $range = $_SERVER['HTTP_RANGE'];
                $range = str_replace('bytes=', '', $range);
                list($start, $end) = explode('-', $range, 2);
                
                $start = intval($start);
                $end = $end === '' ? $fileSize - 1 : intval($end);
                $length = $end - $start + 1;
                
                // Validate the range
                if ($start >= $fileSize || $end >= $fileSize || $start > $end) {
                    return response('Requested range not satisfiable', 416, [
                        'Content-Range' => "bytes */$fileSize"
                    ]);
                }
                
                // Set partial content headers
                $headers['Content-Length'] = $length;
                $headers['Content-Range'] = "bytes $start-$end/$fileSize";
                
                // Return partial content
                return response()->stream(function() use ($path, $start, $length) {
                    $stream = fopen($path, 'rb');
                    fseek($stream, $start);
                    echo fread($stream, $length);
                    fclose($stream);
                }, 206, $headers);
            }
            
            // For full file requests
            return response()->file($path, $headers);
            
        } catch (\Exception $e) {
            \Log::error('Error serving audio file: ' . $e->getMessage());
            abort(500, 'An error occurred while trying to serve the audio file.');
        }
    }
}

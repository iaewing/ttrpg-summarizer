<?php

namespace App\Http\Controllers;

use App\Models\Transcription;
use App\Models\Recording;
use App\Models\Speaker;
use App\Services\DeepgramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Exception;

class TranscriptionController extends Controller
{
    public function __construct(
        private DeepgramService $deepgramService
    ) {}

    public function index()
    {
        $transcriptions = Transcription::query()
            ->whereHas('recording.gameSession.campaign', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->with(['recording.gameSession.campaign', 'speakers.player', 'speakers.character'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform transcriptions to include recording properties and formatted speakers
        $transcriptionsData = $transcriptions->map(function ($transcription) {
            $speakersFormatted = [];
            foreach ($transcription->speakers as $speaker) {
                $speakerLabel = "Speaker " . $speaker->speaker_id;
                $speakersFormatted[$speakerLabel] = $speaker->segments ?? [];
            }

            $data = $transcription->toArray();
            $data['original_filename'] = $transcription->recording->original_filename;
            $data['file_size'] = $transcription->recording->file_size;
            $data['mime_type'] = $transcription->recording->mime_type;
            $data['speakers'] = $speakersFormatted;
            
            return $data;
        });

        return Inertia::render('transcriptions/index', [
            'transcriptions' => $transcriptionsData,
            'supportedMimeTypes' => $this->deepgramService->getSupportedMimeTypes(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'recording_id' => 'required|exists:recordings,id',
        ]);

        $recording = Recording::findOrFail($request->recording_id);

        // Verify user owns this recording through campaign
        if ($recording->gameSession->campaign->user_id !== Auth::id()) {
            abort(403);
        }

        // Check if transcription already exists
        if ($recording->transcription) {
            return redirect()->route('transcriptions.show', $recording->transcription)
                ->with('info', 'Transcription already exists for this recording.');
        }

        // Create transcription record
        $transcription = Transcription::create([
            'recording_id' => $recording->id,
            'status' => 'pending',
        ]);

        // Process transcription
        try {
            $transcription->update(['status' => 'processing']);

            $filePath = Storage::path($recording->file_path);
            $result = $this->deepgramService->transcribeAudio($filePath);

            $transcription->update([
                'status' => 'completed',
                'transcript' => $result['transcript'],
                'full_response' => $result['full_response'],
                'confidence' => $result['confidence'],
                'duration_seconds' => $recording->duration_seconds,
            ]);

            // Create speaker records from Deepgram response
            $this->createSpeakerRecords($transcription, $result['speakers']);
        } catch (Exception $e) {
            $transcription->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }

        return redirect()->route('transcriptions.show', $transcription)
            ->with('success', 'Recording transcribed successfully!');
    }

    public function show(Transcription $transcription)
    {
        // Verify user owns this transcription through campaign
        if ($transcription->recording->gameSession->campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $transcription->load([
            'recording.gameSession.campaign',
            'speakers' => function ($query) {
                $query->with(['player', 'character']);
            }
        ]);

        // Transform speakers array into expected format for frontend
        $speakersFormatted = [];
        foreach ($transcription->speakers as $speaker) {
            $speakerLabel = "Speaker " . $speaker->speaker_id;
            $speakersFormatted[$speakerLabel] = $speaker->segments ?? [];
        }

        // Create a transcription array with all needed properties
        $transcriptionData = $transcription->toArray();
        $transcriptionData['original_filename'] = $transcription->recording->original_filename;
        $transcriptionData['file_size'] = $transcription->recording->file_size;
        $transcriptionData['mime_type'] = $transcription->recording->mime_type;
        $transcriptionData['speakers'] = $speakersFormatted;

        return Inertia::render('transcriptions/show', [
            'transcription' => $transcriptionData,
        ]);
    }

    public function destroy(Transcription $transcription)
    {
        // Verify user owns this transcription through campaign
        if ($transcription->recording->gameSession->campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $transcription->delete();

        return redirect()->route('transcriptions.index')
            ->with('success', 'Transcription deleted successfully!');
    }

    /**
     * Create speaker records from Deepgram response
     */
    private function createSpeakerRecords(Transcription $transcription, array $speakers): void
    {
        foreach ($speakers as $speakerLabel => $segments) {
            // Extract speaker ID from label (e.g., "Speaker 0" -> "0")
            $speakerId = str_replace('Speaker ', '', $speakerLabel);

            Speaker::create([
                'transcription_id' => $transcription->id,
                'speaker_id' => $speakerId,
                'speaker_type' => 'unknown', // Will be updated by user later
                'segments' => $segments,
            ]);
        }
    }

    /**
     * Update speaker attribution (assign speakers to players/characters)
     */
    public function updateSpeaker(Request $request, Speaker $speaker)
    {
        // Verify user owns this speaker through campaign
        if ($speaker->transcription->recording->gameSession->campaign->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
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

        $speaker->update([
            'player_id' => $request->player_id,
            'character_id' => $request->character_id,
            'speaker_type' => $request->speaker_type,
        ]);

        return back()->with('success', 'Speaker attribution updated successfully!');
    }
}

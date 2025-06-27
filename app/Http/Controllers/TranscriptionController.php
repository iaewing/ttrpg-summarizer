<?php

namespace App\Http\Controllers;

use App\Models\Transcription;
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
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('transcriptions/index', [
            'transcriptions' => $transcriptions,
            'supportedMimeTypes' => $this->deepgramService->getSupportedMimeTypes(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'audio_file' => [
                'required',
                'file',
                'max:102400', // 100MB
                'mimes:mp3,wav,m4a,aac,ogg,webm,flac'
            ]
        ]);

        $file = $request->file('audio_file');
        $filename = time() . '_' . $file->getClientOriginalName();
        
        // Store the file
        $path = $file->storeAs('transcriptions', $filename, 'local');

        // Create transcription record
        $transcription = Transcription::create([
            'user_id' => Auth::id(),
            'original_filename' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'status' => 'pending',
        ]);

        // Process transcription
        try {
            $transcription->update(['status' => 'processing']);
            
            $filePath = Storage::path($path);
            $result = $this->deepgramService->transcribeAudio($filePath);
            
            $transcription->update([
                'status' => 'completed',
                'transcript' => $result['transcript'],
                'full_response' => $result['full_response'],
                'speakers' => $result['speakers'],
                'confidence' => $result['confidence'],
            ]);

        } catch (Exception $e) {
            $transcription->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }

        return redirect()->route('transcriptions.show', $transcription)
            ->with('success', 'Audio file uploaded and transcribed successfully!');
    }

    public function show(Transcription $transcription)
    {
        if ($transcription->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('transcriptions/show', [
            'transcription' => $transcription,
        ]);
    }

    public function destroy(Transcription $transcription)
    {
        if ($transcription->user_id !== Auth::id()) {
            abort(403);
        }

        // Delete the audio file
        if (Storage::exists($transcription->file_path)) {
            Storage::delete($transcription->file_path);
        }

        $transcription->delete();

        return redirect()->route('transcriptions.index')
            ->with('success', 'Transcription deleted successfully!');
    }
}

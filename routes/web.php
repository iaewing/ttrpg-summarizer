<?php

use App\Http\Controllers\TranscriptionController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\GameSessionController;
use App\Http\Controllers\RecordingController;
use App\Http\Controllers\PlayerController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // TTRPG Resources
    Route::resource('campaigns', CampaignController::class);
    Route::resource('campaigns.sessions', GameSessionController::class);
    Route::resource('sessions.recordings', RecordingController::class);
    Route::post('sessions/{session}/recordings/{recording}/transcribe', [RecordingController::class, 'transcribe'])->name('recordings.transcribe');
    Route::resource('players', PlayerController::class);
    
    // Transcriptions
    Route::resource('transcriptions', TranscriptionController::class)->except(['edit', 'update']);
    Route::patch('speakers/{speaker}', [TranscriptionController::class, 'updateSpeaker'])->name('speakers.update');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

<?php

use App\Http\Controllers\TranscriptionController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\GameSessionController;
use App\Http\Controllers\RecordingController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\SummaryController;
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
    Route::post('campaigns/{campaign}/players', [CampaignController::class, 'addPlayer'])->name('campaigns.players.add');
    Route::delete('campaigns/{campaign}/players', [CampaignController::class, 'removePlayer'])->name('campaigns.players.remove');
    Route::post('campaigns/{campaign}/characters', [CampaignController::class, 'addCharacter'])->name('campaigns.characters.add');
    Route::delete('campaigns/{campaign}/characters', [CampaignController::class, 'removeCharacter'])->name('campaigns.characters.remove');
    Route::resource('campaigns.sessions', GameSessionController::class);
    Route::post('campaigns/{campaign}/sessions/{session}/speakers', [GameSessionController::class, 'updateSessionSpeaker'])->name('sessions.speakers.update');
    Route::resource('sessions.recordings', RecordingController::class);
    Route::post('sessions/{session}/recordings/{recording}/transcribe', [RecordingController::class, 'transcribe'])->name('recordings.transcribe');
    Route::resource('players', PlayerController::class);
    
    // Summaries
    Route::get('campaigns/{campaign}/summaries', [SummaryController::class, 'index'])->name('campaigns.summaries.index');
    Route::post('sessions/{session}/summaries', [SummaryController::class, 'generateSession'])->name('sessions.summaries.generate');
    Route::post('campaigns/{campaign}/summary', [SummaryController::class, 'generateCampaign'])->name('campaigns.summary.generate');
    Route::post('campaigns/{campaign}/recap', [SummaryController::class, 'generateRecap'])->name('campaigns.recap.generate');
    Route::resource('summaries', SummaryController::class)->except(['index', 'create', 'store']);
    Route::patch('summaries/{summary}/status', [SummaryController::class, 'updateStatus'])->name('summaries.status');
    Route::get('sessions/{session}/summaries', [SummaryController::class, 'sessionSummaries'])->name('sessions.summaries.api');
    
    // Transcriptions
    Route::resource('transcriptions', TranscriptionController::class)->except(['edit', 'update']);
    Route::patch('speakers/{speaker}', [TranscriptionController::class, 'updateSpeaker'])->name('speakers.update');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

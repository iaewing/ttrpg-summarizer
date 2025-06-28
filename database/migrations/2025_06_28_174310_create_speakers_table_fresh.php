<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('speakers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transcription_id')->constrained()->onDelete('cascade');
            $table->string('speaker_id'); // Speaker 0, Speaker 1, etc. from Deepgram
            $table->foreignId('player_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('character_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('speaker_type', ['dm', 'player', 'npc', 'unknown'])->default('unknown');
            $table->json('segments'); // All the speech segments for this speaker
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('speakers');
    }
};

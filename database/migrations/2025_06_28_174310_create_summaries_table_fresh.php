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
        Schema::create('summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_session_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->enum('type', ['full', 'highlights', 'character_actions', 'plot_points'])->default('full');
            $table->longText('content'); // The actual summary content
            $table->json('metadata')->nullable(); // Key NPCs, locations, items, etc.
            $table->decimal('confidence', 5, 4)->nullable(); // AI confidence score
            $table->string('generated_by')->default('ai'); // 'ai', 'user', 'hybrid'
            $table->enum('status', ['draft', 'reviewing', 'approved', 'published'])->default('draft');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('summaries');
    }
};

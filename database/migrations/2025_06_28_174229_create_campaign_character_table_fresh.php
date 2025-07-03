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
        if (!Schema::hasTable('campaign_character')) {
            Schema::create('campaign_character', function (Blueprint $table) {
                $table->id();
                $table->foreignId('campaign_id')->constrained()->onDelete('cascade');
                $table->foreignId('character_id')->constrained()->onDelete('cascade');
                $table->date('introduced_at')->nullable(); // When character joined campaign
                $table->date('left_at')->nullable(); // If character left/died
                $table->boolean('is_active')->default(true);
                $table->text('campaign_notes')->nullable(); // Campaign-specific character notes
                $table->timestamps();

                $table->unique(['campaign_id', 'character_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaign_character');
    }
};

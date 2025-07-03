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
        if (!Schema::hasTable('players')) {
            Schema::create('players', function (Blueprint $table) {
                $table->id();
                $table->string('name'); // Real player name
                $table->string('email')->nullable(); // Optional contact info
                $table->text('notes')->nullable(); // DM notes about the player
                $table->boolean('is_dm')->default(false); // Can this player DM?
                $table->json('preferences')->nullable(); // Player preferences, favorite classes, etc.
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};

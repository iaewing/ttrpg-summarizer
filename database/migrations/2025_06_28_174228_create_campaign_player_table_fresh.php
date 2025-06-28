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
        Schema::create('campaign_player', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->onDelete('cascade');
            $table->foreignId('player_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['dm', 'player'])->default('player');
            $table->date('joined_at')->nullable();
            $table->date('left_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable(); // Campaign-specific notes about this player
            $table->timestamps();

            $table->unique(['campaign_id', 'player_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaign_player');
    }
};

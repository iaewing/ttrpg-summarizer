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
        // First, drop the existing foreign key constraint
        Schema::table('campaign_player', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['player_id']);
            
            // Add a new foreign key that references the players table
            $table->foreign('player_id')
                ->references('id')
                ->on('players')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaign_player', function (Blueprint $table) {
            // Drop the players foreign key
            $table->dropForeign(['player_id']);
            
            // Recreate the original users foreign key
            $table->foreign('player_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');
        });
    }
};

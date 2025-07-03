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
        // Add notes to campaign_player table
        Schema::table('campaign_player', function (Blueprint $table) {
            if (!Schema::hasColumn('campaign_player', 'notes')) {
                $table->text('notes')->nullable()->after('is_active');
            }
        });

        // Add notes to campaign_character table if it doesn't have it
        Schema::table('campaign_character', function (Blueprint $table) {
            if (!Schema::hasColumn('campaign_character', 'notes')) {
                $table->text('notes')->nullable()->after('is_active');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaign_player', function (Blueprint $table) {
            if (Schema::hasColumn('campaign_player', 'notes')) {
                $table->dropColumn('notes');
            }
        });

        Schema::table('campaign_character', function (Blueprint $table) {
            if (Schema::hasColumn('campaign_character', 'notes')) {
                $table->dropColumn('notes');
            }
        });
    }
};

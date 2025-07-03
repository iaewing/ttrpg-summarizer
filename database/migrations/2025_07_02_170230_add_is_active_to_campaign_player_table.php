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
        Schema::table('campaign_player', function (Blueprint $table) {
            if (!Schema::hasColumn('campaign_player', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('left_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaign_player', function (Blueprint $table) {
            if (Schema::hasColumn('campaign_player', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });
    }
};

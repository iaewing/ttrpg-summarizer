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
        Schema::table('transcriptions', function (Blueprint $table) {
            if (!Schema::hasColumn('transcriptions', 'metadata')) {
                $table->json('metadata')->nullable()->after('full_response');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transcriptions', function (Blueprint $table) {
            if (Schema::hasColumn('transcriptions', 'metadata')) {
                $table->dropColumn('metadata');
            }
        });
    }
};

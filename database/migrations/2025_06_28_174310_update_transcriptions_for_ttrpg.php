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
            // Remove user relationship and file fields (now on recordings table)
            $table->dropForeign(['user_id']);
            $table->dropColumn([
                'user_id',
                'original_filename',
                'file_path',
                'file_size',
                'mime_type',
                'speakers' // Moving to separate speakers table
            ]);
            
            // Add recording relationship
            $table->foreignId('recording_id')->constrained()->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('transcriptions', function (Blueprint $table) {
            // Add back removed columns
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('original_filename');
            $table->string('file_path');
            $table->string('file_size');
            $table->string('mime_type');
            $table->json('speakers')->nullable();
            
            // Remove recording relationship
            $table->dropForeign(['recording_id']);
            $table->dropColumn('recording_id');
        });
    }
};

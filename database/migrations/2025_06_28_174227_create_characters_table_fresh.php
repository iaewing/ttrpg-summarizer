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
        if (!Schema::hasTable('characters')) {
            Schema::create('characters', function (Blueprint $table) {
                $table->id();
                $table->foreignId('player_id')->constrained()->onDelete('cascade');
                $table->string('name'); // Character name
                $table->string('race')->nullable(); // Elf, Human, etc.
                $table->string('class')->nullable(); // Fighter, Wizard, etc.
                $table->integer('level')->nullable(); // We should support 5e multiclassing. AKA level 2 fighter level 3 wizard level 5 overall
                $table->text('background')->nullable(); // Character backstory
                $table->text('description')->nullable(); // Physical description
                $table->json('stats')->nullable(); // Character stats, abilities, etc.
                $table->json('equipment')->nullable(); // Gear, weapons, etc.
                $table->text('notes')->nullable(); // Character notes
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('characters');
    }
};

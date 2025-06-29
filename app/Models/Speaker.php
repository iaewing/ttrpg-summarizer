<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Speaker extends Model
{
    use HasFactory;

    protected $fillable = [
        'transcription_id',
        'speaker_id',
        'player_id',
        'character_id',
        'speaker_type',
        'segments',
    ];

    protected $casts = [
        'segments' => 'array',
    ];

    public function transcription(): BelongsTo
    {
        return $this->belongsTo(Transcription::class);
    }

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    public function character(): BelongsTo
    {
        return $this->belongsTo(Character::class);
    }

    public function isDM(): bool
    {
        return $this->speaker_type === 'dm';
    }

    public function isPlayer(): bool
    {
        return $this->speaker_type === 'player';
    }

    public function isNPC(): bool
    {
        return $this->speaker_type === 'npc';
    }

    public function isUnknown(): bool
    {
        return $this->speaker_type === 'unknown';
    }

    public function getSegmentCountAttribute(): int
    {
        return count($this->segments ?? []);
    }

    public function getTotalSpeakingTimeAttribute(): float
    {
        $totalTime = 0;
        foreach ($this->segments ?? [] as $segment) {
            if (isset($segment['start']) && isset($segment['end'])) {
                $totalTime += $segment['end'] - $segment['start'];
            }
        }
        return $totalTime;
    }

    public function getDisplayNameFormatted(): string
    {
        if ($this->character && $this->player) {
            return "{$this->character->name} ({$this->player->name})";
        }

        if ($this->character) {
            return $this->character->name;
        }

        if ($this->player) {
            return $this->player->name;
        }

        return "Speaker " . $this->speaker_id;
    }
}

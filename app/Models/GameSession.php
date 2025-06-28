<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class GameSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'title',
        'description',
        'session_number',
        'session_date',
        'duration_minutes',
        'notes',
        'status',
    ];

    protected $casts = [
        'notes' => 'array',
        'session_date' => 'date',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function recordings(): HasMany
    {
        return $this->hasMany(Recording::class);
    }

    public function summaries(): HasMany
    {
        return $this->hasMany(Summary::class);
    }

    public function transcriptions(): HasManyThrough
    {
        return $this->hasManyThrough(Transcription::class, Recording::class);
    }

    public function isPlanned(): bool
    {
        return $this->status === 'planned';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function getRecordingCountAttribute(): int
    {
        return $this->recordings()->count();
    }

    public function getCompletedTranscriptionsCountAttribute(): int
    {
        return $this->transcriptions()->where('status', 'completed')->count();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transcription extends Model
{
    use HasFactory;

    protected $fillable = [
        'recording_id',
        'status',
        'transcript',
        'full_response',
        'confidence',
        'duration_seconds',
        'error_message',
    ];

    protected $casts = [
        'full_response' => 'array',
        'confidence' => 'decimal:4',
    ];

    public function recording(): BelongsTo
    {
        return $this->belongsTo(Recording::class);
    }

    public function speakers(): HasMany
    {
        return $this->hasMany(Speaker::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Summary extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_session_id',
        'title',
        'type',
        'content',
        'metadata',
        'confidence',
        'generated_by',
        'status',
    ];

    protected $casts = [
        'metadata' => 'array',
        'confidence' => 'decimal:4',
    ];

    public function gameSession(): BelongsTo
    {
        return $this->belongsTo(GameSession::class, 'game_session_id');
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isReviewing(): bool
    {
        return $this->status === 'reviewing';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function isAIGenerated(): bool
    {
        return $this->generated_by === 'ai';
    }

    public function isUserGenerated(): bool
    {
        return $this->generated_by === 'user';
    }

    public function isHybrid(): bool
    {
        return $this->generated_by === 'hybrid';
    }

    public function isFull(): bool
    {
        return $this->type === 'full';
    }

    public function isHighlights(): bool
    {
        return $this->type === 'highlights';
    }

    public function isCharacterActions(): bool
    {
        return $this->type === 'character_actions';
    }

    public function isPlotPoints(): bool
    {
        return $this->type === 'plot_points';
    }

    public function getWordCountAttribute(): int
    {
        return str_word_count(strip_tags($this->content));
    }

    public function getEstimatedReadingTimeAttribute(): int
    {
        // Average reading speed: 200 words per minute
        return max(1, ceil($this->getWordCountAttribute() / 200));
    }
}

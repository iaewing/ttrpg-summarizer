<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'game_system',
        'settings',
        'is_active',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(GameSession::class);
    }

    public function players(): BelongsToMany
    {
        return $this->belongsToMany(Player::class)
            ->withPivot(['role', 'joined_at', 'left_at', 'is_active', 'notes'])
            ->withTimestamps();
    }

    public function characters(): BelongsToMany
    {
        return $this->belongsToMany(Character::class)
            ->withPivot(['introduced_at', 'left_at', 'is_active', 'campaign_notes'])
            ->withTimestamps();
    }

    public function activePlayers(): BelongsToMany
    {
        return $this->players()->wherePivot('is_active', true);
    }

    public function activeCharacters(): BelongsToMany
    {
        return $this->characters()->wherePivot('is_active', true);
    }

    public function activeSessions(): HasMany
    {
        return $this->hasMany(GameSession::class)->whereIn('status', ['planned', 'in_progress']);
    }

    public function completedSessions(): HasMany
    {
        return $this->hasMany(GameSession::class)->where('status', 'completed');
    }

    public function getTotalSessionsAttribute(): int
    {
        return $this->sessions()->count();
    }

    public function getCompletedSessionsCountAttribute(): int
    {
        return $this->completedSessions()->count();
    }
}

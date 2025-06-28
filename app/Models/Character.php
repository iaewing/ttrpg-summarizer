<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Character extends Model
{
    use HasFactory;

    protected $fillable = [
        'player_id',
        'name',
        'race',
        'class',
        'level',
        'background',
        'description',
        'stats',
        'equipment',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'stats' => 'array',
        'equipment' => 'array',
        'is_active' => 'boolean',
    ];

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class);
    }

    public function campaigns(): BelongsToMany
    {
        return $this->belongsToMany(Campaign::class)
            ->withPivot(['introduced_at', 'left_at', 'is_active', 'campaign_notes'])
            ->withTimestamps();
    }

    public function activeCampaigns(): BelongsToMany
    {
        return $this->campaigns()->wherePivot('is_active', true);
    }

    public function speakers(): HasMany
    {
        return $this->hasMany(Speaker::class);
    }

    public function getFullNameAttribute(): string
    {
        return $this->name;
    }

    public function getDisplayNameAttribute(): string
    {
        $parts = [];
        
        if ($this->name) {
            $parts[] = $this->name;
        }
        
        if ($this->race || $this->class) {
            $classRace = [];
            if ($this->race) $classRace[] = $this->race;
            if ($this->class) $classRace[] = $this->class;
            $parts[] = '(' . implode(' ', $classRace) . ')';
        }
        
        return implode(' ', $parts);
    }

    public function isActive(): bool
    {
        return $this->is_active;
    }

    public function isInCampaign(Campaign $campaign): bool
    {
        return $this->campaigns()->where('campaigns.id', $campaign->id)->exists();
    }
}

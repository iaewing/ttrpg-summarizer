<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Player extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'notes',
        'is_dm',
        'preferences',
    ];

    protected $casts = [
        'preferences' => 'array',
        'is_dm' => 'boolean',
    ];

    public function characters(): HasMany
    {
        return $this->hasMany(Character::class);
    }

    public function campaigns(): BelongsToMany
    {
        return $this->belongsToMany(Campaign::class)
            ->withPivot(['role', 'joined_at', 'left_at', 'is_active', 'notes'])
            ->withTimestamps();
    }

    public function activeCampaigns(): BelongsToMany
    {
        return $this->campaigns()->wherePivot('is_active', true);
    }

    public function activeCharacters(): HasMany
    {
        return $this->characters()->where('is_active', true);
    }

    public function speakers(): HasMany
    {
        return $this->hasMany(Speaker::class);
    }

    public function isDM(): bool
    {
        return $this->is_dm;
    }

    public function getActiveCharactersAttribute()
    {
        return $this->characters()->where('is_active', true)->get();
    }

    public function charactersInCampaign(Campaign $campaign)
    {
        return $this->characters()
            ->whereHas('campaigns', function ($query) use ($campaign) {
                $query->where('campaigns.id', $campaign->id);
            })
            ->get();
    }
}

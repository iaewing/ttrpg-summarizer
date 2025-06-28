<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Recording extends Model
{
    use HasFactory;

    protected $fillable = [
        'game_session_id',
        'name',
        'original_filename',
        'file_path',
        'file_size',
        'mime_type',
        'duration_seconds',
        'recording_order',
        'notes',
    ];

    public function gameSession(): BelongsTo
    {
        return $this->belongsTo(GameSession::class, 'game_session_id');
    }

    public function transcription(): HasOne
    {
        return $this->hasOne(Transcription::class);
    }

    public function hasTranscription(): bool
    {
        return $this->transcription()->exists();
    }

    public function hasCompletedTranscription(): bool
    {
        return $this->transcription()->where('status', 'completed')->exists();
    }

    public function getFormattedDurationAttribute(): string
    {
        if (!$this->duration_seconds) {
            return 'Unknown';
        }

        $hours = floor($this->duration_seconds / 3600);
        $minutes = floor(($this->duration_seconds % 3600) / 60);
        $seconds = $this->duration_seconds % 60;

        if ($hours > 0) {
            return sprintf('%d:%02d:%02d', $hours, $minutes, $seconds);
        }

        return sprintf('%02d:%02d', $minutes, $seconds);
    }

    public function getFormattedFileSizeAttribute(): string
    {
        $bytes = (int) $this->file_size;
        if ($bytes === 0) return '0 Bytes';
        
        $k = 1024;
        $sizes = ['Bytes', 'KB', 'MB', 'GB'];
        $i = floor(log($bytes) / log($k));
        
        return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
    }
}

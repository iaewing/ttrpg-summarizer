import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
    src: string;
    mimeType: string;
    className?: string;
}

export default function AudioPlayer({ src, mimeType, className = '' }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Format time in seconds to MM:SS
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Handle play/pause
    const togglePlayPause = () => {
        if (!audioRef.current) return;
        
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Handle volume change
    const handleVolumeChange = (value: number[]) => {
        if (!audioRef.current) return;
        const newVolume = value[0] / 100;
        audioRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    // Handle mute toggle
    const toggleMute = () => {
        if (!audioRef.current) return;
        
        if (isMuted) {
            audioRef.current.volume = volume > 0 ? volume : 0.5;
            setVolume(volume > 0 ? volume : 0.5);
        } else {
            audioRef.current.volume = 0;
            setVolume(0);
        }
        setIsMuted(!isMuted);
    };

    // Handle seek
    const handleSeek = (value: number[]) => {
        if (!audioRef.current) return;
        const newTime = (value[0] / 100) * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    // Handle reset
    const handleReset = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
    };

    // Handle source changes and set up event listeners
    useEffect(() => {
        if (!src) {
            setError('No audio source provided');
            return;
        }
        
        const audio = audioRef.current;
        if (!audio) return;
        
        // Reset state for new source
        setIsLoading(true);
        setError(null);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        
        // Set the source and preload metadata
        audio.src = src;
        audio.load();
        
        const handleLoadedMetadata = () => {
            console.log('Audio metadata loaded. Duration:', audio.duration);
            setDuration(audio.duration);
            setIsLoading(false);
        };

        const handleCanPlay = () => {
            console.log('Audio can play');
            setIsLoading(false);
        };

        const handleError = (e: Event) => {
            console.error('Audio error:', e);
            const error = audio.error;
            let errorMessage = 'Failed to load audio. Please try again.';
            
            if (error) {
                switch(error.code) {
                    case MediaError.MEDIA_ERR_ABORTED:
                        errorMessage = 'Audio playback was aborted.';
                        break;
                    case MediaError.MEDIA_ERR_NETWORK:
                        errorMessage = 'A network error occurred while loading the audio.';
                        break;
                    case MediaError.MEDIA_ERR_DECODE:
                        errorMessage = 'The audio could not be decoded. The file may be corrupted.';
                        break;
                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        errorMessage = 'The audio format is not supported by your browser.';
                        break;
                }
            }
            
            setError(errorMessage);
            setIsLoading(false);
            setIsPlaying(false);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        const handlePause = () => {
            setIsPlaying(false);
        };

        const handlePlay = () => {
            setIsPlaying(true);
        };

        // Add event listeners
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('waiting', () => setIsLoading(true));
        audio.addEventListener('stalled', () => setIsLoading(true));
        
        // Set initial volume
        audio.volume = isMuted ? 0 : volume;

        // Cleanup function
        return () => {
            audio.pause();
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('waiting', () => setIsLoading(false));
            audio.removeEventListener('stalled', () => setIsLoading(false));
            
            // Reset source to stop any ongoing downloads
            audio.src = '';
        };
    }, [src]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Space key to play/pause (when not focused on form elements)
            if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'BUTTON'].includes((e.target as HTMLElement).tagName)) {
                e.preventDefault();
                togglePlayPause();
            }
            // M key to toggle mute
            else if (e.code === 'KeyM') {
                e.preventDefault();
                toggleMute();
            }
            // Left/Right arrow keys to seek
            else if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
                if (!audioRef.current) return;
                e.preventDefault();
                const seekAmount = e.code === 'ArrowLeft' ? -5 : 5;
                const newTime = Math.max(0, Math.min(audioRef.current.currentTime + seekAmount, duration));
                audioRef.current.currentTime = newTime;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [duration]);

    if (error) {
        return (
            <div className={`bg-card rounded-lg p-4 shadow-sm ${className} text-center text-destructive`}>
                <p className="mb-2">{error}</p>
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.reload()}
                >
                    Reload Page
                </Button>
            </div>
        );
    }

    return (
        <div className={`bg-card rounded-lg p-4 shadow-sm ${className}`}>
            <audio ref={audioRef} preload="metadata" crossOrigin="anonymous">
                <source src={src} type={mimeType} />
                Your browser does not support the audio element.
            </audio>

            <div className="flex items-center gap-3 mb-3">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={togglePlayPause}
                    className="w-12 h-12 rounded-full hover:bg-primary/10"
                    disabled={isLoading || !src}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isPlaying ? (
                        <Pause className="h-5 w-5" />
                    ) : (
                        <Play className="h-5 w-5" />
                    )}
                </Button>

                <div className="flex-1">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                    <Slider
                        value={[duration ? (currentTime / duration) * 100 : 0]}
                        onValueChange={handleSeek}
                        className="w-full cursor-pointer"
                        disabled={isLoading || !src}
                        aria-label="Seek"
                    />
                </div>

                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleReset}
                    className="text-muted-foreground hover:text-foreground"
                    disabled={isLoading || !src || currentTime === 0}
                    aria-label="Reset to beginning"
                >
                    <RotateCcw className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-2 w-32">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleMute}
                        className="text-muted-foreground hover:text-foreground"
                        disabled={isLoading || !src}
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted || volume === 0 ? (
                            <VolumeX className="h-5 w-5" />
                        ) : volume < 0.5 ? (
                            <Volume2 className="h-5 w-5" />
                        ) : (
                            <Volume2 className="h-5 w-5" />
                        )}
                    </Button>
                    <Slider
                        value={[isMuted ? 0 : volume * 100]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="w-full cursor-pointer"
                        disabled={isLoading || !src}
                        aria-label="Volume"
                    />
                </div>
            </div>
            
            {/* Keyboard shortcuts hint */}
            <div className="text-xs text-muted-foreground text-center mt-2">
                Space: Play/Pause | M: Mute | ←→: Seek 5s
            </div>
        </div>
    );
}

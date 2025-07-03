import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Campaign, GameSession, Recording, Player, SessionSpeaker } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import SpeakerIdentificationCard from '@/components/speaker-identification-card';
import {
    ArrowLeft,
    Plus,
    Clock,
    FileAudio,
    FileText,
    Edit,
    Play,
    CheckCircle,
    XCircle,
    Users,
    Download,
    Sparkles,
    BookOpen,
    Eye
} from 'lucide-react';

interface Props {
    campaign: Campaign;
    session: GameSession & {
        recordings: Recording[];
    };
    sessionSpeakers: SessionSpeaker[];
    players: Player[];
    stats: {
        total_recordings: number;
        transcribed_recordings: number;
        total_summaries: number;
        identified_speakers: number;
        total_unique_speakers: number;
    };
}

const getStatusIcon = (status: GameSession['status']) => {
    switch (status) {
        case 'completed':
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        case 'in_progress':
            return <Play className="h-4 w-4 text-blue-600" />;
        case 'planned':
            return <Clock className="h-4 w-4 text-yellow-600" />;
        case 'cancelled':
            return <XCircle className="h-4 w-4 text-red-600" />;
        default:
            return null;
    }
};

const getStatusColor = (status: GameSession['status']) => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'in_progress':
            return 'bg-blue-100 text-blue-800';
        case 'planned':
            return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const formatFileSize = (bytes: string | number) => {
    const size = typeof bytes === 'string' ? parseInt(bytes) : bytes;
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export default function SessionShow({ campaign, session, sessionSpeakers, players, stats }: Props) {
    const [updatingSpeaker, setUpdatingSpeaker] = useState<string | null>(null);

    const handleSpeakerUpdate = (speakerGroupId: string, data: any) => {
        setUpdatingSpeaker(speakerGroupId);
        
        router.post(route('sessions.speakers.update', [campaign.id, session.id]), {
            speaker_group_id: speakerGroupId,
            ...data,
        }, {
            onFinish: () => setUpdatingSpeaker(null),
        });
    };
    return (
        <AppLayout>
            <Head title={`${session.title} - ${campaign.name}`} />

            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start gap-4">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={`/campaigns/${campaign.id}`}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to {campaign.name}
                                </Link>
                            </Button>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    {getStatusIcon(session.status)}
                                    <h1 className="text-3xl font-bold tracking-tight">{session.title}</h1>
                                    <Badge className={getStatusColor(session.status)}>
                                        {session.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                    {session.session_number && (
                                        <span>Session #{session.session_number}</span>
                                    )}
                                    {session.session_date && (
                                        <span>{new Date(session.session_date).toLocaleDateString()}</span>
                                    )}
                                    {session.duration_minutes && (
                                        <span>{Math.floor(session.duration_minutes / 60)}h {session.duration_minutes % 60}m</span>
                                    )}
                                </div>
                                {session.description && (
                                    <p className="text-muted-foreground max-w-2xl">{session.description}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href={`/campaigns/${campaign.id}/sessions/${session.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Session
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={route('sessions.recordings.create', session.id)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Upload Recording
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-5 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <FileAudio className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Recordings</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.total_recordings}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Transcribed</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.transcribed_recordings}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Unique Speakers</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.total_unique_speakers}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Identified</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.identified_speakers}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Download className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Summaries</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.total_summaries}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recordings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recordings</CardTitle>
                                    <CardDescription>
                                        Audio recordings for this session
                                    </CardDescription>
                                </div>
                                <Button asChild>
                                    <Link href={route('sessions.recordings.create', session.id)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Upload Recording
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {session.recordings?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <FileAudio className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold">No recordings yet</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Upload audio files to start transcribing and analyzing your session.
                                    </p>
                                    <Button asChild>
                                        <Link href={route('sessions.recordings.create', session.id)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Upload Recording
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {session.recordings?.map((recording, index) => (
                                        <div key={recording.id}>
                                            {index > 0 && <Separator />}
                                            <div className="flex items-center justify-between py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                                                        {recording.recording_order}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{recording.name}</div>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                            <span>{formatFileSize(recording.file_size)}</span>
                                                            {recording.duration_seconds && (
                                                                <span>{formatDuration(recording.duration_seconds)}</span>
                                                            )}
                                                            <span>{recording.mime_type}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('sessions.recordings.show', [session.id, recording.id])}>
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Link>
                                                    </Button>
                                                    {recording.transcription ? (
                                                        <>
                                                            <Badge variant="outline" className="text-green-700 border-green-700">
                                                                <FileText className="h-3 w-3 mr-1" />
                                                                Transcribed
                                                            </Badge>
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/transcriptions/${recording.transcription.id}`}>
                                                                    View Transcription
                                                                </Link>
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Badge variant="outline" className="text-muted-foreground">
                                                                Not transcribed
                                                            </Badge>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    router.post(route('recordings.transcribe', [session.id, recording.id]));
                                                                }}
                                                            >
                                                                Start Transcription
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Speaker Identification */}
                    {sessionSpeakers.length > 0 && (
                        <Card className="mt-6">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Speaker Identification
                                        </CardTitle>
                                        <CardDescription>
                                            Identify speakers detected across all recordings in this session
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline">
                                        {stats.identified_speakers} of {stats.total_unique_speakers} identified
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 lg:grid-cols-2">
                                    {sessionSpeakers.map((sessionSpeaker) => (
                                        <SpeakerIdentificationCard
                                            key={sessionSpeaker.id}
                                            sessionSpeaker={sessionSpeaker}
                                            players={players}
                                            onUpdate={handleSpeakerUpdate}
                                            isUpdating={updatingSpeaker === sessionSpeaker.id}
                                        />
                                    ))}
                                </div>
                                {sessionSpeakers.length === 0 && (
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            No speakers detected yet. Upload and transcribe recordings to identify speakers.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Summary Generation */}
                    {stats.transcribed_recordings > 0 && (
                        <Card className="mt-6">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5" />
                                            Session Summaries
                                        </CardTitle>
                                        <CardDescription>
                                            Generate AI-powered summaries from your transcribed recordings
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline">
                                        {stats.total_summaries} generated
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    <Button
                                        variant="outline"
                                        className="flex items-center justify-center gap-2 h-auto p-4 flex-col"
                                        onClick={() => {
                                            router.post(`/sessions/${session.id}/summaries`, { type: 'full' });
                                        }}
                                    >
                                        <FileText className="h-5 w-5 text-primary" />
                                        <span className="font-medium">Full Summary</span>
                                        <span className="text-xs text-muted-foreground text-center">
                                            Comprehensive session overview
                                        </span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="flex items-center justify-center gap-2 h-auto p-4 flex-col"
                                        onClick={() => {
                                            router.post(`/sessions/${session.id}/summaries`, { type: 'highlights' });
                                        }}
                                    >
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        <span className="font-medium">Highlights</span>
                                        <span className="text-xs text-muted-foreground text-center">
                                            Key moments and events
                                        </span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="flex items-center justify-center gap-2 h-auto p-4 flex-col"
                                        onClick={() => {
                                            router.post(`/sessions/${session.id}/summaries`, { type: 'character_actions' });
                                        }}
                                    >
                                        <Users className="h-5 w-5 text-primary" />
                                        <span className="font-medium">Character Actions</span>
                                        <span className="text-xs text-muted-foreground text-center">
                                            What each character did
                                        </span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="flex items-center justify-center gap-2 h-auto p-4 flex-col"
                                        onClick={() => {
                                            router.post(`/sessions/${session.id}/summaries`, { type: 'plot_points' });
                                        }}
                                    >
                                        <BookOpen className="h-5 w-5 text-primary" />
                                        <span className="font-medium">Plot Points</span>
                                        <span className="text-xs text-muted-foreground text-center">
                                            Story progression and hooks
                                        </span>
                                    </Button>
                                </div>
                                
                                {stats.total_summaries > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <Button variant="ghost" asChild>
                                            <Link href={`/campaigns/${campaign.id}/summaries`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View All Summaries
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
} 
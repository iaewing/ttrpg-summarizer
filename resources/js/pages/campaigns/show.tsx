import { Head, Link } from '@inertiajs/react';
import { Campaign, GameSession } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    ArrowLeft, 
    Plus, 
    Calendar, 
    Users, 
    Activity, 
    FileAudio, 
    FileText,
    Play,
    CheckCircle,
    Clock,
    XCircle,
    Edit
} from 'lucide-react';

interface Props {
    campaign: Campaign & {
        sessions: GameSession[];
    };
    stats: {
        total_sessions: number;
        completed_sessions: number;
        active_players: number;
        active_characters: number;
        total_recordings: number;
        transcribed_recordings: number;
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

export default function CampaignShow({ campaign, stats }: Props) {
    return (
        <AppLayout>
            <Head title={campaign.name} />
            
            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start gap-4">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/campaigns">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Campaigns
                                </Link>
                            </Button>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
                                    <Badge variant={campaign.is_active ? "default" : "secondary"}>
                                        {campaign.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                {campaign.game_system && (
                                    <p className="text-lg text-muted-foreground mb-1">{campaign.game_system}</p>
                                )}
                                {campaign.description && (
                                    <p className="text-muted-foreground max-w-2xl">{campaign.description}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href={`/campaigns/${campaign.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Campaign
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/campaigns/${campaign.id}/sessions/create`}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Session
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Sessions</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.total_sessions}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Completed</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.completed_sessions}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Players</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.active_players}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Characters</span>
                                </div>
                                <p className="text-2xl font-bold">{stats.active_characters}</p>
                            </CardContent>
                        </Card>
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
                    </div>

                    {/* Sessions */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Sessions</CardTitle>
                                    <CardDescription>
                                        Game sessions for this campaign
                                    </CardDescription>
                                </div>
                                <Button asChild>
                                    <Link href={`/campaigns/${campaign.id}/sessions/create`}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Session
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {campaign.sessions?.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold">No sessions yet</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Create your first session to start recording and tracking your campaign.
                                    </p>
                                    <Button asChild>
                                        <Link href={`/campaigns/${campaign.id}/sessions/create`}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Session
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {campaign.sessions?.map((session, index) => (
                                        <div key={session.id}>
                                            {index > 0 && <Separator />}
                                            <div className="flex items-center justify-between py-3">
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(session.status)}
                                                    <div>
                                                        <Link 
                                                            href={`/campaigns/${campaign.id}/sessions/${session.id}`}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {session.title}
                                                        </Link>
                                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                            {session.session_number && (
                                                                <span>Session #{session.session_number}</span>
                                                            )}
                                                            {session.session_date && (
                                                                <span>{new Date(session.session_date).toLocaleDateString()}</span>
                                                            )}
                                                            {session.recordings_count !== undefined && (
                                                                <span>{session.recordings_count} recording{session.recordings_count !== 1 ? 's' : ''}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                                                        {session.status.replace('_', ' ')}
                                                    </span>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/campaigns/${campaign.id}/sessions/${session.id}`}>
                                                            View
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 
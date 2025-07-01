import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Campaign, GameSession, Player, Character } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    Edit,
    Crown,
    User,
    Trash2,
    BookOpen
} from 'lucide-react';

interface Props {
    campaign: Campaign & {
        sessions: GameSession[];
        activePlayers: (Player & { pivot?: { role: string; is_active: boolean; joined_at?: string; left_at?: string; notes?: string } })[];
        activeCharacters: (Character & { pivot?: { introduced_at?: string; left_at?: string; is_active: boolean; campaign_notes?: string } })[];
    };
    availablePlayers: Player[];
    availableCharacters: Character[];
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

export default function CampaignShow({ campaign, availablePlayers, availableCharacters, stats }: Props) {
    const [showAddPlayer, setShowAddPlayer] = useState(false);
    const [showAddCharacter, setShowAddCharacter] = useState(false);
    
    const { data: playerData, setData: setPlayerData, post: postPlayer, processing: processingPlayer, errors: playerErrors, reset: resetPlayer } = useForm({
        player_id: '',
        role: 'player',
        notes: '',
    });
    
    const { data: characterData, setData: setCharacterData, post: postCharacter, processing: processingCharacter, errors: characterErrors, reset: resetCharacter } = useForm({
        character_id: '',
        campaign_notes: '',
    });
    
    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        postPlayer(route('campaigns.players.add', campaign.id), {
            onSuccess: () => {
                resetPlayer();
                setShowAddPlayer(false);
            },
        });
    };
    
    const handleAddCharacter = (e: React.FormEvent) => {
        e.preventDefault();
        postCharacter(route('campaigns.characters.add', campaign.id), {
            onSuccess: () => {
                resetCharacter();
                setShowAddCharacter(false);
            },
        });
    };
    
    const handleRemovePlayer = (playerId: number) => {
        if (confirm('Are you sure you want to remove this player from the campaign?')) {
            router.delete(route('campaigns.players.remove', campaign.id), {
                data: { player_id: playerId },
            });
        }
    };
    
    const handleRemoveCharacter = (characterId: number) => {
        if (confirm('Are you sure you want to remove this character from the campaign?')) {
            router.delete(route('campaigns.characters.remove', campaign.id), {
                data: { character_id: characterId },
            });
        }
    };
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
                                <Link href={`/campaigns/${campaign.id}/summaries`}>
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Summaries
                                </Link>
                            </Button>
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

                    {/* Players & Characters Management */}
                    <div className="grid gap-6 md:grid-cols-2 mb-6">
                        {/* Players */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Players</CardTitle>
                                        <CardDescription>
                                            Players participating in this campaign
                                        </CardDescription>
                                    </div>
                                    <Button 
                                        onClick={() => setShowAddPlayer(!showAddPlayer)}
                                        disabled={availablePlayers.length === 0}
                                        size="sm"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Player
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {showAddPlayer && (
                                    <form onSubmit={handleAddPlayer} className="space-y-3 p-3 border rounded-lg bg-muted/30">
                                        <div className="space-y-2">
                                            <Label htmlFor="player_id">Player</Label>
                                            <Select value={playerData.player_id} onValueChange={(value) => setPlayerData('player_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a player..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availablePlayers.map((player) => (
                                                        <SelectItem key={player.id} value={player.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                {player.is_dm && <Crown className="h-3 w-3" />}
                                                                {player.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {playerErrors.player_id && <p className="text-sm text-destructive">{playerErrors.player_id}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Select value={playerData.role} onValueChange={(value) => setPlayerData('role', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="player">Player</SelectItem>
                                                    <SelectItem value="dm">Dungeon Master</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="notes">Notes (optional)</Label>
                                            <Textarea
                                                value={playerData.notes}
                                                onChange={(e) => setPlayerData('notes', e.target.value)}
                                                placeholder="Any notes about this player's role in the campaign..."
                                                rows={2}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={processingPlayer || !playerData.player_id} size="sm">
                                                Add Player
                                            </Button>
                                            <Button type="button" variant="outline" onClick={() => setShowAddPlayer(false)} size="sm">
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                )}
                                {campaign.activePlayers?.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="h-8 w-8 mx-auto mb-2" />
                                        <p>No players in this campaign yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {campaign.activePlayers?.map((player) => (
                                            <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    {player.is_dm ? <Crown className="h-4 w-4 text-yellow-600" /> : <User className="h-4 w-4" />}
                                                    <div>
                                                        <p className="font-medium">{player.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {player.pivot?.role === 'dm' ? 'Dungeon Master' : 'Player'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemovePlayer(player.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Characters */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Characters</CardTitle>
                                        <CardDescription>
                                            Characters appearing in this campaign
                                        </CardDescription>
                                    </div>
                                    <Button 
                                        onClick={() => setShowAddCharacter(!showAddCharacter)}
                                        disabled={availableCharacters.length === 0}
                                        size="sm"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Character
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {showAddCharacter && (
                                    <form onSubmit={handleAddCharacter} className="space-y-3 p-3 border rounded-lg bg-muted/30">
                                        <div className="space-y-2">
                                            <Label htmlFor="character_id">Character</Label>
                                            <Select value={characterData.character_id} onValueChange={(value) => setCharacterData('character_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a character..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableCharacters.map((character) => (
                                                        <SelectItem key={character.id} value={character.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{character.name}</span>
                                                                {character.player && (
                                                                    <span className="text-muted-foreground text-sm">
                                                                        ({character.player.name})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {characterErrors.character_id && <p className="text-sm text-destructive">{characterErrors.character_id}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="campaign_notes">Campaign Notes (optional)</Label>
                                            <Textarea
                                                value={characterData.campaign_notes}
                                                onChange={(e) => setCharacterData('campaign_notes', e.target.value)}
                                                placeholder="Any notes about this character's role in the campaign..."
                                                rows={2}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={processingCharacter || !characterData.character_id} size="sm">
                                                Add Character
                                            </Button>
                                            <Button type="button" variant="outline" onClick={() => setShowAddCharacter(false)} size="sm">
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                )}
                                {campaign.activeCharacters?.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Activity className="h-8 w-8 mx-auto mb-2" />
                                        <p>No characters in this campaign yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {campaign.activeCharacters?.map((character) => (
                                            <div key={character.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{character.name}</p>
                                                    <div className="text-sm text-muted-foreground">
                                                        {character.race && character.class && (
                                                            <span>{character.race} {character.class}</span>
                                                        )}
                                                        {character.player && (
                                                            <span className="ml-2">• Played by {character.player.name}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveCharacter(character.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
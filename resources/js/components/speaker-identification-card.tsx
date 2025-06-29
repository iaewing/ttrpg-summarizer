import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Crown, Users as UsersIcon, Bot, HelpCircle, Save, FileAudio } from 'lucide-react';
import { Player, SessionSpeaker } from '@/types';

interface Props {
    sessionSpeaker: SessionSpeaker;
    players: Player[];
    onUpdate: (speakerGroupId: string, data: any) => void;
    isUpdating?: boolean;
}

export default function SpeakerIdentificationCard({ sessionSpeaker, players, onUpdate, isUpdating }: Props) {
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>(sessionSpeaker.player?.id?.toString() || 'none');
    const [selectedCharacterId, setSelectedCharacterId] = useState<string>(sessionSpeaker.character?.id?.toString() || 'none');
    const [selectedSpeakerType, setSelectedSpeakerType] = useState<string>(() => {
        const speakerType = sessionSpeaker.speaker_type;
        if (speakerType && speakerType.trim() !== '' && ['dm', 'player', 'npc', 'unknown'].includes(speakerType)) {
            return speakerType;
        }
        return 'unknown';
    });

    const selectedPlayer = players.find(p => p.id.toString() === selectedPlayerId);
    const availableCharacters = selectedPlayer?.characters || [];

    const getDisplayName = () => {
        if (sessionSpeaker.character && sessionSpeaker.player) {
            return `${sessionSpeaker.character.name} (${sessionSpeaker.player.name})`;
        }
        if (sessionSpeaker.character) {
            return sessionSpeaker.character.name;
        }
        if (sessionSpeaker.player) {
            return sessionSpeaker.player.name;
        }
        if (sessionSpeaker.id.startsWith('unidentified_speaker_')) {
            const speakerId = sessionSpeaker.id.replace('unidentified_speaker_', '');
            return `Speaker ${speakerId}`;
        }
        return 'Unknown Speaker';
    };

    const getSpeakerTypeIcon = (type: string) => {
        switch (type) {
            case 'dm':
                return <Crown className="h-4 w-4" />;
            case 'player':
                return <User className="h-4 w-4" />;
            case 'npc':
                return <Bot className="h-4 w-4" />;
            default:
                return <HelpCircle className="h-4 w-4" />;
        }
    };

    const getSpeakerTypeColor = (type: string) => {
        switch (type) {
            case 'dm':
                return 'bg-purple-100 text-purple-700';
            case 'player':
                return 'bg-blue-100 text-blue-700';
            case 'npc':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const handleSave = () => {
        onUpdate(sessionSpeaker.id, {
            player_id: selectedPlayerId === 'none' ? null : selectedPlayerId,
            character_id: selectedCharacterId === 'none' ? null : selectedCharacterId,
            speaker_type: selectedSpeakerType,
        });
    };

    const isIdentified = sessionSpeaker.player || sessionSpeaker.character;
    const hasChanges = 
        selectedPlayerId !== (sessionSpeaker.player?.id?.toString() || 'none') ||
        selectedCharacterId !== (sessionSpeaker.character?.id?.toString() || 'none') ||
        selectedSpeakerType !== (sessionSpeaker.speaker_type || 'unknown');

    return (
        <Card className="transition-colors">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-full ${isIdentified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {getSpeakerTypeIcon(sessionSpeaker.speaker_type)}
                        </div>
                        <CardTitle className="text-lg">
                            {getDisplayName()}
                        </CardTitle>
                    </div>
                    <Badge variant="secondary" className={getSpeakerTypeColor(sessionSpeaker.speaker_type)}>
                        {sessionSpeaker.speaker_type.toUpperCase()}
                    </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <UsersIcon className="h-3 w-3" />
                        {sessionSpeaker.total_segments} segments
                    </span>
                    <span className="flex items-center gap-1">
                        <FileAudio className="h-3 w-3" />
                        {sessionSpeaker.recordings.length} recording(s)
                    </span>
                </div>
                {sessionSpeaker.recordings.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                        Appears in: {sessionSpeaker.recordings.join(', ')}
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor={`speaker-type-${sessionSpeaker.id}`}>Speaker Type</Label>
                        <Select value={selectedSpeakerType} onValueChange={setSelectedSpeakerType}>
                            <SelectTrigger id={`speaker-type-${sessionSpeaker.id}`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unknown">
                                    <div className="flex items-center gap-2">
                                        <HelpCircle className="h-4 w-4" />
                                        Unknown
                                    </div>
                                </SelectItem>
                                <SelectItem value="dm">
                                    <div className="flex items-center gap-2">
                                        <Crown className="h-4 w-4" />
                                        Dungeon Master
                                    </div>
                                </SelectItem>
                                <SelectItem value="player">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Player
                                    </div>
                                </SelectItem>
                                <SelectItem value="npc">
                                    <div className="flex items-center gap-2">
                                        <Bot className="h-4 w-4" />
                                        NPC
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`player-${sessionSpeaker.id}`}>Player</Label>
                        <Select value={selectedPlayerId} onValueChange={(value) => {
                            setSelectedPlayerId(value);
                            setSelectedCharacterId('none'); // Reset character when player changes
                        }}>
                            <SelectTrigger id={`player-${sessionSpeaker.id}`}>
                                <SelectValue placeholder="Select a player..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Player</SelectItem>
                                {players.map((player) => (
                                    <SelectItem key={player.id} value={player.id.toString()}>
                                        <div className="flex items-center gap-2">
                                            {player.is_dm && <Crown className="h-3 w-3" />}
                                            {player.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedPlayerId && selectedPlayerId !== 'none' && availableCharacters.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor={`character-${sessionSpeaker.id}`}>Character</Label>
                            <Select value={selectedCharacterId} onValueChange={setSelectedCharacterId}>
                                <SelectTrigger id={`character-${sessionSpeaker.id}`}>
                                    <SelectValue placeholder="Select a character..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Character</SelectItem>
                                    {availableCharacters.map((character) => (
                                        <SelectItem key={character.id} value={character.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{character.name}</span>
                                                {character.race && character.class && (
                                                    <span className="text-muted-foreground text-sm">
                                                        ({character.race} {character.class})
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {hasChanges && (
                    <>
                        <Separator />
                        <div className="flex justify-end">
                            <Button onClick={handleSave} disabled={isUpdating}>
                                <Save className="h-4 w-4 mr-2" />
                                {isUpdating ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
} 
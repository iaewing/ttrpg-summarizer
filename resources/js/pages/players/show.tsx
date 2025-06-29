import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Mail, Crown, Users, Sword, Calendar, Gamepad2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/types';

interface Props {
    player: Player;
    stats: {
        total_characters: number;
        active_characters: number;
        total_campaigns: number;
        active_campaigns: number;
        dm_campaigns: number;
    };
}

export default function ShowPlayer({ player, stats }: Props) {
    return (
        <AppLayout>
            <Head title={`${player.name} - Player Details`} />
            
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Link href={route('players.index')}>
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Players
                                </Button>
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold tracking-tight">{player.name}</h1>
                                    {player.is_dm && (
                                        <Badge variant="secondary">
                                            <Crown className="h-3 w-3 mr-1" />
                                            DM
                                        </Badge>
                                    )}
                                </div>
                                {player.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                        <Mail className="h-4 w-4" />
                                        <span>{player.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Link href={route('players.edit', player.id)}>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Player
                            </Button>
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Characters</CardTitle>
                                <Sword className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_characters}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.active_characters} active
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_campaigns}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.active_campaigns} active
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">DM Campaigns</CardTitle>
                                <Crown className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.dm_campaigns}</div>
                                <p className="text-xs text-muted-foreground">
                                    As Dungeon Master
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Player Since</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {new Date(player.created_at).getFullYear()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(player.created_at).toLocaleDateString()}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Characters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sword className="h-5 w-5" />
                                    Characters
                                </CardTitle>
                                <CardDescription>
                                    All characters created by this player
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {player.characters && player.characters.length > 0 ? (
                                    <div className="space-y-4">
                                        {player.characters.map((character) => (
                                            <div key={character.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold">{character.name}</h4>
                                                    <Badge variant={character.is_active ? "default" : "secondary"}>
                                                        {character.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    {character.race && (
                                                        <p><span className="font-medium">Race:</span> {character.race}</p>
                                                    )}
                                                    {character.class && (
                                                        <p><span className="font-medium">Class:</span> {character.class}</p>
                                                    )}
                                                    {character.level && (
                                                        <p><span className="font-medium">Level:</span> {character.level}</p>
                                                    )}
                                                    {character.background && (
                                                        <p><span className="font-medium">Background:</span> {character.background}</p>
                                                    )}
                                                </div>
                                                {character.campaigns && character.campaigns.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="text-sm font-medium mb-1">Campaigns:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {character.campaigns.map((campaign) => (
                                                                <Badge key={campaign.id} variant="outline" className="text-xs">
                                                                    {campaign.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Sword className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No characters yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Campaigns */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Gamepad2 className="h-5 w-5" />
                                    Campaigns
                                </CardTitle>
                                <CardDescription>
                                    Campaigns this player is participating in
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {player.campaigns && player.campaigns.length > 0 ? (
                                    <div className="space-y-4">
                                        {player.campaigns.map((campaign) => (
                                            <div key={campaign.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold">{campaign.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={campaign.pivot?.is_active ? "default" : "secondary"}>
                                                            {campaign.pivot?.is_active ? "Active" : "Inactive"}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {campaign.pivot?.role === 'dm' ? 'DM' : 'Player'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                {campaign.description && (
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {campaign.description}
                                                    </p>
                                                )}
                                                {campaign.game_system && (
                                                    <p className="text-sm">
                                                        <span className="font-medium">System:</span> {campaign.game_system}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">No campaigns yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Notes */}
                    {player.notes && (
                        <Card className="mt-8">
                            <CardHeader>
                                <CardTitle>Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none">
                                    <p className="whitespace-pre-wrap">{player.notes}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
} 
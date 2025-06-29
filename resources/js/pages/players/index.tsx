import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, Users, Sword, Crown } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';
import { Player } from '@/types';

interface Props {
    players: Player[];
}

export default function PlayersIndex({ players }: Props) {
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const handleDelete = (player: Player) => {
        if (confirm(`Are you sure you want to delete ${player.name}? This action cannot be undone.`)) {
            setIsDeleting(player.id);
            router.delete(route('players.destroy', player.id), {
                onFinish: () => setIsDeleting(null),
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Players" />
            
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <Heading title="Players" />
                    <Link href={route('players.create')}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Player
                        </Button>
                    </Link>
                </div>

                {players.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No players yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Start by adding players to track their characters and campaigns.
                            </p>
                            <Link href={route('players.create')}>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Player
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {players.map((player) => (
                            <Card key={player.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-lg">
                                                <Link 
                                                    href={route('players.show', player.id)}
                                                    className="hover:underline"
                                                >
                                                    {player.name}
                                                </Link>
                                            </CardTitle>
                                            {player.is_dm && (
                                                <Badge variant="secondary" className="text-xs">
                                                    <Crown className="h-3 w-3 mr-1" />
                                                    DM
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Link href={route('players.edit', player.id)}>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(player)}
                                                disabled={isDeleting === player.id}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {player.email && (
                                        <CardDescription className="text-sm text-muted-foreground">
                                            {player.email}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Sword className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Characters:</span>
                                            <span className="font-medium">{player.characters_count || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Campaigns:</span>
                                            <span className="font-medium">{player.active_campaigns_count || 0}</span>
                                        </div>
                                    </div>
                                    
                                    {player.notes && (
                                        <div className="mt-4 p-3 bg-muted rounded-md">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {player.notes}
                                            </p>
                                        </div>
                                    )}

                                    {player.active_characters && player.active_characters.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium mb-2">Active Characters:</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {player.active_characters.slice(0, 3).map((character) => (
                                                    <Badge key={character.id} variant="outline" className="text-xs">
                                                        {character.name}
                                                    </Badge>
                                                ))}
                                                {player.active_characters.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{player.active_characters.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
} 
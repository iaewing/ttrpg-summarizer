import { Head, Link } from '@inertiajs/react';
import { Campaign } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Scroll, Calendar, Activity } from 'lucide-react';

interface Props {
    campaigns: Campaign[];
}

export default function CampaignsIndex({ campaigns }: Props) {
    return (
        <AppLayout>
            <Head title="Campaigns" />
            
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
                        <p className="text-muted-foreground">
                            Manage your TTRPG campaigns and track their progress.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/campaigns/create">
                            <Plus className="h-4 w-4 mr-2" />
                            New Campaign
                        </Link>
                    </Button>
                </div>

                {campaigns.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Scroll className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">No campaigns yet</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                Create your first campaign to start managing sessions and recordings.
                            </p>
                            <Button asChild>
                                <Link href="/campaigns/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Campaign
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {campaigns.map((campaign) => (
                            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="line-clamp-1">
                                                <Link 
                                                    href={`/campaigns/${campaign.id}`}
                                                    className="hover:underline"
                                                >
                                                    {campaign.name}
                                                </Link>
                                            </CardTitle>
                                            {campaign.game_system && (
                                                <CardDescription className="mt-1">
                                                    {campaign.game_system}
                                                </CardDescription>
                                            )}
                                        </div>
                                        <Badge variant={campaign.is_active ? "default" : "secondary"}>
                                            {campaign.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    {campaign.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                            {campaign.description}
                                        </p>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Sessions</span>
                                            <span className="font-medium">{campaign.sessions_count || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Players</span>
                                            <span className="font-medium">{campaign.active_players_count || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Characters</span>
                                            <span className="font-medium">{campaign.active_characters_count || 0}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Updated {new Date(campaign.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
} 
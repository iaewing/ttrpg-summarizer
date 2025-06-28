import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function CampaignCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        game_system: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('campaigns.store'));
    };

    const commonGameSystems = [
        'D&D 5e',
        'Pathfinder 2e',
        'Pathfinder 1e',
        'Call of Cthulhu',
        'Vampire: The Masquerade',
        'World of Darkness',
        'Shadowrun',
        'Cyberpunk RED',
        'Star Wars RPG',
        'Warhammer 40k',
        'Custom System',
        'Other'
    ];

    return (
        <AppLayout>
            <Head title="Create Campaign" />
            
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/campaigns">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Campaigns
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
                            <p className="text-muted-foreground">
                                Start a new TTRPG campaign to track sessions and recordings.
                            </p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Campaign Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Campaign Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., The Lost Mines of Phandelver"
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="game_system">Game System</Label>
                                    <Select value={data.game_system} onValueChange={(value) => setData('game_system', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a game system" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {commonGameSystems.map((system) => (
                                                <SelectItem key={system} value={system}>
                                                    {system}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.game_system && (
                                        <p className="text-sm text-destructive">{errors.game_system}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Brief description of your campaign..."
                                        rows={4}
                                        className={errors.description ? 'border-destructive' : ''}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-destructive">{errors.description}</p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Campaign'}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href="/campaigns">Cancel</Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 
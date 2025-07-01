import { Head, Link, useForm } from '@inertiajs/react';
import { Campaign } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { FormEventHandler } from 'react';
import { GAME_SYSTEMS } from '@/lib/game-systems';

interface Props {
    campaign: Campaign;
}

export default function CampaignEdit({ campaign }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name: campaign.name || '',
        description: campaign.description || '',
        game_system: campaign.game_system || '',
        is_active: campaign.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('campaigns.update', campaign.id));
    };

    return (
        <AppLayout>
            <Head title={`Edit ${campaign.name}`} />
            
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/campaigns/${campaign.id}`}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to {campaign.name}
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Campaign</h1>
                            <p className="text-muted-foreground">
                                Update your campaign settings and details.
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
                                            {GAME_SYSTEMS.map((system) => (
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

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', !!checked)}
                                    />
                                    <Label htmlFor="is_active" className="text-sm font-normal">
                                        Campaign is active
                                    </Label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating...' : 'Update Campaign'}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={`/campaigns/${campaign.id}`}>Cancel</Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive/20 mt-6">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                                <div>
                                    <h3 className="font-medium">Delete Campaign</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently delete this campaign and all its data. This action cannot be undone.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        if (confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`)) {
                                            // router.delete would be used here in real implementation
                                            console.log('Delete campaign');
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Campaign
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 
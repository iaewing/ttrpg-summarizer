import { Head, Link, useForm } from '@inertiajs/react';
import { Campaign } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    campaign: Campaign;
    nextSessionNumber: number;
}

export default function SessionCreate({ campaign, nextSessionNumber }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        session_number: nextSessionNumber,
        session_date: '',
        duration_minutes: '',
        status: 'planned' as const,
        notes: {} as Record<string, any>,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('campaigns.sessions.store', campaign.id));
    };

    return (
        <AppLayout>
            <Head title={`Create Session - ${campaign.name}`} />
            
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
                            <h1 className="text-3xl font-bold tracking-tight">Create Session</h1>
                            <p className="text-muted-foreground">
                                Add a new game session to <span className="font-medium">{campaign.name}</span>
                            </p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Session Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Session Title *</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="e.g., The Goblin Ambush"
                                            className={errors.title ? 'border-destructive' : ''}
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-destructive">{errors.title}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="session_number">Session Number</Label>
                                        <Input
                                            id="session_number"
                                            type="number"
                                            min="1"
                                            value={data.session_number}
                                            onChange={(e) => setData('session_number', parseInt(e.target.value) || 1)}
                                            className={errors.session_number ? 'border-destructive' : ''}
                                        />
                                        {errors.session_number && (
                                            <p className="text-sm text-destructive">{errors.session_number}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="session_date">Session Date</Label>
                                        <Input
                                            id="session_date"
                                            type="date"
                                            value={data.session_date}
                                            onChange={(e) => setData('session_date', e.target.value)}
                                            className={errors.session_date ? 'border-destructive' : ''}
                                        />
                                        {errors.session_date && (
                                            <p className="text-sm text-destructive">{errors.session_date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                                        <Input
                                            id="duration_minutes"
                                            type="number"
                                            min="1"
                                            value={data.duration_minutes}
                                            onChange={(e) => setData('duration_minutes', e.target.value)}
                                            placeholder="e.g., 240"
                                            className={errors.duration_minutes ? 'border-destructive' : ''}
                                        />
                                        {errors.duration_minutes && (
                                            <p className="text-sm text-destructive">{errors.duration_minutes}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(value: any) => setData('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="planned">Planned</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-destructive">{errors.status}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Brief description of what happens in this session..."
                                        rows={4}
                                        className={errors.description ? 'border-destructive' : ''}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-destructive">{errors.description}</p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Session'}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={`/campaigns/${campaign.id}`}>Cancel</Link>
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
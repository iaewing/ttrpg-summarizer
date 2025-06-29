import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import InputError from '@/components/input-error';
import { Player } from '@/types';

interface Props {
    player: Player;
}

export default function EditPlayer({ player }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    
    const { data, setData, put, processing, errors } = useForm({
        name: player.name || '',
        email: player.email || '',
        is_dm: player.is_dm || false,
        notes: player.notes || '',
        preferences: player.preferences || {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('players.update', player.id));
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${player.name}? This action cannot be undone and will remove all associated data.`)) {
            setIsDeleting(true);
            router.delete(route('players.destroy', player.id), {
                onFinish: () => setIsDeleting(false),
            });
        }
    };

    return (
        <AppLayout>
            <Head title={`Edit ${player.name}`} />
            
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href={route('players.show', player.id)}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Player
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Edit {player.name}</h1>
                    </div>

                    {/* Main Edit Form */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Player Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter player's name"
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="Enter player's email (optional)"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_dm"
                                            checked={data.is_dm}
                                            onCheckedChange={(checked) => setData('is_dm', !!checked)}
                                        />
                                        <Label htmlFor="is_dm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            This player can be a Dungeon Master
                                        </Label>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Add any notes about this player (optional)"
                                            rows={4}
                                        />
                                        <InputError message={errors.notes} />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Link href={route('players.show', player.id)}>
                                        <Button variant="outline" type="button">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Delete Player</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Permanently delete this player and all associated data. This action cannot be undone.
                                        All characters, campaign associations, and speaker attributions will be removed.
                                    </p>
                                </div>
                                <Separator />
                                <div className="flex justify-end">
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {isDeleting ? 'Deleting...' : 'Delete Player'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 
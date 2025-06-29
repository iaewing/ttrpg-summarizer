import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';

export default function CreatePlayer() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        is_dm: false,
        notes: '',
        preferences: {} as Record<string, any>,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('players.store'));
    };

    return (
        <AppLayout>
            <Head title="Create Player" />
            
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href={route('players.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Players
                            </Button>
                        </Link>
                        <Heading title="Create New Player" />
                    </div>

                    <Card>
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
                                    <Link href={route('players.index')}>
                                        <Button variant="outline" type="button">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Creating...' : 'Create Player'}
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
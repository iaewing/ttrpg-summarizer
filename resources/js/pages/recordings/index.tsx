import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileAudio, Plus, Clock, FileText } from 'lucide-react';
import { Recording } from '@/types';

interface Props {
    session: {
        id: number;
        title: string;
        campaign: {
            id: number;
            name: string;
        };
    };
    recordings: Recording[];
}

export default function RecordingsIndex({ session, recordings }: Props) {
    return (
        <AppLayout>
            <Head title={`${session.title} - Recordings`} />
            
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            <Link href={route('campaigns.show', session.campaign.id)} className="text-muted-foreground hover:underline">
                                {session.campaign.name}
                            </Link>
                            <span className="mx-2 text-muted-foreground">/</span>
                            <Link href={route('campaigns.sessions.show', [session.campaign.id, session.id])} className="hover:underline">
                                {session.title}
                            </Link>
                            <span className="mx-2 text-muted-foreground">/</span>
                            <span>Recordings</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Manage and listen to your session recordings
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('sessions.recordings.create', session.id)}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Recording
                        </Link>
                    </Button>
                </div>

                {recordings.length === 0 ? (
                    <Card>
                        <CardHeader className="text-center">
                            <FileAudio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <CardTitle>No recordings yet</CardTitle>
                            <CardDescription>
                                Upload your first recording to get started
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Button asChild>
                                <Link href={route('sessions.recordings.create', session.id)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Upload Recording
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Duration</TableHead>
                                    <TableHead className="hidden md:table-cell">Uploaded</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recordings.map((recording) => (
                                    <TableRow key={recording.id}>
                                        <TableCell className="font-medium">
                                            <Link 
                                                href={route('sessions.recordings.show', [session.id, recording.id])}
                                                className="hover:underline"
                                            >
                                                {recording.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex items-center text-muted-foreground">
                                                <Clock className="h-4 w-4 mr-1" />
                                                {recording.formatted_duration || '--:--'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground">
                                            {new Date(recording.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('sessions.recordings.show', [session.id, recording.id])}>
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        View
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

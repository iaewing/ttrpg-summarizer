import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileAudio, ArrowLeft, FileText, Clock, Calendar, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import AudioPlayer from '@/components/audio-player';
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
    recording: Recording;
}

export default function RecordingShow({ session, recording }: Props) {
    const handleDownload = () => {
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = recording.audio_url || '';
        link.download = recording.original_filename || 'recording';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AppLayout>
            <Head title={`${recording.name} - ${session.title}`} />
            
            <div className="p-6">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href={route('sessions.recordings.index', session.id)}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Recordings
                        </Link>
                    </Button>
                    
                    <h1 className="text-2xl font-bold tracking-tight">
                        <Link href={route('campaigns.show', session.campaign.id)} className="text-muted-foreground hover:underline">
                            {session.campaign.name}
                        </Link>
                        <span className="mx-2 text-muted-foreground">/</span>
                        <Link 
                            href={route('campaigns.sessions.show', [session.campaign.id, session.id])} 
                            className="hover:underline"
                        >
                            {session.title}
                        </Link>
                        <span className="mx-2 text-muted-foreground">/</span>
                        <span>{recording.name}</span>
                    </h1>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        {/* Audio Player */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileAudio className="h-5 w-5 mr-2 text-primary" />
                                    Play Recording
                                </CardTitle>
                                <CardDescription>
                                    Listen to the session recording
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AudioPlayer 
                                    src={recording.audio_url}
                                    mimeType={recording.mime_type}
                                />
                            </CardContent>
                        </Card>

                        {/* Transcription Section - Placeholder for future implementation */}
                        {recording.transcription && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="h-5 w-5 mr-2 text-primary" />
                                        Transcription
                                    </CardTitle>
                                    <CardDescription>
                                        View the transcribed text of this recording
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-muted/50 p-4 rounded-md">
                                        <p className="text-muted-foreground">
                                            {recording.transcription.text || 'No transcription text available.'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Recording Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recording Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                                    <p>{recording.name}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Original Filename</h4>
                                    <p className="break-all">{recording.original_filename}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Duration</h4>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                        {recording.formatted_duration || '--:--'}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">File Size</h4>
                                    <p>{recording.formatted_file_size || 'Unknown'}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Uploaded</h4>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                        {format(new Date(recording.created_at), 'MMM d, yyyy')}
                                    </div>
                                </div>
                                {recording.notes && (
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                                        <p className="whitespace-pre-line">{recording.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start"
                                    onClick={handleDownload}
                                >
                                    <FileDown className="h-4 w-4 mr-2" />
                                    Download Recording
                                </Button>
                                {!recording.transcription && (
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <Link href={route('recordings.transcribe', [session.id, recording.id])}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Transcribe Recording
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

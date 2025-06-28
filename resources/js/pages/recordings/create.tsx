import { Head, Link, useForm } from '@inertiajs/react';
import { GameSession } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, FileAudio } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface Props {
    session: GameSession;
}

export default function RecordingCreate({ session }: Props) {
    const [dragActive, setDragActive] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        file: null as File | null,
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('sessions.recordings.store', session.id), {
            forceFormData: true,
        });
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setData('file', file);
            if (!data.name) {
                setData('name', file.name.replace(/\.[^/.]+$/, ""));
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('file', file);
            if (!data.name) {
                setData('name', file.name.replace(/\.[^/.]+$/, ""));
            }
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const supportedFormats = ['MP3', 'WAV', 'M4A', 'AAC', 'OGG', 'WebM', 'FLAC'];

    return (
        <AppLayout>
            <Head title={`Upload Recording - ${session.title}`} />
            
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('campaigns.sessions.show', [session.campaign_id, session.id])}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to {session.title}
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Upload Recording</h1>
                            <p className="text-muted-foreground">
                                Add an audio recording to <span className="font-medium">{session.title}</span>
                            </p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recording Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {/* File Upload Area */}
                                <div className="space-y-2">
                                    <Label>Audio File *</Label>
                                    <div
                                        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                                            dragActive 
                                                ? 'border-primary bg-primary/5' 
                                                : errors.file 
                                                    ? 'border-destructive bg-destructive/5' 
                                                    : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm,.flac"
                                            onChange={handleFileSelect}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        
                                        {data.file ? (
                                            <div className="text-center">
                                                <FileAudio className="mx-auto h-12 w-12 text-primary mb-4" />
                                                <div className="font-medium">{data.file.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatFileSize(data.file.size)}
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-2">
                                                    Click or drag to replace
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                                <div className="font-medium">Choose a file or drag it here</div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    Supported formats: {supportedFormats.join(', ')}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Maximum file size: 100MB
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {errors.file && (
                                        <p className="text-sm text-destructive">{errors.file}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Recording Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Session 1 - Part 1"
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Any notes about this recording..."
                                        rows={3}
                                        className={errors.notes ? 'border-destructive' : ''}
                                    />
                                    {errors.notes && (
                                        <p className="text-sm text-destructive">{errors.notes}</p>
                                    )}
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-900 mb-2">What happens after upload?</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Your audio file will be securely stored</li>
                                        <li>• You can then start transcription using Deepgram's AI</li>
                                        <li>• Speaker diarization will identify different speakers</li>
                                        <li>• You can map AI speakers to your players and characters</li>
                                    </ul>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" disabled={processing || !data.file}>
                                        {processing ? 'Uploading...' : 'Upload Recording'}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={route('campaigns.sessions.show', [session.campaign_id, session.id])}>
                                            Cancel
                                        </Link>
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
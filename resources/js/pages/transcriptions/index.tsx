import React, { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/ui/alert'
import { Upload, FileAudio, Trash2, Eye, Clock } from 'lucide-react'

interface Transcription {
  id: number
  original_filename: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  confidence: number | null
  created_at: string
  error_message?: string
}

interface Props {
  transcriptions: Transcription[]
  supportedMimeTypes: string[]
}

export default function TranscriptionsIndex({ transcriptions, supportedMimeTypes }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    console.log('File selected via input:', selectedFile)
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    
    const droppedFile = e.dataTransfer.files[0]
    console.log('File dropped:', droppedFile)
    if (droppedFile) {
      // Check if it's an audio file by file extension or MIME type
      const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm', '.flac']
      const fileName = droppedFile.name.toLowerCase()
      const isAudioFile = audioExtensions.some(ext => fileName.endsWith(ext)) || 
                         droppedFile.type.startsWith('audio/')
      
      console.log('Is audio file:', isAudioFile, 'File type:', droppedFile.type, 'File name:', fileName)
      
      if (isAudioFile) {
        setFile(droppedFile)
      } else {
        alert('Please upload an audio file (MP3, WAV, M4A, AAC, OGG, WebM, FLAC)')
      }
    }
  }

  const handleChooseFile = () => {
    console.log('Choose file clicked')
    const input = document.getElementById('audio-upload') as HTMLInputElement
    if (input) {
      console.log('Input found, triggering click')
      input.click()
    } else {
      console.error('Input element not found')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      console.log('No file selected')
      return
    }

    console.log('Submitting file:', file.name, file.size, file.type)
    setUploading(true)
    const formData = new FormData()
    formData.append('audio_file', file)

    router.post('/transcriptions', formData, {
      forceFormData: true,
      onSuccess: (page) => {
        console.log('Upload successful:', page)
        setFile(null)
        setUploading(false)
      },
      onError: (errors) => {
        console.error('Upload failed:', errors)
        setUploading(false)
        alert('Upload failed. Please check the console for details.')
      },
      onFinish: () => {
        console.log('Upload finished')
      }
    })
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this transcription?')) {
      router.delete(`/transcriptions/${id}`)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'outline' | 'secondary' | 'default' | 'destructive'> = {
      pending: 'outline',
      processing: 'secondary',
      completed: 'default',
      failed: 'destructive'
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  return (
    <AppLayout>
      <Head title="Audio Transcriptions" />
      
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Audio Transcriptions</h1>
          <p className="text-muted-foreground">
            Upload audio files and get AI-powered transcriptions with speaker diarization
          </p>
        </div>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Audio File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleChooseFile}
              >
                <FileAudio className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {file ? file.name : 'Drop your audio file here or click to browse'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports: MP3, WAV, M4A, AAC, OGG, WebM, FLAC (Max: 100MB)
                  </p>
                </div>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="audio-upload"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mt-4"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleChooseFile()
                  }}
                >
                  Choose File
                </Button>
              </div>

              {file && (
                <Alert>
                  <FileAudio className="h-4 w-4" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                  </div>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Transcribe
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Transcriptions List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Transcriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {transcriptions.length === 0 ? (
              <div className="text-center py-8">
                <FileAudio className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No transcriptions yet. Upload your first audio file!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transcriptions.map((transcription) => (
                  <div
                    key={transcription.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <FileAudio className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{transcription.original_filename}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          {getStatusBadge(transcription.status)}
                          {transcription.confidence && (
                            <span>• {Math.round(transcription.confidence * 100)}% confidence</span>
                          )}
                          <span>• {new Date(transcription.created_at).toLocaleDateString()}</span>
                        </div>
                        {transcription.error_message && (
                          <p className="text-sm text-destructive mt-1">{transcription.error_message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {transcription.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.visit(`/transcriptions/${transcription.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(transcription.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
} 
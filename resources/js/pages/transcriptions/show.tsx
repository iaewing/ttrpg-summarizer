import React, { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Download, Copy, FileAudio, Users, Clock, TrendingUp } from 'lucide-react'

interface Speaker {
  [key: string]: Array<{
    text: string
    start: number | null
    end: number | null
  }>
}

interface Transcription {
  id: number
  original_filename: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  transcript: string
  speakers: Speaker
  confidence: number | null
  created_at: string
  file_size: string
  mime_type: string
  error_message?: string
}

interface Props {
  transcription: Transcription
}

export default function TranscriptionsShow({ transcription }: Props) {
  const [pauseThreshold, setPauseThreshold] = useState(3) // seconds

  const formatTime = (seconds: number) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes)
    if (size === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(size) / Math.log(k))
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const copyFormattedTranscript = async () => {
    if (!transcription.speakers || Object.keys(transcription.speakers).length === 0) {
      await copyToClipboard(transcription.transcript)
      return
    }

    // Generate formatted transcript with speaker labels
    const allSegments: Array<{
      speaker: string
      text: string
      start: number | null
      end: number | null
    }> = []

    Object.entries(transcription.speakers).forEach(([speaker, segments]) => {
      segments.forEach(segment => {
        allSegments.push({
          speaker,
          ...segment
        })
      })
    })

    allSegments.sort((a, b) => {
      if (!a.start || !b.start) return 0
      return a.start - b.start
    })

    // Group consecutive segments and format for copying
    let formattedText = ''
    let lastSpeaker = ''
    
    for (const segment of allSegments) {
      if (segment.speaker !== lastSpeaker) {
        if (formattedText) formattedText += '\n\n'
        formattedText += `${segment.speaker}: `
        lastSpeaker = segment.speaker
      } else {
        formattedText += ' '
      }
      formattedText += segment.text
    }

    await copyToClipboard(formattedText)
  }

  const getSpeakerCount = () => {
    return Object.keys(transcription.speakers || {}).length
  }

  const renderSpeakerConversation = () => {
    if (!transcription.speakers || Object.keys(transcription.speakers).length === 0) {
      return (
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No speaker diarization available</p>
        </div>
      )
    }

    // Flatten all speaker segments and sort by start time
    const allSegments: Array<{
      speaker: string
      text: string
      start: number | null
      end: number | null
    }> = []

    Object.entries(transcription.speakers).forEach(([speaker, segments]) => {
      segments.forEach(segment => {
        allSegments.push({
          speaker,
          ...segment
        })
      })
    })

    // Sort by start time
    allSegments.sort((a, b) => {
      if (!a.start || !b.start) return 0
      return a.start - b.start
    })

    // Group consecutive segments from the same speaker
    const groupedSegments: Array<{
      speaker: string
      text: string
      start: number | null
      end: number | null
      segmentCount: number
    }> = []

    for (let i = 0; i < allSegments.length; i++) {
      const current = allSegments[i]
      
      if (groupedSegments.length === 0) {
        // First segment
        groupedSegments.push({
          ...current,
          segmentCount: 1
        })
      } else {
        const lastGroup = groupedSegments[groupedSegments.length - 1]
        const timePauseBetween = (current.start && lastGroup.end) 
          ? current.start - lastGroup.end 
          : null
        
        // Group with previous if same speaker and pause is less than threshold (or no timing info)
        if (lastGroup.speaker === current.speaker && 
            (timePauseBetween === null || timePauseBetween <= pauseThreshold)) {
          
          // Combine with previous group
          lastGroup.text += ' ' + current.text
          lastGroup.end = current.end
          lastGroup.segmentCount += 1
        } else {
          // Create new group
          groupedSegments.push({
            ...current,
            segmentCount: 1
          })
        }
      }
    }

    return (
      <div className="space-y-6">
        {groupedSegments.map((group, index) => (
          <div 
            key={index} 
            className={`flex space-x-4 p-4 rounded-lg transition-colors ${
              group.segmentCount > 1 
                ? 'bg-muted/30 border border-muted' 
                : 'hover:bg-muted/10'
            }`}
          >
            <div className="flex-shrink-0 pt-1">
              <Badge 
                variant={group.segmentCount > 1 ? "default" : "outline"} 
                className="w-20 justify-center"
              >
                {group.speaker}
              </Badge>
            </div>
            <div className="flex-1 space-y-2">
              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed text-foreground mb-0 whitespace-pre-wrap">
                  {group.text}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {(group.start || group.end) && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(group.start || 0)} - {formatTime(group.end || 0)}
                    {group.start && group.end && (
                      <span className="ml-1">
                        ({Math.round(group.end - group.start)}s)
                      </span>
                    )}
                  </span>
                )}
                {group.segmentCount > 1 && (
                  <span className="flex items-center gap-1 text-primary">
                    <Users className="h-3 w-3" />
                    {group.segmentCount} segments combined
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (transcription.status === 'failed') {
    return (
      <AppLayout>
        <Head title={`Transcription Failed - ${transcription.original_filename}`} />
        
        <div className="space-y-6 p-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.visit('/transcriptions')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Transcriptions
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Transcription Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{transcription.original_filename}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(transcription.file_size)} • {transcription.mime_type}
                  </p>
                </div>
                
                {transcription.error_message && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-medium text-destructive">Error Message:</p>
                    <p className="text-sm text-destructive mt-1">{transcription.error_message}</p>
                  </div>
                )}

                <Button onClick={() => router.visit('/transcriptions')}>
                  Try Another File
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Head title={`Transcription - ${transcription.original_filename}`} />
      
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.visit('/transcriptions')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Transcriptions
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{transcription.original_filename}</h1>
              <p className="text-muted-foreground">
                Transcribed on {new Date(transcription.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(transcription.transcript)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Raw Text
            </Button>
            {transcription.speakers && Object.keys(transcription.speakers).length > 0 && (
              <Button
                variant="outline"
                onClick={copyFormattedTranscript}
              >
                <Users className="h-4 w-4 mr-2" />
                Copy with Speakers
              </Button>
            )}
          </div>
        </div>

        {/* File Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileAudio className="h-5 w-5" />
              File Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">File Size</p>
                <p className="text-lg font-semibold">{formatFileSize(transcription.file_size)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Format</p>
                <p className="text-lg font-semibold">{transcription.mime_type.split('/')[1].toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Speakers Detected</p>
                <p className="text-lg font-semibold flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {getSpeakerCount()}
                </p>
              </div>
              {transcription.confidence && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                  <p className="text-lg font-semibold flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {Math.round(transcription.confidence * 100)}%
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Full Transcript */}
        <Card>
          <CardHeader>
            <CardTitle>Full Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {transcription.transcript}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Speaker Diarization */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Speaker Diarization
              </CardTitle>
              <div className="flex items-center gap-2 text-sm">
                <label htmlFor="pause-threshold" className="text-muted-foreground">
                  Group threshold:
                </label>
                <select
                  id="pause-threshold"
                  value={pauseThreshold}
                  onChange={(e) => setPauseThreshold(Number(e.target.value))}
                  className="px-2 py-1 text-xs border rounded bg-background"
                >
                  <option value={1}>1s</option>
                  <option value={2}>2s</option>
                  <option value={3}>3s</option>
                  <option value={5}>5s</option>
                  <option value={10}>10s</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderSpeakerConversation()}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
} 
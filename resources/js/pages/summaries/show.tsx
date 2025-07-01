import { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { ArrowLeft, Calendar, Clock, Edit, Eye, Share, Sparkles, User, ChevronDown } from 'lucide-react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Campaign, Summary, GameSession, PageProps } from '@/types'

interface Props extends PageProps {
    summary: Summary
    campaign: Campaign
    session: GameSession
}

const statusColors = {
    draft: 'secondary',
    reviewing: 'default',
    approved: 'outline',
    published: 'default',
} as const

const generatedByIcons = {
    ai: Sparkles,
    user: User,
    hybrid: User,
}

const statusOptions = [
    { value: 'draft', label: 'Draft', description: 'Work in progress' },
    { value: 'reviewing', label: 'Reviewing', description: 'Ready for review' },
    { value: 'approved', label: 'Approved', description: 'Approved for use' },
    { value: 'published', label: 'Published', description: 'Available to players' },
]

export default function SummaryShow({ summary, campaign, session }: Props) {
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    const handleStatusUpdate = (newStatus: string) => {
        if (isUpdatingStatus) return
        
        setIsUpdatingStatus(true)
        router.patch(`/summaries/${summary.id}/status`, { status: newStatus }, {
            onFinish: () => setIsUpdatingStatus(false),
        })
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getTypeLabel = (type: string) => {
        const typeLabels: Record<string, string> = {
            full: 'Full Session Summary',
            highlights: 'Key Highlights',
            character_actions: 'Character Actions',
            plot_points: 'Plot Points',
            campaign_overview: 'Campaign Overview',
            previously_on: 'Previously On...',
        }
        return typeLabels[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    const GeneratedByIcon = generatedByIcons[summary.generated_by]

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(summary.content)
            // You could add a toast notification here
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    return (
        <AppLayout>
            <Head title={summary.title} />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/campaigns/${campaign.id}/summaries`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Summaries
                            </Link>
                        </Button>
                        
                        <div className="h-6 border-l border-gray-300" />
                        
                        <div>
                            <h1 className="text-2xl font-bold">{summary.title}</h1>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                    <GeneratedByIcon className="h-3 w-3" />
                                    {summary.generated_by === 'ai' ? 'AI Generated' : 
                                     summary.generated_by === 'user' ? 'Manual' : 'AI + Manual'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(summary.created_at)}
                                </span>
                                {summary.word_count && (
                                    <span>{summary.word_count} words</span>
                                )}
                                {summary.estimated_reading_time && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {summary.estimated_reading_time} min read
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline">
                            {getTypeLabel(summary.type)}
                        </Badge>
                        
                        {summary.confidence && (
                            <Badge variant="secondary">
                                {Math.round(summary.confidence * 100)}% confidence
                            </Badge>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" disabled={isUpdatingStatus}>
                                    <Badge variant={statusColors[summary.status as keyof typeof statusColors]} className="mr-2">
                                        {summary.status}
                                    </Badge>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {statusOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleStatusUpdate(option.value)}
                                        disabled={summary.status === option.value}
                                    >
                                        <div>
                                            <div className="font-medium">{option.label}</div>
                                            <div className="text-xs text-muted-foreground">{option.description}</div>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="outline" onClick={handleCopyToClipboard}>
                            <Share className="mr-2 h-4 w-4" />
                            Copy
                        </Button>

                        <Button asChild>
                            <Link href={`/summaries/${summary.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Context Cards */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Campaign</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link 
                                href={`/campaigns/${campaign.id}`}
                                className="font-medium text-primary hover:underline"
                            >
                                {campaign.name}
                            </Link>
                            {campaign.game_system && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {campaign.game_system}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Session</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link 
                                href={`/campaigns/${campaign.id}/sessions/${session.id}`}
                                className="font-medium text-primary hover:underline"
                            >
                                Session {session.session_number}: {session.title}
                            </Link>
                            {session.session_date && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {formatDate(session.session_date)}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>Summary Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {summary.content}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Metadata */}
                {summary.metadata && Object.keys(summary.metadata).length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Metadata</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {summary.metadata.word_count && (
                                    <div>
                                        <span className="text-sm font-medium">Word Count:</span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            {summary.metadata.word_count}
                                        </span>
                                    </div>
                                )}
                                {summary.metadata.estimated_reading_time && (
                                    <div>
                                        <span className="text-sm font-medium">Reading Time:</span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            {summary.metadata.estimated_reading_time} minutes
                                        </span>
                                    </div>
                                )}
                                {summary.metadata.generated_at && (
                                    <div>
                                        <span className="text-sm font-medium">Generated:</span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            {formatDate(summary.metadata.generated_at)}
                                        </span>
                                    </div>
                                )}
                                {summary.metadata.context && (
                                    <div>
                                        <span className="text-sm font-medium">Context:</span>
                                        <div className="text-sm text-muted-foreground ml-2 mt-1">
                                            <pre className="text-xs bg-gray-50 p-2 rounded">
                                                {JSON.stringify(summary.metadata.context, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex justify-center mt-8">
                    <Button variant="outline" asChild>
                        <Link href={`/campaigns/${campaign.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Campaign
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    )
} 
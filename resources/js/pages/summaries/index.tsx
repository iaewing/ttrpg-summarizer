import { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { BookOpen, Clock, Eye, PlusCircle, Sparkles, User, MoreHorizontal, FileText, Star, Users, List } from 'lucide-react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Campaign, Summary, PageProps } from '@/types'

interface Props extends PageProps {
    campaign: Campaign
    summaries: {
        data: Summary[]
        links: any[]
        meta: any
    }
    summaryTypes: Record<string, string>
    canGenerate: boolean
}

const typeIcons = {
    full: FileText,
    highlights: Star,
    character_actions: Users,
    plot_points: List,
    campaign_overview: BookOpen,
    previously_on: Sparkles,
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

export default function SummariesIndex({ campaign, summaries, summaryTypes, canGenerate }: Props) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerateCampaignSummary = () => {
        if (isGenerating) return
        
        setIsGenerating(true)
        router.post(`/campaigns/${campaign.id}/summary`, {}, {
            onFinish: () => setIsGenerating(false),
        })
    }

    const handleGenerateRecap = () => {
        if (isGenerating) return
        
        setIsGenerating(true)
        router.post(`/campaigns/${campaign.id}/recap`, {}, {
            onFinish: () => setIsGenerating(false),
        })
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getTypeLabel = (type: string) => {
        return summaryTypes[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    return (
        <AppLayout>
            <Head title={`Summaries - ${campaign.name}`} />

            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Campaign Summaries</h1>
                        <p className="text-muted-foreground mt-1">
                            AI-generated summaries for {campaign.name}
                        </p>
                    </div>
                    
                    {canGenerate && (
                        <div className="flex gap-2">
                            <Button
                                onClick={handleGenerateRecap}
                                disabled={isGenerating}
                                variant="outline"
                            >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Recap
                            </Button>
                            <Button
                                onClick={handleGenerateCampaignSummary}
                                disabled={isGenerating}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Campaign Overview
                            </Button>
                        </div>
                    )}
                </div>

                {!canGenerate && (
                    <Card className="mb-6 border-amber-200 bg-amber-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-amber-800">
                                <Sparkles className="h-4 w-4" />
                                <span className="font-medium">Summary generation not available</span>
                            </div>
                            <p className="text-amber-700 mt-1 text-sm">
                                Configure your Gemini API key to enable AI summary generation.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {summaries.data.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No summaries yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Start by generating summaries for your game sessions.
                            </p>
                            <Button asChild>
                                <Link href={`/campaigns/${campaign.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Sessions
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {summaries.data.map((summary) => {
                            const TypeIcon = typeIcons[summary.type as keyof typeof typeIcons] || FileText
                            const GeneratedByIcon = generatedByIcons[summary.generated_by]
                            
                            return (
                                <Card key={summary.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <TypeIcon className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{summary.title}</CardTitle>
                                                    <CardDescription className="flex items-center gap-4 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <GeneratedByIcon className="h-3 w-3" />
                                                            {summary.generated_by === 'ai' ? 'AI Generated' : 
                                                             summary.generated_by === 'user' ? 'Manual' : 'AI + Manual'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatDate(summary.created_at)}
                                                        </span>
                                                        {summary.word_count && (
                                                            <span>{summary.word_count} words</span>
                                                        )}
                                                        {summary.estimated_reading_time && (
                                                            <span>{summary.estimated_reading_time} min read</span>
                                                        )}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Badge variant={statusColors[summary.status as keyof typeof statusColors]}>
                                                    {summary.status}
                                                </Badge>
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
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/summaries/${summary.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/summaries/${summary.id}/edit`}>
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {summary.content.substring(0, 200)}...
                                        </p>
                                        
                                        <div className="flex justify-between items-center mt-4">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/summaries/${summary.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Read Full Summary
                                                </Link>
                                            </Button>
                                            
                                            {summary.game_session && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/campaigns/${campaign.id}/sessions/${summary.game_session.id}`}>
                                                        View Session
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
                
                {/* Pagination would go here if needed */}
                {summaries.links && summaries.links.length > 3 && (
                    <div className="flex justify-center mt-6">
                        {/* Add pagination component here */}
                    </div>
                )}
            </div>
        </AppLayout>
    )
} 
import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Campaign {
    id: number;
    user_id: number;
    name: string;
    description?: string;
    game_system?: string;
    settings?: Record<string, any>;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    sessions_count?: number;
    active_players_count?: number;
    active_characters_count?: number;
    sessions?: GameSession[];
    players?: (Player & { pivot?: { role: string; is_active: boolean; joined_at?: string; left_at?: string; notes?: string } })[];
    characters?: (Character & { pivot?: { introduced_at?: string; left_at?: string; is_active: boolean; campaign_notes?: string } })[];
}

export interface GameSession {
    id: number;
    campaign_id: number;
    title: string;
    description?: string;
    session_number?: number;
    session_date?: string;
    duration_minutes?: number;
    notes?: Record<string, any>;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
    recordings_count?: number;
    campaign?: Campaign;
    recordings?: Recording[];
    summaries?: Summary[];
}

export interface SessionSpeaker {
    id: string;
    speakers: Speaker[];
    player?: Player;
    character?: Character;
    speaker_type: 'dm' | 'player' | 'npc' | 'unknown';
    total_segments: number;
    recordings: string[];
}

export interface Recording {
    id: number;
    game_session_id: number;
    name: string;
    original_filename: string;
    file_path: string;
    file_size: string;
    mime_type: string;
    duration_seconds?: number;
    recording_order: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    formatted_duration?: string;
    formatted_file_size?: string;
    game_session?: GameSession;
    transcription?: Transcription;
}

export interface Transcription {
    id: number;
    recording_id: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    transcript?: string;
    full_response?: Record<string, any>;
    confidence?: number;
    duration_seconds?: number;
    error_message?: string;
    created_at: string;
    updated_at: string;
    recording?: Recording;
    speakers?: Speaker[];
    // Properties copied from recording for frontend compatibility
    original_filename?: string;
    file_size?: string;
    mime_type?: string;
}

export interface Speaker {
    id: number;
    transcription_id: number;
    speaker_id: string;
    player_id?: number;
    character_id?: number;
    speaker_type: 'dm' | 'player' | 'npc' | 'unknown';
    segments: Array<{
        text: string;
        start?: number;
        end?: number;
    }>;
    created_at: string;
    updated_at: string;
    transcription?: Transcription;
    player?: Player;
    character?: Character;
    display_name_formatted?: string;
}

export interface Player {
    id: number;
    name: string;
    email?: string;
    notes?: string;
    is_dm: boolean;
    preferences?: Record<string, any>;
    created_at: string;
    updated_at: string;
    characters?: Character[];
    campaigns?: (Campaign & { pivot?: { role: string; is_active: boolean; joined_at?: string; left_at?: string; notes?: string } })[];
    characters_count?: number;
    active_campaigns_count?: number;
    active_characters?: Character[];
}

export interface Character {
    id: number;
    player_id: number;
    name: string;
    race?: string;
    class?: string;
    level?: number;
    background?: string;
    description?: string;
    stats?: Record<string, any>;
    equipment?: Record<string, any>;
    notes?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    full_name?: string;
    display_name?: string;
    player?: Player;
    campaigns?: (Campaign & { pivot?: { introduced_at?: string; left_at?: string; is_active: boolean; campaign_notes?: string } })[];
}

export interface Summary {
    id: number;
    game_session_id: number;
    title: string;
    type: 'full' | 'highlights' | 'character_actions' | 'plot_points' | 'campaign_overview' | 'previously_on';
    content: string;
    metadata?: Record<string, any>;
    confidence?: number;
    generated_by: 'ai' | 'user' | 'hybrid';
    status: 'draft' | 'reviewing' | 'approved' | 'published';
    created_at: string;
    updated_at: string;
    word_count?: number;
    estimated_reading_time?: number;
    game_session?: GameSession;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
};

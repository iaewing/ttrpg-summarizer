# 🔄 D&D Session Summarizer Plan

## Overview
The app flow is:
1. Record D&D session audio
2. Transcribe with Deepgram (with speaker diarization)
3. Map speakers to players/characters
4. Summarize story with Gemini (or other LLM agent)

## Summary Types
- Session summaries
- Campaign summaries
- "Last week on..." style recaps

## Technical Requirements
- Use Gemini 2.5 Flash (but design for agent-swappable architecture)
- Comprehensive error handling and logging
- Testing and validation (unit, integration, user testing)
- Export functionality (PDF/Markdown/etc.)
- User authentication and settings management
- Audio playback for uploaded recordings

## 🔄 Next Steps

[x] 1. **Update TranscriptionController** to work with the new Recording → Transcription → Speaker flow
[x] 2. **Create frontend pages** for campaign/session
[x] 3. **Create frontend pages** for player management  
[x] 4. **Implement speaker identification** UI for mapping AI speakers to players/characters
[x] 5. **Build summary generation** using the transcription data
[ ] 6. **Add audio playback** for uploaded recordings
[ ] 7. **Summaries Dashboard** to allow users to easily view all summaries for a particular session
[ ] 8. **Add campaign dashboard** showing sessions, characters, recent activity
[ ] 9. **Laravel Cloud** hosting setup
[ ] 10. **Add comprehensive error handling and logging**
[ ] 11. **Add export functionality**
[ ] 12. **Add user authentication and settings management**
[ ] 12. **Add testing and validation**

## Current Focus
- Campaign dashboard
- Audio playback
- Error handling and logging
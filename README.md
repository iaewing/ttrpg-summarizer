# 🎲 TTRPG Summarizer

A powerful web application for tabletop RPG enthusiasts to record, transcribe, and manage their gaming sessions with advanced speaker identification and AI-powered analysis.

## ✨ Features

### 🎮 Campaign Management
- **Campaign Organization**: Create and manage multiple TTRPG campaigns
- **Session Tracking**: Organize recording sessions within campaigns  
- **Player & Character Management**: Track players and their characters across campaigns
- **Game System Support**: Built-in support for D&D 5e, Pathfinder, and custom systems

### 🎵 Audio Processing
- **Multi-Format Support**: Upload MP3, WAV, M4A, AAC, OGG, WebM, FLAC files (up to 100MB)
- **Drag & Drop Interface**: Intuitive file upload with progress tracking
- **Deepgram Integration**: Professional-grade transcription using Nova 3 model
- **Speaker Diarization**: Automatically identifies different speakers in recordings

### 🗣️ Speaker Attribution
- **AI Speaker Detection**: Automatically separates speakers ("Speaker 0", "Speaker 1", etc.)
- **Player Mapping**: Map AI-identified speakers to real players and characters
- **Character Attribution**: Attribute speech to specific characters (e.g., "John playing Gandahar the Wizard")
- **Smart Grouping**: Combines consecutive speech segments with configurable pause thresholds

### 📊 Analytics & Insights
- **Session Statistics**: Track recordings, transcriptions, and speaker activity
- **Speaker Analytics**: See speaking time and segment counts per speaker
- **Campaign Overview**: Visual dashboards for campaign progress and activity

### 🎯 Modern Interface
- **Beautiful UI**: Built with React, Tailwind CSS, and shadcn/ui components
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Integrated appearance system
- **Intuitive Navigation**: Clean breadcrumbs and organized layouts

## 🚀 Quick Start

### Prerequisites
- PHP 8.1+ with extensions: BCMath, Ctype, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML
- Node.js 18+ and npm
- PostgreSQL 13+
- Composer

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ttrpg-summarizer.git
   cd ttrpg-summarizer
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Configure environment variables**
   ```env
   # Database
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=ttrpg_summarizer
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   
   # Deepgram API (required for transcription)
   DEEPGRAM_API_KEY=your_deepgram_api_key
   ```

6. **Database setup**
   ```bash
   php artisan migrate
   ```

7. **Build frontend assets**
   ```bash
   npm run build
   ```

8. **Start the development server**
   ```bash
   php artisan serve
   npm run dev  # In another terminal for hot reloading
   ```

9. **Visit the application**
   Open http://localhost:8000 in your browser

## 🔧 Configuration

### Deepgram API Setup
1. Sign up at [Deepgram](https://deepgram.com/)
2. Create a new project and generate an API key
3. Add your API key to the `.env` file as `DEEPGRAM_API_KEY`

### File Storage
By default, uploaded recordings are stored in `storage/app/recordings/`. Ensure this directory is writable:
```bash
php artisan storage:link
chmod -R 775 storage/
```

### Supported Audio Formats
- **MP3** - Most common format
- **WAV** - Uncompressed audio  
- **M4A** - Apple's audio format
- **AAC** - Advanced Audio Coding
- **OGG** - Open source format
- **WebM** - Web-optimized format
- **FLAC** - Lossless compression

## 📖 Usage Guide

### 1. Create a Campaign
- Navigate to "Campaigns" in the sidebar
- Click "New Campaign" 
- Fill in campaign details (name, game system, description)
- Set campaign status (Active/Inactive)

### 2. Add a Game Session
- Open your campaign
- Click "New Session"
- Set session details (title, date, duration, status)
- Add session notes and description

### 3. Upload Recordings
- Open a game session
- Click "Upload Recording"
- Drag & drop audio files or browse to select
- Add recording name and optional notes
- Click "Upload Recording"

### 4. Start Transcription
- From the session page, click "Start Transcription" on any recording
- The system will process the audio using Deepgram's AI
- Speaker diarization will automatically identify different speakers
- View results when processing completes

### 5. Map Speakers
- Open the transcription results
- Use the speaker identification UI to map AI speakers to real players
- Assign speech segments to specific characters
- Choose speaker types (DM, Player, NPC, Unknown)

### 6. Review & Export
- View the full transcript with speaker attribution
- Adjust pause thresholds to group related speech segments
- Copy raw text or formatted transcripts with speaker labels
- Use for session summaries and campaign notes

## 🏗️ Technical Architecture

### Backend Stack
- **Laravel 11**: Modern PHP framework with robust features
- **PostgreSQL**: Reliable relational database with JSON support
- **Deepgram API**: Professional speech-to-text with speaker diarization
- **Inertia.js**: Server-side rendering with SPA-like experience

### Frontend Stack
- **React 18**: Component-based UI library
- **TypeScript**: Type-safe JavaScript development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality accessible components
- **Vite**: Fast build tool and development server

### Database Schema
```
campaigns
├── sessions (game_sessions)
    ├── recordings
        └── transcriptions
            └── speakers
```

### Data Flow
1. **Upload** → Audio file stored in Laravel storage
2. **Transcribe** → Deepgram processes audio with Nova 3 + diarization
3. **Speakers** → AI speakers created from Deepgram response
4. **Attribution** → Map AI speakers to players/characters
5. **Display** → Rich transcript with speaker identification

## 🔐 Security Features

- **Authentication**: Built-in Laravel authentication system
- **Authorization**: Campaign-level access control
- **File Validation**: Strict audio file type and size limits
- **Input Sanitization**: XSS protection and SQL injection prevention
- **CSRF Protection**: Cross-site request forgery protection

## 🧪 Testing

Run the test suite:
```bash
php artisan test
```

Run frontend tests:
```bash
npm test
```

## 📝 API Reference

The application uses Inertia.js for seamless server-client communication. Key routes include:

- `GET /campaigns` - List user campaigns
- `POST /campaigns` - Create new campaign
- `GET /campaigns/{id}/sessions` - List campaign sessions  
- `POST /sessions/{session}/recordings` - Upload recording
- `POST /sessions/{session}/recordings/{recording}/transcribe` - Start transcription

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📋 Requirements

### Minimum System Requirements
- **PHP**: 8.1 or higher
- **Node.js**: 18 or higher  
- **PostgreSQL**: 13 or higher
- **Memory**: 512MB RAM minimum
- **Storage**: 2GB free space for recordings

### Recommended
- **PHP**: 8.2+
- **Node.js**: 20+
- **PostgreSQL**: 15+
- **Memory**: 2GB+ RAM
- **Storage**: 10GB+ for audio files

## 🐛 Troubleshooting

### Common Issues

**Upload fails with "file too large" error**
```bash
# Increase PHP upload limits in php.ini
upload_max_filesize = 100M
post_max_size = 100M
max_execution_time = 300
```

**Transcription fails with API error**
- Verify Deepgram API key in `.env`
- Check file format is supported
- Ensure storage directory is writable

**Speakers not appearing correctly**
- Check if recording has speaker diarization enabled
- Verify Deepgram response includes speaker data
- Try shorter audio segments for better accuracy

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Deepgram](https://deepgram.com/) for excellent speech-to-text API
- [Laravel](https://laravel.com/) for the robust backend framework
- [React](https://reactjs.org/) for the dynamic frontend
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- The TTRPG community for inspiration and feedback

## 📞 Support

- 📧 Email: support@ttrpg-summarizer.com
- 💬 Discord: [TTRPG Summarizer Community](https://discord.gg/ttrpg-summarizer)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/ttrpg-summarizer/issues)
- 📖 Documentation: [Wiki](https://github.com/your-username/ttrpg-summarizer/wiki)

---

**Happy Gaming! 🎲** Record your epic adventures and never forget those amazing character moments again! 
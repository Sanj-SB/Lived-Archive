``
/Users/roopa/Desktop/College/Prethesis/Codes/
│
├── index.html                          # Main home page with network graph
│   ├── Navigation bar (Home, Submit, Help ?, Login)
│   ├── Network graph visualization
│   ├── Filter panels (left: tag/search, right: personas/categories)
│   ├── Timeline/Network toggle button
│   ├── Zoom controls
│   └── Modals:
│       ├── Artifact details modal
│       ├── User info modal (for submission)
│       ├── Login modal
│       └── Help modal (new)
│
├── submit.html                         # Artifact submission page
│   ├── File upload (image/PDF/audio)
│   ├── Text input option
│   ├── AI tag generation (Google Gemini API)
│   ├── Tag selection interface (4 categories)
│   ├── Custom tag inputs
│   └── Artifact details form
│
├── admin.html                          # Admin review panel
│   ├── Pending artifacts queue
│   ├── Accept/Reject functionality
│   └── Artifact preview
│
├── css/
│   ├── style.css                       # Main styles
│   │   ├── Header/navbar styles
│   │   ├── Button styles (including help button)
│   │   ├── Modal styles
│   │   ├── Form styles
│   │   └── Responsive design
│   │
│   ├── graph-styles.css                # Graph-specific styles
│   │   ├── Node & link styles
│   │   ├── Tooltip styles
│   │   ├── Filter panel styles
│   │   ├── Timeline toggle styles
│   │   └── Zoom control styles
│   │
│   └── submit-styles.css               # Submit page styles
│       ├── File upload interface
│       ├── Tag selection styles
│       └── Form layout
│
├── js/
│   ├── main.js                         # Entry point module
│   │
│   ├── app.js                          # Application orchestrator
│   │   ├── State management
│   │   ├── Modal handlers
│   │   ├── Supabase data fetching
│   │   └── Global function exports
│   │
│   ├── graph.js                        # Network graph & intro system
│   │   ├── **Intro carousel (4 slides)**
│   │   │   ├── Welcome slide
│   │   │   ├── Finding Content guide
│   │   │   ├── Navigating guide
│   │   │   └── Adding & Tagging guide
│   │   ├── **Persona selection modal**
│   │   │   ├── Start button (no filter)
│   │   │   └── 5 persona options
│   │   ├── D3.js force-directed graph
│   │   ├── Timeline view layout
│   │   ├── Node/link generation
│   │   ├── Category color mapping
│   │   ├── Tooltip system
│   │   ├── Filter system (personas/categories)
│   │   └── Zoom controls
│   │
│   ├── submit.js                       # Submission workflow
│   │   ├── File handling (visual/audio)
│   │   ├── **AI tag generation (Gemini API)**
│   │   │   ├── Rate limiting (3 sec)
│   │   │   ├── Error handling
│   │   │   └── Manual fallback
│   │   ├── Tag display & selection
│   │   ├── Custom tag inputs
│   │   ├── Form validation
│   │   └── Supabase upload
│   │
│   ├── admin.js                        # Admin panel logic
│   │   ├── Review queue management
│   │   ├── Accept/reject handlers
│   │   └── Artifact preview
│   │
│   ├── supabaseClient.js              # Database client
│   │   ├── Supabase initialization
│   │   ├── Storage helpers
│   │   └── Public URL generation
│   │
│   ├── config.js                       # Configuration
│   │   ├── Tag categories (4 types)
│   │   ├── Persona tag mappings
│   │   └── Application settings
│   │
│   ├── navigation.js                   # Page navigation
│   │   └── SPA routing helpers
│   │
│   └── utils.js                        # Utility functions
│       └── Helper methods
│
├── assets/
│   ├── checkbox-filled.svg            # Category filter checkboxes
│   └── checkbox-unfilled.svg
│
└── Database (Supabase):
    ├── Tables:
    │   ├── accepted_artifacts          # Published artifacts
    │   │   ├── id, title, description
    │   │   ├── tags (array)
    │   │   ├── format, date_created
    │   │   ├── file_url, text_content
    │   │   └── submitter info
    │   │
    │   └── pending_artifacts           # Awaiting review
    │       └── (same schema)
    │
    └── Storage Buckets:
        └── artifacts/                  # File uploads
            └── {uuid}/
                ├── visual_{filename}
                └── audio_{filename}
```

## Key Features by Component

### 🎨 User Interface
- **Intro Carousel**: 4-slide onboarding (welcome → finding → navigating → adding)
- **Persona Modal**: Start button + 5 persona filters
- **Help Modal**: Comprehensive guide (? button in navbar)
- **Network/Timeline Views**: Toggle between force-directed and chronological
- **Filter System**: Personas, categories, tags, search

### 🤖 AI Integration
- Google Gemini API for tag suggestions
- Rate limiting (3 seconds between calls)
- Graceful error handling
- Manual tag fallback

### 📊 Data Visualization
- D3.js force-directed graph
- 6 category colors
- Node hover tooltips
- Timeline layout mode
- Zoom controls

### 💾 Data Management
- Supabase backend
- Real-time artifact storage
- File upload to cloud storage
- Pending/accepted workflow

### 🎯 User Flows
1. **First Visit**: Carousel → Persona → Archive
2. **Returning Visit**: Direct to archive (saved persona)
3. **Submit**: User info → Upload → AI tags → Describe → Review
4. **Admin**: Login → Review queue → Accept/Reject

## Technology Stack
- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Visualization**: D3.js v7
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: Google Gemini API (gemini-2.0-flash-exp)
- **Styling**: Custom CSS with Georgia & Roboto fonts

## Recent Updates
- ✅ Intro carousel with skip functionality
- ✅ Persona-based filtering
- ✅ AI-powered tag generation
- ✅ Timeline view with fixed node positions
- ✅ Help modal with guide content
- ✅ Rate limiting for API calls
- ✅ Consistent modal sizing
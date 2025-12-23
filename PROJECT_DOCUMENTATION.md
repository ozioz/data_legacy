# Data Legacy 2.0 - Complete Project Documentation

## 🎮 Project Overview

**Data Legacy 2.0** is a cutting-edge AI-native gaming platform that combines:
- **Career Simulation Mode - Project Genesis**: End-to-End Data Project Simulation with 4 sequential stages
- **Quick Play**: Quick-play games for GenAI enthusiasts (Visionary, The Algorithm, Neural Chess)
- **AI Mock Interview**: Multi-language interview simulation with speech recognition
- **Data Legacy Passport**: Public-facing, shareable verification page with skill matrix

Built with Next.js 14, Supabase, and Groq AI (Llama 3) for extreme low-latency AI interactions.

---

## 🆕 Latest Features (2026)

### Public Modules (Available to All Users)
- ✅ **Career Mode - Project Genesis**: End-to-End Data Project Simulation with 4 sequential stages
  - Stage 1: Source Ingestion (PipelinePuzzle) - Extract and clean raw data
  - Stage 2: Data Modeling (KimballArchitect) - Build Star Schema data warehouse with React Flow (drag-and-drop ERD, edit/delete relationships)
  - Stage 3: Semantic Layer (MetricLab) - Create business measures with block-based formulas
  - Stage 4: Reporting (DashboardCanvas) - Build data visualization dashboard with Recharts
  - **Virtual CTO Companion**: Persistent AI avatar providing guidance and hints in all stages
- ✅ **Quick Play**: Quick-play games for GenAI enthusiasts
  - Visionary: Reverse engineer image generation prompts (dynamic DB levels)
  - The Algorithm: Guess user persona from recommendations
  - Neural Chess: Play chess against AI with Data Engineering metaphors (King=DB, Queen=LLM, etc.)
- ✅ **AI Mock Interview**: Multi-language interview simulation with speech recognition
- ✅ **Data Legacy Passport**: Public-facing profile page with skill matrix (Radar Chart), project progress, and LinkedIn sharing

### Admin-Only Modules (In Progress - Development Phase)
⚠️ **Note**: The following modules are currently in development and only accessible to admin users. They will be made public once development is complete:
- 🚧 **Guilds**: Create/join guilds, compete on leaderboards
  - Guild creation and management
  - Guild leaderboards (sum of members' XP)
  - Join/Leave functionality

**Access Control**: These modules are protected by server-side admin checks in their layout files (`app/*/layout.tsx`). Only users with `is_admin = true` in the `public.users` table can access them. Navigation shows these modules with an "In Progress" badge for admin users only.

### AI Mock Interview
- **Multi-language Support**: Turkish, English, Spanish, French, German
- **Speech-to-Text**: Browser SpeechRecognition API
- **Text-to-Speech**: Browser SpeechSynthesis API
- **Video Call UI**: Camera feed + AI avatar placeholder
- **Transcript Saving**: All conversations saved to Supabase
- **Optimized API Calls**: Rate limiting, debouncing, caching

### Data Legacy Passport (Profile Page)
- **Public-Facing Profile**: Shareable verification page (`/profile`)
- **Layout Sections**:
  - Top: User Avatar, Level, Dynamic Title (based on Project Genesis completion)
  - Middle: Completed Projects (Project Genesis status, progress metrics, dashboard screenshot placeholder)
  - Bottom: Skill Matrix (Radar Chart visualizing coding_speed, analytical_thinking, crisis_management)
- **PDF Resume**: Includes QR code linking to live passport page
- **LinkedIn Sharing**: Pre-filled post text for easy sharing
- **AI Observation**: Displays latest AI career insights from `user_aptitude_metrics`

### Virtual CTO Companion
- **Persistent AI Avatar**: Bottom-right corner during all Project Genesis stages
- **States**: `idle`, `thinking`, `warning`, `celebrating`
- **Event-Based Messages**: Triggers based on game state (e.g., `raw_data_quality` drops below 50%)
- **Hint System**: Click CTO to ask for AI-generated hints based on current game state
- **Integration**: Available in all Project Genesis games (PipelinePuzzle, KimballArchitect, MetricLab, DashboardCanvas), QueryMaster, and BehavioralGame
- **Tech**: Framer Motion for message bubble animations

### Asset Management System
- **Centralized Configuration**: `lib/game/assets.ts` - Single source of truth for all visual assets
- **Asset Types**:
  - Mascots & Heroes (engineer, scientist, analyst)
  - Backgrounds (market, interview)
  - Arcade Game Covers (visionary, agent, algorithm, coach)
  - UI Elements (logo, guild icon, interviewer avatar)
- **Performance**: Uses `next/image` for optimization
- **Fallbacks**: Graceful degradation if assets missing

### The Core - Math & Algorithms
- **Matrix Architecture**: Drag-and-drop neural network layer connection game
  - Matrix dimension matching (matrix multiplication rules)
  - Visual feedback (success/error)
  - Level progression (3-5 layers)
  - Score tracking
- **Gradient Descent**: Interactive optimization algorithm simulator
  - Loss function visualization (2D curve)
  - Learning rate slider (0.01 - 0.5)
  - Real-time ball animation
  - Win/Fail conditions (success, oscillation, stuck)
  - Educational feedback

### Quant Tools (Marketplace Integration)
- **Statistics Learning**: Mini-games integrated into Marketplace
- **Question Types**:
  - **Volatility Analysis**: Calculate standard deviation from price charts
  - **Probability Analysis**: Calculate probability of price going up
- **Rewards**: 10-minute 0% trading fee discount for correct answers
- **Math Skill Score**: Tracks user's statistics knowledge
- **Visualization**: Recharts library for interactive charts

### AI Mock Interview Enhancements
- **Auto-Complete System**:
  - Question limit: 8 questions (optimal: 6-8)
  - Time limit: 20 minutes (optimal: 15-20)
  - AI decision: Ends when sufficient data collected
- **Realistic Scoring**:
  - "I don't know" answers = 20-40 points
  - Accuracy-based calculation
  - Harsh but fair evaluation
- **Emotional Analysis**:
  - Video frame analysis (every 5 seconds)
  - 6 emotional states: neutral, happy, nervous, confident, focused, stressed
  - AI provides emotional feedback in questions
- **Comprehensive Feedback**:
  - Overall score (0-100)
  - SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)
  - Detailed recommendations
  - Technical, Communication, Problem-Solving scores

### Public Resume Verification
- **Public Profile Page**: `/verify/[userId]` - Accessible without authentication
- **Features**:
  - "Verified Data Legacy Profile" badge
  - Level, XP, Coding Hours display
  - Top Technical Skills (with percentiles)
  - Soft Skills (with proficiency levels)
  - Achievements & Certifications
- **PDF Integration**: Resume PDF includes clickable verification link

### Dynamic Market News
- **AI-Generated Headlines**: FAST_MODEL generates tech news
- **Price Effects**: News automatically affects market prices
- **RPC Function**: `apply_market_news()` updates active listings
- **News Ticker**: Scrolling ticker on Marketplace page
- **Volatility Tracking**: `volatility_index` column tracks price fluctuations

### Advanced Social & Economy (Schema Ready)
- **Guild Boss Raids**: Schema ready for future implementation
- **User Memory**: Long-term memory with vector embeddings (schema ready)
- **Market News**: Dynamic news system with price effects

---

## 📁 Project Structure

### Core Game Components

**Career Mode - Project Genesis**:
- `components/game/CareerMap.tsx` - Pipeline visualization UI with Virtual CTO
- `components/game/PipelinePuzzle.tsx` - Stage 1: Source Ingestion with Virtual CTO
- `components/game/KimballArchitect.tsx` - Stage 2: Data Modeling with React Flow (drag-and-drop ERD, edit/delete relationships)
- `components/game/MetricLab.tsx` - Stage 3: Semantic Layer with Virtual CTO
- `components/game/DashboardCanvas.tsx` - Stage 4: Reporting with Recharts (real charts)
- `components/ui/VirtualCTO.tsx` - Persistent AI companion component

**Quick Play**:
- `components/arcade/VisionaryGame.tsx` - Image prompt reverse engineering (dynamic DB levels)
- `components/arcade/AlgorithmGame.tsx` - Persona prediction
- `components/arcade/NeuralChess.tsx` - Chess game with AI Grandmaster Coach (Data Engineering metaphors)

**State Management**:
- `lib/store/game-store.ts` - Zustand store with `ProjectState` interface
- `app/actions/game-actions.ts` - Server actions for project progress
- `app/actions/arcade-actions.ts` - AI evaluation functions (Dashboard)
- `app/actions/chess-actions.ts` - Neural Chess AI moves and board analysis

**Database Schema**:
- `career_progress` table: Stores `ProjectState` (raw_data_quality, model_integrity, semantic_layer_score, business_value, current_stage, stages_completed)

## 📁 Project Structure (Legacy)

```
data_legacy/
├── app/                          # Next.js 14 App Router
│   ├── actions/                  # Server Actions
│   │   ├── ai-actions.ts        # Groq AI functions (scenarios, feedback)
│   │   ├── arcade-actions.ts    # Prompt evaluation, upgrade generation
│   │   ├── chess-actions.ts     # Neural Chess AI moves and board analysis
│   │   ├── game-actions.ts      # Game session tracking, leaderboards
│   │   ├── guild-actions.ts    # Guild operations (create, join, leave)
│   │   ├── market-actions.ts    # Marketplace operations (buy, sell, inventory)
│   │   ├── interview-actions.ts # AI Mock Interview (Groq integration)
│   │   └── resume-actions.ts   # User persona generation for CV
│   ├── arcade/                  # Quick Play Mode
│   │   └── page.tsx            # Quick Play hub with 2 games (Visionary, The Algorithm)
│   ├── auth/                    # Authentication
│   │   ├── page.tsx            # Login page (Email/Anonymous/Guest)
│   │   └── callback/           # Magic link callback
│   ├── career/                  # Career Mode (redirects to /)
│   ├── guilds/                  # Guild System
│   │   ├── page.tsx            # Guild list and leaderboard
│   │   ├── create/              # Create new guild
│   │   └── [id]/               # Guild detail page
│   ├── interview/               # AI Mock Interview
│   │   └── page.tsx            # Interview session setup and execution
│   ├── profile/                 # Data Legacy Passport
│   │   └── page.tsx            # Public-facing profile with skill matrix and project progress
│   ├── verify/                  # Public Resume Verification
│   │   └── [userId]/           # Public profile page
│   ├── page.tsx                # Main Career Mode page
│   ├── layout.tsx              # Root layout (includes Navigation)
│   ├── providers.tsx           # React Query provider
│   └── globals.css             # Global styles
│
├── components/
│   ├── arcade/                 # Quick Play Games
│   │   ├── VisionaryGame.tsx   # Image prompt reverse engineering (dynamic DB levels)
│   │   ├── AlgorithmGame.tsx  # Persona matching game
│   │   └── NeuralChess.tsx     # Chess game with AI Grandmaster Coach
│   ├── game/                   # Career Mode Games
│   │   ├── ModeSelection.tsx   # Career Mode vs Prompt Lab selection
│   │   ├── BehavioralGame.tsx  # AI-powered RPG scenarios
│   │   ├── PipelinePuzzle.tsx  # ETL pipeline builder (with throughput)
│   │   ├── ServerGuardian.tsx   # Tower Defense (classic)
│   │   ├── ServerGuardianRoguelite.tsx # Tower Defense (roguelite)
│   │   ├── NullRunner.tsx      # Signal/Noise collection
│   │   ├── DataFarm.tsx        # Idle farming (with offline mechanics)
│   │   ├── QueryMaster.tsx     # SQL query builder
│   │   ├── HeroSelection.tsx   # Character selection
│   │   ├── PathSelection.tsx   # Technical vs Behavioral path
│   │   └── CareerMap.tsx       # Level selection map
│   ├── interview/              # Interview Components
│   │   ├── InterviewSession.tsx # Video call-style interview UI with Speech API
│   │   └── AudioWaveform.tsx   # Audio waveform visualization
│   └── ui/                     # Reusable UI components
│       ├── StoryModal.tsx      # Mission briefing/debriefing
│       ├── CareerCoachModal.tsx # AI feedback modal
│       ├── GameInstructions.tsx # How to Play modal (Portal-based)
│       ├── Leaderboard.tsx     # Real-time leaderboard
│       ├── VirtualCTO.tsx      # Persistent AI companion
│       └── Navigation.tsx      # Global navigation bar
│
├── lib/
│   ├── game/
│   │   ├── assets.ts           # Centralized asset management (GAME_ASSETS)
│   │   └── constants.ts        # Game constants, levels, items
│   ├── groq/
│   │   ├── client.ts           # Groq SDK client
│   │   └── models.ts           # Hybrid Model Strategy (SMART_MODEL, FAST_MODEL, AUDIO_MODEL)
│   ├── interview/
│   │   ├── cache.ts            # In-memory cache for interview responses
│   │   └── emotion-detector.ts # Facial expression analysis utility
│   ├── resume/
│   │   └── pdf-generator.ts   # PDF resume generation (jspdf) with QR code
│   ├── store/
│   │   └── game-store.ts       # Zustand state management
│   └── supabase/
│       ├── client.ts            # Client-side Supabase
│       └── server.ts            # Server-side Supabase
│
├── supabase/
│   ├── schema.sql              # Main database schema
│   ├── schema_arcade.sql       # Arcade mode extensions
│   ├── schema_social_economy.sql # Social & Economy features (Guilds, Marketplace, Interview)
│   ├── migrations/
│   │   ├── 2026_upgrade.sql    # Advanced features (Guild Raids, User Memory)
│   │   ├── add_admin_system.sql # Admin system tables and policies
│   │   ├── add_visionary_levels.sql # Visionary game levels table
│   │   ├── add_project_genesis_columns.sql # Project Genesis columns (raw_data_quality, model_integrity, etc.)
│   │   └── fix_admin_access.sql # Grant admin access to users
│
└── public/
    └── assets/                 # Game images and mascots
```

---

## 🎯 Core Features

### SECTION 1: Quick Play (Formerly Prompt Lab)

#### Game A: Visionary
- **Mechanic**: Reverse engineer image generation prompts
- **AI**: Groq evaluates semantic similarity (0-100%)
- **Data**: Stores attempts in `prompt_battles` table, uses `visionary_levels` for dynamic level loading
- **UI**: Modern gradient design with responsive layout
- **Admin Panel**: `/admin/visionary` - Auto-generate levels from image directory with AI analysis

#### Game B: The Algorithm
- **Mechanic**: Guess user persona from shopping recommendations
- **AI**: Persona matching score (1-10 converted to 0-100%)
- **Data**: Stores persona evaluations
- **UI**: Shopping cart visualization

#### Game C: Neural Chess
- **Mechanic**: Play chess against AI (The Monolith) with Data Engineering metaphors
- **AI**: 
  - Easy: Greedy algorithm (captures if possible, otherwise random)
  - Medium: Groq FAST_MODEL for quick analysis
  - Hard: Groq SMART_MODEL for deep analysis
- **AI Grandmaster Coach**: Analyzes board position using Data Engineering metaphors
  - King = Production DB, Queen = LLM Model, Rook = Firewall, Bishop = Data Pipeline, Knight = API Gateway, Pawn = Raw Data
- **Features**: 
  - Undo functionality
  - Hint system (3 hints per game)
  - Resign option
  - Auto-analysis when game ends
  - Cyberpunk-styled modal with loading states
- **UI**: Custom dark board colors (#1e293b dark, #334155 light), turn indicators, status messages

### SECTION 2: The Core (Math & Algorithms)

#### Matrix Architecture
- **Mechanic**: Drag-and-drop neural network layer connection
- **Rules**: Matrix multiplication dimension matching ([a×b] × [b×c] = [a×c])
- **Visualization**: Canvas-based with connection lines and arrows
- **Feedback**: Success/Error messages with detailed explanations
- **Progression**: Level system (3-5 layers per level)
- **Scoring**: +10 per connection, +50 for completion

#### Gradient Descent
- **Mechanic**: Interactive optimization algorithm simulator
- **Visualization**: 2D loss function curve with ball animation
- **Controls**: Learning rate slider (0.01 - 0.5)
- **Win Conditions**:
  - Success: Ball reaches global minimum (threshold: 0.01)
  - Oscillation: Learning rate too high (ball bounces)
  - Stuck: Learning rate too low (ball stops early)
- **Educational**: Real-time gradient arrow visualization
- **Scoring**: +100 for success, +50 for partial completion

### SECTION 3: Career Mode Optimizations

#### Mode Selection
- **New Feature**: Choose between Career Mode and Quick Play on startup
- **UI**: Beautiful gradient cards with hover effects
- **Flow**: Mode Selection → Hero Selection → Path Selection → Career Map

#### Tower Defense (Roguelite)
- **New Feature**: AI-generated upgrade cards between waves
- **Mechanic**: Choose 1 of 3 upgrades with trade-offs
- **Data**: Stores deck in `roguelite_decks` table
- **AI**: `generateUpgradeCards()` creates dynamic upgrades

#### Pipeline Puzzle (Throughput)
- **New Feature**: Real-time throughput metric (items/second)
- **Leaderboard**: High throughput scores saved
- **Display**: Shows throughput in HUD

#### Data Farm (Idle Mechanics)
- **New Feature**: Offline resource generation
- **Mechanic**: Calculates resources based on `last_active` timestamp
- **Data**: `idle_production` table tracks production rates
- **Function**: `calculateIdleResources()` RPC function

### SECTION 4: Project Genesis Enhancements

#### Virtual CTO Companion
- **Persistent AI Avatar**: Bottom-right corner during all game stages
- **Event-Based Messages**: Triggers based on game state changes
- **Hint System**: AI-generated contextual hints via Groq
- **Integration**: All Project Genesis games, QueryMaster, BehavioralGame
- **Tech**: Framer Motion animations, Zustand state management

#### Kimball Architect (React Flow)
- **Node-Based UI**: React Flow library for professional ERD visualization
- **Drag-and-Drop Connections**: Connect columns between tables
- **Relationship Types**: One-to-One, One-to-Many, Many-to-Many selection
- **Edit/Delete Relationships**: Click on edge to modify or remove
- **Animated Connections**: Visual feedback for valid/invalid connections
- **Validation**: Real-time Kimball methodology checks

#### Dashboard Canvas (Recharts)
- **Real Charts**: Recharts library for actual data visualization
- **Widget Types**: Bar Chart, Line Chart, KPI Card, Pie Chart, Map
- **AI Evaluation**: Groq analyzes dashboard readability and correctness
- **Dummy Data**: Random data generation for preview
- **Professional Feel**: Tableau/PowerBI-like experience

---

## 🗄️ Database Schema

### Core Tables
- `users` - User profiles, XP, unlocked levels
- `game_sessions` - All game plays with scores
- `behavioral_choices` - RPG scenario decisions

### Arcade Tables
- `prompt_battles` - User prompts and AI scores
- `visionary_levels` - Visionary game levels with AI-generated correct attributes
- `roguelite_decks` - Tower Defense upgrade decks
- `leaderboard_entries` - Enhanced leaderboards
- `idle_production` - Offline resource tracking
- `user_aptitude_metrics` - AI career coach metrics (coding_speed, analytical_thinking, crisis_management)

### Social & Economy Tables
- `guilds` - Guild information (name, leader, total XP)
- `guild_members` - Guild membership and roles
- `guild_raids` - Guild boss raids (schema ready)
- `raid_contributions` - User contributions to raids
- `market_listings` - Active marketplace listings (with volatility_index)
- `market_news` - AI-generated market news with price effects
- `user_inventory` - User item inventory
- `ai_interview_sessions` - Interview transcripts and feedback
- `user_memory` - Long-term user memory with vector embeddings (schema ready)

### User Profile Extensions
- `math_skill_score` - Statistics/math skill from Quant Tools
- `fee_discount_expires_at` - Trading fee discount expiration timestamp

### Views
- `leaderboard` - Top 100 players by XP
- `game_balance_stats` - Win rates per level/game

### RLS Policies
- All tables have Row Level Security enabled
- Users can only view/modify their own data
- Public read access for leaderboards

---

## 🤖 AI Integration (Groq - Hybrid Model Strategy)

### Hybrid Model Architecture

Data Legacy 2.0 uses a **Hybrid Model Strategy** to balance **Latency (Speed)** vs. **Reasoning (Intelligence)**:

#### Model Selection

1. **`SMART_MODEL`** (`llama-3.3-70b-versatile`)
   - **Use Cases**: Complex reasoning tasks requiring high logic and context awareness
   - **Features**: 
     - Complex RPG scenarios with ethical nuance
     - AI Mock Interview (maintains persona and context)
     - Career Coach feedback (professional and analytical)
     - Resume generation (needs deep understanding)
   - **Characteristics**: High reasoning capability, better context understanding, slower response (~500-1000ms), higher token cost

2. **`FAST_MODEL`** (`llama-3.1-8b-instant`)
   - **Use Cases**: Speed-critical tasks needing near-instant responses (<200ms)
   - **Features**:
     - Prompt Lab scoring (Visionary, Algorithm games)
     - Tower Defense upgrade card generation
     - NPC chatter and quick responses
     - Marketplace event generation
   - **Characteristics**: Near-instant responses (<200ms), cost-effective, good for simple logic and scoring, lower reasoning depth

3. **`AUDIO_MODEL`** (`whisper-large-v3`)
   - **Use Cases**: Speech-to-text transcription tasks
   - **Features**: High accuracy transcription, multi-language support, optimized for audio processing

### Core AI Functions

1. **`evaluatePrompt()`** - Semantic similarity scoring
   - **Model**: `FAST_MODEL` (speed-critical)
   - Input: User prompt, target context, game type
   - Output: Score (0-100%), feedback, breakdown
   - Used by: Quick Play games (Visionary, The Algorithm)
   - Latency: <200ms typical

2. **`getAIMove()`** - Neural Chess AI move generation
   - **Model**: `FAST_MODEL` (Medium) or `SMART_MODEL` (Hard)
   - Input: FEN string, difficulty level
   - Output: Best move in UCI format
   - Used by: Neural Chess game
   - Latency: <500ms typical

3. **`analyzeBoardPosition()`** - AI Grandmaster Coach board analysis
   - **Model**: `SMART_MODEL` (deep reasoning)
   - Input: FEN string, current turn
   - Output: Data Engineering metaphor-based analysis
   - Used by: Neural Chess (on-demand or auto on game end)
   - Latency: ~500-1000ms

2. **`generateUpgradeCards()`** - Dynamic card generation
   - **Model**: `FAST_MODEL` (instant between waves)
   - Input: Current wave, existing upgrades
   - Output: 3 unique upgrade cards with trade-offs
   - Used by: Tower Defense roguelite mode

3. **`generateScenario()`** - Dynamic RPG scenarios
   - **Model**: `SMART_MODEL` (complex ethical nuance)
   - Input: User class, level number
   - Output: Workplace conflict scenario with 3 choices
   - Used by: BehavioralGame

4. **`generateCareerCoachFeedback()`** - Post-game analysis
   - **Model**: `SMART_MODEL` (professional and analytical)
   - Input: Game type, win/loss, score, level
   - Output: Personalized feedback linking to real-world concepts
   - Used by: Career Coach modal

5. **`generateInterviewerResponse()`** - AI Mock Interview
   - **Model**: `SMART_MODEL` (persona maintenance and context awareness)
   - Input: Conversation history, job role, level, language, emotional context
   - Output: Technical interview question with emotional feedback
   - Used by: Interview Session component
   - Features: Multi-language support, rate limiting, debouncing, caching, emotional analysis

6. **`generateInterviewFeedback()`** - Comprehensive Interview Evaluation
   - **Model**: `SMART_MODEL` (detailed analysis and SWOT)
   - Input: Full transcript, job role, level, language
   - Output: Overall score (0-100), SWOT analysis, recommendations
   - Used by: Interview completion
   - Features: Accuracy-based scoring, harsh but fair evaluation

7. **`generateMarketNews()`** - Dynamic Market News
   - **Model**: `FAST_MODEL` (instant headline generation)
   - Input: None (generates random tech headline)
   - Output: Headline with price effect (item_type, price_change_percent)
   - Used by: Marketplace
   - Features: Auto-applies to active listings via RPC

6. **`generateChoiceConsequence()`** - Behavioral choice consequences
   - **Model**: `SMART_MODEL` (context understanding)
   - Input: Scenario, choice text, score
   - Output: Immediate consequence and real-world impact
   - Used by: BehavioralGame

### Configuration

- **File**: `lib/groq/models.ts` - Centralized model constants
- **File**: `lib/groq/client.ts` - Groq SDK client with model re-exports
- **Strategy**: Right model for the right task (optimized latency + cost)

---

## 🎮 Game Flow

### Career Mode Flow
```
Mode Selection → Auth → Hero Selection → Path Selection → Career Map → Game → Completion → Career Coach → Career Map
```

### Quick Play Flow
```
Navigation → Quick Play Hub → Select Game (Visionary/The Algorithm/Neural Chess) → Play → AI Evaluation → Score → Save → Next Challenge
```

### The Core Flow
```
Navigation → The Core → Select Game (Matrix/Gradient) → Play → Learn → Complete
```

### Quant Tools Flow
```
Marketplace → Quant Tools Button → Analyze Market → Answer Question → Get Fee Discount (if correct)
```

### Navigation System
- **Global Navigation Bar**: Fixed top navigation on all pages (except `/auth`)
- **Responsive**: Mobile hamburger menu, desktop horizontal menu
- **Dynamic Links**: Shows different links based on authentication status
- **Active State**: Highlights current page
- **Quick Access**: Direct links to Career Mode, Quick Play, The Core, Guilds, Marketplace, Interview, Profile

---

## 🔐 Authentication

### Methods
- **Email/Magic Link**: Requires SMTP configuration in Supabase
- **Anonymous Login**: Works immediately, saves to Supabase
- **Guest Mode**: LocalStorage fallback if anonymous is disabled
- **Auto-redirect**: Unauthenticated users → `/auth`

### User Flow
1. User visits homepage
2. If not authenticated → redirect to `/auth`
3. User can choose:
   - Email login (requires SMTP setup)
   - Anonymous login (works immediately)
   - Guest mode (localStorage only)

---

## 📊 Analytics & Tracking

### Game Sessions
- Every play is tracked with:
  - Score, duration, win/loss
  - Game-specific config (JSONB)
  - XP earned
  - Timestamp

### Behavioral Choices
- RPG decisions stored with:
  - Scenario context
  - Chosen action
  - AI-generated feedback

### Prompt Battles
- Arcade attempts stored with:
  - User input vs target
  - AI score and feedback
  - Game metadata

---

## 🎨 UI/UX Features

### Design System
- **Theme**: Cyberpunk/Dark
- **Colors**: 
  - Neon blue (#00f) - Primary actions
  - Neon green (#0f0) - Success states
  - Purple/Pink gradients - Arcade games
- **Framework**: Tailwind CSS
- **Icons**: Lucide React

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly interactions
- Optimized for all screen sizes

### Modal System
- **GameInstructions**: React Portal-based (z-index: 99999)
- **StoryModal**: Mission briefings (z-index: 200)
- **CareerCoachModal**: AI feedback (z-index: 200)
- All modals have backdrop blur and animations

### Z-Index Hierarchy
1. GameInstructions: 99999 (Portal, always on top)
2. StoryModal: 200
3. CareerCoachModal: 200
4. Game modals: 200
5. Arcade back button: 100
6. Global HUD: 50

---

## 🚀 Deployment Checklist

1. ✅ Run `supabase/schema.sql` in Supabase SQL Editor
2. ✅ Run `supabase/schema_arcade.sql` for arcade features
3. ✅ Run `supabase/schema_social_economy.sql` for social & economy features
4. ✅ Run `supabase/migrations/2026_upgrade.sql` for advanced features (Guild Raids, Market News, User Memory)
5. ✅ Run `supabase/migrations/add_quant_tools.sql` for Quant Tools (math_skill_score, fee_discount_expires_at)
6. ✅ Run `supabase/migrations/add_admin_system.sql` for admin system
7. ✅ Run `supabase/migrations/add_visionary_levels.sql` for Visionary game levels
8. ✅ Run `supabase/migrations/fix_admin_access.sql` to grant admin access (optional, for specific users)
9. ✅ Run `supabase/rpc_execute_market_transaction.sql` for market transactions
10. ✅ Run `supabase/rpc_apply_market_news.sql` for market news price updates
8. ✅ Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY`
4. ✅ Configure Supabase SMTP (optional, for magic links)
5. ✅ Build: `npm run build`
6. ✅ Deploy to Vercel/Netlify

---

## 📈 Performance Optimizations

- **Hybrid Model Strategy**: Right model for the right task (SMART_MODEL for complex reasoning, FAST_MODEL for speed-critical)
- **Groq AI**: Ultra-low latency (<200ms for FAST_MODEL, ~500-1000ms for SMART_MODEL)
- **React Query**: Caching and background refetching
- **Zustand**: Efficient client-side state (persist disabled for CSP)
- **Server Actions**: No API routes needed
- **Database Indexes**: Optimized queries
- **React Portal**: Modal rendering bypasses parent contexts
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: `next/image` for all visual assets
- **API Call Optimization**: Rate limiting, debouncing, in-memory caching for Interview
- **Token Optimization**: Sends only last 6 messages to reduce costs

---

## 🐛 Known Issues & Solutions

### CSP (Content Security Policy)
- **Issue**: Zustand persist middleware uses `eval()`
- **Solution**: Persist middleware temporarily disabled
- **Future**: Re-enable with proper CSP configuration

### Email Login
- **Issue**: Magic links not received
- **Solution**: Configure SMTP in Supabase or use Anonymous/Guest mode
- **Guide**: See `SUPABASE_EMAIL_SETUP.md`

### Modal Z-Index
- **Issue**: Modals appearing behind other elements
- **Solution**: React Portal implementation for GameInstructions
- **Status**: ✅ Fixed

---

## 🔮 Future Enhancements

1. **Game Balance Analytics Dashboard**
   - Auto-adjust difficulty based on win rates
   - A/B testing for game mechanics

2. **Social Features**
   - Friend system
   - Challenge friends
   - Share achievements

3. **Advanced AI Features**
   - Personalized learning paths
   - Adaptive difficulty
   - AI-generated levels

4. **Mobile App**
   - React Native version
   - Push notifications for idle rewards

---

## 📝 Development Notes

### State Management
- **Zustand**: Client-side game state
- **React Query**: Server state synchronization
- **Local Storage**: Guest mode fallback

### File Organization
- **Components**: Organized by feature (game/arcade/ui)
- **Actions**: Server-side logic separated
- **Lib**: Shared utilities and clients

### TypeScript
- Full type coverage
- Strict mode enabled
- No `any` types in production code

---

## 🎓 Learning Resources

- **Next.js 14**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **Groq AI**: https://groq.com/docs
- **Zustand**: https://zustand-demo.pmnd.rs/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 📞 Support & Troubleshooting

For issues or questions:
1. Check browser console for errors
2. Verify environment variables
3. Check Supabase dashboard for RLS policies
4. Review troubleshooting guides in project root

### Common Issues
- **Page not loading**: Check CSP settings, disable persist middleware
- **Email not working**: Use Anonymous or Guest mode
- **Modal behind content**: Should be fixed with Portal implementation

---

## 📄 License & Credits

**Built with ❤️ for the Data Community**

*Version 2.0 - 2026*

**Tech Stack:**
- Next.js 14 (App Router)
- Supabase (PostgreSQL + Auth)
- Groq AI (Llama 3)
- TypeScript
- Tailwind CSS
- Zustand
- React Query

---

## 📋 Changelog

### Version 2.0 (2026)
- ✅ Complete migration to Next.js 14
- ✅ Quick Play (2 games: Visionary, The Algorithm) - rebranded from Prompt Lab
- ✅ Career Mode optimizations
- ✅ Phaser RPG experiment removed (reverted to roadmap UI)
- ✅ Adaptive AI Coach (Phase 2) - Career path analysis with aptitude metrics
- ✅ Admin system with protected routes
- ✅ Navigation optimization (in-progress modules grouped)
- ✅ **Hybrid Model Strategy** (SMART_MODEL, FAST_MODEL, AUDIO_MODEL)
- ✅ AI integration with Groq (optimized model selection)
- ✅ Real-time leaderboards
- ✅ Responsive UI/UX overhaul
- ✅ React Portal for modals
- ✅ Guest mode fallback
- ✅ Mode selection screen
- ✅ Guild System (create, join, leaderboards)
- ✅ Marketplace (buy/sell, inventory, live prices, Quant Tools)
- ✅ AI Mock Interview (multi-language, Speech API, auto-complete, realistic scoring, emotional analysis, SWOT feedback)
- ✅ Resume Generator (PDF export with verification link)
- ✅ Public Resume Verification (public profile pages)
- ✅ Global Navigation System
- ✅ Centralized Asset Management System
- ✅ API call optimizations (rate limiting, debouncing, caching)
- ✅ **The Core** - Math & Algorithms training (Matrix Architecture, Gradient Descent)
- ✅ **Quant Tools** - Statistics learning in Marketplace
- ✅ **Dynamic Market News** - AI-generated headlines with price effects
- ✅ **Advanced Schema** - Guild Raids, User Memory (ready for future implementation)
- ✅ **Project Genesis** - End-to-End Data Project Simulation (4 stages: PipelinePuzzle, KimballArchitect, MetricLab, DashboardCanvas)
- ✅ **Neural Chess** - Chess game with AI Grandmaster Coach using Data Engineering metaphors (Quick Play)
- ✅ **Dashboard Canvas** - Data visualization dashboard builder with AI evaluation

---

**For detailed setup instructions, see `README.md`**
**For Turkish notes, see `TURKCE_NOTLAR.md`**

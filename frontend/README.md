# SITR_APP - Smart Islamic Traditional Recognition App

## 📱 Project Overview

SITR_APP is a React Native mobile application designed to help users manage family photos and detect hijab status in images. The app combines modern technology with Islamic cultural considerations, providing a comprehensive solution for family photo organization and Islamic dress recognition.

## ✨ Key Features

### 🔐 Authentication

- Secure user authentication using Clerk
- Email verification system
- Password reset functionality
- Profile management

### 📊 Dashboard

- Overview of family members
- Quick access to main features
- Settings and preferences
- Internationalization support (Arabic & English)

### 👨‍👩‍👧‍👦 Family Gallery

- Add and manage family members
- Photo organization by family member
- Gender-based categorization
- Hijab status tracking

### 🧕 Hijab Detection

- AI-powered hijab detection in photos
- Processing status tracking
- Results visualization with success/failure states

### 👤 Profile Management

- User profile customization
- Account settings
- Security settings

## 🛠️ Tech Stack

### Frontend

- **React Native** - Mobile framework
- **Expo** - Development platform
- **Expo Router** - File-based navigation
- **TypeScript** - Type safety
- **React Native Paper** - UI components
- **React Native Reanimated** - Animations
- **i18next** - Internationalization

### Backend Services

- **Convex** - Real-time backend
- **Clerk** - Authentication service
- **Python Backend** - Image processing API
- **FastAPI/Flask** - API framework

### Development Tools

- **ESLint** - Code linting
- **TypeScript** - Type checking

## 📁 Project Structure

```
frontend/
├── app/                          # Main application code
│   ├── (tabs)/                   # Tab-based navigation screens
│   │   ├── Dashboard.tsx         # Dashboard screen
│   │   ├── Gallery.tsx           # Family gallery screen
│   │   ├── HijabDetection.tsx    # Hijab detection screen
│   │   └── Profile.tsx           # Profile screen
│   ├── modules/                  # Feature modules
│   │   ├── auth/                 # Authentication module
│   │   ├── dashboard/            # Dashboard module
│   │   ├── familyGallary/        # Family gallery module
│   │   ├── hijabDetection/       # Hijab detection module
│   │   └── profile/              # Profile module
│   └── shared/                   # Shared components and utilities
│       ├── components/           # Reusable UI components
│       ├── constants/            # App constants
│       ├── contexts/             # React contexts
│       ├── locales/              # Internationalization files
│       └── services/             # Shared services
├── assets/                       # Static assets
│   ├── fonts/                    # Custom fonts
│   └── images/                   # App images
├── convex/                       # Convex backend configuration
└── providers/                    # App providers
```

## 🏗️ Module Architecture

The application follows a modular architecture pattern where each feature is self-contained with its own components, hooks, services, and screens. This promotes code reusability, maintainability, and scalability.

### 📐 Module Structure Pattern

Each module follows a consistent structure:

```
module/
├── components/          # UI components specific to this module
├── hooks/              # Custom React hooks for state management
├── screens/            # Screen components (pages)
├── services/           # API calls and external service integrations
└── types/              # TypeScript type definitions (if needed)
```

### 🔐 Auth Module

**Purpose**: Handles user authentication and authorization

**Architecture**:

```
auth/
├── hooks/
│   └── useAuth.ts              # Authentication state management
└── screens/
    ├── _layout.tsx             # Auth navigation layout
    ├── EmailVerification.tsx   # Email verification screen
    ├── ForgotPasswordScreen.tsx # Password reset screen
    ├── signInScreen.tsx        # Sign in screen
    └── signUpScreen.tsx        # Sign up screen
```

**Key Responsibilities**:

- User registration and login
- Email verification process
- Password reset functionality
- Authentication state management
- Integration with Clerk authentication service

### 📊 Dashboard Module

**Purpose**: Provides overview and quick access to main features

**Architecture**:

```
dashboard/
├── components/
│   └── SplashScreen.tsx        # App loading screen
└── screens/
    ├── DashboardScreen.tsx     # Main dashboard screen
    └── SettingsScreen.tsx      # App settings screen
```

**Key Responsibilities**:

- Display family member statistics
- Quick navigation to other modules
- App settings and preferences
- Initial app loading experience

### 👨‍👩‍👧‍👦 Family Gallery Module

**Purpose**: Manages family members and their photos

**Architecture**:

```
familyGallary/
├── components/
│   ├── imagesLayout.tsx        # Photo grid layout component
│   └── modal.tsx               # Photo preview modal
├── hooks/
│   └── useFamilyGallary.ts     # Family data management
└── screens/
    ├── AddMemberScreen.tsx     # Add new family member
    └── GalleryHomeScreen.tsx   # Family gallery home
```

**Key Responsibilities**:

- Add and manage family members
- Photo upload and organization
- Photo gallery display and navigation

### 🧕 Hijab Detection Module

**Purpose**: AI-powered hijab detection in photos

**Architecture**:

```
hijabDetection/
├── components/
│   ├── CompletedResult.tsx     # Success result display
│   ├── FailedResult.tsx        # Failed result display
│   ├── ProcessingState.tsx     # Processing indicator
│   └── UploadCard.tsx          # Photo upload interface
├── hooks/
│   └── useHijabDetection.ts    # Detection state management
├── screens/
│   └── PhotoUploadingScreen.tsx # Main detection screen
└── services/
    └── detection.service.ts    # API integration for detection
```

**Key Responsibilities**:

- Photo upload and preprocessing
- Integration with AI detection API
- Result visualization and feedback

### 👤 Profile Module

**Purpose**: User profile management and preferences

**Architecture**:

```
profile/
├── hooks/
│   └── useProfile.ts           # Profile state management
└── screens/
    └── ProfileScreen.tsx       # Profile editing screen
```

**Key Responsibilities**:

- User profile editing
- Account settings management
- Language preference settings
- Profile photo management

## 🔄 Data Flow Architecture

### State Management Pattern

- **Local State**: Component-level state using `useState`
- **Global State**: Convex real-time queries and mutations
- **Authentication State**: Clerk provider context
- **Custom Hooks**: Encapsulate complex state logic

### Communication Flow

```
Screen Component → Custom Hook → Service Layer → Convex/API → Database
     ↓                ↓              ↓
UI Updates ← State Updates ← Response Data
```

### Module Communication

- **Shared Components**: Reusable UI components in `app/shared/`
- **Shared Services**: Common utilities and API clients
- **Global Context**: Authentication and snackbar notifications
- **Navigation**: Expo Router for screen navigation

## 🎯 Architecture Benefits

1. **Modularity**: Each feature is self-contained and independent
2. **Reusability**: Shared components and hooks reduce code duplication
3. **Maintainability**: Clear separation of concerns makes updates easier
4. **Testability**: Isolated modules can be unit tested independently
5. **Scalability**: New features can be added as new modules
6. **Type Safety**: TypeScript ensures compile-time error checking

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo
- React Native development environment

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   EXPO_PUBLIC_CONVEX_URL=your_convex_url
   ```

4. **Configure Convex**

   ```bash
   npx convex dev
   ```

5. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

## 📱 Usage

### Authentication

1. Launch the app
2. Sign up with email or sign in to existing account
3. Complete email verification if required

### Family Gallery

1. Navigate to the Gallery tab
2. Add family members with their photos
3. Specify gender and hijab status
4. View organized family photos

### Hijab Detection

1. Go to the Hijab Detection tab
2. Upload or take a photo
3. Wait for AI processing
4. View detection results

### Profile Management

1. Access Profile tab
2. Update personal information
3. Change language preferences
4. Manage account settings

## 🔧 Development

### Code Structure Guidelines

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling

## 🌐 Internationalization

The app supports multiple languages:

- **English** (`en.json`)
- **Arabic** (`ar.json`)

Language files are located in `app/shared/locales/`

## 📊 Data Models

### User

- `userName`: User's display name
- `email`: User's email address
- `image`: Profile image URL
- `clerkId`: Clerk authentication ID

### Family Member

- `userId`: Reference to user
- `name`: Member's name
- `gender`: Gender specification
- `hijabStatus`: Boolean hijab status
- `images`: Array of image URLs
- `apiStatus`: Processing status
- `apiTaskId`: API task identifier

## 🔐 Security

- Authentication handled by Clerk
- Secure image storage with Convex
- API request validation

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

## 📞 Support

For support and questions:

- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🙏 Acknowledgments

- Clerk for authentication services
- Convex for backend infrastructure
- Expo team for development tools
- React Native community
- Open source contributors

---

Made with ❤️ for the Islamic community

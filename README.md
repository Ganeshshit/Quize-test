# Quiz Application RBAC (Role-Based Access Control)

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Language](https://img.shields.io/badge/language-JavaScript-yellow)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A comprehensive, role-based access control (RBAC) enabled online quiz application built with modern React and Vite. The application provides a secure platform for conducting quizzes with different user roles including Students, Trainers/Instructors, and Admins.

**Live Demo**: [https://quiz.mediniedutech.in/](https://quiz.mediniedutech.in/)

## 🎯 Features

### Core Features
- ✅ **Role-Based Access Control (RBAC)** - Three distinct user roles with specific permissions
- ✅ **User Authentication** - Secure login and session management
- ✅ **Quiz Management** - Create, update, delete, and manage quizzes
- ✅ **Quiz Attempts** - Students can take quizzes with timed sessions
- ✅ **Real-time Updates** - WebSocket support for live updates via Socket.io
- ✅ **Answer Tracking** - Track student responses and calculate scores
- ✅ **Results Analytics** - Detailed performance metrics and analytics
- ✅ **Responsive Design** - Fully responsive UI for all devices
- ✅ **Dark Mode Theme** - Premium dark theme with animated background particles

### User Roles & Permissions

#### 👨‍💼 Admin
- Manage all users (create, update, delete)
- Create and manage quizzes
- View system-wide analytics
- Manage system settings and configurations
- Access control and permissions management

#### 👨‍🏫 Trainer/Instructor
- Create and manage their own quizzes
- Add questions and answer options
- Set quiz configurations (timer, difficulty, etc.)
- View student performance on their quizzes
- Generate reports for their courses

#### 👨‍🎓 Student
- Browse available quizzes
- Take quizzes with timer
- Submit answers and get instant results
- View detailed results and feedback
- Track their performance history

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.0 - Modern UI library
- **Vite** 7.2.4 - Lightning-fast build tool
- **React Router DOM** 7.9.6 - Client-side routing
- **Tailwind CSS** 4.1.17 - Utility-first CSS framework
- **Zustand** 5.0.9 - Lightweight state management
- **Axios** 1.13.2 - HTTP client for API calls
- **Socket.io** 4.8.1 - Real-time bidirectional communication

### UI Components & Utilities
- **React Hot Toast** 2.6.0 - Beautiful notifications
- **React Icons** 5.5.0 - Icon library
- **Lucide React** 0.555.0 - Modern icon set
- **React Simple Typewriter** 5.0.1 - Typewriter animation effect
- **Prop Types** 15.8.1 - Runtime type checking
- **Crypto-js** 4.2.0 - Encryption utilities
- **Yup** 1.7.1 - Schema validation

### Development Tools
- **ESLint** 9.39.1 - Code linting
- **Tailwind CSS Vite** 4.1.17 - Tailwind integration
- **Vite React SWC** 4.2.2 - Fast React refresh
- **TypeScript Types** - Full type support

### Deployment
- **Vercel** - Hosting and deployment platform

## 📁 Project Structure

```
Quize-test/
├── public/                          # Static assets
│   └── vite.svg                    # Vite logo
│
├── src/                            # Source code
│   ├── api/                        # API integration (to be implemented)
│   ├── assets/                     # Images, fonts, and media
│   │
│   ├── components/                 # Reusable React components
│   │   ├── Layout/                 # Layout components (Header, Footer, Sidebar)
│   │   ├── common/                 # Common/shared components
│   │   ├── comon/                  # Additional common components
│   │   ├── forms/                  # Form components
│   │   ├── trainer/                # Trainer-specific components
│   │   └── ParticlesBackground.jsx # Animated background component
│   │
│   ├── hooks/                      # Custom React hooks
│   │
│   ├── middleware/                 # Authentication & authorization middleware
│   │
│   ├── pages/                      # Page components (screens)
│   │   ├── Dashboard.jsx           # Main dashboard
│   │   ├── admin/                  # Admin pages
│   │   ├── auth/                   # Authentication pages (Login, Register)
│   │   ├── error/                  # Error pages (404, 500, etc.)
│   │   ├── student/                # Student pages
│   │   └── trainer/                # Trainer/Instructor pages
│   │
│   ├── router/                     # Routing configuration
│   │   ├── AppRouter.jsx           # Main router setup
│   │   ├── routes.jsx              # Route definitions
│   │   └── routes-config.js        # Route configurations and permissions
│   │
│   ├── services/                   # API services and external integrations
│   │
│   ├── store/                      # Zustand state management
│   │   ├── auth.store.js           # Authentication state
│   │   ├── quiz.store.js           # Quiz data state
│   │   ├── attempt.store.js        # Quiz attempt state
│   │   └── studentQuiz.store.js    # Student quiz specific state
│   │
│   ├── utils/                      # Utility functions and helpers
│   │
│   ├── App.jsx                     # Root App component
│   ├── App.css                     # App-level styles
│   ├── index.css                   # Global styles
│   └── main.jsx                    # Entry point
│
├── index.html                      # HTML template
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Locked dependencies
├── vite.config.js                  # Vite configuration
├── eslint.config.js                # ESLint configuration
├── vercel.json                     # Vercel deployment configuration
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

## 📋 Prerequisites

Ensure you have the following installed on your system:

- **Node.js** v14 or higher
- **npm** v6+ or **yarn** v1.22+
- **Git** for version control

Verify installation:
```bash
node --version
npm --version
git --version
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Ganeshshit/Quize-test.git
cd Quize-test
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Development
VITE_NODE_ENV=development
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
VITE_JWT_SECRET=your_jwt_secret_key

# Optional: Add your API endpoints
VITE_AUTH_API=http://localhost:3001/api/auth
VITE_QUIZ_API=http://localhost:3001/api/quizzes
VITE_RESULTS_API=http://localhost:3001/api/results
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

The optimized build will be in the `dist` directory.

### 6. Preview Production Build

```bash
npm run preview
```

## 🔧 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint to check code quality
npm run lint
```

## 🔐 Role-Based Access Control (RBAC) System

The application implements a comprehensive RBAC system to control access to features and pages.

### Access Control Configuration

Routes are configured in `src/router/routes-config.js` with specific role requirements:

```javascript
{
  path: '/admin/dashboard',
  element: <AdminDashboard />,
  requiredRoles: ['admin'],
  isPrivate: true
}

{
  path: '/trainer/create-quiz',
  element: <CreateQuiz />,
  requiredRoles: ['trainer', 'admin'],
  isPrivate: true
}

{
  path: '/student/quiz/:id',
  element: <TakeQuiz />,
  requiredRoles: ['student', 'trainer', 'admin'],
  isPrivate: true
}
```

### State Management for Auth

Authentication state is managed in `src/store/auth.store.js` using Zustand:

```javascript
const useAuthStore = create((set) => ({
  user: null,
  role: null,
  token: null,
  isAuthenticated: false,
  
  login: (credentials) => { /* ... */ },
  logout: () => { /* ... */ },
  setUser: (user) => set({ user }),
  checkPermission: (requiredRoles) => { /* ... */ }
}))
```

## 🎓 Key Components & Pages

### Authentication Pages (`src/pages/auth/`)
- **Login** - User login with email and password
- **Register** - New user registration with role selection
- **Forgot Password** - Password reset flow
- **Email Verification** - Email confirmation

### Admin Pages (`src/pages/admin/`)
- **Dashboard** - System overview and analytics
- **User Management** - Manage all users
- **Quiz Management** - Manage all quizzes
- **System Settings** - Configure system settings
- **Reports & Analytics** - View comprehensive reports

### Trainer Pages (`src/pages/trainer/`)
- **Dashboard** - Overview of created quizzes
- **Create Quiz** - Quiz creation interface
- **Edit Quiz** - Modify existing quizzes
- **Manage Questions** - Add/edit/delete questions
- **Student Results** - View student performance

### Student Pages (`src/pages/student/`)
- **Available Quizzes** - Browse available quizzes
- **Take Quiz** - Quiz interface with timer
- **Quiz Results** - View results and feedback
- **Performance History** - Track quiz history

## 📊 State Management (Zustand Stores)

### `auth.store.js`
Manages user authentication state:
- User information and profile
- Authentication tokens
- Login/logout operations
- Permission checks

### `quiz.store.js`
Handles quiz data management:
- Quiz list and details
- Create, update, delete operations
- Quiz metadata and configuration

### `attempt.store.js`
Manages quiz attempt sessions:
- Current attempt data
- Question navigation
- Answer tracking
- Timer management

### `studentQuiz.store.js`
Student-specific quiz state:
- Submitted answers
- Quiz progress
- Results and scores
- Performance tracking

## 🔗 API Integration

The application connects to a backend API for data operations. Create API service files in `src/services/`:

### Example API Service (`src/services/authService.js`)
```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authService = {
  login: (email, password) => 
    axios.post(`${API_BASE_URL}/auth/login`, { email, password }),
  
  register: (userData) => 
    axios.post(`${API_BASE_URL}/auth/register`, userData),
  
  logout: () => 
    axios.post(`${API_BASE_URL}/auth/logout`),
};

export default authService;
```

## 🎨 Styling

### Tailwind CSS
The project uses Tailwind CSS for styling. Global styles are in:
- `src/index.css` - Global utilities and base styles
- `src/App.css` - App-specific styles

### Dark Theme
The application features a dark theme:
- Background: `#0A0A0A`
- Primary Accent: Purple (`#6366f1`)
- Accent: Yellow (`#FACC15`)
- Text: Light gray/white

### Custom Animations
- **Typing Animation** - Hero section title animation
- **Particle Background** - Animated particles in `ParticlesBackground.jsx`
- **Fade & Slide** - Tailwind transition utilities

## 🧪 Testing

Currently, testing framework setup is pending. To add testing:

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Create test files alongside components
# e.g., src/components/Button.test.jsx

# Add test script to package.json
"test": "vitest"
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Use a different port
PORT=3001 npm run dev

# Or change in vite.config.js
```

### Vite Cache Issues
```bash
# Clear cache and reinstall
rm -rf node_modules .vite dist
npm install
```

### Module Not Found Errors
```bash
# Verify all imports use correct paths
# Check that files exist in src/
# Restart development server
npm run dev
```

### API Connection Issues
- Verify backend API is running
- Check `VITE_API_BASE_URL` in `.env`
- Check browser console for CORS errors
- Verify API endpoints match backend routes

### Socket.io Connection
```javascript
// Verify Socket.io is properly configured
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

## 📝 Code Quality

### ESLint Configuration
The project uses ESLint for code quality. Run:

```bash
npm run lint
```

ESLint rules are configured in `eslint.config.js`:
- React best practices
- React Hooks rules
- React Refresh rules

### Code Style Guidelines
- Use functional components
- Use hooks for state management
- Follow Airbnb style guide
- Use meaningful variable names
- Add comments for complex logic
- Keep components focused and reusable

## 🚢 Deployment

### Deploy to Vercel

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub account
   - Select `Quize-test` repository

2. **Configure Build**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variables**
   - Add all `.env` variables to Vercel dashboard
   - These will be injected during build

4. **Deploy**
   - Vercel automatically deploys on push to main
   - Revert deployments anytime from dashboard

### Deploy to Other Platforms

#### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

#### Manual Deployment
```bash
npm run build
# Upload dist/ contents to your hosting
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
   ```bash
   # Visit https://github.com/Ganeshshit/Quize-test
   # Click "Fork" button
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Keep commits atomic and descriptive
   - Follow code style guidelines
   - Test your changes thoroughly

4. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Provide clear description of changes
   - Link any related issues
   - Wait for review and feedback

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

### Get Help
- 📧 **Email**: [Reach out via GitHub](https://github.com/Ganeshshit)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Ganeshshit/Quize-test/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Ganeshshit/Quize-test/discussions)
- 🌐 **Website**: [https://mediniedutech.in](https://mediniedutech.in)

### Report Issues
Found a bug? Please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node version)

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Zustand Documentation](https://zustand-demo.vercel.app)
- [Axios Documentation](https://axios-http.com)
- [Socket.io Documentation](https://socket.io)

## 🙏 Acknowledgments

- Thanks to all contributors and users
- Built with modern web technologies
- Inspired by best practices in educational platforms
- Special thanks to the open-source community

## 📊 Repository Stats

- **Language**: JavaScript (99.7%)
- **Created**: December 9, 2025
- **Last Updated**: September 9, 2026
- **Repository Size**: 441 KB
- **Open Issues**: 3
- **License**: MIT

---

**Last Updated**: September 10, 2026

**Made with ❤️ by [Ganeshshit](https://github.com/Ganeshshit)**

For the latest updates, star ⭐ this repository and follow for announcements!

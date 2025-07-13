# 📋 Modern Todo App

A production-ready, full-stack todo application built with Next.js 15, Supabase, and TypeScript. Features a beautiful interface, comprehensive testing, and exceptional user experience.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![Playwright](https://img.shields.io/badge/Playwright-Testing-45ba4b?style=flat-square&logo=playwright)

## ✨ Features

### Core Functionality
- 🔐 **Authentication** - Secure email/password auth with Supabase
- ✅ **Todo Management** - Create, read, update, delete todos with real-time sync
- 🔍 **Search & Filter** - Find todos instantly and filter by status
- 📱 **Responsive Design** - Optimized for all devices
- 🌙 **Dark Mode** - System preference detection + manual toggle

### User Experience
- ⚡ **Optimistic Updates** - Instant feedback with automatic rollback
- 🍞 **Toast Notifications** - Success/error feedback for all operations
- 💀 **Loading Skeletons** - Elegant loading states instead of spinners
- 🎨 **Smooth Animations** - Micro-interactions and transitions
- 🌐 **Offline Support** - Network status monitoring and indicators

### Accessibility & Quality
- ♿ **WCAG 2.1 AA** - Full accessibility compliance
- ⌨️ **Keyboard Navigation** - Complete keyboard support with shortcuts
- 🧪 **E2E Testing** - Comprehensive Playwright test suite
- 🛡️ **Error Boundaries** - Graceful error handling throughout
- 📊 **Type Safety** - Full TypeScript strict mode

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todolistapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set up the database**
   Run the SQL migration in your Supabase dashboard:
   ```sql
   -- See supabase-migration.sql for complete setup
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

### Run E2E Tests
```bash
# Run all tests
npm test

# Run with UI mode
npm run test:ui

# Run in headed mode
npm run test:headed

# Debug mode
npm run test:debug
```

### Test Coverage
- Authentication flows
- Todo CRUD operations
- Search and filtering
- Accessibility compliance
- Error handling
- Network conditions

## 🏗️ Project Structure

```
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication routes
│   ├── (app)/             # Protected app routes
│   └── globals.css        # Global styles
├── components/
│   ├── features/          # Feature-specific components
│   │   ├── auth/          # Authentication components
│   │   └── todo/          # Todo components
│   ├── ui/                # Reusable UI components
│   └── providers.tsx      # Global providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
├── types/                 # TypeScript type definitions
├── tests/                 # Playwright E2E tests
└── supabase-migration.sql # Database schema
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Beautiful, accessible components
- **Lucide React** - Modern icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Row Level Security** - Database-level access control

### State Management & Data Fetching
- **TanStack Query** - Server state management
- **React Context** - Global client state
- **Optimistic Updates** - Immediate UI feedback

### Testing & Quality
- **Playwright** - End-to-end testing
- **Axe-core** - Accessibility testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

### User Experience
- **Sonner** - Toast notifications
- **Framer Motion** - Smooth animations
- **Loading Skeletons** - Better loading states

## ⚡ Performance Features

- **Optimistic Updates** - Instant UI feedback
- **Efficient Caching** - Smart query invalidation
- **Code Splitting** - Route-based chunking
- **Bundle Optimization** - Tree shaking and minification
- **Image Optimization** - Next.js automatic optimization

## ♿ Accessibility Features

- **ARIA Labels** - Comprehensive screen reader support
- **Keyboard Navigation** - Full keyboard accessibility
- **Focus Management** - Proper focus indicators
- **Color Contrast** - WCAG AA compliant colors
- **Screen Reader Testing** - Verified with multiple tools

## 🔒 Security Features

- **Row Level Security** - Database-level access control
- **Environment Variables** - Secure configuration
- **Input Validation** - Client and server-side validation
- **Error Boundaries** - Graceful error handling
- **HTTPS Enforcement** - Secure communication

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest) 
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically

### Other Platforms
- Netlify
- Railway
- Docker deployment ready

## 🧪 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run Playwright tests
npm run test:ui      # Run tests with UI
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Supabase](https://supabase.com/) - Backend platform
- [Shadcn/ui](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Playwright](https://playwright.dev/) - Testing framework

---

Built with ❤️ using modern web technologies for exceptional user experience.

# 📋 Demo Todo App

A portfolio demonstration app built with Next.js 15 and TypeScript. Designed to showcase modern frontend development skills without external dependencies.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![Playwright](https://img.shields.io/badge/Playwright-Testing-45ba4b?style=flat-square&logo=playwright)
![Demo](https://img.shields.io/badge/Portfolio-Demo-gold?style=flat-square&logo=star)

## ✨ Features

### Core Functionality
- 🔐 **Demo Authentication** - Demo credentials system (demo@todoapp.com / demo123)
- ✅ **Todo Management** - Complete CRUD operations with optimistic updates
- 🔍 **Search & Filter** - Instant search and status-based filtering
- 📱 **Responsive Design** - Optimized for all devices
- 🌙 **Dark Mode** - System preference detection + manual toggle

### User Experience
- ⚡ **Optimistic Updates** -Instant feedback with automatic rollback
- 🍞 **Toast Notifications** - Success/error feedback for all operations
- 💀 **Loading Skeletons** - Elegant loading states instead of spinners
- 🎨 **Smooth Animations** - Micro-interactions and smooth transitions
- 💾 **localStorage Storage** - Data persistence without server

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

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Usage

1. **Use the demo credentials:**
   - **Email**: `demo@todoapp.com`
   - **Password**: `demo123`

2. **Start using the app:**
   - Create, edit, and delete todos
   - Experience the optimistic updates
   - Test the search and filter functionality
   - Try the dark mode toggle

**No setup required!** Everything works immediately with localStorage.

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
- **Tailwind CSS v4** - Utility-first styling with custom variables
- **Radix UI** - Accessible component primitives
- **Lucide React** - Modern icon library

### Storage & Demo
- **localStorage** - Client-side data persistence
- **Demo Authentication** - Hardcoded credentials for easy testing
- **No External Dependencies** - Works offline, no server required

### State Management & Data Fetching
- **TanStack Query** - Server state management with optimistic updates
- **React Context** - Authentication and theme state
- **Custom Hooks** - Feature-specific state management

### Testing & Quality
- **Playwright** - End-to-end testing across browsers
- **Axe-core** - Accessibility compliance testing
- **ESLint** - Code linting with Next.js rules
- **TypeScript Strict Mode** - Full type safety

### User Experience
- **Sonner** - Toast notifications
- **@dnd-kit** - Accessible drag and drop
- **React Hook Form** - Form handling with Zod validation

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

- **Input Validation** - Client-side validation with Zod
- **XSS Protection** - Sanitized user inputs
- **Error Boundaries** - Graceful error handling
- **localStorage Security** - Client-side data isolation
- **Demo Mode** - No real user data stored

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
- [Shadcn/ui](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Playwright](https://playwright.dev/) - Testing framework
- [TanStack Query](https://tanstack.com/query) - Data fetching

---

## 📋 Portfolio Demo

This application is specifically designed as a **portfolio demo** to showcase:

- ✅ Modern Frontend Development (Next.js 15, TypeScript)
- ✅ Scalable Component Architecture
- ✅ Global State and Optimistic Updates
- ✅ Comprehensive E2E Testing
- ✅ Responsive and Accessible Design
- ✅ Modern UX/UI with Dark Mode

**Demo Credentials**: `demo@todoapp.com` / `demo123`

---

Created with ❤️ focusing on modern technologies and exceptional user experience.

**Luis Reche** → [RecheDev](https://github.com/RecheDev)

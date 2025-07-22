# 📋 Demo Todo App

Una aplicación de demostración para portfolio construida con Next.js 15 y TypeScript. Diseñada para mostrar habilidades de desarrollo frontend moderno sin dependencias externas.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![Playwright](https://img.shields.io/badge/Playwright-Testing-45ba4b?style=flat-square&logo=playwright)
![Demo](https://img.shields.io/badge/Portfolio-Demo-gold?style=flat-square&logo=star)

## ✨ Features

### Core Functionality
- 🔐 **Demo Authentication** - Sistema de credenciales demo (demo@todoapp.com / demo123)
- ✅ **Todo Management** - CRUD completo de todos con actualizaciones optimistas
- 🔍 **Search & Filter** - Búsqueda instantánea y filtros por estado
- 📱 **Responsive Design** - Optimizado para todos los dispositivos
- 🌙 **Dark Mode** - Detección de preferencias del sistema + toggle manual

### User Experience
- ⚡ **Optimistic Updates** - Feedback instantáneo con rollback automático
- 🍞 **Toast Notifications** - Feedback de éxito/error para todas las operaciones
- 💀 **Loading Skeletons** - Estados de carga elegantes en lugar de spinners
- 🎨 **Smooth Animations** - Micro-interacciones y transiciones suaves
- 💾 **localStorage Storage** - Persistencia de datos sin servidor

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

**¡No setup required!** Todo funciona inmediatamente con localStorage.

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

### Storage & Demo
- **localStorage** - Client-side data persistence
- **Demo Authentication** - Hardcoded credentials for easy testing
- **No External Dependencies** - Works offline, no server required

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

Esta aplicación está diseñada específicamente como **demo de portfolio** para mostrar:

- ✅ Desarrollo Frontend Moderno (Next.js 15, TypeScript)
- ✅ Arquitectura de Componentes Escalable
- ✅ Estado Global y Optimistic Updates
- ✅ Testing E2E Comprehensivo
- ✅ Diseño Responsivo y Accesible
- ✅ UX/UI Moderna con Dark Mode

**Credenciales Demo**: `demo@todoapp.com` / `demo123`

---

Creado con ❤️ enfocándose en tecnologías modernas y experiencia de usuario excepcional.

**Luis Reche** → [RecheDev](https://github.com/RecheDev)

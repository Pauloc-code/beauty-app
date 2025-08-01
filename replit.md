# Beauty App - Service Management and Booking Platform

## Overview

This is a dual-interface beauty service management platform designed for nail technicians and their clients. The application consists of a mobile-optimized client interface for booking services and viewing portfolios, and a comprehensive web-based administrative panel for business management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Progress (August 1, 2025)

### Completed Features
- **Settings Management**: Fixed critical save functionality with proper apiRequest parameter order
- **Holiday System**: Complete Brazilian holiday display system in calendar with regional support
- **Calendar Configuration**: Working hours, timezone, and holiday region settings fully functional
- **Dashboard Today's Schedule**: Fixed appointment filtering to display current day appointments correctly
- **Gallery Upload System**: Fully implemented with file upload functionality from device storage
- **Calendar System**: Complete calendar visualization with month, week, and day views
- **Filter System**: Functional filtering by status, service, and client for appointments
- **Appointment Management**: Full CRUD operations with edit and cancellation capabilities

### Current Status
- Admin panel fully functional with ALL core features implemented and working
- Settings save system completely resolved (apiRequest parameter order corrected)
- Holiday display working in calendar with national and regional Brazilian holidays
- Dashboard today's appointments and statistics both showing consistent counts (FIXED)
- Gallery management with image upload from device files (not URLs)
- Calendar with multiple view modes and appointment editing
- Filter system working correctly for appointment management
- Future appointments list view with chronological organization

### Technical Notes
- Critical Fix: apiRequest function expects (method, url, data) parameters, not (url, options)
- Holiday System: Supports national holidays + regional holidays for São Paulo, Rio, Manaus, Fortaleza
- Dashboard Fix: Changed from server-side date filtering to client-side filtering for reliability
- Object storage properly configured for image uploads
- Database schema optimized for beauty salon operations
- All major admin panel features completed and tested

### Next Steps
- Mobile interface implementation and integration
- Final testing and deployment preparation
- Any additional features or refinements as requested

## System Architecture

The application follows a full-stack architecture with clear separation between client and server components:

- **Frontend**: React with TypeScript for both mobile and admin interfaces
- **Backend**: Node.js with Express.js serving RESTful APIs  
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for fast development and optimized builds

## Key Components

### Frontend Structure
- **Client Interface** (`/client/src/pages/mobile-app.tsx`): Mobile-optimized app for customers
  - Home dashboard with next appointments
  - Service catalog with pricing and points
  - Portfolio gallery of work examples
  - Appointment booking and history
- **Admin Panel** (`/client/src/pages/admin-panel.tsx`): Web interface for business management
  - Dashboard with daily statistics
  - Calendar for appointment management
  - Client relationship management (CRM)
  - Service catalog management
  - Gallery content management
  - Financial reporting and transaction tracking

### Backend Architecture
- **Database Layer** (`/server/db.ts`): Neon PostgreSQL connection with connection pooling
- **API Routes** (`/server/routes.ts`): RESTful endpoints for all business operations
- **Storage Layer** (`/server/storage.ts`): Data access abstraction layer
- **Schema** (`/shared/schema.ts`): Drizzle ORM schema definitions with Zod validation

### Database Schema
The system uses six main entities:
- **Users**: Admin authentication and authorization
- **Clients**: Customer profiles with CPF-based authentication
- **Services**: Service catalog with pricing, duration, and loyalty points
- **Appointments**: Booking system with status tracking
- **Gallery Images**: Portfolio management for showcasing work
- **Transactions**: Financial tracking and reporting

## Data Flow

1. **Client Authentication**: CPF-based login system for customers
2. **Service Discovery**: Clients browse services with real-time pricing and availability
3. **Booking Process**: Real-time appointment scheduling with conflict prevention
4. **Admin Management**: Comprehensive business management through web interface
5. **Data Synchronization**: Real-time updates between client and admin interfaces

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe ORM with schema validation
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Form management with validation
- **date-fns**: Date manipulation and formatting with Portuguese locale

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first styling approach
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

The application is configured for Replit deployment with the following setup:

### Development Mode
- Frontend served by Vite dev server with HMR
- Backend runs on Express with automatic restarts
- Database migrations handled by Drizzle Kit

### Production Build
- Frontend built as static assets using Vite
- Backend bundled with ESBuild for Node.js runtime
- Single deployment artifact serving both client and API

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Automatic database provisioning check on startup
- Development/production mode switching via `NODE_ENV`

### Key Architectural Decisions

**Database Choice**: PostgreSQL with Drizzle ORM chosen for:
- Strong typing and schema validation
- Complex relational queries for appointments and client management
- Built-in connection pooling for scalability

**Authentication Strategy**: CPF-based authentication for clients provides:
- Simplified user experience (no password management)
- Brazilian market compliance
- Easy integration with existing customer databases

**State Management**: TanStack Query selected for:
- Automatic caching and background updates
- Optimistic updates for better UX
- Built-in loading and error states

**UI Framework**: shadcn/ui with Radix primitives chosen for:
- Accessibility compliance out of the box
- Consistent design system
- Customizable component library
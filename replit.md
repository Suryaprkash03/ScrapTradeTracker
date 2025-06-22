# ScrapFlow - Metal Trading Management System

## Overview

ScrapFlow is a comprehensive metal trading management system built as a full-stack web application. The system manages inventory, partners, deals, shipments, payments, and quality checks for metal trading operations. It features role-based access control with three user types: admin, export_manager, and yard_staff.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the client-side application
- **Vite** as the build tool and development server
- **Tailwind CSS** with shadcn/ui components for styling
- **Wouter** for client-side routing
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation for form handling
- **Zustand** with persistence for authentication state management

### Backend Architecture
- **Node.js** with Express.js server
- **TypeScript** for type safety across the stack
- **ESM modules** for modern JavaScript imports
- **Custom storage interface** for data persistence abstraction
- **Session-based authentication** with role-based access control

### Database Architecture
- **PostgreSQL** as the primary database
- **Drizzle ORM** for type-safe database operations
- **Neon Database** serverless PostgreSQL for cloud hosting
- Comprehensive schema covering all business entities with proper relationships

## Key Components

### Authentication & Authorization
- Session-based authentication system
- Role-based access control (admin, export_manager, yard_staff)
- Protected routes with automatic redirection
- User management with active/inactive status

### Core Business Modules
1. **Inventory Management** - Track metal types, grades, quantities, and locations
2. **Partner Management** - Manage suppliers, buyers, and their documentation
3. **Deal Management** - Handle transactions between partners and inventory items
4. **Shipment Tracking** - Monitor container shipments and logistics
5. **Financial Management** - Process payments and track financial transactions
6. **Quality Control** - Manage quality checks and compliance reports
7. **Reporting & Analytics** - Generate business insights and reports

### UI/UX Components
- Comprehensive component library using Radix UI primitives
- Responsive design with mobile support
- Toast notifications for user feedback
- Modal dialogs for data entry and editing
- Loading states with skeleton components
- Form validation with error handling

## Data Flow

### Client-Server Communication
1. **API Layer**: RESTful API endpoints for all CRUD operations
2. **Query Management**: TanStack Query handles caching, synchronization, and error states
3. **State Management**: Zustand manages global authentication state
4. **Form Handling**: React Hook Form with Zod schemas for validation

### Database Operations
1. **ORM Layer**: Drizzle ORM provides type-safe database queries
2. **Schema Management**: Centralized schema definitions with automatic TypeScript types
3. **Migrations**: Database schema changes managed through Drizzle migrations
4. **Connection Management**: Serverless database connections through Neon

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, ReactDOM, React Hook Form)
- Vite build tooling with TypeScript support
- Express.js server framework
- Drizzle ORM with PostgreSQL driver

### UI Component Libraries
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography
- Class Variance Authority for component variants

### Database & Storage
- @neondatabase/serverless for PostgreSQL connection
- connect-pg-simple for session storage
- Drizzle Kit for database migrations

### Development Tools
- TypeScript for type safety
- ESBuild for production builds
- PostCSS with Autoprefixer for CSS processing

## Deployment Strategy

### Development Environment
- Replit-hosted development with hot reloading
- Vite development server with middleware integration
- PostgreSQL 16 module for database services
- Node.js 20 runtime environment

### Production Build
- Vite builds client-side assets to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Static file serving through Express middleware
- Environment-based configuration management

### Database Management
- Drizzle migrations for schema changes
- Environment variable configuration for database URLs
- Serverless PostgreSQL for scalable data storage

## Recent Changes

```
Recent Changes:
- June 22, 2025: Successfully migrated application from in-memory storage to PostgreSQL database
- Implemented complete database schema with Drizzle ORM for persistent data storage
- Added full CRUD operations across all modules with database persistence
- Enhanced dashboard with Quick Actions and Recent Activities components
- Implemented Edit/Delete functionality for Deals, Inventory, Partners, and Shipments
- Added comprehensive modal-based editing for all major entities
- Fixed SelectItem validation errors and improved form handling
- Database seeding with default users and system settings
- All modules now have complete Create, Read, Update, Delete operations
- Full production-ready application with working sidebar navigation and role-based access
- Added comprehensive sample data across all modules for testing
- Fixed admin documents module and populated with sample documents
- Added Scrap Lifecycle Status display on admin dashboard
- Created complete USER_MANUAL.md with detailed system documentation
```

## User Role Permissions

### Admin Access
- Full system access with all CRUD operations
- User management and role assignment
- System settings configuration
- Deal approval/rejection authority
- All modules: Dashboard, Inventory, Partners, Deals, Shipments, Documents, Finance, Reports, Settings, Users

### Export Manager Access
- Create and manage export deals
- Upload and manage commercial documents
- Track shipments and update status
- Record weighbridge and quality test results
- Manage payment records (Advance, TT, LC)
- Access to: Dashboard, Deals, Documents, Shipments, Finance, Reports, Partners
- Restrictions: Cannot manage users, cannot delete inventory, no import data access

### Yard Staff Access
- Manage scrap inventory and lifecycle stages
- Input collection→sorting→cleaning→melting→distribution stages
- Upload inspection and quality reports
- Assign barcodes/QR codes to scrap batches
- Mark items as recycled or disposed
- View-only access to shipments
- Access to: Inventory, Scrap-Lifecycle, Quality-Check, Shipments (read-only)
- Restrictions: No deals, payments, documents, suppliers/buyers, or reports access

## Changelog

```
Changelog:
- June 21, 2025. Initial setup and comprehensive role-based enhancement
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
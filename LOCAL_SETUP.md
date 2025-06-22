# ScrapFlow - Local Setup Guide

## Prerequisites

Before setting up ScrapFlow locally, ensure you have the following installed:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **PostgreSQL** (version 14 or higher)
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres`

3. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/

## Installation Steps

### 1. Clone or Download the Project

If you have the code:
```bash
# Extract the project files to a folder
cd scrapflow-project
```

### 2. Install Dependencies

```bash
# Install all required packages
npm install
```

### 3. Database Setup

#### Option A: Local PostgreSQL
1. Create a new database:
```sql
CREATE DATABASE scrapflow;
CREATE USER scrapflow_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE scrapflow TO scrapflow_user;
```

2. Create `.env` file in the project root:
```env
DATABASE_URL=postgresql://scrapflow_user:your_secure_password@localhost:5432/scrapflow
NODE_ENV=development
```

#### Option B: Docker PostgreSQL
```bash
# Run PostgreSQL in Docker
docker run --name scrapflow-db -e POSTGRES_DB=scrapflow -e POSTGRES_USER=scrapflow_user -e POSTGRES_PASSWORD=your_secure_password -p 5432:5432 -d postgres

# Create .env file
echo "DATABASE_URL=postgresql://scrapflow_user:your_secure_password@localhost:5432/scrapflow" > .env
echo "NODE_ENV=development" >> .env
```

### 4. Initialize Database Schema

```bash
# Push database schema
npm run db:push
```

### 5. Start the Application

```bash
# Start development server
npm run dev
```

The application will be available at: http://localhost:5000

## Default Login Credentials

### Admin Account
- **Email:** admin@scrapflow.com
- **Password:** admin123
- **Access:** Full system control

### Export Manager Account
- **Email:** export@scrapflow.com
- **Password:** export123
- **Access:** Deal management, documents, shipments, finance

### Yard Staff Account
- **Email:** yard@scrapflow.com
- **Password:** yard123
- **Access:** Inventory management, lifecycle tracking, quality checks

## Project Structure

```
scrapflow/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utilities and configurations
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── db.ts             # Database connection
├── shared/                # Shared types and schemas
│   └── schema.ts         # Database schema and types
├── package.json          # Dependencies and scripts
└── drizzle.config.ts     # Database configuration
```

## Available Scripts

- **`npm run dev`** - Start development server (frontend + backend)
- **`npm run db:push`** - Push database schema changes
- **`npm run build`** - Build for production
- **`npm start`** - Start production server

## Features Available Locally

✓ **Dashboard** - Revenue analytics and lifecycle tracking
✓ **Inventory Management** - Metal types, grades, quantities
✓ **Partner Management** - Suppliers and buyers worldwide
✓ **Deal Management** - Export/import transactions
✓ **Shipment Tracking** - Container and vessel monitoring
✓ **Document Management** - Invoice, bills, certificates
✓ **Financial Management** - Payments with GST calculations
✓ **Quality Control** - Inspection and test results
✓ **Reports & Analytics** - Business insights
✓ **User Management** - Role-based access control
✓ **Scrap Lifecycle** - Collection to recycling tracking

## Currency & Localization

- **Primary Currency:** Indian Rupees (INR)
- **GST Rate:** 18% (configurable)
- **Number Format:** Indian standard (Lakhs/Crores)
- **Date Format:** DD/MM/YYYY

## Troubleshooting

### Database Connection Issues
1. Verify PostgreSQL is running: `pg_isready`
2. Check database credentials in `.env`
3. Ensure database exists: `psql -U scrapflow_user -d scrapflow`

### Port Conflicts
- Default port: 5000
- Change in `server/index.ts` if needed

### Missing Dependencies
```bash
npm install
```

### Schema Issues
```bash
npm run db:push
```

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use secure database credentials
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Use process manager (PM2)

## Support

For issues or questions:
1. Check the USER_MANUAL.md for detailed feature documentation
2. Review the troubleshooting section above
3. Ensure all prerequisites are properly installed

## Security Notes

- Change default passwords in production
- Use environment variables for sensitive data
- Enable database SSL in production
- Configure firewall rules appropriately
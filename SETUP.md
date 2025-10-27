# 🚀 Lobato Tours - Development Setup

## Quick Start

### Option 1: Automated Setup (Recommended)
```bash
npm run setup
```

### Option 2: Manual Setup

1. **Start Docker Database:**
   ```bash
   npm run docker:up
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

4. **Initialize Database:**
   ```bash
   npm run init-db
   ```

## 🐳 Docker Commands

```bash
# Start database
npm run docker:up

# Stop database
npm run docker:down

# View database logs
npm run docker:logs
```

## 🗄️ Database Initialization

The `/api/init` endpoint will:
- ✅ Create all database tables
- ✅ Create default admin user
- ✅ Set up initial data structure

### Default Admin Credentials
- **Username:** `admin`
- **Password:** `admin123`

## 📊 Database Schema

The system creates the following tables:
- `cotizacion` - Main quotes table
- `cliente` - Customer information
- `persona` - Travelers
- `empleado` - Users/employees
- `viaje` - Travel details
- `vuelo` - Flight information
- `hotel` - Hotel information
- `habitacion` - Room details
- `distribucion` - Room distribution
- `comida` - Meal information
- `moneda` - Currency settings
- `itinerario_viaje` - Travel itinerary
- `actividad` - Activities
- `itinerario_vuelo` - Flight itinerary

## 🔧 Environment Variables

Create a `.env` file with:
```env
# Database Configuration
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
DB_HOST=localhost
DB_PORT=5430

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## 🚨 Troubleshooting

### Database Connection Issues
1. Ensure Docker is running
2. Check if port 5430 is available
3. Verify database credentials in `.env`

### Tables Not Created
1. Check database connection
2. Run initialization endpoint: `POST /api/init`
3. Check for errors in console

### Permission Issues
```bash
chmod +x scripts/start-dev.sh
```

## 📝 API Endpoints

- `GET /api/init` - Check database status
- `POST /api/init` - Initialize database
- `GET /api/quotes` - List quotes
- `GET /api/quotes?id=123` - Get specific quote
- `POST /api/quotes` - Create/update quote

## 🎯 Next Steps

1. Visit `http://localhost:3000`
2. Navigate to the cotizador
3. Start creating quotes!
4. Use the default admin credentials to log in

## 🆘 Support

If you encounter issues:
1. Check Docker is running
2. Verify database connection
3. Check console for errors
4. Ensure all dependencies are installed

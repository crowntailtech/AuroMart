# AuroMart - B2B Marketplace Platform

A comprehensive B2B marketplace platform that connects retailers, distributors, and manufacturers. Built with React, Flask, and PostgreSQL, wrapped in Docker for easy deployment.

## Features

### 🏪 **Multi-Role Support**
- **Retailers**: Browse products, place orders, manage partnerships
- **Distributors**: Manage inventory, fulfill orders, connect with manufacturers and retailers
- **Manufacturers**: Create products, manage partnerships with distributors

### 🤝 **Partner Management**
- Browse partners by type (manufacturers/distributors)
- Add partners to favorites for quick access
- Send and manage partnership requests
- Global search for partners when favorites don't have what you need

### 📦 **Product Management**
- Browse products by category
- Browse products by partner (manufacturer/distributor)
- Search products globally
- View product details and inventory

### 💼 **Order Management**
- Place orders with distributors
- Track order status
- View order history
- Manage delivery preferences

### 🔍 **Advanced Search**
- Search products by name, description, or category
- Search partners by business name, email, or role
- Global product search when favorites don't have items
- Search history tracking

### ⭐ **Favorites System**
- Add preferred partners to favorites
- Quick access to favorite partners
- Browse products from favorite partners
- Remove partners from favorites

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Flask Backend  │    │  PostgreSQL DB  │
│   (Port 80)     │◄──►│   (Port 5000)   │◄──►│   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Redis Cache   │
                    │   (Port 6379)   │
                    └─────────────────┘
```

## Quick Start with Docker

### Prerequisites
- Docker
- Docker Compose

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AuroMart
```

### 2. Start the Application
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Flask backend on port 5000
- React frontend on port 80
- Redis cache on port 6379

### 3. Access the Application
- Frontend: http://localhost
- Backend API: http://localhost:5000
- Database: localhost:5432

### 4. Stop the Application
```bash
docker-compose down
```

## Development Setup

### Frontend (React + TypeScript)
```bash
cd client
npm install
npm run dev
```

### Backend (Flask)
```bash
cd server
pip install -r requirements.txt
python app.py
```

### Database
```bash
# Using Docker
docker run -d \
  --name postgres \
  -e POSTGRES_DB=auromart \
  -e POSTGRES_USER=auromart \
  -e POSTGRES_PASSWORD=auromart123 \
  -p 5432:5432 \
  postgres:15-alpine
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/user` - Get current user info

### Partners
- `GET /api/partners/distributors` - Get distributors
- `GET /api/partners/manufacturers` - Get manufacturers (distributors only)
- `GET /api/partners/available` - Get available partners
- `GET /api/partners/search` - Search partners globally

### Favorites
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/<id>` - Remove from favorites

### Partnerships
- `GET /api/partnerships` - Get user partnerships
- `POST /api/partnerships/request` - Send partnership request

### Products
- `GET /api/products` - Get products
- `GET /api/categories` - Get categories

## Database Schema

### Core Tables
- `users` - User accounts and profiles
- `products` - Product catalog
- `inventory` - Distributor inventory
- `orders` - Order management
- `order_items` - Order line items
- `partnerships` - Business partnerships
- `favorites` - User favorite partners
- `search_history` - Search tracking

### Relationships
- Retailers can only see distributors
- Distributors can see both retailers and manufacturers
- Manufacturers can only see distributors
- Partners can be added to favorites for quick access

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://auromart:auromart123@localhost:5432/auromart
SECRET_KEY=your-super-secret-key-change-in-production
FLASK_ENV=production
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## Docker Commands

### Build Images
```bash
docker-compose build
```

### View Logs
```bash
docker-compose logs -f
```

### Access Container Shell
```bash
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Database Backup
```bash
docker-compose exec postgres pg_dump -U auromart auromart > backup.sql
```

### Database Restore
```bash
docker-compose exec -T postgres psql -U auromart auromart < backup.sql
```

## Production Deployment

### 1. Update Environment Variables
```bash
# Update docker-compose.yml with production values
SECRET_KEY=your-production-secret-key
DATABASE_URL=your-production-database-url
```

### 2. Build and Deploy
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. SSL/HTTPS Setup
Add nginx reverse proxy with SSL certificates for production.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@auromart.com or create an issue in the repository. 
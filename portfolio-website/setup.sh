#!/bin/bash

# Portfolio Website - Automated Setup Script
# This script will help you set up the entire project quickly

set -e

echo "================================================"
echo "Portfolio Website - Automated Setup"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

command -v python3 >/dev/null 2>&1 || { echo -e "${RED}✗ Python 3 is required but not installed.${NC}" >&2; exit 1; }
echo -e "${GREEN}✓ Python 3 found${NC}"

command -v node >/dev/null 2>&1 || { echo -e "${RED}✗ Node.js is required but not installed.${NC}" >&2; exit 1; }
echo -e "${GREEN}✓ Node.js found${NC}"

command -v psql >/dev/null 2>&1 || { echo -e "${YELLOW}⚠ PostgreSQL client not found. Make sure PostgreSQL is installed.${NC}"; }

echo ""
echo "================================================"
echo "Step 1: Database Setup"
echo "================================================"

read -p "Enter PostgreSQL username (default: postgres): " PG_USER
PG_USER=${PG_USER:-postgres}

read -p "Enter PostgreSQL password: " -s PG_PASS
echo ""

read -p "Enter database name (default: portfolio_db): " DB_NAME
DB_NAME=${DB_NAME:-portfolio_db}

echo ""
echo "Creating database..."
PGPASSWORD=$PG_PASS createdb -U $PG_USER $DB_NAME 2>/dev/null && echo -e "${GREEN}✓ Database created${NC}" || echo -e "${YELLOW}⚠ Database might already exist${NC}"

echo ""
echo "================================================"
echo "Step 2: Backend Setup"
echo "================================================"

cd backend

echo "Creating virtual environment..."
python3 -m venv venv
echo -e "${GREEN}✓ Virtual environment created${NC}"

echo "Activating virtual environment..."
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null

echo "Installing Python dependencies..."
pip install -r requirements.txt -q
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo "Configuring environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    
    # Update .env with user inputs
    sed -i "s|postgresql://username:password@localhost:5432/portfolio_db|postgresql://$PG_USER:$PG_PASS@localhost:5432/$DB_NAME|g" .env
    
    # Generate secret key
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    sed -i "s|your-secret-key-here-change-this-in-production|$SECRET_KEY|g" .env
    
    echo -e "${GREEN}✓ Environment configured${NC}"
else
    echo -e "${YELLOW}⚠ .env already exists, skipping${NC}"
fi

echo "Setting up admin credentials..."
read -p "Enter admin username (default: admin): " ADMIN_USER
ADMIN_USER=${ADMIN_USER:-admin}

read -p "Enter admin password (default: changeme123): " ADMIN_PASS
ADMIN_PASS=${ADMIN_PASS:-changeme123}

sed -i "s|ADMIN_USERNAME=.*|ADMIN_USERNAME=$ADMIN_USER|g" .env
sed -i "s|ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$ADMIN_PASS|g" .env

echo "Initializing database with sample data..."
python init_db.py --with-sample-data
echo -e "${GREEN}✓ Database initialized${NC}"

cd ..

echo ""
echo "================================================"
echo "Step 3: Frontend Setup"
echo "================================================"

cd frontend

echo "Installing Node.js dependencies..."
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo "Configuring frontend environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Environment configured${NC}"
else
    echo -e "${YELLOW}⚠ .env already exists, skipping${NC}"
fi

cd ..

echo ""
echo "================================================"
echo "✓ Setup Complete!"
echo "================================================"
echo ""
echo "Your portfolio website is ready!"
echo ""
echo "To start the application:"
echo ""
echo "1. Backend (Terminal 1):"
echo "   cd backend"
echo "   source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "   python main.py"
echo ""
echo "2. Frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "Then visit:"
echo "  - Portfolio: http://localhost:3000"
echo "  - Admin: http://localhost:3000/admin/login"
echo ""
echo "Admin Credentials:"
echo "  Username: $ADMIN_USER"
echo "  Password: $ADMIN_PASS"
echo ""
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "================================================"

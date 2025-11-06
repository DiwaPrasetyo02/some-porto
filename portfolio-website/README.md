# Portfolio Website - Full Stack with CRUD Admin Panel

A modern, full-featured portfolio website with a complete admin panel for managing content.

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM for database operations
- **JWT Authentication** - Secure admin authentication

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **React Icons** - Icon library

## Features

- 🏠 Beautiful portfolio landing page
- 📝 About section management
- 💻 Tech stack showcase with proficiency levels
- 🚀 Project portfolio with GitHub/Live links
- 💼 Work experience timeline
- 🎓 Education history
- 🔗 Social media links
- 📧 Contact form with message management
- 🔐 Secure admin authentication
- ✏️ Full CRUD operations for all sections
- 📱 Responsive design

## Project Structure

```
portfolio-website/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── crud.py              # CRUD operations
│   ├── database.py          # Database configuration
│   ├── auth.py              # Authentication utilities
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variables template
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── pages/           # Page components
    │   │   ├── Home.jsx     # Public portfolio page
    │   │   └── admin/       # Admin panel pages
    │   └── services/
    │       └── api.js       # API client
    ├── package.json
    └── .env.example
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

### 1. Database Setup

Create a PostgreSQL database:

```bash
# Log into PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE portfolio_db;

# Create user (optional)
CREATE USER portfolio_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;

# Exit psql
\q
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env

# Edit .env with your database credentials
# Update these values in .env:
# DATABASE_URL=postgresql://username:password@localhost:5432/portfolio_db
# SECRET_KEY=your-secret-key-here
# ADMIN_USERNAME=admin
# ADMIN_PASSWORD=your-secure-password

# Run the application
python main.py
```

The backend will start on `http://localhost:8000`

API Documentation available at: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env if backend is not on localhost:8000
# VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000` or `http://localhost:5173`

## Usage

### Accessing the Portfolio

Visit `http://localhost:3000` to view the public portfolio website.

### Accessing the Admin Panel

1. Navigate to `http://localhost:3000/admin/login`
2. Login with credentials from your `.env` file:
   - Default username: `admin`
   - Default password: `changeme123` (change this!)

### Admin Panel Features

**Dashboard** - Overview of all content statistics

**About** - Manage your personal information:
- Title, subtitle, description
- Profile image and resume links
- Contact information

**Stack** - Manage your tech stack:
- Add/edit/delete technologies
- Set proficiency levels (0-100%)
- Categorize by type (Frontend, Backend, etc.)
- Reorder items

**Projects** - Manage your portfolio projects:
- Add project details and descriptions
- Add images, GitHub and live URLs
- Mark projects as featured
- Reorder projects

**Experience** - Manage work experience:
- Add company, position, dates
- Mark current positions
- Add descriptions and locations
- Timeline ordering

**Education** - Manage education history:
- Add institutions, degrees, fields
- Date ranges and grades
- Reorder entries

**Social Links** - Manage social media:
- Add platform links (GitHub, LinkedIn, etc.)
- Custom ordering

**Contacts** - View and manage contact form submissions:
- View all messages
- Mark messages as read
- Delete messages
- See unread count

## API Endpoints

### Public Endpoints

- `GET /api/about` - Get about information
- `GET /api/stack` - Get all stack items
- `GET /api/projects` - Get all projects
- `GET /api/projects/{id}` - Get single project
- `GET /api/experience` - Get all experience
- `GET /api/education` - Get all education
- `GET /api/social-links` - Get all social links
- `POST /api/contact` - Submit contact form

### Admin Endpoints (Require Authentication)

All admin endpoints require Bearer token authentication.

- `POST /api/admin/login` - Admin login
- `GET /api/admin/verify` - Verify authentication
- Full CRUD endpoints for all sections

See `/docs` for complete API documentation.

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://username:password@localhost:5432/portfolio_db
SECRET_KEY=your-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:8000
```

## Deployment

### Backend Deployment

1. Set up PostgreSQL database on your hosting provider
2. Update environment variables for production
3. Use a production WSGI server like Gunicorn:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
   ```

### Frontend Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting provider
3. Update `VITE_API_URL` to your production backend URL

## Security Considerations

- Change default admin credentials immediately
- Use strong SECRET_KEY in production
- Use HTTPS in production
- Configure CORS properly for your domain
- Keep dependencies updated
- Use environment variables for sensitive data

## Customization

### Styling

- Edit CSS files in `frontend/src/pages/` for page-specific styles
- Modify colors in the CSS gradient properties
- Adjust layouts and breakpoints in media queries

### Adding New Sections

1. Create a new model in `backend/models.py`
2. Create schemas in `backend/schemas.py`
3. Add CRUD operations in `backend/crud.py`
4. Add API endpoints in `backend/main.py`
5. Create a manager component in `frontend/src/pages/admin/managers/`
6. Add route in `AdminDashboard.jsx`

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check database credentials in .env
- Ensure database exists
- Check firewall/network settings

### CORS Errors

- Verify FRONTEND_URL in backend .env matches your frontend URL
- Check CORS middleware configuration in main.py

### Authentication Issues

- Clear browser localStorage
- Verify token expiration settings
- Check SECRET_KEY consistency

## License

MIT License - Feel free to use this project for your portfolio!

## Support

For issues and questions, please create an issue in the repository.

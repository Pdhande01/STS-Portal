# Smart Tech Service Portal

A comprehensive multi-role web application for managing tech repair services with support for customers, technicians, and administrators.

## Features

### For Customers
- 🛠️ Book repair services with device details and scheduling
- 📦 Track service status in real-time
- 🛍️ Browse and purchase hardware products
- 📊 Manage bookings and orders from dashboard

### For Technicians
- 📋 View and manage assigned repair jobs
- ✅ Update job status and add notes
- 👤 Manage profile and availability

### For Administrators
- 👥 Complete user and technician management
- 🔧 Service assignment and tracking
- 📦 Inventory control for hardware products
- 📊 Comprehensive analytics dashboard

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + Custom Components
- **Icons**: Lucide React
- **Build Tool**: Vite

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher) - [Download here](https://nodejs.org/)
- npm, yarn, or pnpm (comes with Node.js)

### Quick Start (3 Steps)

1. **Install all dependencies**
   ```bash
   npm install
   ```

2. **Install React** (required peer dependency)
   ```bash
   npm install react@18.3.1 react-dom@18.3.1
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:5173`

### Detailed Installation

1. **Clone or download this project**

2. **Open terminal in project folder**
   ```bash
   cd smart-tech-service-portal
   ```

3. **Install dependencies**

   Using npm:
   ```bash
   npm install
   npm install react@18.3.1 react-dom@18.3.1
   ```

   Using yarn:
   ```bash
   yarn install
   yarn add react@18.3.1 react-dom@18.3.1
   ```

   Using pnpm (fastest):
   ```bash
   pnpm install
   pnpm add react@18.3.1 react-dom@18.3.1
   ```

4. **Verify installation**
   ```bash
   npm list react
   # Should show react@18.3.1
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

   You should see:
   ```
   VITE v6.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

### Troubleshooting

If you see a blank page, check:
1. All dependencies are installed (including React)
2. No errors in terminal
3. No errors in browser console (F12)

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed help.

## Project Structure

```
├── index.html              # HTML entry point
├── src/
│   ├── main.tsx           # Application entry point
│   ├── app/
│   │   ├── App.tsx        # Main App component
│   │   ├── routes.tsx     # Route configuration
│   │   ├── components/    # Reusable UI components
│   │   └── pages/         # Page components
│   │       ├── Home.tsx
│   │       ├── Login.tsx
│   │       ├── Register.tsx
│   │       ├── user/      # User role pages
│   │       ├── technician/ # Technician role pages
│   │       └── admin/     # Admin role pages
│   └── styles/            # CSS files
├── package.json
├── vite.config.ts
└── README.md
```

## Available Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page (User/Technician/Admin)
- `/register` - Registration page

### User Routes
- `/user/dashboard` - User dashboard
- `/user/book-service` - Book a repair service
- `/user/track-service` - Track service status
- `/user/shop` - Browse hardware products
- `/user/order-products` - Manage orders

### Technician Routes
- `/technician/dashboard` - Technician dashboard with job management

### Admin Routes
- `/admin/dashboard` - Admin dashboard with full system management

## Development Notes

- The application uses mock data for demonstration purposes
- Authentication is simulated (no backend required)
- All three roles (User, Technician, Admin) can be accessed via the login page
- Responsive design works on mobile, tablet, and desktop

## Customization

### Changing Theme Colors
Edit `/src/styles/theme.css` to customize the color scheme.

### Adding New Pages
1. Create a new component in `/src/app/pages/`
2. Add the route in `/src/app/routes.tsx`
3. Update navigation components as needed

### Styling
- Uses Tailwind CSS v4
- Custom styles in `/src/styles/`
- Component-specific styles use Tailwind utility classes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is for demonstration purposes.

## Support

For issues or questions, please refer to the project documentation.
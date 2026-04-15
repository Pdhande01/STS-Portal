# Quick Start Guide

## The Problem
If you're seeing a blank page, it's likely because **React is not installed** as a peer dependency.

## The Solution (3 Commands)

Open your terminal in the project folder and run these commands:

```bash
# 1. Install all dependencies
npm install

# 2. Install React (this is the critical step!)
npm install react@18.3.1 react-dom@18.3.1

# 3. Start the server
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Even Faster Setup

### On Mac/Linux:
```bash
chmod +x setup.sh
./setup.sh
```

### On Windows:
Double-click `setup.bat` or run:
```cmd
setup.bat
```

## What's Included

✅ All configuration files (tsconfig.json, vite.config.ts)
✅ Entry point (/src/main.tsx)
✅ All React components and pages
✅ Routing setup with React Router
✅ Tailwind CSS styling
✅ TypeScript support

## Project Structure

```
smart-tech-service-portal/
├── index.html              ← HTML entry point
├── vite.config.ts          ← Vite configuration
├── tsconfig.json           ← TypeScript config
├── package.json            ← Dependencies & scripts
├── src/
│   ├── main.tsx           ← App entry point (connects HTML to React)
│   ├── app/
│   │   ├── App.tsx        ← Main component (sets up routing)
│   │   ├── routes.tsx     ← All routes defined here
│   │   ├── pages/         ← All page components
│   │   └── components/    ← Reusable UI components
│   └── styles/            ← CSS files
└── README.md              ← Full documentation
```

## How It Works

1. **index.html** loads `/src/main.tsx`
2. **main.tsx** renders the `<App />` component
3. **App.tsx** sets up React Router with `<RouterProvider>`
4. **routes.tsx** defines all the routes and their components
5. **Root.tsx** provides the layout wrapper with `<Outlet />`
6. Individual page components render based on the URL

## Common Issues

### "Cannot find module 'react'"
→ Run: `npm install react@18.3.1 react-dom@18.3.1`

### "Failed to resolve entry for package"
→ Run: `npm install` first, then install React

### Blank page, no errors
→ Hard refresh (Ctrl+Shift+R) or check browser console (F12)

### Port already in use
→ Run: `npm run dev -- --port 3000`

## Need More Help?

- Check **TROUBLESHOOTING.md** for detailed debugging steps
- Check **README.md** for complete documentation
- Look at browser console (F12) for error messages

## Test The App

Once running, try these routes:
- `/` - Home page
- `/login` - Login (try all three roles)
- `/register` - Registration
- `/user/dashboard` - User dashboard
- `/user/shop` - Hardware shop
- `/technician/dashboard` - Technician portal
- `/admin/dashboard` - Admin panel

---

**Still stuck?** Make sure:
- [ ] Node.js 18+ is installed (`node --version`)
- [ ] You ran `npm install`
- [ ] You ran `npm install react@18.3.1 react-dom@18.3.1`
- [ ] No errors in terminal when running `npm run dev`
- [ ] You're visiting `http://localhost:5173`

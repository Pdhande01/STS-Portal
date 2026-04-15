# Setup Checklist

Use this checklist to ensure everything is properly configured before running the project.

## Before You Start

- [ ] Node.js version 18 or higher installed
  - Check with: `node --version`
  - If not installed, download from: https://nodejs.org/

- [ ] npm is available (comes with Node.js)
  - Check with: `npm --version`

## Installation Steps

- [ ] Open terminal in project directory

- [ ] Run: `npm install`
  - This installs all dependencies from package.json
  - Wait for it to complete without errors

- [ ] Run: `npm install react@18.3.1 react-dom@18.3.1`
  - **CRITICAL**: React is a peer dependency and must be installed separately
  - This is the most common reason for blank pages

- [ ] Verify React is installed: `npm list react`
  - Should show: `react@18.3.1`
  - If not, run the install command again

## Verify Files Exist

- [ ] `/index.html` exists
- [ ] `/src/main.tsx` exists  
- [ ] `/src/app/App.tsx` exists
- [ ] `/src/app/routes.tsx` exists
- [ ] `/vite.config.ts` exists
- [ ] `/tsconfig.json` exists
- [ ] `/package.json` exists

## Start Development Server

- [ ] Run: `npm run dev`

- [ ] Terminal shows:
  ```
  VITE v6.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
  ```

- [ ] No red error messages in terminal

## Open Browser

- [ ] Navigate to: `http://localhost:5173`

- [ ] Page loads (not blank)

- [ ] Open browser DevTools (F12):
  - [ ] No errors in Console tab
  - [ ] No failed requests in Network tab
  - [ ] Elements tab shows content (not just empty `<div id="root">`)

## Test Navigation

- [ ] Home page displays with gradient hero section
- [ ] Click "Login" button - navigates to `/login`
- [ ] Click "Get Started" - navigates to `/register`
- [ ] Navigation works without errors

## If Anything Fails

1. **Check for error messages** in terminal and browser console
2. **Read TROUBLESHOOTING.md** for specific solutions
3. **Try clearing cache**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm install react@18.3.1 react-dom@18.3.1
   npm run dev
   ```

## Success Criteria

✅ Terminal shows Vite server running
✅ Browser shows the landing page with:
   - Header with "Smart Tech Service" logo
   - Blue/purple gradient hero section
   - "Professional Computer Repair" heading
   - "Book Repair Service" and "Shop Hardware" buttons
   - Service features section
✅ No console errors
✅ Navigation works

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Install React (required!)
npm install react@18.3.1 react-dom@18.3.1

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check Node.js version
node --version

# Check if React is installed
npm list react
```

## Alternative Package Managers

If npm is slow, try pnpm:

```bash
# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install
pnpm add react@18.3.1 react-dom@18.3.1

# Start server
pnpm dev
```

---

**All checkboxes marked?** You're ready to develop! 🎉

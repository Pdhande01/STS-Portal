# Troubleshooting Guide

If you're seeing a blank page, follow these steps:

## Quick Fixes

### 1. Install All Dependencies

Make sure you've installed BOTH the regular dependencies AND React:

```bash
# First, install all dependencies
npm install

# Then install React (peer dependency)
npm install react@18.3.1 react-dom@18.3.1

# Alternative: Install everything at once
npm install react@18.3.1 react-dom@18.3.1 && npm install
```

### 2. Check for Errors

Start the dev server and watch the console:

```bash
npm run dev
```

Look for:
- Port conflicts (default is 5173)
- Module not found errors
- TypeScript errors

### 3. Clear Cache and Restart

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm install react@18.3.1 react-dom@18.3.1

# Start fresh
npm run dev
```

### 4. Check Browser Console

Open your browser's Developer Tools (F12) and check:
- **Console tab**: Look for JavaScript errors
- **Network tab**: See if files are loading
- **Elements tab**: Check if the root div exists

## Common Issues

### Issue: "Cannot find module 'react'"

**Solution**: Install React as a peer dependency:
```bash
npm install react@18.3.1 react-dom@18.3.1
```

### Issue: TypeScript errors

**Solution**: Make sure `tsconfig.json` and `tsconfig.node.json` exist in the root directory.

### Issue: Blank page, no errors

**Solution**: 
1. Check if `http://localhost:5173` is the correct URL
2. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
3. Try opening in incognito/private mode

### Issue: Port 5173 already in use

**Solution**: 
```bash
# Kill the process using port 5173
# On Mac/Linux:
lsof -ti:5173 | xargs kill

# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port:
npm run dev -- --port 3000
```

### Issue: Module resolution errors

**Solution**: Check that `vite.config.ts` has the correct path alias:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

## Verification Checklist

- [ ] Node.js version 18+ installed (`node --version`)
- [ ] All dependencies installed (`npm install`)
- [ ] React installed (`npm list react`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Dev server running (`npm run dev`)
- [ ] Browser pointing to correct URL (usually http://localhost:5173)
- [ ] No console errors in browser DevTools

## File Structure Verification

Make sure these key files exist:
```
✓ /index.html
✓ /vite.config.ts
✓ /tsconfig.json
✓ /tsconfig.node.json
✓ /package.json
✓ /src/main.tsx
✓ /src/app/App.tsx
✓ /src/app/routes.tsx
✓ /src/styles/index.css
```

## Still Not Working?

1. **Check package.json scripts**: Make sure "dev" script exists:
   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview"
   }
   ```

2. **Verify main.tsx**: Should import and render App:
   ```typescript
   import App from './app/App'
   import './styles/index.css'
   ```

3. **Check index.html**: Should have:
   ```html
   <div id="root"></div>
   <script type="module" src="/src/main.tsx"></script>
   ```

4. **Try a production build**:
   ```bash
   npm run build
   npm run preview
   ```

## Alternative: Use a Different Package Manager

If npm isn't working, try pnpm or yarn:

### Using pnpm (recommended for speed):
```bash
npm install -g pnpm
pnpm install
pnpm add react@18.3.1 react-dom@18.3.1
pnpm dev
```

### Using yarn:
```bash
npm install -g yarn
yarn install
yarn add react@18.3.1 react-dom@18.3.1
yarn dev
```

## Get Help

If you're still stuck, please provide:
1. Node.js version (`node --version`)
2. npm version (`npm --version`)
3. Any error messages from console
4. Any error messages from browser DevTools
5. Operating system

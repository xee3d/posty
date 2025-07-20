@echo off
echo ========================================
echo Running Local AI Server
echo ========================================
echo.

cd C:\Users\xee3d\Documents\Posty\posty-server

echo Installing dependencies...
npm install

echo.
echo Setting up environment...
echo OPENAI_API_KEY=your-key-here > .env.local
echo APP_SECRET=posty-secret-key-change-this-in-production >> .env.local

echo.
echo Starting local server...
echo Server will run at http://localhost:3000
echo.
vercel dev

pause

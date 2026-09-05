# DocVerify AI — Run Locally and Upload to GitHub

## Requirements

- Node.js 20 or newer
- pnpm 10 or npm
- VS Code

## Run in VS Code

1. Extract the project folder.
2. Open the extracted `docverify-ai` folder in VS Code.
3. Open the integrated terminal.
4. Install dependencies with npm:

```bash
npm install
```

If PowerShell blocks `npm`, use `npm.cmd`:

```bash
npm.cmd install
```

If you prefer pnpm, install it separately and use `pnpm install` instead.

If npm reports `Cannot read properties of null (reading 'matches')`, close any running dev server and run this clean setup sequence from the folder containing `package.json`:

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm.cmd cache clean --force
npm.cmd install
```

5. Start the development server:

```bash
npm run dev
```

6. Open the local URL shown in the terminal, normally:

```text
http://localhost:3000
```

## Available Commands

```bash
npm run dev      # Start Vite development server
npm run check    # Run TypeScript checks
npm run build    # Create a production build
npm run preview  # Preview the production build
```

## Demo Login

The prototype uses mock authentication. Use any email/password, or use the prefilled demo account:

- Email: `demo@docverify.ai`
- Password: `password`

## GitHub Upload

Create an empty repository on GitHub, then run these commands from the project folder:

```bash
git init
git add .
git commit -m "Initial DocVerify AI application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPOSITORY` with your GitHub details.

## Important Notes

- The current project uses a clean mock verification service for OCR, validation, ELA, copy-move detection, AI confidence, history, analytics, and reports.
- Real OCR/OpenCV/FastAPI services can be connected later through the service layer in `client/src/lib/mockVerification.ts`.
- Do not commit `node_modules`, `dist`, API keys, passwords, or private environment files.

# Kollywood Imposter

A mobile-first pass-and-play social deduction game built with React and Tailwind CSS.

## Deploy Online

### Option 1: Vercel

1. Upload this folder to a GitHub repository.
2. Go to Vercel and create a new project from that repository.
3. Vercel should detect Vite automatically.
4. Deploy with the default settings.

### Option 2: Netlify

1. Upload this folder to a GitHub repository.
2. Go to Netlify and import the repository.
3. Use:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy.

## Local Development

1. Run `npm install`
2. Run `npm run dev`

## Game Notes

- Supports 3 to 15 players.
- Supports 1 to 3 imposters.
- Uses Fisher-Yates shuffle for imposter assignment.
- Prevents the same word from repeating within a session unless the word history is reset.
- Data comes from `src/kollywoodData.csv`.

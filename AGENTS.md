# gabfoodlogger

Next.js 16.2.11 + React 19.2.4 food tracking app with Supabase backend and Gemini AI integration.

## Quick Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run lint       # ESLint (core-web-vitals + typescript)
```

No tests, no typecheck script, no formatter. Lint is the only automated check.

## Architecture

**App Router** structure in `app/`:
- `app/page.tsx` - Main dashboard (date navigation, macro chart, food logging)
- `app/add-food/page.tsx` - Food search and quick-add page
- `app/profile/page.tsx` - TDEE calculator and macro target settings

**Server Actions** in `app/actions/`:
- `dashboard.ts` - Fetch daily stats (targets + consumed)
- `food.ts` - Barcode lookup (OpenFoodFacts), search, save, log foods
- `log.ts` - Log/delete food entries
- `profile.ts` - Update user macro targets
- `suggest.ts` - Gemini AI meal suggestions
- `vision.ts` - Gemini AI nutrition label scanning

**Components** in `components/`:
- `MacroChart.tsx` - Pie chart + progress bars (recharts)
- `BarcodeScanner.tsx` - Camera barcode scanning (html5-qrcode)
- `AISuggestions.tsx` - AI meal suggestion display

## Key Quirks

- **Single-user prototype**: All actions use hardcoded `DUMMY_USER_ID = "00000000-0000-0000-0000-000000000000"`. No authentication.
- **Supabase clients**: Server actions create their own Supabase client inline (don't reuse `utils/supabase.ts`)
- **Macro split**: 30% protein, 25% fats, 45% carbs (hardcoded in profile calculation)
- **AI model**: Uses `gemini-3.5-flash-lite` for both suggestions and vision
- **Body size limit**: Server actions allow 10mb (for image uploads)
- **Incomplete files**: Several component files are empty or work-in-progress (`AddFoodConsultation.tsx`, `AddFoodNutrition.tsx`, `EntryPreview.tsx`, `LoggedFoods.tsx`, `AddFoodSearch.tsx`, `AddFoodQuick.tsx`)

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `GEMINI_API_KEY` - Google Gemini API key

## Supabase Tables

- `users` - User profile with macro targets (id, caloric_target, target_protein, target_carbs, target_fats, baseline_tdee)
- `saved_foods` - Saved food database (id, user_id, name, calories, protein, carbs, fats, description)
- `food_logs` - Daily food log entries (id, user_id, date, food_name, calories, protein, carbs, fats, portion_multiplier, entry_type)

## Known Issues

- `AISuggestions.tsx` imports from `../actions/ai` but the file is `../actions/suggest.ts`
- `AddFood.tsx` contains JSX outside of a proper component export (likely refactoring in progress)
- `LoggedFoods` component is imported in page.tsx but file is empty

## Styling

Tailwind CSS v4 with `@tailwindcss/postcss` plugin. No `tailwind.config.js` needed (uses CSS-based config). Dark mode via `dark:` class prefix.

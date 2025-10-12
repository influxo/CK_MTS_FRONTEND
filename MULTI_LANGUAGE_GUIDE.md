# Multi-Language Support Guide

## Overview

Your CaritasMotherTeresa platform now supports multiple languages (English and Albanian). The system uses a context-based translation system that allows dynamic language switching without page reloads.

## Architecture

### Files Created

1. **Translation Files:**
   - `/src/locales/en.json` - English translations
   - `/src/locales/sq.json` - Albanian translations (sq is ISO 639-1 code for Albanian)

2. **Context & Hooks:**
   - `/src/contexts/LanguageContext.tsx` - Language context provider
   - `/src/hooks/useTranslation.ts` - Hook to access translations

3. **Components:**
   - `/src/components/LanguageSwitcher.tsx` - Language switcher dropdown in Topbar

4. **Updates:**
   - `App.tsx` - Wrapped with LanguageProvider
   - `Topbar.tsx` - Added LanguageSwitcher component

## How to Use Translations

### Basic Usage

```tsx
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

### Switching Language

```tsx
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { language, setLanguage } = useTranslation();
  
  return (
    <div>
      <p>Current language: {language}</p>
      <button onClick={() => setLanguage('en')}>English</button>
      <button onClick={() => setLanguage('sq')}>Shqip</button>
    </div>
  );
}
```

### Getting Current Language

```tsx
const { language } = useTranslation();

// language will be either 'en' or 'sq'
```

## Translation Keys Structure

Translations are organized hierarchically by module:

```json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel"
  },
  "dashboard": {
    "title": "Dashboard",
    "totalBeneficiaries": "Total Beneficiaries"
  },
  "projects": {
    "title": "Projects",
    "createProject": "Create Project"
  }
}
```

### Available Translation Sections

- **common** - Common UI elements (buttons, labels, status)
- **auth** - Authentication pages (login, signup, password reset)
- **sidebar** - Sidebar navigation items
- **dashboard** - Dashboard page
- **projects** - Projects module
- **subProjects** - Sub-projects module
- **beneficiaries** - Beneficiaries module
- **forms** - Forms module
- **dataEntry** - Data entry module
- **reports** - Reports module
- **employees** - Employees module
- **profile** - User profile page
- **footer** - Footer text
- **validation** - Validation messages
- **notifications** - Success/error notifications

## Adding New Translations

### Step 1: Add to English file (`en.json`)

```json
{
  "myModule": {
    "myNewKey": "My new text in English"
  }
}
```

### Step 2: Add to Albanian file (`sq.json`)

```json
{
  "myModule": {
    "myNewKey": "Teksti im i ri në shqip"
  }
}
```

### Step 3: Use in component

```tsx
const { t } = useTranslation();

return <p>{t('myModule.myNewKey')}</p>;
```

## Converting Existing Components

### Before (Static Text):

```tsx
export function MyComponent() {
  return (
    <div>
      <h1>Projects</h1>
      <button>Create Project</button>
      <p>Loading...</p>
    </div>
  );
}
```

### After (Dynamic Translation):

```tsx
import { useTranslation } from '../hooks/useTranslation';

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('projects.title')}</h1>
      <button>{t('projects.createProject')}</button>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

## Language Persistence

The selected language is automatically saved to `localStorage` and persists across sessions. When users return to the app, their language preference is remembered.

## Language Switcher

The language switcher is located in the top navigation bar (Topbar) and displays a globe icon. Users can:
1. Click the globe icon
2. Select either "🇦🇱 Shqip" or "🇬🇧 English"
3. The entire application updates instantly

## Best Practices

1. **Always use translation keys** instead of hardcoded text
2. **Use descriptive key names** that indicate where they're used
3. **Keep translations organized** by module/component
4. **Be consistent** with key naming conventions (camelCase)
5. **Test both languages** when adding new features
6. **Keep translation files in sync** - if you add a key in one file, add it to all language files

## Example: Complete Component Conversion

### Before:
```tsx
export function EmployeesList() {
  return (
    <div>
      <h2>Employees</h2>
      <p>Manage staff</p>
      <button>Invite Employee</button>
      <input placeholder="Search employees..." />
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
      </table>
    </div>
  );
}
```

### After:
```tsx
import { useTranslation } from '../hooks/useTranslation';

export function EmployeesList() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2>{t('employees.title')}</h2>
      <p>{t('employees.subtitle')}</p>
      <button>{t('employees.inviteEmployee')}</button>
      <input placeholder={t('employees.searchEmployees')} />
      <table>
        <thead>
          <tr>
            <th>{t('employees.employee')}</th>
            <th>{t('common.role')}</th>
            <th>{t('common.status')}</th>
            <th>{t('common.actions')}</th>
          </tr>
        </thead>
      </table>
    </div>
  );
}
```

## Troubleshooting

### Translation not found
If you see the key itself displayed instead of the translation:
1. Check that the key exists in both `en.json` and `sq.json`
2. Ensure the key path is correct (e.g., `common.loading` not `commonloading`)
3. Check browser console for warnings about missing keys

### Language not switching
1. Verify `LanguageProvider` wraps your app in `App.tsx`
2. Check that you're using `useTranslation()` hook, not directly accessing context
3. Clear browser cache and localStorage

### TypeScript errors
1. The translation files are imported as JSON - TypeScript will infer types automatically
2. If you get type errors, restart your TypeScript server

## Next Steps

To complete the multi-language implementation:
1. Update remaining components to use `t()` function
2. Add more translations as needed to the JSON files
3. Test all pages in both languages
4. Consider adding more languages in the future (just add new JSON files)

## Language Codes

- `en` - English
- `sq` - Albanian (Shqip)

To add more languages, create new JSON files following the same structure (e.g., `fr.json` for French, `de.json` for German).

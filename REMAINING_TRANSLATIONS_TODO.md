# Remaining Translation Tasks

## Status Summary

### ✅ Completed (Fully Translated)
- `Sidebar.tsx` - Navigation menu
- `Login.tsx` - Login page  
- `AppLayout.tsx` - Main layout and footer
- `Profile.tsx` - User profile page
- `Topbar.tsx` - Top navigation bar
- Language Context & Hook infrastructure
- Translation JSON files (en.json, sq.json)

### 🔄 Partially Complete (Has some Albanian text, needs full translation system)
The following components already have some Albanian text but need to be converted to use the translation system:

1. **EmployeesList.tsx** - Employee list table (line 294 has Albanian text like "Menaxho stafin")
2. **InviteEmployee.tsx** - Employee invitation form
3. **EmployeesModule.tsx** - Employee module wrapper

### ⏳ To Do (High Priority)

#### Authentication Pages
- [ ] `AcceptInvitation.tsx` - Accept invitation and account setup
- [ ] `ForgotPassword.tsx` - Password reset request
- [ ] `ResetPassword.tsx` - Password reset form
- [ ] `AccountSetup.tsx` - New employee account setup

#### Dashboard Components
- [ ] `FilterControls.tsx` - Dashboard filters
- [ ] `SummaryMetrics.tsx` - Metrics cards
- [ ] `KpiHighlights.tsx` - KPI cards
- [ ] `ServiceDelivery.tsx` - Service delivery chart
- [ ] `BeneficiaryDemographics.tsx` - Demographics chart
- [ ] `FormSubmissions.tsx` - Form submissions overview
- [ ] `RecentActivity.tsx` - Activity feed
- [ ] `SyncStatus.tsx` - Sync status widget
- [ ] `SystemAlerts.tsx` - System alerts

#### Employees Module
- [ ] `EmployeesList.tsx` - Complete translation implementation
- [ ] `InviteEmployee.tsx` - Complete translation implementation  
- [ ] `EmployeeDetails.tsx` - Employee detail view

#### Projects Module
- [ ] `ProjectsList.tsx` - Projects list
- [ ] `ProjectDetails.tsx` - Project detail view
- [ ] `SubProjects.tsx` - Sub-projects list
- [ ] `SubProjectDetails.tsx` - Sub-project details
- [ ] `ProjectTeam.tsx` - Team management
- [ ] `ProjectServices.tsx` - Services management
- [ ] `ProjectActivity.tsx` - Activity log
- [ ] `ProjectStats.tsx` - Statistics
- [ ] `ProjectExport.tsx` - Export functionality

#### Beneficiaries Module
- [ ] `BeneficiariesList.tsx` - Beneficiaries list
- [ ] `BeneficiaryDetails.tsx` - Beneficiary details
- [ ] `BeneficiarySingleSubmission.tsx` - Single submission view

#### Forms Module
- [ ] `FormsModule.tsx` - Forms module wrapper
- [ ] `FormsList.tsx` - Forms list
- [ ] `FormBuilder.tsx` - Form builder
- [ ] `FormCreate.tsx` - Create form
- [ ] `FormEdit.tsx` - Edit form
- [ ] `FormDetails.tsx` - Form details
- [ ] `FormPreview.tsx` - Form preview
- [ ] `FormSettings.tsx` - Form settings

#### Data Entry Module
- [ ] `DataEntry.tsx` - Main data entry page
- [ ] `DataEntryTemplates.tsx` - Templates page
- [ ] `SubProjectSelection.tsx` - Sub-project selector
- [ ] `FormActivitySelection.tsx` - Activity selector
- [ ] `AvailableForms.tsx` - Available forms list
- [ ] `FormSubmission.tsx` - Form submission
- [ ] `SubmissionHistory.tsx` - Submission history

#### Reports Module
- [ ] `Reports.tsx` - Reports page
- [ ] `ReportsList.tsx` - Reports list
- [ ] `ReportGenerator.tsx` - Report generator
- [ ] `ReportViewer.tsx` - Report viewer

#### Other Components
- [ ] `PWAInstallPrompt.tsx` - PWA install prompt
- [ ] Various UI components with hardcoded text

---

## Priority Order

### Week 1 (Critical)
1. Complete EmployeesList.tsx
2. Complete InviteEmployee.tsx
3. Dashboard components (FilterControls, SummaryMetrics)
4. ProjectsList.tsx

### Week 2 (Important)
1. Authentication pages (AcceptInvitation, ForgotPassword, ResetPassword)
2. BeneficiariesList.tsx
3. FormsList.tsx and FormsModule.tsx
4. Remaining Dashboard components

### Week 3 (Nice to Have)
1. Detail views (ProjectDetails, BeneficiaryDetails, etc.)
2. Data Entry module
3. Reports module
4. Sub-project components

---

## Quick Start Guide for Each Component

For each component in the list above:

1. **Open the component file**
2. **Add import**: `import { useTranslation } from '../hooks/useTranslation';`
3. **Add hook**: `const { t } = useTranslation();`
4. **Find all hardcoded text** (strings in JSX)
5. **Replace with translation keys**: `{t('module.key')}`
6. **Add missing keys** to both `en.json` and `sq.json`
7. **Test** in both languages

---

## Example Conversion (Quick Reference)

### Before:
```tsx
export function MyComponent() {
  return (
    <div>
      <h1>Title Here</h1>
      <p>Description here</p>
      <button>Click Me</button>
    </div>
  );
}
```

### After:
```tsx
import { useTranslation } from '../hooks/useTranslation';

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('module.title')}</h1>
      <p>{t('module.description')}</p>
      <button>{t('module.buttonText')}</button>
    </div>
  );
}
```

### Add to en.json:
```json
{
  "module": {
    "title": "Title Here",
    "description": "Description here",
    "buttonText": "Click Me"
  }
}
```

### Add to sq.json:
```json
{
  "module": {
    "title": "Titulli Këtu",
    "description": "Përshkrimi këtu",
    "buttonText": "Kliko Mua"
  }
}
```

---

## Notes

- All translation keys are already defined in `en.json` and `sq.json` for common text
- Refer to `TRANSLATION_IMPLEMENTATION_EXAMPLES.md` for detailed examples
- Check `MULTI_LANGUAGE_GUIDE.md` for the complete guide
- Test each component in both languages after conversion
- The language switcher in the Topbar allows easy testing

---

## Testing Checklist

After converting each component:
- [ ] Component renders without errors
- [ ] All text displays in English
- [ ] All text displays in Albanian
- [ ] No translation keys are shown (e.g., "common.loading" instead of "Loading...")
- [ ] No console warnings about missing translations
- [ ] Placeholders work correctly
- [ ] Button text works correctly
- [ ] Modal/dialog text works correctly

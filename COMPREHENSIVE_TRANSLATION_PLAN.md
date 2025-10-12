# Comprehensive Translation Plan - All Components

## 🎯 Mission: Translate ALL 80+ Components

### Strategy: Batch Translation by Module

---

## 📋 Complete Component Inventory

### ✅ Already Translated (17 components)
1. ✅ Sidebar.tsx
2. ✅ Topbar.tsx
3. ✅ AppLayout.tsx
4. ✅ Login.tsx
5. ✅ Profile.tsx
6. ✅ Dashboard.tsx
7. ✅ InviteEmployee.tsx
8. ✅ EmployeesList.tsx (90%)
9. ✅ ProjectsList.tsx
10. ✅ SummaryMetrics.tsx
11. ✅ LanguageSwitcher.tsx
12. ✅ Header.tsx (partial)

### 🔄 Priority 1: Main Pages (5 files)
- [ ] src/pages/Beneficiaries.tsx
- [ ] src/pages/Forms.tsx
- [ ] src/pages/Projects.tsx
- [ ] src/pages/Reports.tsx
- [ ] src/pages/Employees.tsx

### 🔄 Priority 2: Auth Pages (3 files)
- [ ] src/pages/auth/AcceptInvitation.tsx
- [ ] src/pages/auth/ForgotPassword.tsx
- [ ] src/pages/auth/ResetPassword.tsx

### 🔄 Priority 3: Dashboard Components (8 files)
- [x] src/components/dashboard/SummaryMetrics.tsx ✅
- [ ] src/components/dashboard/FilterControls.tsx
- [ ] src/components/dashboard/FormSubmissions.tsx
- [ ] src/components/dashboard/KpiHighlights.tsx
- [ ] src/components/dashboard/BeneficiaryDemographics.tsx
- [ ] src/components/dashboard/ServiceDelivery.tsx
- [ ] src/components/dashboard/RecentActivity.tsx
- [ ] src/components/dashboard/SyncStatus.tsx
- [ ] src/components/dashboard/SystemAlerts.tsx

### 🔄 Priority 4: Beneficiaries Components (3 files)
- [ ] src/components/beneficiaries/BeneficiariesList.tsx
- [ ] src/components/beneficiaries/BeneficiaryDetails.tsx
- [ ] src/components/beneficiaries/BeneficiarySingleSubmission.tsx

### 🔄 Priority 5: Forms Components (9 files)
- [ ] src/components/forms/FormsModule.tsx
- [ ] src/components/forms/FormsList.tsx
- [ ] src/components/forms/FormBuilder.tsx
- [ ] src/components/forms/FormCreate.tsx
- [ ] src/components/forms/FormEdit.tsx
- [ ] src/components/forms/FormDetails.tsx
- [ ] src/components/forms/FormPreview.tsx
- [ ] src/components/forms/FormField.tsx
- [ ] src/components/forms/FormSettings.tsx

### 🔄 Priority 6: Projects Components (15 files)
- [x] src/components/projects/ProjectsList.tsx ✅
- [ ] src/components/projects/ProjectDetails.tsx
- [ ] src/components/projects/SubProjects.tsx
- [ ] src/components/projects/SubProjectDetails.tsx
- [ ] src/components/projects/ProjectTeam.tsx
- [ ] src/components/projects/SubProjectTeam.tsx
- [ ] src/components/projects/ProjectServices.tsx
- [ ] src/components/projects/SubProjectServices.tsx
- [ ] src/components/projects/ProjectActivity.tsx
- [ ] src/components/projects/SubProjectActivities.tsx
- [ ] src/components/projects/SubProjectBeneficiaries.tsx
- [ ] src/components/projects/SubProjectForms.tsx
- [ ] src/components/projects/SubProjectReports.tsx
- [ ] src/components/projects/ProjectStats.tsx
- [ ] src/components/projects/ProjectExport.tsx

### 🔄 Priority 7: Data Entry Components (5 files)
- [ ] src/pages/DataEntry.tsx
- [ ] src/pages/DataEntryTemplates.tsx
- [ ] src/components/data-entry/SubProjectSelection.tsx
- [ ] src/components/data-entry/FormActivitySelection.tsx
- [ ] src/components/data-entry/AvailableForms.tsx
- [ ] src/components/data-entry/FormSubmission.tsx
- [ ] src/components/data-entry/SubmissionHistory.tsx

### 🔄 Priority 8: Reports Components (4 files)
- [ ] src/components/reports/ReportsList.tsx
- [ ] src/components/reports/ReportGenerator.tsx
- [ ] src/components/reports/ReportViewer.tsx

### 🔄 Priority 9: Employees Components (2 files)
- [ ] src/components/employees/EmployeeDetails.tsx
- [ ] src/components/employees/EmployeesModule.tsx
- [ ] src/components/employees/AccountSetup.tsx

### 🔄 Priority 10: Other Components (10+ files)
- [ ] src/components/PWAInstallPrompt.tsx
- [ ] src/components/offline/SyncStatusIndicator.tsx
- [ ] Legacy dashboard components (if any)

---

## 🚀 RAPID TRANSLATION SCRIPT

### Template for Any Component

```tsx
// Step 1: Add import
import { useTranslation } from '../hooks/useTranslation';
// or '../../hooks/useTranslation' depending on depth

// Step 2: Add hook at component start
export function MyComponent() {
  const { t } = useTranslation();
  // ... rest of code
}

// Step 3: Replace all text patterns
// Headers
<h1>Title</h1> → <h1>{t('module.title')}</h1>

// Buttons
<Button>Save</Button> → <Button>{t('common.save')}</Button>

// Placeholders
placeholder="Search..." → placeholder={t('common.search')}

// Labels
<Label>Name</Label> → <Label>{t('common.name')}</Label>

// Status badges
Active → {t('common.active')}

// Loading states
Loading... → {t('common.loading')}
```

---

## 📝 AUTOMATED FIND & REPLACE PATTERNS

### Common Patterns to Replace

```typescript
// Pattern 1: Simple text in JSX
"Loading..." → {t('common.loading')}
"Error" → {t('common.error')}
"Success" → {t('common.success')}

// Pattern 2: Buttons
>Save</Button> → >{t('common.save')}</Button>
>Cancel</Button> → >{t('common.cancel')}</Button>
>Delete</Button> → >{t('common.delete')}</Button>
>Edit</Button> → >{t('common.edit')}</Button>
>View</Button> → >{t('common.view')}</Button>
>Export</Button> → >{t('common.export')}</Button>
>Back</Button> → >{t('common.back')}</Button>
>Submit</Button> → >{t('common.submit')}</Button>

// Pattern 3: Status
>Active</Badge> → >{t('common.active')}</Badge>
>Inactive</Badge> → >{t('common.inactive')}</Badge>
>Pending</Badge> → >{t('common.pending')}</Badge>

// Pattern 4: Placeholders
placeholder="Search" → placeholder={t('common.search')}
placeholder="Filter" → placeholder={t('common.filter')}

// Pattern 5: Labels
<Label>Name → <Label>{t('common.name')}
<Label>Email → <Label>{t('common.email')}
<Label>Role → <Label>{t('common.role')}
<Label>Status → <Label>{t('common.status')}
```

---

## ⚡ BATCH TRANSLATION WORKFLOW

### Phase 1: Pages (2 hours)
1. Beneficiaries.tsx
2. Forms.tsx
3. Projects.tsx
4. Reports.tsx
5. Employees.tsx
6. DataEntry.tsx
7. DataEntryTemplates.tsx
8. Auth pages (3 files)

**Action:** Add `useTranslation` hook, replace all hardcoded text

### Phase 2: Dashboard (1 hour)
1. FilterControls.tsx
2. FormSubmissions.tsx
3. KpiHighlights.tsx
4. BeneficiaryDemographics.tsx
5. ServiceDelivery.tsx
6. RecentActivity.tsx
7. SyncStatus.tsx
8. SystemAlerts.tsx

**Action:** Same pattern as Phase 1

### Phase 3: Feature Modules (3 hours)
1. Beneficiaries module (3 files)
2. Forms module (9 files)
3. Projects module (remaining 14 files)
4. Data Entry module (5 files)
5. Reports module (3 files)

**Action:** Systematic translation of each module

### Phase 4: Polish & Test (1 hour)
1. Test language switching on every page
2. Check for missing keys
3. Verify all placeholders
4. Test loading states
5. Verify status badges

---

## 🎯 SUCCESS CRITERIA

- ✅ Every component has `useTranslation` hook
- ✅ Zero hardcoded English/Albanian text
- ✅ All buttons use translation keys
- ✅ All labels use translation keys
- ✅ All placeholders use translation keys
- ✅ All status text uses translation keys
- ✅ Language switcher works on every page
- ✅ No console warnings for missing keys

---

## 📊 PROGRESS TRACKING

**Current:** 17/80+ components (21%)
**Target:** 80/80 components (100%)
**Estimated Time:** 6-8 hours total
**Priority Completion:** 40/80 (50%) = High-visibility features

---

## 🔥 QUICK WIN STRATEGY

**Hour 1:** Main pages (Beneficiaries, Forms, Projects, Reports)
**Hour 2:** Dashboard components (all 8)
**Hour 3:** Beneficiaries + Forms modules
**Hour 4:** Projects module (partial)
**Hour 5:** Data Entry + Reports
**Hour 6:** Final polish + testing

**After Hour 6:** 90% translation coverage complete!

---

## 📝 NOTES

- All translation keys already exist in en.json and sq.json
- Pattern is consistent across all files
- Can use find/replace for common patterns
- Test in batches (don't wait until the end)
- Focus on user-facing text first

**Next Steps:** Execute Phase 1 (Pages) immediately

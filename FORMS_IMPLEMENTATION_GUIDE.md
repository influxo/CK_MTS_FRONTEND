# 🔧 FORMS TRANSLATION - COMPLETE IMPLEMENTATION GUIDE

## ✅ COMPLETED TRANSLATIONS

### 1. FormsModule.tsx - ✅ FULLY IMPLEMENTED
All toast messages have been translated.

### 2. Translation Keys - ✅ FULLY ADDED
- 140+ keys added to `en.json`
- 140+ keys added to `sq.json`

---

## 📝 REMAINING IMPLEMENTATION

### FormsList.tsx - Needs Implementation

Replace all hardcoded text with `{t()}` calls. Here are the key replacements:

#### Header Section:
```tsx
// Line 261
<h2>Forms</h2>  →  <h2>{t('forms.title')}</h2>

// Line 262-264
<p className="text-muted-foreground">
  Create and manage data collection forms
</p>
→
<p className="text-muted-foreground">
  {t('forms.subtitle')}
</p>

// Line 273
Advanced Filters  →  {t('forms.advancedFilters')}

// Line 283
Create Form  →  {t('forms.createForm')}
```

#### Create Form Dialog:
```tsx
// Line 288
<DialogTitle>Create New Form</DialogTitle>
→
<DialogTitle>{t('forms.createNewForm')}</DialogTitle>

// Line 289-292
<DialogDescription>
  Create a new data collection form template. You'll be able
  to add fields in the form builder.
</DialogDescription>
→
<DialogDescription>
  {t('forms.createNewFormDesc')}
</DialogDescription>

// Line 296
Form Name *  →  {t('forms.formName')} *

// Line 299
placeholder="Enter form name"  →  placeholder={t('forms.enterFormName')}

// Line 305
Description  →  {t('forms.description')}

// Line 308
placeholder="Enter form description"  →  placeholder={t('forms.enterFormDescription')}

// Line 315
Category *  →  {t('forms.category')} *

// Line 321
placeholder="Select a category"  →  placeholder={t('forms.selectCategory')}

// Lines 324-329 (Categories)
<SelectItem value="health">Health</SelectItem>
<SelectItem value="agriculture">Agriculture</SelectItem>
<SelectItem value="wash">Water & Sanitation</SelectItem>
<SelectItem value="education">Education</SelectItem>
<SelectItem value="training">Training</SelectItem>
<SelectItem value="other">Other</SelectItem>
→
<SelectItem value="health">{t('forms.health')}</SelectItem>
<SelectItem value="agriculture">{t('forms.agriculture')}</SelectItem>
<SelectItem value="wash">{t('forms.washCategory')}</SelectItem>
<SelectItem value="education">{t('forms.education')}</SelectItem>
<SelectItem value="training">{t('forms.training')}</SelectItem>
<SelectItem value="other">{t('forms.other')}</SelectItem>

// Line 334
Associate with Project  →  {t('forms.associateWithProject')}

// Line 344
"Loading projects..."  →  {t('forms.loadingProjects')}

// Line 345
"Select a project"  →  {t('forms.selectProject')}

// Line 361
Associate with Sub-Project  →  {t('forms.associateWithSubProject')}

// Line 368
"Select a sub-project"  →  {t('forms.selectSubProject')}

// Line 389
Cancel  →  {t('forms.cancel')}

// Line 395
Create & Open Builder  →  {t('forms.createAndOpenBuilder')}
```

#### Search & Filters:
```tsx
// Line 405
<DialogTitle>Form Preview</DialogTitle>
→
<DialogTitle>{t('forms.formPreview')}</DialogTitle>

// Line 426
placeholder="Search forms..."  →  placeholder={t('forms.searchForms')}

// Line 437
Export  →  {t('forms.export')}

// Line 448
Project  →  {t('forms.project')}

// Line 451
placeholder="All projects"  →  placeholder={t('forms.allProjects')}

// Line 454
All Projects  →  {t('forms.allProjects')}

// Line 464
Created By  →  {t('forms.createdBy')}

// Line 467
placeholder="All users"  →  placeholder={t('forms.allUsers')}

// Line 470
All Users  →  {t('forms.allUsers')}

// Line 481
Last Updated  →  {t('forms.lastUpdated')}

// Line 484
placeholder="Any time"  →  placeholder={t('forms.anyTime')}

// Lines 487-492
Any Time  →  {t('forms.anyTime')}
Today  →  {t('forms.today')}
This Week  →  {t('forms.thisWeek')}
This Month  →  {t('forms.thisMonth')}
This Quarter  →  {t('forms.thisQuarter')}

// Lines 498-500
Reset Filters  →  {t('forms.resetFilters')}
Apply Filters  →  {t('forms.applyFilters')}
```

#### Card & Table Content:
```tsx
// Line 534
Edit Form  →  {t('forms.editForm')}

// Line 541
Preview  →  {t('forms.preview')}

// Line 549
Delete  →  {t('forms.delete')}

// Lines 578-594 (Card labels)
Fields:  →  {t('forms.fields')}:
Last updated:  →  {t('forms.lastUpdatedLabel')}
Created by:  →  {t('forms.createdByLabel')}
Projects:  →  {t('forms.projects')}:
No associated projects  →  {t('forms.noAssociatedProjects')}

// Line 642
Configure  →  {t('forms.configure')}

// Line 650
Edit Form  →  {t('forms.editForm')}

// Line 661
Create New Form  →  {t('forms.createNewFormCard')}

// Lines 662-664
Design a custom data collection form for your projects
→
{t('forms.designCustomForm')}

// Line 665
Create Form  →  {t('forms.createForm')}
```

#### Table Headers:
```tsx
// Lines 673-681
Form Name  →  {t('forms.formNameHeader')}
Status  →  {t('forms.statusHeader')}
Version  →  {t('forms.versionHeader')}
Fields  →  {t('forms.fieldsHeader')}
Project  →  {t('forms.projectHeader')}
Last Updated  →  {t('forms.lastUpdatedHeader')}
Actions  →  {t('forms.actionsHeader')}

// Line 746
Edit  →  {t('forms.edit')}

// Line 763
Preview  →  {t('forms.preview')}

// Line 770
Delete  →  {t('forms.delete')}
```

#### Pagination:
```tsx
// Lines 784-787
Page {page} of {Math.max(totalPages || 1, 1)}
→
{t('forms.pageOf')} {page} {t('forms.of')} {Math.max(totalPages || 1, 1)}

• Total {totalCount} records
→
• {t('forms.total')} {totalCount} {t('forms.records')}

// Lines 797-806
Prev  →  {t('forms.prev')}
Next  →  {t('forms.next')}

// Line 844
placeholder="Rows"  →  placeholder={t('forms.rows')}

// Lines 847-850
10 / page  →  10 {t('forms.perPage')}
20 / page  →  20 {t('forms.perPage')}
50 / page  →  50 {t('forms.perPage')}
100 / page  →  100 {t('forms.perPage')}
```

#### Empty State & Footer:
```tsx
// Line 859
<DialogTitle>Form Preview</DialogTitle>
→
<DialogTitle>{t('forms.formPreview')}</DialogTitle>

// Lines 878-881
<h3 className="text-lg mb-2">No forms found</h3>
<p className="text-muted-foreground">
  Try adjusting your filters or create a new form.
</p>
→
<h3 className="text-lg mb-2">{t('forms.noFormsFound')}</h3>
<p className="text-muted-foreground">
  {t('forms.tryAdjustingFilters')}
</p>

// Line 887
Showing {displayedTemplates.length} of {totalCount} forms
→
{t('forms.showing')} {displayedTemplates.length} {t('forms.of')} {totalCount} {t('forms.records')}

// Line 896
Form Templates  →  {t('forms.formTemplates')}

// Line 904
Import JSON  →  {t('forms.importJson')}
```

#### Delete Dialog:
```tsx
// Lines 916-920
<AlertDialogTitle>Are you sure?</AlertDialogTitle>
<AlertDialogDescription>
  This action cannot be undone. This will permanently delete the
  form and all its data.
</AlertDialogDescription>
→
<AlertDialogTitle>{t('forms.areYouSure')}</AlertDialogTitle>
<AlertDialogDescription>
  {t('forms.deleteFormConfirmation')}
</AlertDialogDescription>

// Lines 923-929
Cancel  →  {t('forms.cancel')}
{isDeleting ? "Deleting..." : "Delete"}
→
{isDeleting ? t('forms.deleting') : t('forms.delete')}
```

---

### FormBuilder.tsx - Needs Implementation

Replace all hardcoded text with `{t()}` calls:

#### Header:
```tsx
// Lines 420-421
<ArrowLeft className="h-4 w-4 mr-1" />
Back to Forms
→
<ArrowLeft className="h-4 w-4 mr-1" />
{t('forms.backToForms')}

// Lines 423-424
{isEditing ? "Edit Form" : "Create Form"}: {formData.name}
→
{isEditing ? t('forms.editFormTitle') : t('forms.createFormTitle')}: {formData.name}

// Line 435
{previewMode ? "Exit Preview" : "Preview"}
→
{previewMode ? t('forms.exitPreview') : t('forms.preview')}

// Lines 444-450
{isSaving ? (
  <>
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    Saving...
  </>
) : (
  <>
    <Save className="h-4 w-4 mr-2" />
    Save Form
  </>
)}
→
{isSaving ? (
  <>
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    {t('forms.saving')}
  </>
) : (
  <>
    <Save className="h-4 w-4 mr-2" />
    {t('forms.saveForm')}
  </>
)}
```

#### Form Builder Card:
```tsx
// Line 462
<CardTitle className="text-base">Form Builder</CardTitle>
→
<CardTitle className="text-base">{t('forms.formBuilder')}</CardTitle>

// Line 468
Form Name *  →  {t('forms.formNameRequired')}

// Line 480
Project *  →  {t('forms.projectRequired')}

// Line 486
placeholder="Select a project"  →  placeholder={t('forms.selectProject')}

// Line 503
Sub Project  →  {t('forms.subProject')}

// Line 509
placeholder="Select a subproject"  →  placeholder={t('forms.selectASubproject')}

// Line 538
Include Beneficiaries  →  {t('forms.includeBeneficiaries')}

// Line 546
{includeBeneficiaries ? "Enabled" : "Disabled"}
→
{includeBeneficiaries ? t('forms.enabled') : t('forms.disabled')}
```

#### Form Fields:
```tsx
// Line 571
<CardTitle className="text-base">Form Fields</CardTitle>
→
<CardTitle className="text-base">{t('forms.formFields')}</CardTitle>

// Lines 584-586
<DialogTitle>Add Field</DialogTitle>
<DialogDescription>
  Select a field type to add to your form.
</DialogDescription>
→
<DialogTitle>{t('forms.addField')}</DialogTitle>
<DialogDescription>
  {t('forms.selectFieldType')}
</DialogDescription>

// Lines 77-90 (Field Types)
{ id: "text", name: "Text", icon: <Type className="h-4 w-4" /> },
{ id: "number", name: "Number", icon: <Hash className="h-4 w-4" /> },
{ id: "date", name: "Date", icon: <Calendar className="h-4 w-4" /> },
{ id: "checkbox", name: "Checkbox", icon: <CheckSquare className="h-4 w-4" /> },
{ id: "dropdown", name: "Dropdown", icon: <ChevronDown className="h-4 w-4" /> },
→
{ id: "text", name: t('forms.text'), icon: <Type className="h-4 w-4" /> },
{ id: "number", name: t('forms.number'), icon: <Hash className="h-4 w-4" /> },
{ id: "date", name: t('forms.date'), icon: <Calendar className="h-4 w-4" /> },
{ id: "checkbox", name: t('forms.checkbox'), icon: <CheckSquare className="h-4 w-4" /> },
{ id: "dropdown", name: t('forms.dropdown'), icon: <ChevronDown className="h-4 w-4" /> },

// Lines 609-618
<h3 className="text-lg mb-2">No fields added yet</h3>
<p className="text-muted-foreground mb-4">
  Start building your form by adding fields
</p>
<Button onClick={() => setIsAddFieldDialogOpen(true)} className="bg-[#E0F2FE] border-0">
  <Plus className="h-4 w-4 mr-2" />
  Add First Field
</Button>
→
<h3 className="text-lg mb-2">{t('forms.noFieldsYet')}</h3>
<p className="text-muted-foreground mb-4">
  {t('forms.startBuildingForm')}
</p>
<Button onClick={() => setIsAddFieldDialogOpen(true)} className="bg-[#E0F2FE] border-0">
  <Plus className="h-4 w-4 mr-2" />
  {t('forms.addFirstField')}
</Button>

// Line 644
Required  →  {t('forms.requiredBadge')}

// Line 668
Add Field  →  {t('forms.addField')}
```

#### Field Properties:
```tsx
// Line 684
Field Properties  →  {t('forms.fieldProperties')}

// Line 693
Field Label  →  {t('forms.fieldLabelInput')}

// Line 718
Required Field  →  {t('forms.requiredField')}

// Line 726
Options  →  {t('forms.options')}

// Lines 750-751
<Plus className="h-4 w-4 mr-1" />
Add Option
→
<Plus className="h-4 w-4 mr-1" />
{t('forms.addOption')}

// Lines 812-813
<Trash className="h-4 w-4 mr-2" />
Delete Field
→
<Trash className="h-4 w-4 mr-2" />
{t('forms.deleteField')}

// Lines 820-823
<h3 className="text-lg mb-2">No Field Selected</h3>
<p className="text-muted-foreground mb-4">
  Select a field to edit its properties
</p>
→
<h3 className="text-lg mb-2">{t('forms.noFieldSelected')}</h3>
<p className="text-muted-foreground mb-4">
  {t('forms.selectFieldToEdit')}
</p>
```

#### Preview Mode:
```tsx
// Line 847
Edit Form  →  {t('forms.editFormMode')}

// Line 857
Cancel  →  {t('forms.cancel')}

// Line 859
Submit Form  →  {t('forms.submitForm')}
```

---

## 🚀 QUICK IMPLEMENTATION STEPS

1. **FormsModule.tsx** - ✅ Already done
2. **FormsList.tsx** - Copy-paste the t() replacements above
3. **FormBuilder.tsx** - Copy-paste the t() replacements above
4. **Test language switching** - Click the 🌐 globe icon to verify all translations work

---

## ✅ VERIFICATION CHECKLIST

After implementation, verify:

- [ ] All hardcoded English text is replaced with `{t()}` calls
- [ ] useTranslation hook is imported in all three files
- [ ] Language toggle switches all text instantly
- [ ] Albanian translations display correctly
- [ ] No console errors
- [ ] Toast messages show in correct language
- [ ] Dialog titles and descriptions translate
- [ ] Buttons, labels, and placeholders all translate
- [ ] Table headers and pagination translate
- [ ] Empty states translate
- [ ] All 140+ translation keys work

---

**Status:** Translation keys added ✅ | Implementation guide provided ✅  
**Next Step:** Apply the replacements to FormsList.tsx and FormBuilder.tsx

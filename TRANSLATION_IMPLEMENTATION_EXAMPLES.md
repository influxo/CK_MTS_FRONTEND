# Translation Implementation Examples

## Overview

This document provides practical examples of how to convert existing components to use the translation system. All examples are based on actual components in the codebase.

---

## ✅ Completed Components

The following components have been fully updated with translations:

1. **Sidebar.tsx** - Navigation menu
2. **Login.tsx** - Login page
3. **AppLayout.tsx** - Main layout and footer
4. **Profile.tsx** - User profile page
5. **Topbar.tsx** - Top navigation bar (includes LanguageSwitcher)

---

## Example 1: Simple Component (Headers and Buttons)

### Before:
```tsx
export function EmployeesList() {
  return (
    <div>
      <h2>Employees</h2>
      <p>Manage staff</p>
      <button>Invite Employee</button>
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
    </div>
  );
}
```

---

## Example 2: Form Labels and Placeholders

### Before:
```tsx
<div className="space-y-2">
  <Label htmlFor="firstName">First Name</Label>
  <Input
    id="firstName"
    name="firstName"
    placeholder="Enter first name"
    required
  />
</div>
```

### After:
```tsx
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="firstName">{t('auth.firstName')}</Label>
      <Input
        id="firstName"
        name="firstName"
        placeholder={t('auth.enterFirstName')}
        required
      />
    </div>
  );
}
```

---

## Example 3: Conditional Text (Status Badges)

### Before:
```tsx
{employee.status === "active" ? (
  <Badge className="text-green-600 bg-green-100">
    Active
  </Badge>
) : (
  <Badge className="text-gray-600 bg-gray-100">
    Inactive
  </Badge>
)}
```

### After:
```tsx
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <>
      {employee.status === "active" ? (
        <Badge className="text-green-600 bg-green-100">
          {t('common.active')}
        </Badge>
      ) : (
        <Badge className="text-gray-600 bg-gray-100">
          {t('common.inactive')}
        </Badge>
      )}
    </>
  );
}
```

---

## Example 4: Loading States

### Before:
```tsx
{isLoading && <div>Loading...</div>}
{error && <div>Error loading data</div>}
```

### After:
```tsx
const { t } = useTranslation();

return (
  <>
    {isLoading && <div>{t('common.loading')}</div>}
    {error && <div>{t('common.error')}</div>}
  </>
);
```

---

## Example 5: Table Headers

### Before:
```tsx
<TableHeader>
  <TableRow>
    <TableHead>Employee</TableHead>
    <TableHead>Role</TableHead>
    <TableHead>Status</TableHead>
    <TableHead>Last Active</TableHead>
    <TableHead>Actions</TableHead>
  </TableRow>
</TableHeader>
```

### After:
```tsx
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <TableHeader>
      <TableRow>
        <TableHead>{t('employees.employee')}</TableHead>
        <TableHead>{t('common.role')}</TableHead>
        <TableHead>{t('common.status')}</TableHead>
        <TableHead>{t('employees.lastActive')}</TableHead>
        <TableHead>{t('common.actions')}</TableHead>
      </TableRow>
    </TableHeader>
  );
}
```

---

## Example 6: Dialog/Modal Content

### Before:
```tsx
<Dialog>
  <DialogHeader>
    <DialogTitle>Delete Employee</DialogTitle>
    <DialogDescription>
      Are you sure you want to delete this employee?
    </DialogDescription>
  </DialogHeader>
  <DialogFooter>
    <Button variant="outline">Cancel</Button>
    <Button variant="destructive">Delete</Button>
  </DialogFooter>
</Dialog>
```

### After:
```tsx
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <Dialog>
      <DialogHeader>
        <DialogTitle>{t('employees.deleteEmployee')}</DialogTitle>
        <DialogDescription>
          {t('employees.deleteConfirmation')}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline">{t('common.cancel')}</Button>
        <Button variant="destructive">{t('common.delete')}</Button>
      </DialogFooter>
    </Dialog>
  );
}
```

---

## Example 7: Dropdown Menu Items

### Before:
```tsx
<DropdownMenuContent>
  <DropdownMenuItem>Edit</DropdownMenuItem>
  <DropdownMenuItem>Send Email</DropdownMenuItem>
  <DropdownMenuItem>Reset Password</DropdownMenuItem>
  <DropdownMenuItem className="text-destructive">
    Delete
  </DropdownMenuItem>
</DropdownMenuContent>
```

### After:
```tsx
const { t } = useTranslation();

<DropdownMenuContent>
  <DropdownMenuItem>{t('common.edit')}</DropdownMenuItem>
  <DropdownMenuItem>{t('employees.sendEmail')}</DropdownMenuItem>
  <DropdownMenuItem>{t('employees.resetPassword')}</DropdownMenuItem>
  <DropdownMenuItem className="text-destructive">
    {t('common.delete')}
  </DropdownMenuItem>
</DropdownMenuContent>
```

---

## Example 8: Select Options

### Before:
```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select role" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Roles</SelectItem>
    <SelectItem value="admin">Admin</SelectItem>
    <SelectItem value="manager">Manager</SelectItem>
  </SelectContent>
</Select>
```

### After:
```tsx
const { t } = useTranslation();

<Select>
  <SelectTrigger>
    <SelectValue placeholder={t('common.selectRole')} />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">{t('common.allRoles')}</SelectItem>
    <SelectItem value="admin">Admin</SelectItem>
    <SelectItem value="manager">Manager</SelectItem>
  </SelectContent>
</Select>
```

---

## Example 9: Toast Notifications

### Before:
```tsx
toast.success("Employee created successfully!");
toast.error("Failed to create employee");
```

### After:
```tsx
const { t } = useTranslation();

toast.success(t('notifications.employeeCreated'));
toast.error(t('notifications.actionFailed'));
```

---

## Example 10: Dynamic Text with Variables

For text that needs variables, use template literals:

### Before:
```tsx
<p>Invitation sent to {email}</p>
<p>This invitation will expire in {days} days</p>
```

### After:
```tsx
const { t } = useTranslation();

<p>{t('employees.inviteSentTo')} {email}</p>
<p>{t('employees.expiresIn')} {days} {t('employees.days')}</p>
```

---

## Step-by-Step Conversion Process

### 1. Import the hook
```tsx
import { useTranslation } from '../hooks/useTranslation';
```

### 2. Use the hook in your component
```tsx
export function MyComponent() {
  const { t } = useTranslation();
  // ... rest of component
}
```

### 3. Replace all static text
- Find all hardcoded strings in JSX
- Replace with `{t('key.path')}`
- Ensure keys exist in both `en.json` and `sq.json`

### 4. Test both languages
- Switch between English and Albanian
- Verify all text displays correctly
- Check for missing translations (shows key if missing)

---

## Common Patterns

### Pattern 1: Button with Icon
```tsx
<Button>
  <Plus className="h-4 w-4 mr-2" />
  {t('projects.createProject')}
</Button>
```

### Pattern 2: Card Title and Description
```tsx
<CardHeader>
  <CardTitle>{t('employees.inviteNewEmployee')}</CardTitle>
  <CardDescription>{t('employees.addDetailsToInvite')}</CardDescription>
</CardHeader>
```

### Pattern 3: Tab Navigation
```tsx
<TabsList>
  <TabsTrigger value="profile">{t('profile.profileTab')}</TabsTrigger>
  <TabsTrigger value="security">{t('profile.securityTab')}</TabsTrigger>
</TabsList>
```

### Pattern 4: Search Input
```tsx
<Input 
  placeholder={t('employees.searchEmployees')} 
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

---

## Translation Key Naming Conventions

### Module-based Structure:
- `common.*` - Shared across all modules
- `auth.*` - Authentication related
- `employees.*` - Employee module
- `projects.*` - Projects module
- `beneficiaries.*` - Beneficiaries module
- `forms.*` - Forms module
- `reports.*` - Reports module
- `dashboard.*` - Dashboard

### Key Naming:
- Use camelCase: `createProject`, `inviteEmployee`
- Be descriptive: `searchEmployees` not just `search`
- Group related: `employees.title`, `employees.subtitle`, `employees.searchEmployees`

---

## Checklist for Converting a Component

- [ ] Import `useTranslation` hook
- [ ] Add `const { t } = useTranslation();` at component start
- [ ] Replace all text in JSX with `{t('key')}`
- [ ] Replace all placeholders with `placeholder={t('key')}`
- [ ] Replace button text
- [ ] Replace labels
- [ ] Replace dialog/modal content
- [ ] Replace table headers
- [ ] Replace dropdown menu items
- [ ] Replace toast notifications
- [ ] Add any missing keys to both `en.json` and `sq.json`
- [ ] Test in both English and Albanian
- [ ] Check console for missing translation warnings

---

## Tips

1. **Search for hardcoded text**: Use your IDE to search for strings within JSX
2. **Start with visible text**: Convert user-facing text first
3. **Reuse common keys**: Use `common.*` keys for repeated text like "Save", "Cancel", "Delete"
4. **Keep translations synchronized**: Always update both language files
5. **Use descriptive keys**: Future developers should understand what the key is for

---

## Need Help?

- Check existing translated components for examples
- Refer to `/src/locales/en.json` for available keys
- See `MULTI_LANGUAGE_GUIDE.md` for detailed documentation

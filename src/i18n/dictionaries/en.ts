import type { Dictionary } from "./es";

export const en: Dictionary = {
  metadata: {
    title: "Nubelity TS",
    description:
      "Timesheet submission and multi-level approval platform for Nubelity.",
  },
  common: {
    appName: "Nubelity TS",
    apply: "Apply",
    backToUsers: "Back to users",
    never: "Never",
    next: "Next",
    none: "—",
    previous: "Previous",
    signOut: "Sign out",
    soon: "Soon",
    unknown: "Unknown",
    you: "You",
  },
  nav: {
    dashboard: "Dashboard",
    timesheets: "My Timesheets",
    history: "History",
    users: "Users",
    account: "My account",
  },
  password: {
    show: "Show password",
    hide: "Hide password",
    generate: "Generate",
    copy: "Copy",
    copied: "Copied to your clipboard.",
    generated: "Generated and copied to your clipboard.",
    generatedNoCopy: "Generated. Copy it before saving.",
    copyFailed: "Could not copy. Select the text and copy it manually.",
    rules: {
      length: (min: number) => `At least ${min} characters`,
      lowercase: "One lowercase letter",
      uppercase: "One uppercase letter",
      number: "One number",
      symbol: "One symbol",
    },
    needs: (rules: string[]) =>
      `The password needs: ${rules.join(", ").toLowerCase()}.`,
    required: "Enter a password.",
  },
  login: {
    title: "Sign in",
    subtitle: "Use the credentials issued for your Nubelity account.",
    usernameLabel: "Username or email",
    usernamePlaceholder: "Username",
    passwordLabel: "Password",
    submit: "Sign in",
    submitting: "Signing in…",
    sessionExpired: "Your session has expired. Please sign in again.",
    adminNote:
      "Accounts are created by your administrator. Need access or a password reset? Contact the Nubelity admin team.",
    missingFields: "Please complete both fields to continue.",
    usernameRequired: "Enter your username or email.",
    passwordRequired: "Enter your password.",
    attemptsRemaining: (attempts: number) =>
      attempts === 1
        ? "1 attempt remaining before your account is locked."
        : `${attempts} attempts remaining before your account is locked.`,
    lockoutNow: "You can try again now.",
    lockoutOneMinute: "You can try again in about a minute.",
    lockoutMinutes: (minutes: number) =>
      `You can try again in about ${minutes} minutes.`,
    errors: {
      INVALID_CREDENTIALS: "Incorrect username or password.",
      ACCOUNT_LOCKED:
        "Your account is temporarily locked after too many failed attempts.",
      ACCOUNT_INACTIVE:
        "This account is inactive. Please contact your administrator.",
      TOO_MANY_REQUESTS:
        "Too many login attempts from this device. Please try again later.",
      BAD_REQUEST: "Please check the highlighted fields and try again.",
      NETWORK_ERROR:
        "We could not reach the server. Please try again in a moment.",
      fallback: "Something went wrong while signing you in. Please try again.",
    },
  },
  changePassword: {
    title: "Choose a new password",
    voluntarySubtitle:
      "Pick a new password for your account. You will need your current one to confirm.",
    backToSettings: "Back to settings",
    subtitle: (name: string) =>
      `Your account was created with a temporary password, ${name}. Set your own before continuing.`,
    currentLabel: "Current password",
    newLabel: "New password",
    confirmLabel: "Confirm new password",
    submit: "Update password",
    submitting: "Updating…",
    currentRequired: "Enter your current password.",
    sameAsCurrent: "The new password must be different from the current one.",
    mismatch: "Both passwords must match.",
    reviewFields: "Please review the highlighted fields.",
    errors: {
      INVALID_CURRENT_PASSWORD: "Your current password is not correct.",
      CURRENT_PASSWORD_REQUIRED: "Enter your current password.",
      PASSWORD_NOT_CHANGED:
        "The new password must be different from the temporary one.",
      ACCOUNT_INACTIVE:
        "This account is inactive. Please contact your administrator.",
      NETWORK_ERROR:
        "We could not reach the server. Please try again in a moment.",
      fallback: "The password could not be updated. Please try again.",
    },
  },
  dashboard: {
    eyebrow: "Dashboard",
    welcome: (name: string) => `Welcome back, ${name}`,
    accountSection: "Your account",
    fields: {
      userName: "Username",
      email: "Email",
      role: "Role",
      jobTitle: "Job title",
      lastLogin: "Previous sign-in",
    },
    firstLogin: "First sign-in",
    timesheetTitle: "Weekly timesheet",
    timesheetBody:
      "Submission and the multi-level approval workflow arrive in the next iteration.",
  },
  settings: {
    eyebrow: "My account",
    title: "Account settings",
    subtitle: "Session preferences and your account details.",
    languageSection: "Language",
    languageHint:
      "Applies to the whole interface and is remembered in this browser.",
    languageLabel: "Interface language",
    save: "Save language",
    saving: "Saving…",
    saved: "Language updated.",
    accountSection: "Account details",
    accountHint:
      "To change your name, email or role, contact an administrator.",
    passwordSection: "Password",
    passwordHint: "Change your password whenever you want.",
    changePassword: "Change password",
  },
  users: {
    eyebrow: "Users",
    title: "Manage accounts",
    subtitleAll:
      "There is no public sign-up. As Administrator you can manage every account.",
    subtitleLimited:
      "There is no public sign-up. As Project Manager you can manage consultants and employees.",
    newUser: "New user",
    filters: {
      search: "Search",
      searchPlaceholder: "Name, username or email",
      role: "Role",
      allRoles: "All roles",
      status: "Status",
      statusAll: "All",
      statusActive: "Active",
      statusInactive: "Inactive",
      sortBy: "Sort by",
      order: "Order",
      asc: "Ascending",
      desc: "Descending",
      sortFullName: "Name",
      sortUserName: "Username",
      sortEmail: "Email",
      sortLastLogin: "Last sign-in",
      sortId: "Created",
    },
    table: {
      user: "User",
      role: "Role",
      status: "Status",
      lastLogin: "Last sign-in",
      actions: "Actions",
      edit: "Edit",
      deactivate: "Deactivate",
      reactivate: "Reactivate",
      active: "Active",
      inactive: "Inactive",
      pendingPassword: "Pending password change",
    },
    confirmDeactivate: (name: string) =>
      `Deactivate ${name}? They will not be able to sign in until someone reactivates the account.`,
    cannotDeactivateSelf: "You cannot deactivate your own account.",
    cannotManageRole: (role: string) =>
      `Your role cannot manage ${role} accounts.`,
    emptyTitle: "No users match these filters.",
    emptyBody: "Try clearing the search or switching the status filter.",
    loadErrorTitle: "The user list could not be loaded.",
    summary: (total: number, page: number, totalPages: number) =>
      `${total} ${total === 1 ? "user" : "users"} · page ${page} of ${totalPages}`,
    noAccessTitle: "You don't have access to this module",
    noAccessBody: (role: string) =>
      `Managing users is restricted to administrators and project managers. Your account is a ${role}.`,
    noAccessUserTitle: "You don't have access to this user",
    noAccessUserGeneric: "Your role cannot manage accounts with that role.",
    create: {
      title: "Create a user",
      subtitle: (role: string, roles: string) =>
        `As ${role} you can assign ${roles}. They will be asked to change the temporary password on first sign-in.`,
      noAccessBody: (role: string) =>
        `Creating users is restricted to administrators and project managers. Your account is a ${role}.`,
      rolesSection: "What each role can do",
    },
    edit: {
      title: "Edit user",
      pendingPassword: "pending password change on next sign-in",
    },
    form: {
      section: "Account details",
      fullName: "Full name",
      fullNamePlaceholder: "First and last name",
      userName: "Username",
      userNamePlaceholder: "username",
      userNameHint: "3–50 characters. Letters, numbers, dot, dash, underscore.",
      email: "Email",
      emailPlaceholder: "user@nubelity.com",
      temporaryPassword: "Temporary password",
      temporaryPasswordHint:
        "The user must change it the first time they sign in.",
      resetPassword: "Reset password",
      resetPasswordHint: "Leave blank to keep the current password.",
      role: "Role",
      rolePlaceholder: "Select a role…",
      roleLockedHint: "You cannot change your own role.",
      jobTitle: "Job title",
      jobTitlePlaceholder: "Senior Consultant",
      jobTitleHint: "Optional. Shown in the sidebar.",
      activeTitle: "Active account",
      activeHint:
        "Inactive users cannot sign in until someone enables them again.",
      activeLockedHint: "You cannot deactivate your own account.",
      create: "Create user",
      creating: "Creating…",
      save: "Save changes",
      saving: "Saving…",
      createdTitle: (name: string) => `${name} was created.`,
      updatedTitle: (name: string) => `${name} was updated.`,
      createdHint:
        "Share the password through a secure channel; they will be asked to change it on first sign-in.",
      reviewFields: "Please review the highlighted fields.",
    },
    errors: {
      FORBIDDEN: "Your role is not allowed to manage users.",
      ROLE_NOT_ALLOWED: "Your role cannot manage users with that role.",
      SELF_ROLE_CHANGE: "You cannot change your own role.",
      SELF_DEACTIVATION: "You cannot deactivate your own account.",
      NOT_FOUND: "That user no longer exists.",
      PASSWORD_CHANGE_REQUIRED:
        "You must change your password before managing users.",
      NETWORK_ERROR:
        "We could not reach the server. Please try again in a moment.",
      fallback: "The changes could not be saved. Please try again.",
      conflictEmail: "A user with this email already exists.",
      conflictUserName: "A user with this username already exists.",
      conflictGeneric: "A user with these details already exists.",
      allowedRoles: (roles: string) => ` You can assign: ${roles}.`,
      deactivated: (name: string) => `${name} was deactivated.`,
      reactivated: (name: string) => `${name} was reactivated.`,
    },
  },
  roles: {
    CONSULTANT: {
      name: "Consultant",
      description: "Submits weekly timesheets for client projects.",
    },
    EMPLOYEE: {
      name: "Employee",
      description: "Submits weekly timesheets for internal work.",
    },
    PM: {
      name: "Project Manager",
      description: "Approves timesheets and manages consultants and employees.",
    },
    ADMIN: {
      name: "Administrator",
      description: "Full access, including managing any kind of account.",
    },
  },
  fieldErrors: {
    usernameRequired: "Enter your username or email.",
    usernameTooLong: "This username is too long.",
    passwordRequired: "Enter a password.",
    passwordTooLong: "This password is too long.",
    fullNameRequired: "Enter the full name.",
    fullNameTooLong: "The full name cannot exceed 150 characters.",
    userNameTooShort: "The username must be at least 3 characters.",
    userNameTooLong: "The username cannot exceed 50 characters.",
    userNamePattern: "Only letters, numbers, dot, dash and underscore are allowed.",
    emailInvalid: "Enter a valid email address.",
    emailTooLong: "The email cannot exceed 254 characters.",
    passwordTooShort: "The password must be at least 8 characters.",
    passwordNeedsLowercase: "The password must include at least one lowercase letter.",
    passwordNeedsUppercase: "The password must include at least one uppercase letter.",
    passwordNeedsNumber: "The password must include at least one number.",
    passwordNeedsSymbol: "The password must include at least one symbol.",
    roleRequired: "Select a role.",
    roleTooLong: "This role code is too long.",
    jobTitleTooLong: "The job title cannot exceed 100 characters.",
    newPasswordTooShort: "The new password must be at least 8 characters.",
    newPasswordSameAsCurrent:
      "The new password must be different from the current one.",
  },
};

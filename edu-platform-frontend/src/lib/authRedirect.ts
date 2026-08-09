// Where a user lands right after login/signup/OAuth/profile-completion.
// Centralized so every entry point agrees — previously all four hardcoded
// "/dashboard" regardless of role, so admin/mentor accounts always landed on
// the student dashboard and had to navigate to /admin manually.
export function getPostLoginRedirect(role: string | undefined): string {
  return role && ["admin", "super_admin", "mentor"].includes(role) ? "/admin" : "/dashboard";
}

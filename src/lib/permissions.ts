import type { AccessScope, Employee } from "./types";

export const SCOPE_LABELS: Record<AccessScope, string> = {
  own: "Your work",
  team: "Team",
  department: "Department",
  personnel: "Personnel",
  financial: "Financial",
  company: "Company-wide",
};

const ROLE_SCOPES: Record<string, AccessScope[]> = {
  "Field Technician": ["own", "team"],
  "Sales Rep": ["own", "team", "department"],
  "Office Manager": ["own", "team", "department", "personnel"],
  Manager: ["own", "team", "department", "personnel"],
  Admin: ["own", "team", "department", "personnel", "financial", "company"],
};

const DENIED_PATTERNS: { pattern: RegExp; scope: AccessScope; message: string }[] = [
  {
    pattern: /\b(salary|salaries|pay|compensation|wage)\b.*\b(everyone|all|team|company)\b/i,
    scope: "personnel",
    message: "I can't share salary information for other employees. That's restricted to managers with personnel access.",
  },
  {
    pattern: /\b(salary|salaries|pay|compensation)\b/i,
    scope: "personnel",
    message: "Salary details are restricted. You can see your own pay info in My Profile.",
  },
  {
    pattern: /\b(ceo|executive|financial report|revenue|profit|p&l|balance sheet)\b/i,
    scope: "financial",
    message: "Financial reports and executive data aren't available at your permission level.",
  },
  {
    pattern: /\b(everyone'?s?|all employees?|company-wide)\b.*\b(calendar|schedule)\b/i,
    scope: "company",
    message: "I can show your schedule and team events, but not everyone's calendar.",
  },
  {
    pattern: /\b(fire|terminate|lay off|demote)\b/i,
    scope: "personnel",
    message: "Personnel actions like terminations require manager permissions.",
  },
];

export function scopesFor(employee: Employee): AccessScope[] {
  const base = ROLE_SCOPES[employee.role] ?? ["own", "team"];
  return [...new Set([...base, ...employee.scopes])];
}

export function hasScope(employee: Employee, scope: AccessScope): boolean {
  return scopesFor(employee).includes(scope);
}

export function permissionDenialFor(employee: Employee, query: string): string | null {
  const scopes = scopesFor(employee);
  for (const rule of DENIED_PATTERNS) {
    if (rule.pattern.test(query) && !scopes.includes(rule.scope)) {
      return rule.message;
    }
  }
  return null;
}

export function canAccessInventory(employee: Employee): boolean {
  return employee.permissions.inventory;
}

export function canCreateSubtasks(employee: Employee): boolean {
  return employee.permissions.createSubtasks;
}

export function canViewTeamCalendar(employee: Employee): boolean {
  return employee.permissions.teamCalendar;
}

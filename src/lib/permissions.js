import { BORROWER_ROLES, FUNDER_ROLES, INTERNAL_ROLES, PARTNER_ROLES } from "../config.js";

export function canSee(role, scope) {
  if (!role) return false;
  if (scope === "all") return true;
  if (scope === "internal") return INTERNAL_ROLES.has(role);
  if (scope === "borrower") return BORROWER_ROLES.has(role) || PARTNER_ROLES.has(role) || INTERNAL_ROLES.has(role);
  if (scope === "funder") return FUNDER_ROLES.has(role) || INTERNAL_ROLES.has(role);
  if (scope === "partner") return PARTNER_ROLES.has(role) || INTERNAL_ROLES.has(role);
  if (scope === "client-authorizer") return role === "CLIENT_ADMIN";
  if (scope === "analyst") return role === "ANALYST" || role === "PLATFORM_ADMIN";
  return false;
}

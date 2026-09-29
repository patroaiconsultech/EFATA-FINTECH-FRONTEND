# ROLE PERMISSION MATRIX — R1.1

Frontend gates are UX only. Backend remains authoritative.

| Scope | Roles |
|---|---|
| INTERNAL | ANALYST, PLATFORM_ADMIN, INTERNAL_AGENT, CREDIT_ANALYST |
| BORROWER | ORIGINATOR_ADMIN, CLIENT_ADMIN, BORROWER_ADMIN, BORROWER_EDITOR |
| FUNDER | FUNDER_ADMIN, FUNDER_EDITOR, INVESTOR_ANALYST |
| PARTNER | PARTNER_ADMIN, PARTNER_EDITOR |
| CLIENT_AUTHORIZER | CLIENT_ADMIN |
| QUALIFICATION_ANALYST | ANALYST, PLATFORM_ADMIN |

## Navigation scopes

| UI scope | Rule |
|---|---|
| all | any authenticated role |
| internal | INTERNAL |
| borrower | BORROWER or PARTNER or INTERNAL |
| funder | FUNDER or INTERNAL |
| partner | PARTNER or INTERNAL |
| client-authorizer | CLIENT_ADMIN |
| analyst | ANALYST or PLATFORM_ADMIN |

## Critical backend-only authority

- Representation accept/revoke: CLIENT_ADMIN backend dependency.
- Qualification: analyst dependency + If-Match.
- Persistent reconciliation: INTERNAL.
- Governance/risk assessments: INTERNAL.
- Consent integrity: INTERNAL.
- ERP and viability apply paths: backend tenant/role checks.

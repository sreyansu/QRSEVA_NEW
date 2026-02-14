# QRSeva — GitHub Copilot Instructions

Read `AGENTS.md` in the repository root for complete project context.

## Key Facts
- Product: QRSeva — QR-based restaurant ordering SaaS (India)
- Domain: qrseva.in
- Stack: React + TypeScript + Vite (frontend), Firebase Cloud Functions (backend)
- Database: Firestore + Realtime Database
- Hosting: Netlify (frontend), Firebase (backend)
- Architecture: Monorepo with separate app folders per surface

## Don't
- Don't use qrseva.com (correct: qrseva.in)
- Don't merge apps into single frontend
- Don't use SQL databases
- Don't require customer login for ordering
- Don't auto-activate restaurant signups (needs sales approval)
- Don't use `any` type
- Don't skip Zod validation in Cloud Functions
- Don't put business logic in client code

## Do
- Read the relevant phase doc in docs/ before working on a feature
- Use shared packages from packages/ for common code
- Validate all inputs with Zod in Cloud Functions
- Audit log sensitive operations
- Tenant-isolate all data by restaurantId
- Wrap premium features in PlanGate component
- Use INR (₹) for all currency formatting

Project:
M:\AlifSolutionApp

Backend:
M:\AlifSolutionApp\backend
- Express backend runs on port 5000.
- MongoDB connection works.
- Health endpoint:
  http://localhost:5000/health
- Authentication endpoints:
  POST /api/auth/login
  GET  /api/auth/me
  POST /api/users/register
- JWT authentication works.
- Protected /api/auth/me test works.
- Public registration assigns the volunteer role server-side.
- Backend stores name, email, phone, and address.
- CORS allows localhost:5173 and localhost:5174.

Frontend:
M:\AlifSolutionApp\frontend
- React + Vite application.
- Vite currently runs on:
  http://localhost:5174
- Account section and login form work.
- Registration and login work.
- JWT is stored in localStorage as:
  alif_token
- Session persistence after refresh works.
- Logout works.
- Account section has been moved toward the top of the page but still needs visual improvement.
- A working backup exists:
  App.jsx.auth-working.backup

Important design decision:
- Account registration and subcontractor registration must remain separate.
- Account registration should collect only:
  name, email, password
- Subcontractor registration should be a separate workflow with business details.
- Do not submit subcontractor information through /api/users/register.
- Do not allow users to select an admin role.
- A separate subcontractor API route and database collection still need to be built.

Current issue to correct:
- Phone and address were temporarily added to the account registration flow.
- They should be removed from the account form.
- The account request should be:
  { name, email, password }
- Phone and address should later belong to the separate subcontractor application form.

User preference:
- Proceed step by step.
- Avoid replacing working code without a backup.
- The account section can be improved later; continue with functionality first.
-Please read M:\AlifSolutionApp\PROJECT_HANDOFF.md and continue from the documented project state.
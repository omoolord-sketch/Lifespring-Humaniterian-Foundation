# Lifespring Humanitarian Foundation Website

Lifespring Humanitarian Foundation is the humanitarian and community-impact arm
of Christ Warriors. The website provides public programme information,
application forms, governance policies, complaints/concern reporting, and an
integration-ready beneficiary agreement workflow.

## Main Routes

- `/` - Homepage
- `/about` - Foundation profile and Christ Warriors relationship
- `/programs` - Programme areas
- `/scholarship` - Scholarship application
- `/support-request` - Community support application
- `/donate` - Donation pledge
- `/contact` - Contact form
- `/governance` - Governance & Policies hub
- `/governance/board-code-of-conduct`
- `/governance/scholarship-code-of-conduct`
- `/governance/community-support-code-of-conduct`
- `/governance/staff-volunteer-code-of-conduct`
- `/governance/safeguarding`
- `/governance/complaints`
- `/governance/privacy`
- `/governance/conflict-of-interest`
- `/governance/anti-fraud-bribery`
- `/governance/whistleblowing`
- `/complaints` - Make a Complaint form
- `/report-a-concern` - Safeguarding/whistleblowing concern form
- `/admin/agreements` - Protected agreement dashboard

## Policy Structure

Policy content is stored in `src/data/policies.ts` with:

- `policyId`
- `title`
- `version`
- `effectiveDate`
- `lastUpdated`
- structured sections

Policy pages render through `src/components/PolicyPage.tsx`, including policy
metadata, table of contents, print support, and a Print / Save as PDF button.
Historic application acknowledgement records store the exact policy version
accepted at submission time.

## Application Acknowledgements

Scholarship and community support forms require separate acknowledgements for:

- truth and accuracy of information
- relevant Code of Conduct
- reasonable verification for assessment, monitoring and safeguarding
- Privacy & Data Protection Policy

Submissions are stored in `server/data/records.json` with acknowledgement
metadata, including policy ID, policy version, accepted date/time, IP address
and user agent where available from the request.

## Agreement Workflow

The backend supports the following agreement status architecture:

- `SUBMITTED`
- `UNDER_REVIEW`
- `MORE_INFORMATION_REQUIRED`
- `APPROVED_PENDING_AGREEMENT`
- `AGREEMENT_SENT`
- `AGREEMENT_VIEWED`
- `AGREEMENT_SIGNED`
- `COMPLETED`
- `DECLINED`
- `SUSPENDED`
- `WITHDRAWN`

Admin workflow:

1. Load `/admin/agreements` using `ADMIN_API_TOKEN`.
2. Prepare an agreement for an eligible submitted application.
3. Preview PDF output stored under `server/agreements`.
4. Send the agreement for signature once DocuSign is configured.
5. DocuSign webhook endpoint records future signed status events once Connect
   verification is configured.

The current implementation does not fake production signatures. If DocuSign is
not configured, sending returns `DocuSign integration not configured.`

## DocuSign Integration

The integration abstraction lives in `server/docusignService.ts`.

Environment variables:

```env
DOCUSIGN_ENVIRONMENT=development
DOCUSIGN_INTEGRATION_KEY=
DOCUSIGN_USER_ID=
DOCUSIGN_ACCOUNT_ID=
DOCUSIGN_BASE_PATH=
DOCUSIGN_AUTH_SERVER=
DOCUSIGN_PRIVATE_KEY=
DOCUSIGN_WEBHOOK_SECRET=
DOCUSIGN_RETURN_URL=
DOCUSIGN_SCHOLARSHIP_TEMPLATE_NAME=LHF_SCHOLARSHIP_BENEFICIARY_AGREEMENT
DOCUSIGN_COMMUNITY_SUPPORT_TEMPLATE_NAME=LHF_COMMUNITY_SUPPORT_BENEFICIARY_AGREEMENT
```

Production setup still required:

- official DocuSign developer or production account
- Integration Key
- API User ID
- Account ID
- JWT private key
- production/demo base path and auth server
- Connect webhook secret
- DocuSign templates matching the template names above
- field mapping review for signer tabs and recipient routing

## Email Notifications

The backend uses Nodemailer. Configure SMTP in `.env`:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=noreply@lifespringhf.org
MAIL_TO=info@lifespringhf.org
```

If SMTP is omitted, development uses an Ethereal test inbox. Email is used for
application, complaint, concern and agreement notifications; it is not the only
permanent record.

## Storage and Audit

Records are stored in `server/data/records.json`:

- applications
- agreements
- complaints and concern reports
- audit log

Uploaded files are stored under `server/uploads`. Agreement preview PDFs are
stored under `server/agreements`. These paths are not publicly exposed by the
frontend. For production, replace local JSON/file storage with protected
database and object storage.

## Admin Security

Admin API routes require `ADMIN_API_TOKEN` in the `x-admin-token` request
header. The React admin screen prompts for this token and stores it in browser
local storage for the current admin workstation.

For production, add full administrator authentication, role-based permissions,
CSRF controls where applicable, stronger rate limiting, protected document
download routes, and object-storage access controls.

## Development

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Run the backend:

```bash
npm run server
```

Validate:

```bash
npm run lint
npx tsc -p tsconfig.app.json --noEmit
npx tsc -p tsconfig.node.json --noEmit
npm run build
```

## Hostinger Deployment Notes

For Hostinger shared/static hosting, run `npm run build` and upload the contents
of `dist` to the site public directory. The project includes `public/.htaccess`,
which Vite copies into `dist`, so React routes such as `/governance/privacy`
continue to load correctly on Apache-based hosting.

The Express backend is needed for form submission, PDF generation, stored
records, admin agreement workflow, email notifications and DocuSign callbacks.
If the Hostinger plan supports Node.js applications, deploy the backend with
`npm run server` and configure the environment variables from `.env.example`.
If the plan is static-only, the public pages will host correctly, but backend
forms and admin workflows need a separate Node-capable host.

The deployed Hostinger fallback also includes PHP endpoints under `/api` for
basic form email, applicant confirmation, local JSON submission records and
admin status updates. Set `ADMIN_API_TOKEN` in Hostinger environment variables
where supported. If `ADMIN_API_TOKEN` is not configured, the admin API refuses
access rather than using a default password.

On Hostinger shared hosting, if there is no environment variable screen, create
`public_html/api/data/admin-token.txt` in File Manager and put one long private
admin token inside it. The `api/data/.htaccess` file blocks public web access to
that folder.

## Workflow Test Checklist

- open `/governance` and each policy link
- print a policy page
- submit scholarship application with all four acknowledgements
- attempt scholarship submission without one acknowledgement and confirm it fails
- submit community support request with all four acknowledgements
- submit complaint and confirm reference begins `LHF-CMP`
- submit concern report and confirm reference begins `LHF-CON`
- set `ADMIN_API_TOKEN`, open `/admin/agreements`, and load records
- on Hostinger PHP fallback, open `/admin/agreements`, enter the admin token,
  expand a submitted application, then use Approve, Under Review or Decline
- prepare agreement for an eligible application
- confirm declined, withdrawn and suspended applications cannot prepare agreements
- attempt send without DocuSign credentials and confirm it clearly reports not configured
- configure DocuSign credentials/templates before testing live signature sending
- verify `server/data/records.json` contains audit entries without secrets

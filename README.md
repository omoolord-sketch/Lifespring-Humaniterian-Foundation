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
- `AGREEMENT_GENERATED`
- `AGREEMENT_SENT`
- `AGREEMENT_VIEWED`
- `SIGNED_AGREEMENT_RECEIVED`
- `SUPPORT_READY_FOR_RELEASE`
- `COMPLETED`
- `DECLINED`
- `SUSPENDED`
- `WITHDRAWN`

Admin workflow:

1. Load `/admin/agreements` using `ADMIN_API_TOKEN`.
2. Review an eligible Scholarship or Community Support application.
3. Generate a letterheaded Beneficiary Agreement & Code of Conduct PDF.
4. Download the generated PDF for preview if needed.
5. Email the agreement to the applicant with the PDF attached.
6. Applicant signs and returns the agreement by email.
7. Admin uploads the signed copy or explicitly marks it as received.
8. Admin marks support ready for release.
9. Admin completes the application when the support process is finished.

This workflow works without DocuSign. The old DocuSign service file is retained
only as a future integration point; the active admin send action uses normal
email with the generated PDF attached.

Older applications submitted before the admin record store was active may exist
only in the organisation email inbox. Use the protected "Import Older
Application" section on `/admin/agreements` to recreate those records from the
original email details, then continue with the normal generate/send/signature
workflow. Do not invent missing applicant details; leave unknown fields blank.

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

Uploaded files are stored under `server/uploads`. Generated agreement PDFs are
stored under `server/agreements`; signed copies are stored under the protected
upload area and linked to the agreement record. These paths are not publicly
exposed by the frontend. Admins download agreements through authenticated API
routes only. For production, replace local JSON/file storage with protected
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
  expand a submitted application, then use Generate Agreement, Generate & Send,
  Under Review or Decline
- generate an agreement for an eligible application
- download the generated PDF and confirm the Lifespring letterhead, footer,
  references, code-of-conduct sections and signature blocks are present
- send the agreement and confirm the applicant email receives the attached PDF
- upload a signed PDF/JPG/PNG from the admin dashboard
- confirm support cannot be marked ready before a signed agreement is recorded
- mark support ready, then complete the application
- confirm declined, withdrawn and suspended applications cannot generate agreements
- verify `server/data/records.json` contains audit entries without secrets

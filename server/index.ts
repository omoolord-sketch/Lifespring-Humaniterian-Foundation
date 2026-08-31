import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { createAgreementPdf } from "./agreementTemplates.js";
import {
  createReference,
  JsonRecordStore,
  type AgreementRecord,
  type ApplicationStatus,
} from "./records.js";
import {
  getDocuSignConfigurationStatus,
  sendCommunitySupportAgreement,
  sendScholarshipAgreement,
} from "./docusignService.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;
const MAIL_FROM = process.env.MAIL_FROM || "noreply@lifespringhf.org";
const MAIL_TO = process.env.MAIL_TO || "info@lifespringhf.org";

app.use(
  cors({
    origin: CLIENT_ORIGIN || true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, "uploads");
const dataDir = path.join(__dirname, "data");
const agreementDir = path.join(__dirname, "agreements");
const recordStore = new JsonRecordStore(path.join(dataDir, "records.json"));

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

fs.mkdirSync(agreementDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = file.originalname.replace(/[^a-z0-9._-]/gi, "_");
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const allowedFileTypes = /jpeg|jpg|png|pdf|doc|docx/;

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  const mime = file.mimetype.toLowerCase();

  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedFileTypes.test(ext) && allowedMimeTypes.includes(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const scholarshipUpload = upload.fields([
  { name: "passportPhoto", maxCount: 1 },
  { name: "termResult", maxCount: 1 },
  { name: "currentBill", maxCount: 1 },
  { name: "supportingDocument", maxCount: 1 },
]);

type UploadedFileMap = {
  [fieldname: string]: Express.Multer.File[];
};

type ScholarshipFormData = {
  firstName: string;
  lastName: string;
  homeAddress: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  guardianOccupation: string;
  guardianMonthlyIncome: string;
  schoolName: string;
  classLevel: string;
  schoolLocation: string;
  schoolPhone: string;
  schoolAddress: string;
  schoolContactPerson: string;
  academicNeed: string;
  primarySchoolOnlyAcknowledged?: string;
  truthDeclaration?: string;
  codeOfConductAccepted?: string;
  verificationAcknowledged?: string;
  privacyPolicyAccepted?: string;
  scholarshipCodePolicyId?: string;
  scholarshipCodePolicyVersion?: string;
  privacyPolicyId?: string;
  privacyPolicyVersion?: string;
};

type SupportRequestFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  supportCategory: string;
  location: string;
  homeAddress: string;
  supportNeeded: string;
  truthDeclaration?: string;
  codeOfConductAccepted?: string;
  verificationAcknowledged?: string;
  privacyPolicyAccepted?: string;
  communityCodePolicyId?: string;
  communityCodePolicyVersion?: string;
  privacyPolicyId?: string;
  privacyPolicyVersion?: string;
};

type ComplaintFormData = {
  name?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  reference?: string;
  category?: string;
  details?: string;
  desiredResolution?: string;
  privacyAccepted?: string;
};

type ConcernFormData = {
  name?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  category?: string;
  description?: string;
  peopleInvolved?: string;
  incidentDate?: string;
  location?: string;
  immediateRisk?: string;
};

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type DonationIntentFormData = {
  name: string;
  email: string;
  supportArea: string;
  amount: string;
};

let transporter: nodemailer.Transporter;

async function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    console.log("SMTP transporter configured");
    return;
  }

  try {
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log("Ethereal test account created");
    console.log("Ethereal user:", testAccount.user);
  } catch {
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    console.log("Using local JSON email transport for development");
  }
}

function requireFields(fields: string[]) {
  return fields.every((field) => field && field.trim());
}

function requireAdmin(req: Request, res: Response, next: express.NextFunction) {
  const expectedToken = process.env.ADMIN_API_TOKEN;
  const suppliedToken = req.header("x-admin-token");

  if (!expectedToken) {
    return res.status(503).json({
      message: "Admin API is not configured. Set ADMIN_API_TOKEN.",
    });
  }

  if (suppliedToken !== expectedToken) {
    return res.status(401).json({ message: "Unauthorised admin request" });
  }

  return next();
}

function accepted(value: unknown) {
  return value === "accepted" || value === "on" || value === true;
}

function createAcknowledgements(
  req: Request,
  entries: Array<{ policyId?: string; policyVersion?: string; declaration: string }>
) {
  const acceptedAt = new Date().toISOString();
  return entries.map((entry) => ({
    policyId: entry.policyId || "UNKNOWN",
    policyVersion: entry.policyVersion || "1.0",
    declaration: entry.declaration,
    accepted: true,
    acceptedAt,
    userAgent: req.get("user-agent"),
    ipAddress: req.ip,
  }));
}

const complaintUpload = upload.single("attachment");

function createScholarshipPdf(
  data: ScholarshipFormData,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    doc.fontSize(20).text("Scholarship Application Summary", {
      underline: true,
    });

    doc.moveDown();
    doc.fontSize(14).text("Applicant Details", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`First Name: ${data.firstName}`);
    doc.text(`Last Name: ${data.lastName}`);
    doc.text(`Email: ${data.email}`);
    doc.text(`Phone Number: ${data.phone}`);
    doc.text(`Home Address: ${data.homeAddress}`);

    doc.moveDown();
    doc.fontSize(14).text("Parent / Guardian Details", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Parent / Guardian Name: ${data.guardianName}`);
    doc.text(`Parent / Guardian Email: ${data.guardianEmail}`);
    doc.text(`Parent / Guardian Phone: ${data.guardianPhone}`);
    doc.text(`Parent / Guardian Occupation: ${data.guardianOccupation}`);
    doc.text(`Parent / Guardian Monthly Income: ${data.guardianMonthlyIncome}`);

    doc.moveDown();
    doc.fontSize(14).text("School Details", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Name of Beneficiary School: ${data.schoolName}`);
    doc.text(`Current Class of Beneficiary: ${data.classLevel}`);
    doc.text("Scholarship Level: Primary school only");
    doc.text(`School Location: ${data.schoolLocation}`);
    doc.text(`School Phone Number: ${data.schoolPhone}`);
    doc.text(`School Address: ${data.schoolAddress}`);
    doc.text(`School Contact Person: ${data.schoolContactPerson}`);

    doc.moveDown();
    doc.fontSize(14).text("Scholarship Need Summary", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(data.academicNeed, {
      width: 500,
      align: "left",
    });

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

function createSupportRequestPdf(
  data: SupportRequestFormData,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    doc.fontSize(20).text("Community Support Application Summary", {
      underline: true,
    });

    doc.moveDown();
    doc.fontSize(14).text("Applicant Details", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`First Name: ${data.firstName}`);
    doc.text(`Last Name: ${data.lastName}`);
    doc.text(`Email: ${data.email}`);
    doc.text(`Phone Number: ${data.phone}`);
    doc.text(`Support Category: ${data.supportCategory}`);
    doc.text(`Location: ${data.location}`);
    doc.text(`Home Address: ${data.homeAddress}`);

    doc.moveDown();
    doc.fontSize(14).text("Support Request", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(data.supportNeeded, {
      width: 500,
      align: "left",
    });

    doc.end();

    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

app.post(
  "/api/scholarship",
  scholarshipUpload,
  async (req: Request, res: Response) => {
    try {
      const {
        firstName,
        lastName,
        homeAddress,
        email,
        phone,
        guardianName,
        guardianEmail,
        guardianPhone,
        guardianOccupation,
        guardianMonthlyIncome,
        schoolName,
        classLevel,
        schoolLocation,
        schoolPhone,
        schoolAddress,
        schoolContactPerson,
        academicNeed,
        primarySchoolOnlyAcknowledged,
        truthDeclaration,
        codeOfConductAccepted,
        verificationAcknowledged,
        privacyPolicyAccepted,
        scholarshipCodePolicyId,
        scholarshipCodePolicyVersion,
        privacyPolicyId,
        privacyPolicyVersion,
      } = req.body as ScholarshipFormData;

      const requiredFields = [
        firstName,
        lastName,
        homeAddress,
        email,
        phone,
        guardianName,
        guardianEmail,
        guardianPhone,
        guardianOccupation,
        guardianMonthlyIncome,
        schoolName,
        classLevel,
        schoolLocation,
        schoolPhone,
        schoolAddress,
        schoolContactPerson,
        academicNeed,
      ];

      if (!requireFields(requiredFields)) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (
        !accepted(truthDeclaration) ||
        !accepted(primarySchoolOnlyAcknowledged) ||
        !accepted(codeOfConductAccepted) ||
        !accepted(verificationAcknowledged) ||
        !accepted(privacyPolicyAccepted)
      ) {
        return res.status(400).json({
          message: "Please complete all required applicant declarations",
        });
      }

      const files = req.files as UploadedFileMap | undefined;

      if (!files?.passportPhoto?.[0] || !files?.termResult?.[0] || !files?.currentBill?.[0]) {
        return res.status(400).json({
          message:
            "Passport photograph, current report card, and current bill are required",
        });
      }

      const application = recordStore.addApplication({
        reference: createReference("LHF-SCH"),
        type: "SCHOLARSHIP",
        applicantName: `${firstName} ${lastName}`,
        applicantEmail: email,
        applicantPhone: phone,
        status: "SUBMITTED",
        data: {
          firstName,
          lastName,
          homeAddress,
          email,
          phone,
          guardianName,
          guardianEmail,
          guardianPhone,
          guardianOccupation,
          guardianMonthlyIncome,
          schoolName,
          classLevel,
          schoolLocation,
          schoolPhone,
          schoolAddress,
          schoolContactPerson,
          academicNeed,
          primarySchoolOnlyAcknowledged,
        },
        files: Object.entries(files).flatMap(([field, items]) =>
          items.map((file) => ({
            field,
            filename: file.originalname,
            path: file.path,
          }))
        ),
        acknowledgements: createAcknowledgements(req, [
          {
            policyId: scholarshipCodePolicyId || "SCHOLARSHIP_CODE",
            policyVersion: scholarshipCodePolicyVersion || "1.0",
            declaration: "truthDeclaration",
          },
          {
            policyId: scholarshipCodePolicyId || "SCHOLARSHIP_CODE",
            policyVersion: scholarshipCodePolicyVersion || "1.0",
            declaration: "codeOfConductAccepted",
          },
          {
            policyId: scholarshipCodePolicyId || "SCHOLARSHIP_CODE",
            policyVersion: scholarshipCodePolicyVersion || "1.0",
            declaration: "verificationAcknowledged",
          },
          {
            policyId: privacyPolicyId || "PRIVACY",
            policyVersion: privacyPolicyVersion || "1.0",
            declaration: "privacyPolicyAccepted",
          },
        ]),
      });

      const pdfPath = path.join(uploadDir, `application-${Date.now()}.pdf`);

      await createScholarshipPdf(
        {
          firstName,
          lastName,
          homeAddress,
          email,
          phone,
          guardianName,
          guardianEmail,
          guardianPhone,
          guardianOccupation,
          guardianMonthlyIncome,
          schoolName,
          classLevel,
          schoolLocation,
          schoolPhone,
          schoolAddress,
          schoolContactPerson,
          academicNeed,
          primarySchoolOnlyAcknowledged,
        },
        pdfPath
      );

      const attachments = [
        {
          filename: "scholarship-application-summary.pdf",
          path: pdfPath,
        },
        {
          filename: files.passportPhoto[0].originalname,
          path: files.passportPhoto[0].path,
        },
        {
          filename: files.termResult[0].originalname,
          path: files.termResult[0].path,
        },
        {
          filename: files.currentBill[0].originalname,
          path: files.currentBill[0].path,
        },
      ];

      if (files.supportingDocument?.[0]) {
        attachments.push({
          filename: files.supportingDocument[0].originalname,
          path: files.supportingDocument[0].path,
        });
      }

      const info = await transporter.sendMail({
        from: MAIL_FROM,
        to: MAIL_TO,
        subject: `New Scholarship Application - ${firstName} ${lastName}`,
        text: `
A new scholarship application has been submitted.

Application Reference: ${application.reference}

APPLICANT DETAILS
First Name: ${firstName}
Last Name: ${lastName}
Email: ${email}
Phone Number: ${phone}
Home Address: ${homeAddress}

PARENT / GUARDIAN DETAILS
Parent / Guardian Name: ${guardianName}
Parent / Guardian Email: ${guardianEmail}
Parent / Guardian Phone: ${guardianPhone}
Parent / Guardian Occupation: ${guardianOccupation}
Parent / Guardian Monthly Income: ${guardianMonthlyIncome}

SCHOOL DETAILS
Name of Beneficiary School: ${schoolName}
Current Class of Beneficiary: ${classLevel}
Scholarship Level: Primary school only
School Location: ${schoolLocation}
School Phone Number: ${schoolPhone}
School Address: ${schoolAddress}
School Contact Person: ${schoolContactPerson}

SCHOLARSHIP NEED SUMMARY
${academicNeed}
        `,
        attachments,
      });

      console.log(
        "Scholarship Preview URL:",
        nodemailer.getTestMessageUrl(info)
      );

      return res.status(200).json({
        message: `Application submitted successfully. Reference: ${application.reference}`,
      });
    } catch (error) {
      console.error("Scholarship submission error:", error);
      return res.status(500).json({
        message: "Something went wrong while processing the application",
      });
    }
  }
);

app.post("/api/support-request", async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      supportCategory,
      location,
      homeAddress,
      supportNeeded,
      truthDeclaration,
      codeOfConductAccepted,
      verificationAcknowledged,
      privacyPolicyAccepted,
      communityCodePolicyId,
      communityCodePolicyVersion,
      privacyPolicyId,
      privacyPolicyVersion,
    } = req.body as SupportRequestFormData;

    const requiredFields = [
      firstName,
      lastName,
      email,
      phone,
      supportCategory,
      location,
      homeAddress,
      supportNeeded,
    ];

    if (!requireFields(requiredFields)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (
      !accepted(truthDeclaration) ||
      !accepted(codeOfConductAccepted) ||
      !accepted(verificationAcknowledged) ||
      !accepted(privacyPolicyAccepted)
    ) {
      return res.status(400).json({
        message: "Please complete all required applicant declarations",
      });
    }

    const application = recordStore.addApplication({
      reference: createReference("LHF-CSP"),
      type: "COMMUNITY_SUPPORT",
      applicantName: `${firstName} ${lastName}`,
      applicantEmail: email,
      applicantPhone: phone,
      status: "SUBMITTED",
      data: {
        firstName,
        lastName,
        email,
        phone,
        supportCategory,
        location,
        homeAddress,
        supportNeeded,
      },
      acknowledgements: createAcknowledgements(req, [
        {
          policyId: communityCodePolicyId || "COMMUNITY_SUPPORT_CODE",
          policyVersion: communityCodePolicyVersion || "1.0",
          declaration: "truthDeclaration",
        },
        {
          policyId: communityCodePolicyId || "COMMUNITY_SUPPORT_CODE",
          policyVersion: communityCodePolicyVersion || "1.0",
          declaration: "codeOfConductAccepted",
        },
        {
          policyId: communityCodePolicyId || "COMMUNITY_SUPPORT_CODE",
          policyVersion: communityCodePolicyVersion || "1.0",
          declaration: "verificationAcknowledged",
        },
        {
          policyId: privacyPolicyId || "PRIVACY",
          policyVersion: privacyPolicyVersion || "1.0",
          declaration: "privacyPolicyAccepted",
        },
      ]),
    });

    const pdfPath = path.join(uploadDir, `support-request-${Date.now()}.pdf`);

    await createSupportRequestPdf(
      {
        firstName,
        lastName,
        email,
        phone,
        supportCategory,
        location,
        homeAddress,
        supportNeeded,
      },
      pdfPath
    );

    const info = await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      subject: `New Community Support Application - ${firstName} ${lastName}`,
      text: `
A new community support application has been submitted.

Application Reference: ${application.reference}

APPLICANT DETAILS
First Name: ${firstName}
Last Name: ${lastName}
Email: ${email}
Phone Number: ${phone}
Support Category: ${supportCategory}
Location: ${location}
Home Address: ${homeAddress}

SUPPORT REQUEST
${supportNeeded}
      `,
      attachments: [
        {
          filename: "community-support-application-summary.pdf",
          path: pdfPath,
        },
      ],
    });

    console.log("Support Preview URL:", nodemailer.getTestMessageUrl(info));

    return res.status(200).json({
      message: `Support request submitted successfully. Reference: ${application.reference}`,
    });
  } catch (error) {
    console.error("Support request submission error:", error);
    return res.status(500).json({
      message: "Something went wrong while processing the support request",
    });
  }
});

app.post(
  "/api/complaints",
  complaintUpload,
  async (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        phone,
        relationship,
        reference,
        category,
        details,
        desiredResolution,
        privacyAccepted,
      } = req.body as ComplaintFormData;

      if (
        !requireFields([
          name || "",
          email || "",
          phone || "",
          relationship || "",
          category || "",
          details || "",
          desiredResolution || "",
        ]) ||
        !accepted(privacyAccepted)
      ) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const complaintReference = createReference("LHF-CMP");
      const file = req.file;
      recordStore.addComplaint({
        reference: complaintReference,
        type: "COMPLAINT",
        status: "SUBMITTED",
        data: {
          name,
          email,
          phone,
          relationship,
          reference,
          category,
          details,
          desiredResolution,
        },
        attachment: file
          ? { filename: file.originalname, path: file.path }
          : undefined,
      });

      await transporter.sendMail({
        from: MAIL_FROM,
        to: MAIL_TO,
        replyTo: email,
        subject: `New Complaint - ${complaintReference}`,
        text: `
A new complaint has been submitted.

Complaint Reference: ${complaintReference}
Name: ${name}
Email: ${email}
Phone: ${phone}
Relationship: ${relationship}
Application / Beneficiary Reference: ${reference || "N/A"}
Category: ${category}

Complaint Details:
${details}

Desired Resolution:
${desiredResolution}
        `,
        attachments: file
          ? [{ filename: file.originalname, path: file.path }]
          : undefined,
      });

      return res.status(200).json({
        message: `Complaint submitted successfully. Reference: ${complaintReference}`,
      });
    } catch (error) {
      console.error("Complaint submission error:", error);
      return res.status(500).json({
        message: "Something went wrong while submitting the complaint",
      });
    }
  }
);

app.post(
  "/api/report-a-concern",
  complaintUpload,
  async (req: Request, res: Response) => {
    try {
      const {
        name,
        email,
        phone,
        relationship,
        category,
        description,
        peopleInvolved,
        incidentDate,
        location,
        immediateRisk,
      } = req.body as ConcernFormData;

      if (!requireFields([category || "", description || "", immediateRisk || ""])) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const concernReference = createReference("LHF-CON");
      const file = req.file;
      recordStore.addComplaint({
        reference: concernReference,
        type: "CONCERN",
        status: "SUBMITTED",
        data: {
          name,
          email,
          phone,
          relationship,
          category,
          description,
          peopleInvolved,
          incidentDate,
          location,
          immediateRisk,
        },
        attachment: file
          ? { filename: file.originalname, path: file.path }
          : undefined,
      });

      await transporter.sendMail({
        from: MAIL_FROM,
        to: MAIL_TO,
        replyTo: email,
        subject: `New Concern Report - ${concernReference}`,
        text: `
A new concern report has been submitted.

Concern Reference: ${concernReference}
Name: ${name || "Not provided"}
Email: ${email || "Not provided"}
Phone: ${phone || "Not provided"}
Relationship: ${relationship || "Not provided"}
Category: ${category}
Immediate Risk: ${immediateRisk}
People Involved: ${peopleInvolved || "Not provided"}
Date of Incident: ${incidentDate || "Not provided"}
Location: ${location || "Not provided"}

Description:
${description}
        `,
        attachments: file
          ? [{ filename: file.originalname, path: file.path }]
          : undefined,
      });

      return res.status(200).json({
        message: `Concern submitted successfully. Reference: ${concernReference}`,
      });
    } catch (error) {
      console.error("Concern submission error:", error);
      return res.status(500).json({
        message: "Something went wrong while submitting the concern",
      });
    }
  }
);

app.get("/api/admin/applications", requireAdmin, (_req, res) => {
  return res.status(200).json({
    applications: recordStore.all().applications,
    agreements: recordStore.all().agreements,
  });
});

app.get("/api/admin/agreements", requireAdmin, (_req, res) => {
  return res.status(200).json({
    agreements: recordStore.all().agreements,
    docusign: getDocuSignConfigurationStatus(),
  });
});

app.post(
  "/api/admin/applications/:applicationId/status",
  requireAdmin,
  (req, res) => {
    const { status } = req.body as { status?: ApplicationStatus };
    const validStatuses: ApplicationStatus[] = [
      "SUBMITTED",
      "UNDER_REVIEW",
      "MORE_INFORMATION_REQUIRED",
      "APPROVED_PENDING_AGREEMENT",
      "AGREEMENT_SENT",
      "AGREEMENT_VIEWED",
      "AGREEMENT_SIGNED",
      "COMPLETED",
      "DECLINED",
      "SUSPENDED",
      "WITHDRAWN",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid application status" });
    }

    const application = recordStore.updateApplicationStatus(
      req.params.applicationId,
      status,
      req.header("x-admin-id") || "admin"
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.status(200).json({ message: "Status updated", application });
  }
);

app.post(
  "/api/admin/applications/:applicationId/prepare-agreement",
  requireAdmin,
  async (req, res) => {
    const application = recordStore
      .all()
      .applications.find((item) => item.id === req.params.applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (["DECLINED", "WITHDRAWN", "SUSPENDED"].includes(application.status)) {
      return res.status(409).json({
        message: "Cannot prepare an agreement for this application status",
      });
    }

    const existing = recordStore
      .all()
      .agreements.find((item) => item.applicationId === application.id);

    if (existing) {
      return res.status(200).json({
        message: "Agreement already prepared",
        agreement: existing,
      });
    }

    const agreementReference = createReference(
      application.type === "SCHOLARSHIP" ? "LHF-SCH-AGR" : "LHF-CSP-AGR"
    );
    const agreementPath = path.join(agreementDir, `${agreementReference}.pdf`);
    const data = application.data as Record<string, string>;

    await createAgreementPdf(
      application.type,
      {
        agreementReference,
        applicationReference: application.reference,
        date: new Date().toLocaleDateString("en-GB"),
        beneficiaryFullName: application.applicantName,
        parentGuardianFullName: data.guardianName,
        address: data.homeAddress,
        telephone: application.applicantPhone,
        email: application.applicantEmail,
        school: data.schoolName,
        classLevel: data.classLevel,
        supportCategory: data.supportCategory,
        approvedPurpose: data.academicNeed || data.supportNeeded,
        approvedSupport: data.supportNeeded,
        foundationRepresentative: "Lifespring Representative",
      },
      agreementPath
    );

    const agreement = recordStore.addAgreement({
      applicationId: application.id,
      applicantId: application.id,
      agreementType: application.type,
      agreementReference,
      policyVersion: application.acknowledgements[0]?.policyVersion || "1.0",
      status: "READY",
      signedDocumentPathOrSecureObjectKey: agreementPath,
      createdByAdminId: req.header("x-admin-id") || "admin",
    });

    recordStore.updateApplicationStatus(
      application.id,
      "APPROVED_PENDING_AGREEMENT",
      req.header("x-admin-id") || "admin"
    );

    return res.status(200).json({
      message: "Agreement prepared for preview and signature workflow",
      agreement,
    });
  }
);

app.post(
  "/api/admin/agreements/:agreementId/send",
  requireAdmin,
  async (req, res) => {
    const agreement = recordStore
      .all()
      .agreements.find((item) => item.id === req.params.agreementId);

    if (!agreement) {
      return res.status(404).json({ message: "Agreement not found" });
    }

    if (agreement.status === "SENT" || agreement.status === "SIGNED") {
      return res.status(409).json({ message: "Agreement has already been sent" });
    }

    const application = recordStore
      .all()
      .applications.find((item) => item.id === agreement.applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (!application.applicantEmail) {
      return res.status(400).json({ message: "Missing applicant email" });
    }

    try {
      const sender =
        agreement.agreementType === "SCHOLARSHIP"
          ? sendScholarshipAgreement
          : sendCommunitySupportAgreement;

      const result = await sender({
        agreementReference: agreement.agreementReference,
        applicationReference: application.reference,
        agreementType: agreement.agreementType,
        applicantName: application.applicantName,
        applicantEmail: application.applicantEmail,
        fields: application.data as Record<string, string>,
      });

      const updated = recordStore.updateAgreement(agreement.id, {
        status: "SENT",
        sentAt: new Date().toISOString(),
        docusignEnvelopeId: result.envelopeId,
      }) as AgreementRecord;

      recordStore.updateApplicationStatus(application.id, "AGREEMENT_SENT");

      await transporter.sendMail({
        from: MAIL_FROM,
        to: application.applicantEmail,
        subject: "Your Lifespring Agreement Is Ready for Signature",
        text: `
Dear ${application.applicantName},

Your Lifespring agreement is ready for signature.

Application Reference: ${application.reference}
Agreement Reference: ${agreement.agreementReference}
Agreement Type: ${agreement.agreementType}
        `,
      });

      return res.status(200).json({ message: "Agreement sent", agreement: updated });
    } catch (error) {
      recordStore.updateAgreement(agreement.id, { status: "ERROR" });
      return res.status(503).json({
        message:
          error instanceof Error
            ? error.message
            : "DocuSign could not send the agreement",
      });
    }
  }
);

app.post("/api/docusign/webhook", (req, res) => {
  try {
    void req.body;
    return res.status(503).json({
      message:
        "DocuSign webhook endpoint is present, but signature verification is not configured.",
    });
  } catch (error) {
    console.error("DocuSign webhook error:", error);
    return res.status(400).json({ message: "Webhook could not be processed" });
  }
});

app.post("/api/contact", async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body as ContactFormData;

    if (!requireFields([name, email, subject, message])) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      replyTo: email,
      subject: `Website Contact - ${subject}`,
      text: `
A new contact message has been submitted.

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `,
    });

    return res.status(200).json({
      message: "Message sent successfully.",
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    return res.status(500).json({
      message: "Something went wrong while sending the message",
    });
  }
});

app.post("/api/donation-intent", async (req: Request, res: Response) => {
  try {
    const { name, email, supportArea, amount } =
      req.body as DonationIntentFormData;

    if (!requireFields([name, email, supportArea, amount])) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Enter a valid donation amount" });
    }

    await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      replyTo: email,
      subject: `Donation Pledge - ${supportArea}`,
      text: `
A new donation pledge has been submitted.

Name: ${name}
Email: ${email}
Support Area: ${supportArea}
Amount: ${amount}
      `,
    });

    return res.status(200).json({
      message: "Donation pledge submitted successfully.",
    });
  } catch (error) {
    console.error("Donation pledge error:", error);
    return res.status(500).json({
      message: "Something went wrong while submitting the donation pledge",
    });
  }
});

app.get("/", (_req: Request, res: Response) => {
  res.send("Scholarship backend is running");
});

app.use(
  (
    error: Error,
    _req: Request,
    res: Response,
    next: express.NextFunction
  ) => {
    void next;

    if (error instanceof multer.MulterError || error.message === "Unsupported file type") {
      return res.status(400).json({ message: error.message });
    }

    console.error("Unhandled server error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
);

createTransporter()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to create test transporter:", error);
  });

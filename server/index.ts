import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { agreementFilename, createAgreementPdf } from "./agreementTemplates.js";
import {
  createReference,
  JsonRecordStore,
  type AgreementRecord,
  type ApplicationStatus,
} from "./records.js";

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

const signedAgreementUpload = upload.single("signedAgreement");

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

type LegacyApplicationImportData = {
  type?: "SCHOLARSHIP" | "COMMUNITY_SUPPORT";
  reference?: string;
  applicantName?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  summary?: string;
  schoolName?: string;
  classLevel?: string;
  supportCategory?: string;
  originalSubmittedAt?: string;
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

function createAgreementReference(applicationType: "SCHOLARSHIP" | "COMMUNITY_SUPPORT") {
  const year = new Date().getFullYear();
  const prefix = applicationType === "SCHOLARSHIP" ? "LHF-SCH-AGR" : "LHF-COM-AGR";
  const existingForYear = recordStore
    .all()
    .agreements.filter((agreement) =>
      agreement.agreementReference.startsWith(`${prefix}-${year}`)
    ).length;

  return `${prefix}-${year}-${String(existingForYear + 1).padStart(4, "0")}`;
}

function isAcceptedSignedAgreement(file: Express.Multer.File) {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
  return allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype);
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
    signingMode: "manual_email",
  });
});

app.post("/api/admin/import-legacy-application", requireAdmin, (req, res) => {
  const {
    type,
    reference,
    applicantName,
    applicantEmail,
    applicantPhone,
    summary,
    schoolName,
    classLevel,
    supportCategory,
    originalSubmittedAt,
  } = req.body as LegacyApplicationImportData;

  if (!type || !["SCHOLARSHIP", "COMMUNITY_SUPPORT"].includes(type)) {
    return res.status(400).json({ message: "Choose a valid application type" });
  }
  if (!requireFields([applicantName || "", applicantEmail || ""])) {
    return res.status(400).json({ message: "Applicant name and email are required" });
  }

  const cleanReference =
    reference?.trim() ||
    createReference(type === "SCHOLARSHIP" ? "LHF-SCH-LEGACY" : "LHF-CSP-LEGACY");
  const duplicate = recordStore
    .all()
    .applications.find((application) => application.reference === cleanReference);

  if (duplicate) {
    return res.status(409).json({ message: "An application with this reference already exists" });
  }

  const application = recordStore.addApplication({
    reference: cleanReference,
    type,
    applicantName: applicantName.trim(),
    applicantEmail: applicantEmail.trim(),
    applicantPhone: applicantPhone?.trim() || "",
    status: "SUBMITTED",
    data: {
      importedLegacyApplication: "yes",
      originalSubmittedAt: originalSubmittedAt?.trim() || "",
      summary: summary?.trim() || "",
      schoolName: schoolName?.trim() || "",
      classLevel: classLevel?.trim() || "",
      supportCategory: supportCategory?.trim() || "",
      academicNeed: type === "SCHOLARSHIP" ? summary?.trim() || "" : "",
      supportNeeded: type === "COMMUNITY_SUPPORT" ? summary?.trim() || "" : "",
    },
    acknowledgements: [
      {
        policyId: type === "SCHOLARSHIP" ? "SCHOLARSHIP_CODE" : "COMMUNITY_SUPPORT_CODE",
        policyVersion: "1.0",
        declaration: "legacy_application_imported_from_email_record",
        accepted: true,
        acceptedAt: new Date().toISOString(),
        userAgent: req.get("user-agent"),
        ipAddress: req.ip,
      },
    ],
  });

  recordStore.audit(
    "application.legacy_imported",
    "application",
    application.id,
    {
      reference: application.reference,
      type: application.type,
      originalSubmittedAt: originalSubmittedAt?.trim() || "",
    },
    req.header("x-admin-id") || "admin"
  );

  return res.status(200).json({ message: "Legacy application imported", application });
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
      "AGREEMENT_GENERATED",
      "AGREEMENT_SENT",
      "AGREEMENT_VIEWED",
      "SIGNED_AGREEMENT_RECEIVED",
      "SUPPORT_READY_FOR_RELEASE",
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

app.post("/api/admin/application-status", requireAdmin, (req, res) => {
  const { applicationId, status } = req.body as {
    applicationId?: string;
    status?: ApplicationStatus;
  };
  const validStatuses: ApplicationStatus[] = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "MORE_INFORMATION_REQUIRED",
    "APPROVED_PENDING_AGREEMENT",
    "AGREEMENT_GENERATED",
    "AGREEMENT_SENT",
    "AGREEMENT_VIEWED",
    "SIGNED_AGREEMENT_RECEIVED",
    "SUPPORT_READY_FOR_RELEASE",
    "COMPLETED",
    "DECLINED",
    "SUSPENDED",
    "WITHDRAWN",
  ];

  if (!applicationId || !status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status update" });
  }

  const application = recordStore.updateApplicationStatus(
    applicationId,
    status,
    req.header("x-admin-id") || "admin"
  );

  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  return res.status(200).json({ message: "Application status updated", application });
});

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

    const agreementReference = createAgreementReference(application.type);
    const filename = agreementFilename(application.type, application.reference);
    const agreementPath = path.join(agreementDir, filename);
    const data = application.data as Record<string, string>;
    const approvedAt = new Date();
    const adminId = req.header("x-admin-id") || "admin";

    await createAgreementPdf(
      application.type,
      {
        agreementReference,
        applicationReference: application.reference,
        date: approvedAt.toLocaleDateString("en-GB"),
        policyVersion: application.acknowledgements[0]?.policyVersion || "1.0",
        beneficiaryFullName: application.applicantName,
        parentGuardianFullName: data.guardianName,
        relationshipToBeneficiary: "Parent/Guardian",
        address: data.homeAddress,
        telephone: application.applicantPhone,
        email: application.applicantEmail,
        school: data.schoolName,
        classLevel: data.classLevel,
        academicSession: data.academicSession,
        scholarshipType: application.type === "SCHOLARSHIP" ? "Primary school scholarship support" : undefined,
        supportCategory: data.supportCategory,
        approvedPurpose: data.academicNeed || data.supportNeeded,
        approvedSupport: data.supportNeeded,
        approvedAmount: data.approvedAmount || data.monetaryValue,
        monetaryValue: data.monetaryValue || data.approvedAmount,
        paymentArrangement: data.paymentArrangement,
        paymentMethod: data.paymentMethod,
        paymentRecipient: data.paymentRecipient,
        paymentSchedule: data.paymentSchedule,
        duration: data.duration,
        reviewDate: data.reviewDate,
        expectedDeliveryDate: data.expectedDeliveryDate,
        conditions: data.conditions,
        foundationRepresentative: "Lifespring Representative",
        logoPath: path.resolve(__dirname, "..", "public", "lifespring-emblem.png"),
      },
      agreementPath
    );

    const agreement = recordStore.addAgreement({
      applicationId: application.id,
      applicantId: application.id,
      agreementType: application.type,
      agreementReference,
      policyVersion: application.acknowledgements[0]?.policyVersion || "1.0",
      status: "GENERATED",
      generatedPdfPathOrObjectKey: agreementPath,
      generatedAt: approvedAt.toISOString(),
      generatedByAdminId: adminId,
      createdByAdminId: adminId,
    });

    recordStore.updateApplicationStatus(
      application.id,
      "AGREEMENT_GENERATED",
      adminId
    );

    return res.status(200).json({
      message: "Agreement generated and saved for secure admin access",
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

    if (["SIGNED_RECEIVED", "COMPLETED", "VOIDED"].includes(agreement.status)) {
      return res.status(409).json({ message: "This agreement cannot be resent in its current status" });
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

    const pdfPath = agreement.generatedPdfPathOrObjectKey || agreement.signedDocumentPathOrSecureObjectKey;
    if (!pdfPath || !fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: "Generated agreement PDF was not found" });
    }

    try {
      const now = new Date().toISOString();
      const updated = recordStore.updateAgreement(agreement.id, {
        status: "SENT",
        sentAt: agreement.sentAt || now,
        lastSentAt: now,
        sendCount: (agreement.sendCount || 0) + 1,
      }, req.header("x-admin-id") || "admin", "agreement.sent") as AgreementRecord;

      recordStore.updateApplicationStatus(application.id, "AGREEMENT_SENT");

      await transporter.sendMail({
        from: MAIL_FROM,
        to: application.applicantEmail,
        subject: `Lifespring Beneficiary Agreement - Action Required - ${application.reference}`,
        text: `
Dear ${application.applicantName},

Congratulations.

Your application to Lifespring Humanitarian Foundation has been approved.

Attached is your Beneficiary Agreement and Code of Conduct.

Please:

1. read the document carefully;
2. complete the required signature section;
3. sign and date the agreement;
4. return the signed document by email to:

info@lifespringhf.org

Please use the following subject when returning the signed document:

SIGNED AGREEMENT - ${application.reference}

Your approved support may proceed after the signed agreement has been received and verified by Lifespring Humanitarian Foundation.

Application Reference: ${application.reference}
Agreement Reference: ${agreement.agreementReference}
Agreement Type: ${agreement.agreementType}

Kind regards,

Lifespring Humanitarian Foundation
Restoring Hope. Empowering Futures.
        `,
        attachments: [
          {
            filename: path.basename(pdfPath),
            path: pdfPath,
          },
        ],
      });

      await transporter.sendMail({
        from: MAIL_FROM,
        to: MAIL_TO,
        subject: `Agreement Sent - ${application.reference}`,
        text: `Agreement sent.\n\nApplicant: ${application.applicantName}\nApplication Reference: ${application.reference}\nAgreement Reference: ${agreement.agreementReference}\nApplication Type: ${agreement.agreementType}\nDate Sent: ${now}`,
      });

      return res.status(200).json({ message: "Agreement sent", agreement: updated });
    } catch (error) {
      recordStore.updateAgreement(agreement.id, { status: "ERROR" }, req.header("x-admin-id") || "admin", "agreement.email_failed");
      return res.status(503).json({
        message:
          error instanceof Error
            ? error.message
            : "Agreement email could not be sent",
      });
    }
  }
);

app.get("/api/admin/agreements/:agreementId/download", requireAdmin, (req, res) => {
  const agreement = recordStore
    .all()
    .agreements.find((item) => item.id === req.params.agreementId);

  if (!agreement) {
    return res.status(404).json({ message: "Agreement not found" });
  }

  const pdfPath = agreement.generatedPdfPathOrObjectKey || agreement.signedDocumentPathOrSecureObjectKey;
  if (!pdfPath || !fs.existsSync(pdfPath)) {
    return res.status(404).json({ message: "Agreement PDF was not found" });
  }

  recordStore.updateAgreement(agreement.id, {}, req.header("x-admin-id") || "admin", "agreement.downloaded");
  return res.download(pdfPath, path.basename(pdfPath));
});

app.post(
  "/api/admin/agreements/:agreementId/upload-signed",
  requireAdmin,
  signedAgreementUpload,
  (req, res) => {
    const agreement = recordStore
      .all()
      .agreements.find((item) => item.id === req.params.agreementId);

    if (!agreement) {
      return res.status(404).json({ message: "Agreement not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Upload a signed agreement file" });
    }
    if (!isAcceptedSignedAgreement(req.file)) {
      fs.unlink(req.file.path, () => undefined);
      return res.status(400).json({ message: "Signed agreement must be PDF, JPG or PNG" });
    }

    const application = recordStore
      .all()
      .applications.find((item) => item.id === agreement.applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const now = new Date().toISOString();
    const adminId = req.header("x-admin-id") || "admin";
    const updated = recordStore.updateAgreement(agreement.id, {
      status: "SIGNED_RECEIVED",
      signedPdfPathOrObjectKey: req.file.path,
      signedDocumentPathOrSecureObjectKey: req.file.path,
      signedReceivedAt: now,
      signedUploadedByAdminId: adminId,
      notes: typeof req.body.note === "string" ? req.body.note : agreement.notes,
    }, adminId, "agreement.signed_uploaded");

    recordStore.updateApplicationStatus(application.id, "SIGNED_AGREEMENT_RECEIVED", adminId);
    return res.status(200).json({ message: "Signed agreement uploaded and recorded", agreement: updated });
  }
);

app.post("/api/admin/agreements/:agreementId/mark-signed", requireAdmin, (req, res) => {
  const agreement = recordStore
    .all()
    .agreements.find((item) => item.id === req.params.agreementId);
  if (!agreement) {
    return res.status(404).json({ message: "Agreement not found" });
  }
  const application = recordStore.all().applications.find((item) => item.id === agreement.applicationId);
  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }
  const now = new Date().toISOString();
  const adminId = req.header("x-admin-id") || "admin";
  const updated = recordStore.updateAgreement(agreement.id, {
    status: "SIGNED_RECEIVED",
    signedReceivedAt: now,
    notes: typeof req.body?.note === "string" ? req.body.note : agreement.notes,
  }, adminId, "agreement.signed_confirmed");
  recordStore.updateApplicationStatus(application.id, "SIGNED_AGREEMENT_RECEIVED", adminId);
  return res.status(200).json({ message: "Signed agreement marked as received", agreement: updated });
});

app.post("/api/admin/agreements/:agreementId/support-ready", requireAdmin, (req, res) => {
  const agreement = recordStore
    .all()
    .agreements.find((item) => item.id === req.params.agreementId);
  if (!agreement) {
    return res.status(404).json({ message: "Agreement not found" });
  }
  if (agreement.status !== "SIGNED_RECEIVED") {
    return res.status(409).json({ message: "Signed agreement must be received before support is marked ready" });
  }
  const application = recordStore.all().applications.find((item) => item.id === agreement.applicationId);
  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }
  const now = new Date().toISOString();
  const adminId = req.header("x-admin-id") || "admin";
  const updated = recordStore.updateAgreement(agreement.id, {
    supportReadyAt: now,
  }, adminId, "support.marked_ready");
  recordStore.updateApplicationStatus(application.id, "SUPPORT_READY_FOR_RELEASE", adminId);
  return res.status(200).json({ message: "Support marked ready for release", agreement: updated });
});

app.post("/api/admin/agreements/:agreementId/complete", requireAdmin, (req, res) => {
  const agreement = recordStore
    .all()
    .agreements.find((item) => item.id === req.params.agreementId);
  if (!agreement) {
    return res.status(404).json({ message: "Agreement not found" });
  }
  if (!agreement.supportReadyAt) {
    return res.status(409).json({ message: "Support must be marked ready before completion" });
  }
  const application = recordStore.all().applications.find((item) => item.id === agreement.applicationId);
  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }
  const now = new Date().toISOString();
  const adminId = req.header("x-admin-id") || "admin";
  const updated = recordStore.updateAgreement(agreement.id, {
    status: "COMPLETED",
    completedAt: now,
  }, adminId, "application.completed");
  recordStore.updateApplicationStatus(application.id, "COMPLETED", adminId);
  return res.status(200).json({ message: "Application completed", agreement: updated });
});

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

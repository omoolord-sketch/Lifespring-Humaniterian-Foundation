import PDFDocument from "pdfkit";
import fs from "fs";

export type AgreementTemplateData = {
  agreementReference: string;
  applicationReference: string;
  date: string;
  policyVersion?: string;
  beneficiaryFullName: string;
  dateOfBirth?: string;
  parentGuardianFullName?: string;
  relationshipToBeneficiary?: string;
  address?: string;
  telephone?: string;
  email?: string;
  school?: string;
  classLevel?: string;
  academicSession?: string;
  scholarshipType?: string;
  approvedAmount?: string;
  approvedPurpose?: string;
  paymentArrangement?: string;
  startDate?: string;
  reviewDate?: string;
  supportCategory?: string;
  approvedSupport?: string;
  monetaryValue?: string;
  expectedDeliveryDate?: string;
  conditions?: string;
  foundationRepresentative?: string;
  logoPath?: string;
};

type AgreementKind = "SCHOLARSHIP" | "COMMUNITY_SUPPORT";

const burgundy = "#65000D";
const darkBurgundy = "#4F000A";
const gold = "#C98A08";
const ivory = "#FFFDF8";
const text = "#231F20";
const muted = "#5f5b5b";

export function createAgreementPdf(
  kind: AgreementKind,
  data: AgreementTemplateData,
  outputPath: string
) {
  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 54,
      bufferPages: true,
      info: {
        Title: documentTitle(kind),
        Author: "Lifespring Humanitarian Foundation",
        Subject: `${data.agreementReference} for ${data.applicationReference}`,
      },
    });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    drawFirstPageHeader(doc, kind, data);
    drawInfoPanel(doc, {
      "Agreement Reference": data.agreementReference,
      "Application Reference": data.applicationReference,
      Date: data.date,
      "Policy Version": data.policyVersion || "1.0",
    });

    section(doc, "Beneficiary Information");
    drawInfoPanel(doc, beneficiaryFields(kind, data));

    section(doc, "Purpose");
    paragraph(
      doc,
      kind === "SCHOLARSHIP"
        ? "This agreement confirms the education support approved by Lifespring Humanitarian Foundation and records the responsibilities that help keep scholarship support fair, accountable and focused on the beneficiary's primary-school education."
        : "This agreement confirms the community support approved by Lifespring Humanitarian Foundation and records the responsibilities that help ensure support is used properly, safely and for its intended humanitarian purpose."
    );

    section(doc, "Details of Approved Support");
    drawInfoPanel(doc, supportFields(kind, data));

    section(doc, "Beneficiary Responsibilities");
    bullets(doc, [
      "Provide truthful and complete information throughout the application and support process.",
      "Use approved support only for the agreed purpose and cooperate with reasonable verification.",
      "Communicate respectfully with Lifespring staff, representatives, schools and partner organisations.",
      "Protect the Lifespring name and logo from misuse, impersonation or unauthorised representation.",
    ]);

    section(doc, "Code of Conduct");
    const conductItems =
      kind === "SCHOLARSHIP"
        ? [
            "Purpose",
            "Integrity and Respect",
            "Responsible Communication",
            "Use of Foundation Name and Identity",
            "Accurate and Truthful Information",
            "Scholarship Eligibility",
            "Ongoing Responsibilities",
            "Monitoring and Verification",
            "Attendance and Educational Progress where applicable",
            "Use of Scholarship Support",
            "Cooperation with Reasonable Monitoring",
            "Safeguarding",
            "Privacy and Confidentiality",
            "Fraud and Misrepresentation",
            "Complaints and Reporting Concerns",
            "Misconduct and Breach",
            "Suspension or Withdrawal of Support",
            "Review",
            "Acceptance and Acknowledgement",
          ]
        : [
            "Purpose",
            "Honesty and Accurate Information",
            "Dignity and Mutual Respect",
            "Eligibility Information",
            "Supporting Documents",
            "No Forged or Falsified Documents",
            "No Duplicate or Fraudulent Applications",
            "No Bribery or Inducement",
            "Proper Use of Approved Assistance",
            "Reasonable Verification",
            "Responsible Communication",
            "No Harassment, Threats or Abuse",
            "No Impersonation",
            "No Misuse of Lifespring Name or Logo",
            "Confidentiality",
            "Safeguarding",
            "Complaints and Feedback",
            "Fraud and Misconduct",
            "Suspension or Withdrawal",
            "Review",
            "Acceptance",
          ];
    numberedList(doc, conductItems);

    section(doc, "Safeguarding, Privacy and Complaints");
    paragraph(
      doc,
      "Lifespring commits to dignity, fairness, confidentiality, safeguarding, non-discrimination, responsible handling of personal information, fair consideration of complaints and reasonable transparency."
    );
    paragraph(
      doc,
      "Nothing in this Code prevents any beneficiary, parent or guardian from making a genuine complaint, raising a safeguarding concern, reporting suspected misconduct or exercising any right available under applicable law."
    );

    section(doc, "Acceptance");
    paragraph(
      doc,
      "By signing this document, the beneficiary and, where applicable, the parent or guardian acknowledge that they have read and understood the agreement and will cooperate with reasonable monitoring connected to the approved support."
    );
    paragraph(
      doc,
      "This document forms part of the official records of Lifespring Humanitarian Foundation and should be retained by both the beneficiary and the Foundation."
    );
    paragraph(doc, "Please sign and return the completed document to: info@lifespringhf.org");

    addSignatureSection(doc, kind);
    addPageChrome(doc, kind, data);

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

export function agreementFilename(kind: AgreementKind, applicationReference: string) {
  const safeReference = applicationReference.replace(/[^A-Za-z0-9_-]/g, "_");
  return kind === "SCHOLARSHIP"
    ? `Lifespring_Scholarship_Beneficiary_Agreement_${safeReference}.pdf`
    : `Lifespring_Community_Support_Beneficiary_Agreement_${safeReference}.pdf`;
}

function drawFirstPageHeader(
  doc: PDFKit.PDFDocument,
  kind: AgreementKind,
  data: AgreementTemplateData
) {
  const logoPath = data.logoPath && fs.existsSync(data.logoPath) ? data.logoPath : undefined;
  doc.save();
  doc.rect(0, 0, doc.page.width, 158).fill(ivory);
  if (logoPath) {
    doc.image(logoPath, 54, 32, { width: 58, height: 58, fit: [58, 58] });
  }
  doc
    .fillColor(burgundy)
    .font("Helvetica-Bold")
    .fontSize(17)
    .text("LIFESPRING HUMANITARIAN FOUNDATION", 126, 36, { width: 360 });
  doc
    .fillColor(text)
    .font("Helvetica")
    .fontSize(10.5)
    .text("Restoring Hope. Empowering Futures.", 126, 60);
  doc
    .fillColor(muted)
    .fontSize(9)
    .text("A humanitarian and community-impact initiative of Christ Warriors", 126, 77);
  doc
    .fontSize(8.5)
    .fillColor(muted)
    .text("www.lifespringhf.org | info@lifespringhf.org | +2349053646313", 54, 108, {
      align: "center",
      width: doc.page.width - 108,
    })
    .text("27 Adeojo Street, Isheri, Lagos State, Nigeria", 54, 122, {
      align: "center",
      width: doc.page.width - 108,
    });
  doc.moveTo(54, 142).lineTo(doc.page.width - 54, 142).lineWidth(1.3).strokeColor(burgundy).stroke();
  doc.moveTo(54, 146).lineTo(doc.page.width - 54, 146).lineWidth(0.8).strokeColor(gold).stroke();
  doc.restore();
  doc.y = 174;
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(darkBurgundy)
    .text(documentTitle(kind), { align: "center" });
  doc.moveDown(0.8);
}

function addPageChrome(doc: PDFKit.PDFDocument, kind: AgreementKind, data: AgreementTemplateData) {
  const range = doc.bufferedPageRange();
  for (let index = range.start; index < range.start + range.count; index += 1) {
    doc.switchToPage(index);
    if (index > range.start) {
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(burgundy)
        .text("LIFESPRING HUMANITARIAN FOUNDATION", 54, 28, { continued: false });
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(muted)
        .text(documentTitle(kind), 54, 42, { width: 360 });
      doc.moveTo(54, 58).lineTo(doc.page.width - 54, 58).lineWidth(0.8).strokeColor(gold).stroke();
    }

    doc
      .moveTo(54, doc.page.height - 58)
      .lineTo(doc.page.width - 54, doc.page.height - 58)
      .lineWidth(0.7)
      .strokeColor("#E5D6B6")
      .stroke();
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(muted)
      .text("www.lifespringhf.org | info@lifespringhf.org | +2349053646313", 54, doc.page.height - 47, {
        align: "center",
        width: doc.page.width - 108,
      })
      .text("Lifespring Humanitarian Foundation - a humanitarian and community-impact initiative of Christ Warriors", 54, doc.page.height - 35, {
        align: "center",
        width: doc.page.width - 108,
      })
      .text(`Page ${index - range.start + 1} of ${range.count}`, 54, doc.page.height - 23, {
        align: "center",
        width: doc.page.width - 108,
      });
  }
  void data;
}

function documentTitle(kind: AgreementKind) {
  return kind === "SCHOLARSHIP"
    ? "SCHOLARSHIP BENEFICIARY AGREEMENT & CODE OF CONDUCT"
    : "COMMUNITY SUPPORT BENEFICIARY AGREEMENT & CODE OF CONDUCT";
}

function beneficiaryFields(kind: AgreementKind, data: AgreementTemplateData) {
  const common = {
    Beneficiary: data.beneficiaryFullName,
    Email: data.email,
    Telephone: data.telephone,
    Address: data.address,
  };

  return kind === "SCHOLARSHIP"
    ? {
        ...common,
        "Parent/Guardian": data.parentGuardianFullName,
        "Relationship to Beneficiary": data.relationshipToBeneficiary,
        School: data.school,
        "Class/Level": data.classLevel,
        "Academic Session": data.academicSession,
      }
    : {
        ...common,
        "Support Category": data.supportCategory,
      };
}

function supportFields(kind: AgreementKind, data: AgreementTemplateData) {
  return kind === "SCHOLARSHIP"
    ? {
        "Scholarship Type": data.scholarshipType || "Primary school scholarship support",
        "Approved Amount": data.approvedAmount,
        Purpose: data.approvedPurpose,
        "Payment Arrangement": data.paymentArrangement,
        "Date Approved": data.date,
        "Review Date": data.reviewDate,
      }
    : {
        "Approved Support": data.approvedSupport,
        "Approved Amount/Estimated Value": data.monetaryValue,
        Purpose: data.approvedPurpose,
        "Date Approved": data.date,
        "Delivery Date": data.expectedDeliveryDate,
        "Conditions of Support": data.conditions,
        "Foundation Representative": data.foundationRepresentative,
      };
}

function drawInfoPanel(doc: PDFKit.PDFDocument, fields: Record<string, string | undefined>) {
  const filtered = Object.entries(fields).filter(([, value]) => value && !["undefined", "null"].includes(value));
  if (filtered.length === 0) {
    return;
  }

  ensureSpace(doc, 42 + filtered.length * 18);
  const x = 54;
  const y = doc.y;
  const width = doc.page.width - 108;
  const rows = filtered.length;
  const height = 24 + rows * 18;
  doc.roundedRect(x, y, width, height, 6).fillAndStroke("#FFFCF5", "#E7D5AD");
  doc.y = y + 14;
  filtered.forEach(([label, value]) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(burgundy)
      .text(`${label}:`, x + 16, doc.y, { width: 170, continued: true });
    doc
      .font("Helvetica")
      .fillColor(text)
      .text(` ${value}`, { width: width - 210 });
  });
  doc.y = y + height + 18;
}

function section(doc: PDFKit.PDFDocument, heading: string) {
  ensureSpace(doc, 70);
  doc.moveDown(0.4);
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(burgundy)
    .text(heading.toUpperCase(), 54, doc.y);
  doc.moveTo(54, doc.y + 3).lineTo(154, doc.y + 3).lineWidth(1).strokeColor(gold).stroke();
  doc.moveDown(0.7);
}

function paragraph(doc: PDFKit.PDFDocument, value: string) {
  ensureSpace(doc, 44);
  doc.font("Helvetica").fontSize(10.5).fillColor(text).text(value, {
    lineGap: 3,
    width: doc.page.width - 108,
  });
  doc.moveDown(0.45);
}

function bullets(doc: PDFKit.PDFDocument, items: string[]) {
  items.forEach((item) => {
    ensureSpace(doc, 32);
    doc.font("Helvetica").fontSize(10.5).fillColor(text).text(`- ${item}`, {
      lineGap: 3,
      width: doc.page.width - 108,
    });
  });
  doc.moveDown(0.5);
}

function numberedList(doc: PDFKit.PDFDocument, items: string[]) {
  items.forEach((item, index) => {
    ensureSpace(doc, 28);
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(text)
      .text(`${index + 1}. ${item}`, { lineGap: 2, width: doc.page.width - 108 });
  });
  doc.moveDown(0.5);
}

function addSignatureSection(doc: PDFKit.PDFDocument, kind: AgreementKind) {
  ensureSpace(doc, kind === "SCHOLARSHIP" ? 330 : 230);
  section(doc, "Signatures");
  const labels =
    kind === "SCHOLARSHIP"
      ? ["BENEFICIARY", "PARENT/GUARDIAN (where applicable)", "FOR LIFESPRING HUMANITARIAN FOUNDATION"]
      : ["BENEFICIARY", "FOR LIFESPRING HUMANITARIAN FOUNDATION"];

  labels.forEach((label) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(darkBurgundy)
      .text(label);
    signatureLine(doc, "Name");
    if (label.startsWith("PARENT")) {
      signatureLine(doc, "Relationship");
    }
    if (label.startsWith("FOR LIFESPRING")) {
      signatureLine(doc, "Position");
    }
    signatureLine(doc, "Signature");
    signatureLine(doc, "Date");
    doc.moveDown(0.8);
  });
}

function signatureLine(doc: PDFKit.PDFDocument, label: string) {
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(text)
    .text(`${label}:`, { continued: true })
    .text(" ______________________________________________");
}

function ensureSpace(doc: PDFKit.PDFDocument, required: number) {
  if (doc.y + required > doc.page.height - 78) {
    doc.addPage();
    doc.y = 82;
  }
}

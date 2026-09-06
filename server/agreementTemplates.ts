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
  paymentMethod?: string;
  paymentRecipient?: string;
  paymentSchedule?: string;
  duration?: string;
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
const panel = "#FFFBF2";
const text = "#231F20";
const muted = "#5F5B5B";
const border = "#E7D5AD";
const pageMargin = 54;
const footerTop = 730;

const scholarshipCode = [
  ["Purpose", "This Code of Conduct establishes the standards expected of scholarship applicants, beneficiaries, parents and guardians participating in programmes supported by Lifespring Humanitarian Foundation. It is intended to promote integrity, respect, accountability, safeguarding and responsible use of Foundation support."],
  ["Integrity and Respect", "Beneficiaries, parents and guardians are expected to demonstrate honesty, integrity, respect, accountability and transparency in all dealings with the Foundation, its representatives, schools, partners and other beneficiaries."],
  ["Responsible Communication", "All communication with Lifespring Humanitarian Foundation, its representatives and partner institutions must be respectful. Beneficiaries, parents and guardians must not knowingly publish, circulate or communicate false, defamatory, malicious or deliberately misleading information about the Foundation, its representatives or programmes. Nothing in this clause prevents any person from making a genuine complaint, raising a safeguarding concern, reporting suspected misconduct, making a protected disclosure or exercising any right available under applicable law."],
  ["Use of Foundation Name and Identity", "The name, logo, documents, identity and reputation of Lifespring Humanitarian Foundation must not be used for unlawful, fraudulent, unethical or unauthorised purposes. No beneficiary, parent or guardian may represent themselves as an authorised representative of the Foundation unless formally authorised."],
  ["Accurate and Truthful Information", "All information provided in connection with an application, assessment, monitoring process or continued scholarship eligibility must be truthful, complete and accurate. Forgery, falsification, deliberate omission of material information or misrepresentation may result in review, suspension or withdrawal of support."],
  ["Scholarship Eligibility", "Scholarship support remains subject to the eligibility criteria of the relevant programme. The Foundation may reasonably review continued eligibility during the period of support."],
  ["Ongoing Responsibilities", "Beneficiaries and parents or guardians must notify the Foundation of significant changes that may affect eligibility or the administration of support, including changes of school, contact details, educational status or other relevant circumstances."],
  ["Monitoring and Verification", "The Foundation may reasonably verify relevant information with schools or other appropriate institutions for the purposes of scholarship administration, accountability and safeguarding, subject to applicable privacy requirements."],
  ["Attendance and Educational Progress", "Where applicable, beneficiaries are expected to maintain reasonable school attendance, participation and educational engagement. The Foundation may consider attendance and progress when reviewing continued scholarship support."],
  ["Use of Scholarship Support", "Scholarship funds, payments or benefits must be used only for the educational purpose for which they were approved. Misuse or diversion of support may result in investigation and appropriate action."],
  ["Cooperation with Reasonable Monitoring", "Beneficiaries, parents and guardians are expected to cooperate with reasonable requests for information, confirmation or monitoring relevant to the scholarship. Monitoring should be proportionate and respectful of privacy and safeguarding obligations."],
  ["Safeguarding", "The dignity, safety and welfare of children and vulnerable persons must be protected at all times. Any safeguarding concern should be reported promptly through the Foundation's safeguarding or reporting channels."],
  ["Privacy and Confidentiality", "Personal information shall be handled in accordance with the Foundation's Privacy and Data Protection Policy. Beneficiaries, parents and guardians must also respect confidential information obtained through participation in Foundation programmes."],
  ["Fraud and Misrepresentation", "Fraud, forged documents, deliberate misrepresentation, false declarations, duplicate fraudulent applications or intentional misuse of Foundation resources are prohibited. Suspected fraud may be investigated and, where appropriate, referred to relevant authorities."],
  ["Complaints and Reporting Concerns", "Beneficiaries, parents and guardians have the right to raise genuine complaints and concerns. Complaints should be handled fairly, respectfully and without retaliation. Safeguarding concerns, suspected misconduct, fraud or serious policy breaches may be reported through the Foundation's appropriate channels."],
  ["Misconduct and Breach", "Serious or repeated breaches of this Code may result in appropriate action. Any action taken should be proportionate to the nature and seriousness of the breach."],
  ["Suspension or Withdrawal of Support", "Scholarship support may be suspended, reviewed or withdrawn where there is proven fraud or deliberate misrepresentation, material breach of scholarship conditions, serious misconduct, misuse of scholarship funds or benefits, loss of programme eligibility, or other substantial reasons directly affecting the integrity or proper administration of the scholarship. Support must not be withdrawn arbitrarily."],
  ["Review", "Where scholarship support is suspended or withdrawn, the beneficiary or parent or guardian may request a review in accordance with the Foundation's applicable procedures."],
  ["Acceptance and Acknowledgement", "By signing this Agreement, the beneficiary and parent or guardian where applicable confirm that they have read the Agreement, understood the Code of Conduct, received an opportunity to ask questions, agreed to comply with the applicable scholarship conditions, and confirmed that information provided to the Foundation is accurate to the best of their knowledge."],
] as const;

export function createAgreementPdf(
  kind: AgreementKind,
  data: AgreementTemplateData,
  outputPath: string
) {
  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: pageMargin,
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
    section(doc, "Agreement Details");
    drawInfoPanel(doc, {
      "Agreement Reference": data.agreementReference,
      "Application Reference": data.applicationReference,
      Date: data.date,
      "Policy Version": data.policyVersion || "1.0",
    });

    ensureSpace(doc, 380);
    section(doc, "Beneficiary Information");
    drawInfoPanel(doc, beneficiaryFields(kind, data));

    section(doc, kind === "SCHOLARSHIP" ? "Approved Scholarship Support" : "Approved Community Support");
    paragraph(
      doc,
      kind === "SCHOLARSHIP"
        ? "This Agreement records the scholarship approved by Lifespring Humanitarian Foundation."
        : "This Agreement records the community support approved by Lifespring Humanitarian Foundation."
    );
    drawInfoPanel(doc, kind === "SCHOLARSHIP" ? scholarshipSupportFields(data) : communitySupportFields(data));
    paragraph(
      doc,
      "The approved support shall be used solely for the purpose for which it was awarded and shall remain subject to the terms of this Agreement and the Foundation's applicable policies."
    );

    section(doc, "Purpose of Agreement");
    paragraph(
      doc,
      kind === "SCHOLARSHIP"
        ? "This Agreement records the scholarship support approved by Lifespring Humanitarian Foundation and sets out the responsibilities of the beneficiary, parent or guardian where applicable, and the Foundation. The purpose of the Agreement is to ensure that scholarship support is administered fairly, transparently and in accordance with its intended educational purpose."
        : "This Agreement records the support approved by Lifespring Humanitarian Foundation and sets out the responsibilities of the beneficiary and the Foundation so that support is administered fairly, transparently and for its intended humanitarian purpose."
    );

    ensureSpace(doc, 300);
    section(doc, "Beneficiary Responsibilities");
    numberedList(doc, [
      "provide truthful and accurate information at all times;",
      "use scholarship support only for the approved educational purpose;",
      "remain enrolled at the stated school or educational institution where applicable;",
      "maintain reasonable attendance and participation;",
      "cooperate with reasonable verification and monitoring by the Foundation;",
      "promptly notify the Foundation of any material change that may affect eligibility;",
      "treat Foundation representatives, school staff and other beneficiaries with respect;",
      "comply with this Agreement and the Scholarship Code of Conduct;",
      "avoid conduct involving fraud, falsification or misuse of Foundation support;",
      "return or account for funds or benefits where required following proven misuse or error, subject to applicable law and Foundation procedure.",
    ], "The beneficiary shall:");

    if (kind === "SCHOLARSHIP") {
      section(doc, "Parent / Guardian Responsibilities");
      numberedList(doc, [
        "ensure that information supplied to the Foundation is accurate;",
        "support the beneficiary's continued educational participation;",
        "cooperate with reasonable Foundation monitoring;",
        "notify the Foundation of material changes in school, contact details or circumstances;",
        "ensure that scholarship funds or benefits are used for the approved purpose;",
        "communicate respectfully with the Foundation and school;",
        "comply with this Agreement and the applicable Code of Conduct.",
      ], "Where a parent or guardian applies or signs on behalf of a minor beneficiary, the parent or guardian shall:");
    }

    section(doc, "Scholarship Code of Conduct");
    scholarshipCode.forEach(([title, body], index) => {
      subsection(doc, `${index + 1}. ${title}`);
      paragraph(doc, body);
    });

    section(doc, "Our Commitment to Beneficiaries");
    bullets(doc, [
      "treating beneficiaries with dignity and respect;",
      "assessing scholarship matters fairly;",
      "protecting personal information;",
      "maintaining appropriate safeguarding standards;",
      "avoiding discrimination;",
      "administering funds responsibly;",
      "considering complaints fairly;",
      "communicating important decisions reasonably and transparently;",
      "avoiding retaliation against persons who raise genuine concerns.",
    ], "Lifespring Humanitarian Foundation commits to:");

    section(doc, "Declaration and Acceptance");
    paragraph(doc, "I/We confirm that the information supplied in connection with this scholarship is true and accurate to the best of our knowledge.");
    paragraph(doc, "I/We confirm that we have read and understood this Scholarship Beneficiary Agreement and Code of Conduct and agree to comply with its terms.");
    paragraph(doc, "I/We understand that scholarship support is provided for the approved educational purpose and may be reviewed where eligibility changes or where there is a serious or material breach of this Agreement.");
    paragraph(doc, "I/We acknowledge our right to make a genuine complaint, raise a safeguarding concern or report suspected wrongdoing without improper retaliation.");

    section(doc, "Return Instruction");
    paragraph(doc, `Please sign and return the completed Agreement to info@lifespringhf.org with the email subject: SIGNED AGREEMENT - ${data.applicationReference}.`);
    paragraph(doc, "This document forms part of the official records of Lifespring Humanitarian Foundation and should be retained by both the beneficiary and the Foundation.");

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

function drawFirstPageHeader(doc: PDFKit.PDFDocument, kind: AgreementKind, data: AgreementTemplateData) {
  const logoPath = data.logoPath && fs.existsSync(data.logoPath) ? data.logoPath : undefined;

  doc.save();
  doc.rect(0, 0, doc.page.width, 170).fill(ivory);
  doc.rect(0, 0, doc.page.width, 14).fill(darkBurgundy);
  doc.moveTo(0, 170).lineTo(doc.page.width, 170).lineWidth(1).strokeColor(border).stroke();
  if (logoPath) {
    doc.image(logoPath, 54, 34, { width: 62, height: 62, fit: [62, 62] });
  }
  doc.fillColor(burgundy).font("Helvetica-Bold").fontSize(17).text("LIFESPRING HUMANITARIAN FOUNDATION", 130, 34, { width: 380 });
  doc.fillColor(text).font("Helvetica").fontSize(10.5).text("Restoring Hope. Empowering Futures.", 130, 58);
  doc.fillColor(burgundy).fontSize(9).text("A humanitarian and community-impact initiative of Christ Warriors", 130, 75);
  doc.fontSize(8.5).fillColor(muted)
    .text("www.lifespringhf.org", 54, 108, { width: 150 })
    .text("info@lifespringhf.org", 218, 108, { width: 150, align: "center" })
    .text("+2349053646313", 391, 108, { width: 150, align: "right" })
    .text("Foundation Office: 27 Adeojo Street, Isheri, Lagos State, Nigeria", 54, 126, {
      align: "center",
      width: doc.page.width - 108,
    });
  doc.moveTo(54, 148).lineTo(doc.page.width - 54, 148).lineWidth(1.4).strokeColor(burgundy).stroke();
  doc.moveTo(54, 153).lineTo(doc.page.width - 54, 153).lineWidth(1).strokeColor(gold).stroke();
  doc.restore();

  doc.y = 192;
  doc.font("Helvetica-Bold").fontSize(19).fillColor(darkBurgundy).text("LIFESPRING HUMANITARIAN FOUNDATION", { align: "center" });
  doc.fontSize(18).fillColor(burgundy).text(documentTitle(kind), { align: "center" });
  doc.font("Helvetica").fontSize(10).fillColor(text).text("Restoring Hope. Empowering Futures.", { align: "center" });
  doc.moveDown(0.8);
}

function addPageChrome(doc: PDFKit.PDFDocument, kind: AgreementKind, data: AgreementTemplateData) {
  const range = doc.bufferedPageRange();
  const logoPath = data.logoPath && fs.existsSync(data.logoPath) ? data.logoPath : undefined;

  for (let index = range.start; index < range.start + range.count; index += 1) {
    doc.switchToPage(index);
    drawWatermark(doc, logoPath);

    if (index > range.start) {
      doc.rect(0, 0, doc.page.width, 62).fill(ivory);
      doc.font("Helvetica-Bold").fontSize(9).fillColor(burgundy).text("LIFESPRING HUMANITARIAN FOUNDATION", 54, 25, {
        lineBreak: false,
      });
      doc.font("Helvetica").fontSize(8).fillColor(muted).text(documentTitle(kind), 54, 39, {
        lineBreak: false,
        width: 360,
      });
      doc.moveTo(54, 58).lineTo(doc.page.width - 54, 58).lineWidth(0.8).strokeColor(gold).stroke();
    }

    doc.moveTo(54, footerTop).lineTo(doc.page.width - 54, footerTop).lineWidth(0.7).strokeColor(border).stroke();
    doc.font("Helvetica").fontSize(8).fillColor(muted)
      .text("www.lifespringhf.org | info@lifespringhf.org | +2349053646313", 54, footerTop + 10, {
        align: "center",
        lineBreak: false,
        width: doc.page.width - 108,
      })
      .text("A humanitarian and community-impact initiative of Christ Warriors", 54, footerTop + 22, {
        align: "center",
        lineBreak: false,
        width: doc.page.width - 108,
      })
      .text(`Page ${index - range.start + 1} of ${range.count}`, 54, footerTop + 35, {
        align: "center",
        lineBreak: false,
        width: doc.page.width - 108,
      });
  }
}

function drawWatermark(doc: PDFKit.PDFDocument, logoPath?: string) {
  if (!logoPath) return;
  doc.save();
  doc.opacity(0.035);
  doc.image(logoPath, doc.page.width / 2 - 95, doc.page.height / 2 - 95, {
    width: 190,
    height: 190,
    fit: [190, 190],
  });
  doc.opacity(1);
  doc.restore();
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
        "Scholarship Type": data.scholarshipType || "Primary school scholarship support",
        "Approved Amount": data.approvedAmount,
        "Approved Purpose": data.approvedPurpose,
        "Payment Arrangement": data.paymentArrangement,
        "Date Approved": data.date,
        "Review Date": data.reviewDate,
      }
    : {
        ...common,
        "Support Category": data.supportCategory,
      };
}

function scholarshipSupportFields(data: AgreementTemplateData) {
  return {
    "Scholarship Type": data.scholarshipType || "Primary school scholarship support",
    "Approved Amount / Value": data.approvedAmount,
    Purpose: data.approvedPurpose,
    "Academic Session": data.academicSession,
    "Payment Method": data.paymentMethod,
    "Payment Recipient": data.paymentRecipient,
    "Payment Schedule": data.paymentSchedule,
    Duration: data.duration,
    "Review Date": data.reviewDate,
  };
}

function communitySupportFields(data: AgreementTemplateData) {
  return {
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
  const filtered = Object.entries(fields).filter(([, value]) => isUseful(value));
  if (filtered.length === 0) return;

  const width = doc.page.width - 108;
  const valueWidth = width - 210;
  const rowHeights = filtered.map(([, value]) => {
    doc.font("Helvetica").fontSize(9.4);
    return Math.max(18, doc.heightOfString(` ${value}`, { width: valueWidth }) + 4);
  });
  const height = 24 + rowHeights.reduce((total, item) => total + item, 0);
  ensureSpace(doc, height + 20);
  const x = pageMargin;
  const y = doc.y;
  doc.roundedRect(x, y, width, height, 6).fillAndStroke(panel, border);
  doc.y = y + 14;
  filtered.forEach(([label, value], index) => {
    const rowTop = doc.y;
    doc.font("Helvetica-Bold").fontSize(9.4).fillColor(burgundy).text(`${label}:`, x + 16, doc.y, {
      lineBreak: false,
      width: 160,
    });
    doc.font("Helvetica").fillColor(text).text(`${value}`, x + 186, rowTop, { width: valueWidth });
    doc.y = rowTop + rowHeights[index];
  });
  doc.y = y + height + 16;
}

function section(doc: PDFKit.PDFDocument, heading: string) {
  ensureSpace(doc, 54);
  doc.moveDown(0.45);
  doc.font("Helvetica-Bold").fontSize(12.5).fillColor(burgundy).text(heading.toUpperCase(), pageMargin, doc.y);
  doc.moveTo(pageMargin, doc.y + 3).lineTo(pageMargin + 116, doc.y + 3).lineWidth(1).strokeColor(gold).stroke();
  doc.moveDown(0.7);
}

function subsection(doc: PDFKit.PDFDocument, heading: string) {
  ensureSpace(doc, 40);
  doc.font("Helvetica-Bold").fontSize(10.4).fillColor(darkBurgundy).text(heading.toUpperCase(), pageMargin, doc.y, {
    width: doc.page.width - 108,
  });
  doc.moveDown(0.22);
}

function paragraph(doc: PDFKit.PDFDocument, value: string) {
  ensureSpace(doc, 42);
  doc.font("Helvetica").fontSize(9.6).fillColor(text).text(value, pageMargin, doc.y, {
    lineGap: 2.8,
    width: doc.page.width - 108,
  });
  doc.moveDown(0.44);
}

function bullets(doc: PDFKit.PDFDocument, items: string[], intro?: string) {
  if (intro) paragraph(doc, intro);
  items.forEach((item) => {
    ensureSpace(doc, 28);
    doc.font("Helvetica").fontSize(9.6).fillColor(text).text(`- ${item}`, pageMargin + 10, doc.y, {
      lineGap: 2.6,
      width: doc.page.width - 128,
    });
    doc.moveDown(0.18);
  });
  doc.moveDown(0.35);
}

function numberedList(doc: PDFKit.PDFDocument, items: string[], intro?: string) {
  if (intro) paragraph(doc, intro);
  items.forEach((item, index) => {
    ensureSpace(doc, 30);
    doc.font("Helvetica").fontSize(9.6).fillColor(text).text(`${index + 1}. ${item}`, pageMargin + 8, doc.y, {
      lineGap: 2.6,
      width: doc.page.width - 124,
    });
    doc.moveDown(0.2);
  });
  doc.moveDown(0.35);
}

function addSignatureSection(doc: PDFKit.PDFDocument, kind: AgreementKind) {
  ensureSpace(doc, kind === "SCHOLARSHIP" ? 330 : 240);
  section(doc, "Signatures");
  const labels =
    kind === "SCHOLARSHIP"
      ? ["BENEFICIARY", "PARENT / GUARDIAN (where applicable)", "FOR LIFESPRING HUMANITARIAN FOUNDATION"]
      : ["BENEFICIARY", "FOR LIFESPRING HUMANITARIAN FOUNDATION"];

  labels.forEach((label) => {
    ensureSpace(doc, 92);
    doc.font("Helvetica-Bold").fontSize(10).fillColor(darkBurgundy).text(label, pageMargin, doc.y);
    doc.moveDown(0.32);
    signatureLine(doc, "Full Name");
    if (label.startsWith("PARENT")) signatureLine(doc, "Relationship to Beneficiary");
    if (label.startsWith("FOR LIFESPRING")) signatureLine(doc, "Position");
    signatureLine(doc, "Signature");
    signatureLine(doc, "Date");
    doc.moveDown(0.65);
  });
}

function signatureLine(doc: PDFKit.PDFDocument, label: string) {
  doc.font("Helvetica").fontSize(9.7).fillColor(text)
    .text(`${label}:`, pageMargin, doc.y, { continued: true })
    .text(" ______________________________________________");
  doc.moveDown(0.3);
}

function ensureSpace(doc: PDFKit.PDFDocument, required: number) {
  if (doc.y + required > footerTop - 8) {
    doc.addPage();
    doc.y = 82;
  }
}

function isUseful(value?: string) {
  const clean = `${value || ""}`.trim();
  return clean !== "" && !["undefined", "null", "N/A", "[object Object]"].includes(clean);
}

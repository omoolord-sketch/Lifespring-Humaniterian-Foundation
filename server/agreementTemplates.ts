import PDFDocument from "pdfkit";
import fs from "fs";

export type AgreementTemplateData = {
  agreementReference: string;
  applicationReference: string;
  date: string;
  beneficiaryFullName: string;
  dateOfBirth?: string;
  parentGuardianFullName?: string;
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
};

type AgreementKind = "SCHOLARSHIP" | "COMMUNITY_SUPPORT";

export function createAgreementPdf(
  kind: AgreementKind,
  data: AgreementTemplateData,
  outputPath: string
) {
  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const title =
      kind === "SCHOLARSHIP"
        ? "SCHOLARSHIP BENEFICIARY AGREEMENT & CODE OF CONDUCT"
        : "COMMUNITY SUPPORT BENEFICIARY AGREEMENT & CODE OF CONDUCT";

    doc.fontSize(11).fillColor("#65000D").text("LIFESPRING HUMANITARIAN FOUNDATION");
    doc.moveDown(0.5);
    doc.fontSize(18).fillColor("#231F20").text(title, { underline: true });
    doc.moveDown();

    writeFields(doc, {
      "Agreement Reference": data.agreementReference,
      "Application Reference": data.applicationReference,
      Date: data.date,
      "Beneficiary Full Name": data.beneficiaryFullName,
      "Date of Birth": data.dateOfBirth,
      "Parent/Guardian Full Name": data.parentGuardianFullName,
      Address: data.address,
      Telephone: data.telephone,
      Email: data.email,
      School: data.school,
      "Class/Level": data.classLevel,
      "Academic Session": data.academicSession,
      "Scholarship Type": data.scholarshipType,
      "Approved Amount": data.approvedAmount,
      "Approved Purpose": data.approvedPurpose || data.approvedSupport,
      "Payment Arrangement": data.paymentArrangement,
      "Start Date": data.startDate,
      "Review Date": data.reviewDate,
      "Support Category": data.supportCategory,
      "Monetary Value": data.monetaryValue,
      "Expected Delivery Date": data.expectedDeliveryDate,
      Conditions: data.conditions,
      "Foundation Representative": data.foundationRepresentative,
    });

    const sections =
      kind === "SCHOLARSHIP"
        ? [
            "About the Agreement",
            "Scholarship Award",
            "Purpose of Support",
            "Beneficiary Responsibilities",
            "Parent/Guardian Responsibilities where applicable",
            "Academic Participation",
            "Attendance",
            "Monitoring and Verification",
            "Information Accuracy",
            "Use of Funds",
            "Safeguarding",
            "Communication",
            "Privacy and Confidentiality",
            "Fraud and Misrepresentation",
            "Complaints and Concerns",
            "Suspension or Withdrawal",
            "Review",
            "Code of Conduct",
            "Acceptance",
            "Signature",
          ]
        : [
            "Purpose",
            "Description of Support",
            "Beneficiary Responsibilities",
            "Proper Use of Assistance",
            "Verification",
            "Fraud and Misrepresentation",
            "No Bribery or Payment for Selection",
            "Safeguarding",
            "Privacy",
            "Responsible Communication",
            "Complaints",
            "Withdrawal/Suspension",
            "Code of Conduct",
            "Acceptance",
            "Signatures",
          ];

    sections.forEach((section, index) => {
      doc.moveDown(0.8);
      doc.fontSize(13).fillColor("#65000D").text(`${index + 1}. ${section}`);
      doc
        .fontSize(10.5)
        .fillColor("#231F20")
        .text(
          "The parties agree to act honestly, respectfully and in line with Lifespring Humanitarian Foundation policies, including safeguarding, privacy, complaints and applicable code of conduct requirements.",
          { lineGap: 3 }
        );
    });

    doc.moveDown();
    doc.fontSize(12).fillColor("#65000D").text("Signature Areas", {
      underline: true,
    });
    doc.moveDown(0.5);
    ["Beneficiary", "Parent/Guardian where applicable", "Lifespring Representative"].forEach(
      (label) => {
        doc.fontSize(10.5).fillColor("#231F20").text(`${label}:`);
        doc.text("Name: ______________________________");
        doc.text("Signature: __________________________");
        doc.text("Date: _______________________________");
        doc.moveDown();
      }
    );

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

function writeFields(doc: PDFKit.PDFDocument, fields: Record<string, string | undefined>) {
  Object.entries(fields).forEach(([label, value]) => {
    if (value) {
      doc.fontSize(10.5).fillColor("#231F20").text(`${label}: ${value}`);
    }
  });
}

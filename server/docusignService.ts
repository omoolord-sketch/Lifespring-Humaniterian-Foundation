export type AgreementEnvelopeInput = {
  agreementReference: string;
  applicationReference: string;
  agreementType: "SCHOLARSHIP" | "COMMUNITY_SUPPORT";
  applicantName: string;
  applicantEmail: string;
  parentGuardianName?: string;
  parentGuardianEmail?: string;
  foundationRepresentativeName?: string;
  fields: Record<string, string | undefined>;
};

export type EnvelopeResult = {
  envelopeId: string;
  status: string;
};

const requiredConfigKeys = [
  "DOCUSIGN_INTEGRATION_KEY",
  "DOCUSIGN_USER_ID",
  "DOCUSIGN_ACCOUNT_ID",
  "DOCUSIGN_BASE_PATH",
  "DOCUSIGN_AUTH_SERVER",
  "DOCUSIGN_PRIVATE_KEY",
] as const;

export function isDocuSignConfigured() {
  return requiredConfigKeys.every((key) => Boolean(process.env[key]));
}

export function getDocuSignConfigurationStatus() {
  return {
    configured: isDocuSignConfigured(),
    missing: requiredConfigKeys.filter((key) => !process.env[key]),
    mode: process.env.DOCUSIGN_ENVIRONMENT || "development",
  };
}

export async function createEnvelope(
  input: AgreementEnvelopeInput
): Promise<EnvelopeResult> {
  if (!isDocuSignConfigured()) {
    throw new Error("DocuSign integration not configured.");
  }

  void input;
  throw new Error(
    "DocuSign API credentials are configured, but envelope creation must be connected to the organisation's DocuSign templates before production use."
  );
}

export function sendScholarshipAgreement(input: AgreementEnvelopeInput) {
  return createEnvelope({ ...input, agreementType: "SCHOLARSHIP" });
}

export function sendCommunitySupportAgreement(input: AgreementEnvelopeInput) {
  return createEnvelope({ ...input, agreementType: "COMMUNITY_SUPPORT" });
}

export async function getEnvelopeStatus(envelopeId: string) {
  if (!isDocuSignConfigured()) {
    throw new Error("DocuSign integration not configured.");
  }

  void envelopeId;
  throw new Error("DocuSign status lookup is awaiting production template setup.");
}

export async function downloadCompletedAgreement(envelopeId: string) {
  if (!isDocuSignConfigured()) {
    throw new Error("DocuSign integration not configured.");
  }

  void envelopeId;
  throw new Error("DocuSign document download is awaiting storage setup.");
}

export function processWebhookEvent(
  rawBody: string,
  signatureHeader: string | undefined
) {
  if (!process.env.DOCUSIGN_WEBHOOK_SECRET) {
    throw new Error("DocuSign webhook secret not configured.");
  }

  void rawBody;
  void signatureHeader;
  throw new Error(
    "DocuSign webhook verification must be completed with the production Connect secret before accepting signature events."
  );
}

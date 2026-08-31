import fs from "fs";
import path from "path";

export type ApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "MORE_INFORMATION_REQUIRED"
  | "APPROVED_PENDING_AGREEMENT"
  | "AGREEMENT_SENT"
  | "AGREEMENT_VIEWED"
  | "AGREEMENT_SIGNED"
  | "COMPLETED"
  | "DECLINED"
  | "SUSPENDED"
  | "WITHDRAWN";

export type AgreementStatus =
  | "DRAFT"
  | "READY"
  | "SENT"
  | "VIEWED"
  | "SIGNED"
  | "COMPLETED"
  | "VOIDED"
  | "ERROR";

export type StoredApplication = {
  id: string;
  reference: string;
  type: "SCHOLARSHIP" | "COMMUNITY_SUPPORT";
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  status: ApplicationStatus;
  data: Record<string, unknown>;
  files?: Array<{ field: string; filename: string; path: string }>;
  acknowledgements: Array<{
    policyId: string;
    policyVersion: string;
    declaration: string;
    accepted: boolean;
    acceptedAt: string;
    userAgent?: string;
    ipAddress?: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type AgreementRecord = {
  id: string;
  applicationId: string;
  applicantId: string;
  agreementType: "SCHOLARSHIP" | "COMMUNITY_SUPPORT";
  agreementReference: string;
  policyVersion: string;
  docusignEnvelopeId?: string;
  status: AgreementStatus;
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
  completedAt?: string;
  signedDocumentPathOrSecureObjectKey?: string;
  certificatePathOrSecureObjectKey?: string;
  createdByAdminId?: string;
  createdAt: string;
  updatedAt: string;
};

export type ComplaintRecord = {
  id: string;
  reference: string;
  type: "COMPLAINT" | "CONCERN";
  status: "SUBMITTED" | "UNDER_REVIEW" | "CLOSED";
  data: Record<string, unknown>;
  attachment?: { filename: string; path: string };
  createdAt: string;
  updatedAt: string;
};

export type AuditEntry = {
  id: string;
  event: string;
  entityType: string;
  entityId: string;
  userOrAdminId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

type RecordStore = {
  applications: StoredApplication[];
  agreements: AgreementRecord[];
  complaints: ComplaintRecord[];
  auditLog: AuditEntry[];
};

const initialStore: RecordStore = {
  applications: [],
  agreements: [],
  complaints: [],
  auditLog: [],
};

export class JsonRecordStore {
  private store: RecordStore = initialStore;

  constructor(private readonly filePath: string) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    this.load();
  }

  all() {
    return this.store;
  }

  addApplication(
    record: Omit<StoredApplication, "id" | "createdAt" | "updatedAt">
  ) {
    const now = new Date().toISOString();
    const application: StoredApplication = {
      ...record,
      id: createId("app"),
      createdAt: now,
      updatedAt: now,
    };
    this.store.applications.unshift(application);
    this.audit("application.submitted", "application", application.id, {
      reference: application.reference,
      type: application.type,
    });
    this.save();
    return application;
  }

  updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    adminId = "admin"
  ) {
    const application = this.store.applications.find((item) => item.id === applicationId);
    if (!application) {
      return undefined;
    }
    application.status = status;
    application.updatedAt = new Date().toISOString();
    this.audit("application.status_changed", "application", application.id, {
      status,
      adminId,
    });
    this.save();
    return application;
  }

  addAgreement(
    record: Omit<AgreementRecord, "id" | "createdAt" | "updatedAt">
  ) {
    const now = new Date().toISOString();
    const agreement: AgreementRecord = {
      ...record,
      id: createId("agr"),
      createdAt: now,
      updatedAt: now,
    };
    this.store.agreements.unshift(agreement);
    this.audit("agreement.created", "agreement", agreement.id, {
      applicationId: agreement.applicationId,
      agreementReference: agreement.agreementReference,
    });
    this.save();
    return agreement;
  }

  updateAgreement(agreementId: string, update: Partial<AgreementRecord>) {
    const agreement = this.store.agreements.find((item) => item.id === agreementId);
    if (!agreement) {
      return undefined;
    }
    Object.assign(agreement, update, { updatedAt: new Date().toISOString() });
    this.audit("agreement.updated", "agreement", agreement.id, {
      status: agreement.status,
      docusignEnvelopeId: agreement.docusignEnvelopeId,
    });
    this.save();
    return agreement;
  }

  addComplaint(record: Omit<ComplaintRecord, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const complaint: ComplaintRecord = {
      ...record,
      id: createId(record.type === "COMPLAINT" ? "cmp" : "con"),
      createdAt: now,
      updatedAt: now,
    };
    this.store.complaints.unshift(complaint);
    this.audit(`${record.type.toLowerCase()}.submitted`, record.type.toLowerCase(), complaint.id, {
      reference: complaint.reference,
    });
    this.save();
    return complaint;
  }

  audit(
    event: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, unknown>,
    userOrAdminId?: string
  ) {
    this.store.auditLog.unshift({
      id: createId("aud"),
      event,
      entityType,
      entityId,
      userOrAdminId,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  private load() {
    if (!fs.existsSync(this.filePath)) {
      this.store = structuredClone(initialStore);
      this.save();
      return;
    }

    try {
      this.store = {
        ...structuredClone(initialStore),
        ...JSON.parse(fs.readFileSync(this.filePath, "utf8")),
      };
    } catch {
      this.store = structuredClone(initialStore);
      this.save();
    }
  }

  private save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.store, null, 2));
  }
}

export function createReference(prefix: string) {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${random}`;
}

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

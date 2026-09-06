import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { apiUrl, readApiMessage } from "../lib/api";

type ApplicationRecord = {
  id: string;
  reference: string;
  type: "SCHOLARSHIP" | "COMMUNITY_SUPPORT";
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  status: string;
  data?: Record<string, string>;
  createdAt?: string;
};

type AgreementRecord = {
  id: string;
  applicationId: string;
  agreementType: string;
  agreementReference: string;
  policyVersion: string;
  status: string;
  generatedAt?: string;
  sentAt?: string;
  lastSentAt?: string;
  sendCount?: number;
  signedReceivedAt?: string;
  supportReadyAt?: string;
  completedAt?: string;
};

const filters = [
  "All",
  "Approved - Agreement Needed",
  "Generated",
  "Sent",
  "Awaiting Signed Copy",
  "Signed Received",
  "Support Ready",
  "Completed",
  "Cancelled/Voided",
];

const statusOptions = [
  "UNDER_REVIEW",
  "MORE_INFORMATION_REQUIRED",
  "APPROVED_PENDING_AGREEMENT",
  "DECLINED",
  "SUSPENDED",
  "WITHDRAWN",
];

const awaitingSignatureStatuses = ["SENT", "VIEWED"];
const inactiveAgreementStatuses = ["VOIDED", "SUPERSEDED"];

type WorkflowRow =
  | {
      kind: "application";
      application: ApplicationRecord;
      agreement?: undefined;
    }
  | {
      kind: "agreement";
      application?: ApplicationRecord;
      agreement: AgreementRecord;
    };

export default function AdminAgreementsPage() {
  const [token, setToken] = useState(localStorage.getItem("lhfAdminToken") || "");
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [agreements, setAgreements] = useState<AgreementRecord[]>([]);
  const [legacyForm, setLegacyForm] = useState({
    type: "SCHOLARSHIP",
    reference: "",
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    originalSubmittedAt: "",
    schoolName: "",
    classLevel: "",
    supportCategory: "",
    summary: "",
  });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const applicationById = useMemo(
    () => new Map(applications.map((item) => [item.id, item])),
    [applications]
  );

  const agreementByApplicationId = useMemo(
    () => new Map(agreements.map((item) => [item.applicationId, item])),
    [agreements]
  );

  const counts = useMemo(() => {
    const approvedNeedsAgreement = applications.filter(
      (item) => item.status === "APPROVED_PENDING_AGREEMENT" && !agreementByApplicationId.has(item.id)
    ).length;

    return {
      approvedNeedsAgreement,
      generated: agreements.filter((item) => item.status === "GENERATED").length,
      awaitingSignature: agreements.filter((item) => awaitingSignatureStatuses.includes(item.status)).length,
      signed: agreements.filter((item) => item.status === "SIGNED_RECEIVED" && !item.supportReadyAt).length,
      ready: agreements.filter((item) => item.supportReadyAt && item.status !== "COMPLETED").length,
      completed: agreements.filter((item) => item.status === "COMPLETED").length,
    };
  }, [applications, agreementByApplicationId, agreements]);

  const workflowRows = useMemo<WorkflowRow[]>(() => {
    const approvedRows = applications
      .filter((application) => application.status === "APPROVED_PENDING_AGREEMENT" && !agreementByApplicationId.has(application.id))
      .map((application) => ({ kind: "application" as const, application }));

    const agreementRows = agreements.map((agreement) => ({
      kind: "agreement" as const,
      application: applicationById.get(agreement.applicationId),
      agreement,
    }));

    return [...approvedRows, ...agreementRows];
  }, [agreements, agreementByApplicationId, applicationById, applications]);

  const filteredWorkflowRows = workflowRows.filter((row) => {
    const application = row.application;
    const agreement = row.kind === "agreement" ? row.agreement : undefined;
    const haystack = [
      application?.applicantName,
      application?.applicantEmail,
      application?.reference,
      agreement?.agreementReference,
      agreement?.agreementType,
      agreement?.status,
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      (filter === "Approved - Agreement Needed" && row.kind === "application") ||
      (filter === "Generated" && agreement?.status === "GENERATED") ||
      (filter === "Sent" && agreement?.status === "SENT") ||
      (filter === "Awaiting Signed Copy" && Boolean(agreement && awaitingSignatureStatuses.includes(agreement.status))) ||
      (filter === "Signed Received" && agreement?.status === "SIGNED_RECEIVED" && !agreement.supportReadyAt) ||
      (filter === "Support Ready" && Boolean(agreement?.supportReadyAt) && agreement?.status !== "COMPLETED") ||
      (filter === "Completed" && agreement?.status === "COMPLETED") ||
      (filter === "Cancelled/Voided" && Boolean(agreement && inactiveAgreementStatuses.includes(agreement.status)));

    return matchesQuery && matchesFilter;
  });

  const channelCards = [
    {
      label: "Approved - Agreement Needed",
      value: counts.approvedNeedsAgreement,
      helper: "Approved applications ready for agreement generation.",
    },
    {
      label: "Agreements Pending Send",
      filter: "Generated",
      value: counts.generated,
      helper: "Generated agreements that still need to be emailed.",
    },
    {
      label: "Agreements Awaiting Signature",
      filter: "Awaiting Signed Copy",
      value: counts.awaitingSignature,
      helper: "Sent agreements waiting for the applicant's signed copy.",
    },
    {
      label: "Signed Agreements Received",
      filter: "Signed Received",
      value: counts.signed,
      helper: "Signed agreements waiting for support release approval.",
    },
    {
      label: "Support Ready for Release",
      filter: "Support Ready",
      value: counts.ready,
      helper: "Cases approved for practical support release.",
    },
  ];

  const loadRecords = useCallback(async (currentToken = token) => {
    if (!currentToken) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(apiUrl("/api/admin/applications"), {
        headers: { "x-admin-token": currentToken },
      });
      const payload = (await response.json()) as {
        applications?: ApplicationRecord[];
        agreements?: AgreementRecord[];
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || "Unable to load admin records");
      }

      setApplications(payload.applications || []);
      setAgreements(payload.agreements || []);
      localStorage.setItem("lhfAdminToken", currentToken);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load records");
    } finally {
      setLoading(false);
    }
  }, [token]);

  async function prepareAgreement(applicationId: string, shouldSend = false) {
    if (!confirm(shouldSend ? "Generate and email agreement to this applicant?" : "Generate agreement for this application?")) {
      return;
    }

    const payload = await adminPost<{ agreement?: AgreementRecord }>(`/api/admin/applications/${applicationId}/prepare-agreement`);
    const agreementId = payload.agreement?.id || agreementByApplicationId.get(applicationId)?.id;
    if (shouldSend && agreementId) {
      await adminPost(`/api/admin/agreements/${agreementId}/send`);
    }
    await loadRecords();
  }

  async function updateApplicationStatus(applicationId: string, status: string) {
    if (!confirm(`Change this application status to ${status}?`)) {
      return;
    }

    await setApplicationStatus(applicationId, status);
    await loadRecords();
  }

  async function setApplicationStatus(applicationId: string, status: string) {
    setMessage("");
    const response = await fetch(apiUrl("/api/admin/application-status"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token,
      },
      body: JSON.stringify({ applicationId, status }),
    });
    const messageText = await readApiMessage(response);
    setMessage(messageText);

    if (!response.ok) {
      throw new Error(messageText);
    }
  }

  async function sendAgreement(agreementId: string) {
    if (!confirm("Email this generated agreement to the applicant?")) {
      return;
    }

    await adminPost(`/api/admin/agreements/${agreementId}/send`);
    await loadRecords();
  }

  async function markSigned(agreementId: string) {
    const note = prompt("Optional note for the signed agreement record") || "";
    if (!confirm("Mark signed agreement as received?")) {
      return;
    }

    await adminPost(`/api/admin/agreements/${agreementId}/mark-signed`, { note });
    await loadRecords();
  }

  async function markSupportReady(agreementId: string) {
    if (!confirm("Mark this support ready for release?")) {
      return;
    }

    await adminPost(`/api/admin/agreements/${agreementId}/support-ready`);
    await loadRecords();
  }

  async function completeApplication(agreementId: string) {
    if (!confirm("Complete this application?")) {
      return;
    }

    await adminPost(`/api/admin/agreements/${agreementId}/complete`);
    await loadRecords();
  }

  async function uploadSignedAgreement(agreementId: string, file: File | undefined) {
    if (!file) {
      return;
    }
    const note = prompt("Optional note for the signed agreement upload") || "";
    const formData = new FormData();
    formData.append("signedAgreement", file);
    formData.append("note", note);

    const response = await fetch(apiUrl(`/api/admin/agreements/${agreementId}/upload-signed`), {
      method: "POST",
      headers: { "x-admin-token": token },
      body: formData,
    });
    const messageText = await readApiMessage(response);
    setMessage(messageText);
    if (!response.ok) {
      throw new Error(messageText);
    }
    await loadRecords();
  }

  async function downloadAgreement(agreementId: string) {
    setMessage("");
    const response = await fetch(apiUrl(`/api/admin/agreements/${agreementId}/download`), {
      headers: { "x-admin-token": token },
    });
    if (!response.ok) {
      const messageText = await readApiMessage(response);
      setMessage(messageText);
      throw new Error(messageText);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lifespring-agreement-${agreementId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function importLegacyApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirm("Import this older application into the admin records?")) {
      return;
    }

    await adminPost("/api/admin/import-legacy-application", legacyForm);
    setLegacyForm({
      type: "SCHOLARSHIP",
      reference: "",
      applicantName: "",
      applicantEmail: "",
      applicantPhone: "",
      originalSubmittedAt: "",
      schoolName: "",
      classLevel: "",
      supportCategory: "",
      summary: "",
    });
    await loadRecords();
  }

  async function adminPost<T = { message?: string }>(path: string, body: Record<string, string> = {}) {
    setMessage("");
    const response = await fetch(apiUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token,
      },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => ({}))) as T & { message?: string };
    setMessage(payload.message || "Action completed");

    if (!response.ok) {
      throw new Error(payload.message || "Admin action failed");
    }
    return payload;
  }

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  return (
    <main className="site-shell py-16 text-[var(--lifespring-text)]">
      <div className="max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--lifespring-burgundy)]">
          Admin
        </p>
        <h1 className="mt-4 text-4xl font-extrabold">Agreements Dashboard</h1>
        <p className="mt-5 leading-8 text-[var(--lifespring-muted)]">
          Review applications, generate letterheaded beneficiary agreements,
          email them to applicants, and track signed returns before support is released.
        </p>
      </div>

      <section className="mt-8 rounded-md border border-[#eadfcb] bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="text-sm font-semibold">
            Admin API Token
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="mt-2 w-full rounded-md border border-[#d9c8a5] px-4 py-3"
              placeholder="Enter ADMIN_API_TOKEN"
            />
          </label>
          <button
            type="button"
            onClick={() => void loadRecords()}
            className="self-end rounded-md bg-[var(--lifespring-burgundy)] px-6 py-3 font-bold text-white"
          >
            Load Records
          </button>
        </div>
        {message && (
          <p className="mt-4 rounded-md bg-[#fff7e6] px-4 py-3 text-sm font-semibold text-[var(--lifespring-burgundy)]">
            {message}
          </p>
        )}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {channelCards.map((channel) => {
          const channelFilter = channel.filter || channel.label;
          const selected = filter === channelFilter;

          return (
            <button
              key={channel.label}
              type="button"
              onClick={() => setFilter(channelFilter)}
              aria-pressed={selected}
              className={`rounded-md border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--lifespring-gold)] hover:shadow-md ${
                selected
                  ? "border-[var(--lifespring-gold)] bg-[#fff7e6] ring-2 ring-[var(--lifespring-gold)]/30"
                  : "border-[#eadfcb] bg-white"
              }`}
            >
              <span className="block text-2xl font-extrabold text-[var(--lifespring-burgundy)]">
                {channel.value}
              </span>
              <span className="mt-1 block text-xs font-bold uppercase tracking-[0.12em] text-[var(--lifespring-muted)]">
                {channel.label}
              </span>
              <span className="mt-3 block text-xs leading-5 text-[var(--lifespring-muted)]">
                {channel.helper}
              </span>
            </button>
          );
        })}
      </section>

      <section className="mt-8 rounded-md border border-[#eadfcb] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <label className="text-sm font-semibold md:w-80">
            Search
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mt-2 w-full rounded-md border border-[#d9c8a5] px-4 py-3"
              placeholder="Name, email or reference"
            />
          </label>
          <label className="text-sm font-semibold md:w-64">
            Filter
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="mt-2 w-full rounded-md border border-[#d9c8a5] px-4 py-3"
            >
              {filters.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-md bg-[#fff7e6] px-4 py-3 text-sm text-[var(--lifespring-muted)]">
          <span className="font-bold text-[var(--lifespring-burgundy)]">Monitoring channel:</span>
          <span>{filter}</span>
          {filter !== "All" && (
            <button
              type="button"
              onClick={() => setFilter("All")}
              className="rounded-md border border-[#d9c8a5] px-3 py-1 text-xs font-bold text-[var(--lifespring-burgundy)] hover:bg-white"
            >
              Show all
            </button>
          )}
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[1120px] w-full text-left text-sm">
            <thead className="bg-[#fff7e6] text-[var(--lifespring-burgundy)]">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Agreement</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Sent</th>
                <th className="px-4 py-3">Signed</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkflowRows.map((row) => {
                const agreement = row.kind === "agreement" ? row.agreement : undefined;
                const application = row.application;
                const rowKey = agreement?.id || application?.id || "unknown-row";
                const status = agreement?.status || application?.status || "Unknown";
                return (
                  <tr key={rowKey} className="border-b border-[#eadfcb] align-top">
                    <td className="px-4 py-4 font-semibold">
                      {agreement?.agreementReference || "Not generated"}
                    </td>
                    <td className="px-4 py-4">
                      <p>{application?.applicantName || "Unknown"}</p>
                      <p className="text-xs text-[var(--lifespring-muted)]">{application?.applicantEmail}</p>
                    </td>
                    <td className="px-4 py-4">{application?.reference || "Unknown"}</td>
                    <td className="px-4 py-4">{agreement?.agreementType || "Pending agreement"}</td>
                    <td className="px-4 py-4">{status}</td>
                    <td className="px-4 py-4">{agreement?.lastSentAt || agreement?.sentAt || "-"}</td>
                    <td className="px-4 py-4">{agreement?.signedReceivedAt || "-"}</td>
                    <td className="min-w-[320px] px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {row.kind === "application" ? (
                          <>
                            <button type="button" onClick={() => void prepareAgreement(row.application.id)} className="admin-action">
                              Generate Agreement
                            </button>
                            <button type="button" onClick={() => void prepareAgreement(row.application.id, true)} className="admin-action">
                              Generate & Send
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => void downloadAgreement(row.agreement.id)} className="admin-action">
                              Download
                            </button>
                            <button type="button" onClick={() => void sendAgreement(row.agreement.id)} className="admin-action">
                              {row.agreement.sentAt ? "Resend" : "Send"}
                            </button>
                            <label className="admin-action cursor-pointer">
                              Upload Signed
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="sr-only"
                                onChange={(event) => void uploadSignedAgreement(row.agreement.id, event.currentTarget.files?.[0])}
                              />
                            </label>
                            <button type="button" onClick={() => void markSigned(row.agreement.id)} className="admin-action">
                              Mark Signed
                            </button>
                            <button type="button" onClick={() => void markSupportReady(row.agreement.id)} className="admin-action">
                              Ready
                            </button>
                            <button type="button" onClick={() => void completeApplication(row.agreement.id)} className="admin-action">
                              Complete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredWorkflowRows.length === 0 && (
          <div className="mt-6 rounded-md bg-[#fff7e6] p-5 text-[var(--lifespring-muted)]">
            {loading
              ? "Loading records..."
              : "No application or agreement records match this monitoring channel."}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-md border border-[#eadfcb] bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-extrabold text-[var(--lifespring-burgundy)]">
          Submitted Applications
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--lifespring-muted)]">
          Open each record to review the submitted form details. Approving an
          application moves it into the agreement workflow; support should only
          be released after the signed agreement has been received.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {applications.map((application) => {
            const agreement = agreementByApplicationId.get(application.id);
            const blocked = ["DECLINED", "WITHDRAWN", "SUSPENDED"].includes(application.status);
            return (
              <article key={application.id} className="rounded-md border border-[#eadfcb] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--lifespring-gold)]">
                  {application.type}
                </p>
                <h3 className="mt-2 font-extrabold text-[var(--lifespring-burgundy)]">
                  {application.applicantName}
                </h3>
                <p className="mt-2 text-sm text-[var(--lifespring-muted)]">
                  {application.reference} | {application.status}
                </p>
                {agreement && (
                  <p className="mt-2 rounded-md bg-[#fff7e6] px-3 py-2 text-xs font-bold text-[var(--lifespring-burgundy)]">
                    Agreement: {agreement.agreementReference} | {agreement.status}
                  </p>
                )}
                <details className="mt-4 rounded-md bg-[#fff7e6] p-3 text-sm text-[var(--lifespring-muted)]">
                  <summary className="cursor-pointer font-bold text-[var(--lifespring-burgundy)]">
                    View form details
                  </summary>
                  <dl className="mt-3 space-y-2">
                    {Object.entries(application.data || {}).map(([key, value]) => (
                      <div key={key}>
                        <dt className="font-bold text-[var(--lifespring-text)]">{key}</dt>
                        <dd className="break-words">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!agreement && (
                    <>
                      <button type="button" disabled={blocked} onClick={() => void prepareAgreement(application.id)} className="rounded-md bg-[var(--lifespring-burgundy)] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                        Generate Agreement
                      </button>
                      <button type="button" disabled={blocked} onClick={() => void prepareAgreement(application.id, true)} className="rounded-md bg-[var(--lifespring-gold)] px-4 py-2 text-sm font-bold text-[#250006] disabled:cursor-not-allowed disabled:opacity-50">
                        Generate & Send
                      </button>
                    </>
                  )}
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => void updateApplicationStatus(application.id, status)}
                      className="rounded-md border border-[#d9c8a5] px-4 py-2 text-sm font-bold text-[var(--lifespring-burgundy)]"
                    >
                      {status.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-8 rounded-md border border-[#eadfcb] bg-white p-5 shadow-sm">
        <details>
          <summary className="cursor-pointer text-2xl font-extrabold text-[var(--lifespring-burgundy)]">
            Import Older Application
          </summary>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--lifespring-muted)]">
            Use this for applications submitted before the admin record store was
            active. Copy only the details that exist in the original email or
            paper record; leave unknown fields blank.
          </p>
          <form onSubmit={(event) => void importLegacyApplication(event)} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Application Type
              <select
                value={legacyForm.type}
                onChange={(event) => setLegacyForm((current) => ({ ...current, type: event.target.value }))}
                className="mt-2 w-full rounded-md border border-[#d9c8a5] px-4 py-3"
              >
                <option value="SCHOLARSHIP">Scholarship</option>
                <option value="COMMUNITY_SUPPORT">Community Support</option>
              </select>
            </label>
            <LegacyInput label="Original Reference" value={legacyForm.reference} onChange={(value) => setLegacyForm((current) => ({ ...current, reference: value }))} placeholder="Leave blank if none" />
            <LegacyInput label="Applicant Name" value={legacyForm.applicantName} onChange={(value) => setLegacyForm((current) => ({ ...current, applicantName: value }))} required />
            <LegacyInput label="Applicant Email" value={legacyForm.applicantEmail} onChange={(value) => setLegacyForm((current) => ({ ...current, applicantEmail: value }))} required type="email" />
            <LegacyInput label="Applicant Phone" value={legacyForm.applicantPhone} onChange={(value) => setLegacyForm((current) => ({ ...current, applicantPhone: value }))} />
            <LegacyInput label="Original Submitted Date" value={legacyForm.originalSubmittedAt} onChange={(value) => setLegacyForm((current) => ({ ...current, originalSubmittedAt: value }))} placeholder="Example: 24 August 2026" />
            <LegacyInput label="School Name" value={legacyForm.schoolName} onChange={(value) => setLegacyForm((current) => ({ ...current, schoolName: value }))} />
            <LegacyInput label="Class/Level" value={legacyForm.classLevel} onChange={(value) => setLegacyForm((current) => ({ ...current, classLevel: value }))} />
            <LegacyInput label="Support Category" value={legacyForm.supportCategory} onChange={(value) => setLegacyForm((current) => ({ ...current, supportCategory: value }))} />
            <label className="text-sm font-semibold md:col-span-2">
              Application Summary
              <textarea
                value={legacyForm.summary}
                onChange={(event) => setLegacyForm((current) => ({ ...current, summary: event.target.value }))}
                className="mt-2 min-h-32 w-full rounded-md border border-[#d9c8a5] px-4 py-3"
                placeholder="Paste the need/support summary from the old email"
              />
            </label>
            <div className="md:col-span-2">
              <button type="submit" className="rounded-md bg-[var(--lifespring-burgundy)] px-6 py-3 font-bold text-white">
                Import Legacy Application
              </button>
            </div>
          </form>
        </details>
      </section>
    </main>
  );
}

function LegacyInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-md border border-[#d9c8a5] px-4 py-3"
        placeholder={placeholder}
      />
    </label>
  );
}

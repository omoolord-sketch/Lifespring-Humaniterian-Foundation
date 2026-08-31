import { useCallback, useEffect, useMemo, useState } from "react";
import { apiUrl, readApiMessage } from "../lib/api";

type ApplicationRecord = {
  id: string;
  reference: string;
  type: "SCHOLARSHIP" | "COMMUNITY_SUPPORT";
  applicantName: string;
  applicantEmail: string;
  status: string;
};

type AgreementRecord = {
  id: string;
  applicationId: string;
  agreementType: string;
  agreementReference: string;
  policyVersion: string;
  docusignEnvelopeId?: string;
  status: string;
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
};

const filters = [
  "All",
  "Pending Signature",
  "Sent",
  "Viewed",
  "Signed",
  "Completed",
  "Cancelled/Voided",
];

export default function AdminAgreementsPage() {
  const [token, setToken] = useState(localStorage.getItem("lhfAdminToken") || "");
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [agreements, setAgreements] = useState<AgreementRecord[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const applicationById = useMemo(
    () => new Map(applications.map((item) => [item.id, item])),
    [applications]
  );

  const filteredAgreements = agreements.filter((agreement) => {
    const application = applicationById.get(agreement.applicationId);
    const haystack = [
      agreement.agreementReference,
      agreement.agreementType,
      agreement.status,
      application?.applicantName,
      application?.applicantEmail,
      application?.reference,
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      (filter === "Pending Signature" && ["READY", "SENT", "VIEWED"].includes(agreement.status)) ||
      (filter === "Sent" && agreement.status === "SENT") ||
      (filter === "Viewed" && agreement.status === "VIEWED") ||
      (filter === "Signed" && agreement.status === "SIGNED") ||
      (filter === "Completed" && agreement.status === "COMPLETED") ||
      (filter === "Cancelled/Voided" && agreement.status === "VOIDED");

    return matchesQuery && matchesFilter;
  });

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

  async function prepareAgreement(applicationId: string) {
    if (!confirm("Prepare agreement for this application?")) {
      return;
    }

    await adminPost(`/api/admin/applications/${applicationId}/prepare-agreement`);
    await loadRecords();
  }

  async function sendAgreement(agreementId: string) {
    if (!confirm("Send this agreement for DocuSign signature?")) {
      return;
    }

    await adminPost(`/api/admin/agreements/${agreementId}/send`);
    await loadRecords();
  }

  async function adminPost(path: string) {
    setMessage("");
    const response = await fetch(apiUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token,
      },
      body: JSON.stringify({}),
    });
    const messageText = await readApiMessage(response);
    setMessage(messageText);

    if (!response.ok) {
      throw new Error(messageText);
    }
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
          Review applications, prepare beneficiary agreements, and send approved
          agreements through the DocuSign-ready workflow.
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

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="bg-[#fff7e6] text-[var(--lifespring-burgundy)]">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Application Type</th>
                <th className="px-4 py-3">Application Reference</th>
                <th className="px-4 py-3">Agreement Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Sent Date</th>
                <th className="px-4 py-3">Signed Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgreements.map((agreement) => {
                const application = applicationById.get(agreement.applicationId);
                return (
                  <tr key={agreement.id} className="border-b border-[#eadfcb]">
                    <td className="px-4 py-4 font-semibold">{agreement.agreementReference}</td>
                    <td className="px-4 py-4">{application?.applicantName || "Unknown"}</td>
                    <td className="px-4 py-4">{application?.type || "Unknown"}</td>
                    <td className="px-4 py-4">{application?.reference || "Unknown"}</td>
                    <td className="px-4 py-4">{agreement.agreementType}</td>
                    <td className="px-4 py-4">{agreement.status}</td>
                    <td className="px-4 py-4">{agreement.sentAt || "-"}</td>
                    <td className="px-4 py-4">{agreement.signedAt || "-"}</td>
                    <td className="space-x-2 px-4 py-4">
                      <button
                        type="button"
                        onClick={() => void sendAgreement(agreement.id)}
                        className="rounded-md border border-[#d9c8a5] px-3 py-2 font-bold text-[var(--lifespring-burgundy)]"
                      >
                        Send
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAgreements.length === 0 && (
          <div className="mt-6 rounded-md bg-[#fff7e6] p-5 text-[var(--lifespring-muted)]">
            {loading
              ? "Loading records..."
              : "No agreement records match this view. Prepare agreements from eligible applications below."}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-md border border-[#eadfcb] bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-extrabold text-[var(--lifespring-burgundy)]">
          Applications
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {applications.map((application) => {
            const hasAgreement = agreements.some(
              (agreement) => agreement.applicationId === application.id
            );
            const canPrepare = !hasAgreement && !["DECLINED", "WITHDRAWN", "SUSPENDED"].includes(application.status);
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
                <button
                  type="button"
                  disabled={!canPrepare}
                  onClick={() => void prepareAgreement(application.id)}
                  className="mt-4 rounded-md bg-[var(--lifespring-burgundy)] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Approve & Prepare Agreement
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

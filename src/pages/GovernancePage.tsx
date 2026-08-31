import { Link } from "react-router-dom";
import { policies } from "../data/policies";

export default function GovernancePage() {
  return (
    <main className="bg-[var(--lifespring-ivory)] text-[var(--lifespring-text)]">
      <section className="site-shell py-16 md:py-20">
        <div className="max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--lifespring-burgundy)]">
            Governance
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
            Governance & Policies
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--lifespring-muted)]">
            Lifespring Humanitarian Foundation is committed to responsible
            governance, safeguarding, accountability, transparency and the
            ethical delivery of humanitarian support. Our policies set out the
            standards that guide our trustees, volunteers, beneficiaries,
            applicants, partners and representatives.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {policies.map((policy) => (
            <Link
              key={policy.id}
              to={policy.path}
              className="rounded-md border border-[#eadfcb] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--lifespring-gold)]">
                Version {policy.version}
              </p>
              <h2 className="mt-3 text-xl font-extrabold text-[var(--lifespring-burgundy)]">
                {policy.title}
              </h2>
              <p className="mt-4 line-clamp-4 leading-7 text-[var(--lifespring-muted)]">
                {policy.intro}
              </p>
              <span className="mt-5 inline-flex text-sm font-bold text-[var(--lifespring-burgundy)]">
                Read policy
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <Link
            to="/complaints"
            className="rounded-md bg-[var(--lifespring-burgundy)] p-6 text-white shadow-sm"
          >
            <h2 className="text-2xl font-bold">Make a Complaint</h2>
            <p className="mt-3 leading-7 text-[#fff4dd]">
              Raise a complaint or provide feedback for fair review.
            </p>
          </Link>
          <Link
            to="/report-a-concern"
            className="rounded-md border border-[#d9c8a5] bg-[#fff7e6] p-6 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-[var(--lifespring-burgundy)]">
              Report a Concern
            </h2>
            <p className="mt-3 leading-7 text-[var(--lifespring-muted)]">
              Report safeguarding, fraud, bribery, harassment, conflict of
              interest, privacy or serious misconduct concerns.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}

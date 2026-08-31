import { Link } from "react-router-dom";
import type { Policy } from "../data/policies";

type PolicyPageProps = {
  policy: Policy;
};

function anchorFor(heading: string) {
  return heading
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function PolicyPage({ policy }: PolicyPageProps) {
  return (
    <main className="bg-[var(--lifespring-ivory)] text-[var(--lifespring-text)] print:bg-white">
      <section className="site-shell py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block print:hidden">
            <div className="sticky top-36 rounded-md border border-[#eadfcb] bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--lifespring-gold)]">
                Contents
              </p>
              <nav className="mt-4 space-y-3 text-sm">
                {policy.sections.map((section) => (
                  <a
                    key={section.heading}
                    href={`#${anchorFor(section.heading)}`}
                    className="block leading-6 text-[var(--lifespring-muted)] hover:text-[var(--lifespring-burgundy)]"
                  >
                    {section.heading}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="rounded-md border border-[#eadfcb] bg-white p-6 shadow-sm md:p-10 print:border-0 print:p-0 print:shadow-none">
            <div className="flex flex-col gap-5 border-b border-[#eadfcb] pb-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="/lifespring-emblem.png"
                  alt="LIFESPRING HUMANITARIAN FOUNDATION emblem"
                  className="h-14 w-14 shrink-0 object-contain"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--lifespring-burgundy)]">
                    LIFESPRING HUMANITARIAN FOUNDATION
                  </p>
                  <p className="mt-1 text-sm text-[var(--lifespring-muted)]">
                    Restoring Hope. Empowering Futures.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-md bg-[var(--lifespring-burgundy)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--lifespring-burgundy-dark)]"
                >
                  Print / Save as PDF
                </button>
                <Link
                  to="/governance"
                  className="rounded-md border border-[#d9c8a5] px-4 py-2 text-sm font-bold text-[var(--lifespring-burgundy)] hover:bg-[#fff7e6]"
                >
                  Back to Governance & Policies
                </Link>
              </div>
            </div>

            <div className="pt-8">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--lifespring-gold)]">
                Policy {policy.id} | Version {policy.version}
              </p>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[var(--lifespring-text)] md:text-5xl">
                {policy.title}
              </h1>
              <div className="mt-5 grid gap-2 text-sm text-[var(--lifespring-muted)] sm:grid-cols-2">
                <p>Effective date: {policy.effectiveDate}</p>
                <p>Last updated: {policy.lastUpdated}</p>
              </div>
              <p className="mt-6 max-w-4xl text-lg leading-8 text-[var(--lifespring-muted)]">
                {policy.intro}
              </p>
            </div>

            <div className="mt-10 space-y-9">
              {policy.sections.map((section) => (
                <section key={section.heading} id={anchorFor(section.heading)}>
                  <h2 className="text-2xl font-bold text-[var(--lifespring-burgundy)]">
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4 leading-8 text-[var(--lifespring-muted)]">
                    {section.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

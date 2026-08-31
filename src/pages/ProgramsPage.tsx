export default function ProgramsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-20 text-[var(--lifespring-text)]">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--lifespring-burgundy)]">
          Our Programmes
        </p>

        <h1 className="mt-4 text-4xl font-bold text-[var(--lifespring-text)]">
          Supporting education, relief, healthcare, and community hope
        </h1>

        <p className="mt-6 leading-8 text-[var(--lifespring-muted)]">
          LIFESPRING HUMANITARIAN FOUNDATION is committed to supporting
          vulnerable individuals and families through practical assistance,
          humanitarian relief, empowerment, and community care.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="rounded-md border border-[#eadfcb] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--lifespring-gold)]">
            Education & Scholarships
          </p>

          <h2 className="mt-4 text-2xl font-bold text-[var(--lifespring-burgundy)]">
            Scholarship and academic continuity
          </h2>

          <p className="mt-4 leading-8 text-[var(--lifespring-muted)]">
            We help less privileged students continue their education through
            scholarships, school fees support, books, uniforms, examination
            support, and other academic resources.
          </p>

          <ul className="mt-6 space-y-3 leading-7 text-[var(--lifespring-muted)]">
            <li>Scholarship application opportunities</li>
            <li>Support for tuition and school-related expenses</li>
          </ul>
        </div>

        <div className="rounded-md border border-[#eadfcb] bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--lifespring-gold)]">
            Humanitarian Relief
          </p>

          <h2 className="mt-4 text-2xl font-bold text-[var(--lifespring-burgundy)]">
            Care for vulnerable people and families
          </h2>

          <p className="mt-4 leading-8 text-[var(--lifespring-muted)]">
            We also support widows and widowers through compassionate welfare
            initiatives, practical assistance, encouragement, and community care
            that help restore dignity and hope.
          </p>

          <ul className="mt-6 space-y-3 leading-7 text-[var(--lifespring-muted)]">
            <li>Welfare and relief support</li>
            <li>Compassionate outreach and care initiatives</li>
            <li>Community-based encouragement and assistance</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-md border border-[#eadfcb] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--lifespring-gold)]">
          Community Development
        </p>

        <h2 className="mt-4 text-2xl font-bold text-[var(--lifespring-burgundy)]">
          Serving the wider community through practical support
        </h2>

        <p className="mt-4 leading-8 text-[var(--lifespring-muted)]">
          Beyond educational and family support, LIFESPRING HUMANITARIAN FOUNDATION provides
          community-based service initiatives that promote wellbeing,
          empowerment, and sustainable development.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-[#eadfcb] bg-[#fff7e6] p-4">
            <h3 className="font-semibold text-[var(--lifespring-burgundy)]">
              Women & Youth Empowerment
            </h3>
            <p className="mt-2 leading-7 text-[var(--lifespring-muted)]">
              Support for confidence, opportunity, and future-focused progress.
            </p>
          </div>

          <div className="rounded-md border border-[#eadfcb] bg-[#fff7e6] p-4">
            <h3 className="font-semibold text-[var(--lifespring-burgundy)]">Healthcare Support</h3>
            <p className="mt-2 leading-7 text-[var(--lifespring-muted)]">
              Practical support connected to healthcare needs and wellbeing.
            </p>
          </div>

          <div className="rounded-md border border-[#eadfcb] bg-[#fff7e6] p-4">
            <h3 className="font-semibold text-[var(--lifespring-burgundy)]">Community Development</h3>
            <p className="mt-2 leading-7 text-[var(--lifespring-muted)]">
              Partnership-led work that strengthens local resilience.
            </p>
          </div>

          <div className="rounded-md border border-[#eadfcb] bg-[#fff7e6] p-4">
            <h3 className="font-semibold text-[var(--lifespring-burgundy)]">Counselling</h3>
            <p className="mt-2 leading-7 text-[var(--lifespring-muted)]">
              Support through listening, encouragement, and compassionate counsel.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-md border border-[#eadfcb] bg-[#fff7e6] p-8">
        <h2 className="text-2xl font-bold text-[var(--lifespring-burgundy)]">
          How supporters can help
        </h2>

        <p className="mt-4 leading-8 text-[var(--lifespring-muted)]">
          Sponsors and donors can support the foundation by funding student
          scholarships, welfare initiatives, healthcare support, community
          development programmes, and broader humanitarian outreach efforts.
        </p>
      </div>
    </main>
  );
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-20 text-[var(--lifespring-text)]">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--lifespring-burgundy)]">
          About Us
        </p>

        <h1 className="mt-4 text-4xl font-bold text-[var(--lifespring-text)]">
          A humanitarian foundation committed to hope, empowerment, and care
        </h1>

        <p className="mt-6 leading-8 text-[var(--lifespring-muted)]">
          LIFESPRING HUMANITARIAN FOUNDATION supports individuals, families,
          and communities through education, humanitarian relief, healthcare
          support, empowerment, and sustainable development initiatives.
        </p>

        <p className="mt-4 leading-8 text-[var(--lifespring-muted)]">
          We believe real transformation happens when education, welfare, and
          community care come together. Through compassion, stewardship, and
          integrity, we work with sponsors, organisations, and community
          partners to restore dignity and expand opportunity.
        </p>
      </div>

      <section className="mt-12 rounded-md border border-[#eadfcb] bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--lifespring-gold)]">
              Parent Organisation
            </p>
            <h2 className="mt-3 text-2xl font-extrabold text-[var(--lifespring-burgundy)]">
              Part of the Christ Warriors Family
            </h2>
            <p className="mt-4 leading-8 text-[var(--lifespring-muted)]">
              Lifespring Humanitarian Foundation is the humanitarian and
              community-impact arm of Christ Warriors, created to deliver
              practical support through education, healthcare, humanitarian
              relief, empowerment, and sustainable community development.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-md border border-[#eadfcb] bg-[var(--lifespring-ivory)] px-4 py-3">
            <img
              src="/logo.png"
              alt="Christ Warriors logo"
              className="h-12 w-12 rounded-full bg-white object-contain p-1"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--lifespring-gold)]">
                Christ Warriors
              </p>
              <p className="text-sm font-semibold text-[var(--lifespring-burgundy)]">
                Parent organisation
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <div className="rounded-md border border-[#eadfcb] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--lifespring-burgundy)]">
            Our Mission
          </h2>
          <p className="mt-3 leading-7 text-[var(--lifespring-muted)]">
            To restore hope and empower futures through practical humanitarian
            support, education, healthcare, and community development.
          </p>
        </div>

        <div className="rounded-md border border-[#eadfcb] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--lifespring-burgundy)]">
            Our Vision
          </h2>
          <p className="mt-3 leading-7 text-[var(--lifespring-muted)]">
            A future where hardship does not destroy dignity, opportunity, or
            hope.
          </p>
        </div>

        <div className="rounded-md border border-[#eadfcb] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--lifespring-burgundy)]">
            Our Values
          </h2>
          <p className="mt-3 leading-7 text-[var(--lifespring-muted)]">
            Compassion, dignity, stewardship, transparency, service, and hope.
          </p>
        </div>
      </div>
    </main>
  );
}

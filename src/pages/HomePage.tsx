import { Link } from "react-router-dom";

type ProgrammeArea = {
  title: string;
  text: string;
  to: string;
  position: string;
  icon: "book" | "heart" | "care" | "growth" | "home" | "person";
};

const programmeAreas: ProgrammeArea[] = [
  {
    title: "Education & Scholarships",
    text: "School fee assistance, learning materials, academic support, and scholarships for students in need.",
    to: "/scholarship",
    position: "left top",
    icon: "book",
  },
  {
    title: "Humanitarian Relief",
    text: "Responsive support for individuals and families navigating hardship, crisis, and urgent welfare needs.",
    to: "/support-request",
    position: "center top",
    icon: "heart",
  },
  {
    title: "Healthcare Support",
    text: "Practical care connected to health, wellbeing, and access to compassionate community assistance.",
    to: "/programs",
    position: "right top",
    icon: "care",
  },
  {
    title: "Women & Youth Empowerment",
    text: "Skills training, mentorship, and resources that equip women and young people to build brighter futures.",
    to: "/programs",
    position: "left bottom",
    icon: "growth",
  },
  {
    title: "Community Development",
    text: "Strengthening communities through sustainable projects that create long-term opportunities for all.",
    to: "/programs",
    position: "center bottom",
    icon: "home",
  },
  {
    title: "Support for Vulnerable Persons",
    text: "Compassionate support for the elderly, widows, families, and other vulnerable community members.",
    to: "/support-request",
    position: "right bottom",
    icon: "person",
  },
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
      <path
        d="M4 10h11m0 0-4-4m4 4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MiniIcon({ name }: { name: ProgrammeArea["icon"] }) {
  const paths = {
    book: (
      <path d="M5 5h6a3 3 0 0 1 3 3v7H8a3 3 0 0 0-3 3V5Zm9 0h5v13h-5" />
    ),
    heart: (
      <path d="M12 19s-7-4.5-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 9c0 5.5-7 10-7 10Z" />
    ),
    care: <path d="M12 5v14M5 12h14" />,
    growth: <path d="M5 17c7 0 10-4 11-11m0 0h-6m6 0v6" />,
    home: <path d="m4 11 8-7 8 7v8H7v-6h10" />,
    person: (
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function ContactIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--lifespring-burgundy)] text-[var(--lifespring-gold-soft)]">
      {children}
    </span>
  );
}

function ProgrammeCard({ area }: { area: ProgrammeArea }) {
  return (
    <article className="group overflow-hidden rounded-md border border-[#eadfcb] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="h-40 overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-no-repeat transition duration-500 group-hover:scale-105"
          style={{
            backgroundImage: "url('/programme-photos.png')",
            backgroundPosition: area.position,
            backgroundSize: "300% 200%",
          }}
          role="img"
          aria-label={`${area.title} programme photograph`}
        />
      </div>

      <div className="relative px-5 pb-5 pt-8">
        <div className="absolute -top-7 left-5 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[var(--lifespring-burgundy)] text-[var(--lifespring-gold-soft)] shadow-md">
          <MiniIcon name={area.icon} />
        </div>
        <div className="absolute left-20 top-4 h-1 w-28 rounded-full bg-[var(--lifespring-gold)]" />

        <h3 className="text-lg font-extrabold text-[var(--lifespring-burgundy)]">
          {area.title}
        </h3>
        <p className="mt-3 min-h-24 text-sm leading-6 text-[var(--lifespring-muted)]">
          {area.text}
        </p>
        <Link
          to={area.to}
          className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--lifespring-burgundy)]"
        >
          Learn More <ArrowIcon />
        </Link>
      </div>
    </article>
  );
}

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[var(--lifespring-ivory)] text-[var(--lifespring-text)]">
      <section className="relative min-h-[620px] overflow-hidden bg-[var(--lifespring-burgundy)] text-white lg:min-h-[650px]">
        <div className="hero-gold-curve absolute inset-y-0 left-[43%] z-10 hidden w-[58%] bg-[var(--lifespring-gold)] lg:block" />
        <div className="hero-image-curve absolute inset-y-0 right-0 z-20 hidden w-[56%] overflow-hidden lg:block">
          <img
            src="/hero-hands.png"
            alt="Hands reaching toward each other in a gesture of support"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="site-shell relative z-30 grid min-h-[620px] items-center py-14 lg:min-h-[650px] lg:grid-cols-[48%_52%]">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.34em] text-[#f1d79f]">
              Empowering Dreams, Building Futures
            </p>
            <div className="mt-4 h-1 w-12 bg-[var(--lifespring-gold)]" />

            <h1 className="display-serif mt-7 text-[2.5rem] font-bold leading-[1.06] md:text-[4rem] xl:text-[5.4rem]">
              Restoring <span className="block sm:inline">Hope.</span>
              <br />
              Empowering Futures.
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-[#fff4dd] md:text-lg">
              LIFESPRING HUMANITARIAN FOUNDATION supports individuals,
              families, and communities through education, humanitarian relief,
              healthcare support, empowerment, and sustainable development
              initiatives.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap lg:flex-nowrap">
              <Link
                to="/donate"
                className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-[var(--lifespring-gold)] px-4 py-4 text-sm font-bold text-[var(--lifespring-burgundy-dark)] transition hover:bg-[var(--lifespring-gold-soft)] sm:w-auto"
              >
                Donate Now <ArrowIcon />
              </Link>
              <Link
                to="/support-request"
                className="inline-flex w-full items-center justify-center gap-3 rounded-md border border-white/55 px-4 py-4 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto"
              >
                Get Involved <ArrowIcon />
              </Link>
              <Link
                to="/programs"
                className="inline-flex w-full items-center justify-center gap-3 rounded-md border border-white/55 px-4 py-4 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto"
              >
                Explore Our Programmes <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-30 h-72 lg:hidden">
          <img
            src="/hero-hands.png"
            alt="Hands reaching toward each other in a gesture of support"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="border-b border-[#eadfcb] bg-white">
        <div className="site-shell grid gap-8 py-7 md:grid-cols-3">
          <div className="flex items-center gap-4 md:justify-center">
            <ContactIcon>
              <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="2" />
                <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </ContactIcon>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--lifespring-gold)]">
                Website
              </p>
              <p className="mt-1 font-semibold">www.lifespringhf.org</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-[#eadfcb] md:justify-center md:border-x">
            <ContactIcon>
              <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeWidth="2" />
                <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="2" />
              </svg>
            </ContactIcon>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--lifespring-gold)]">
                Email
              </p>
              <p className="mt-1 font-semibold">info@lifespringhf.org</p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:justify-center">
            <ContactIcon>
              <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path d="M8 5c.5 5.5 5.5 10.5 11 11l-2.5 3C9.5 18 6 14.5 5 7.5L8 5Z" stroke="currentColor" strokeWidth="2" />
              </svg>
            </ContactIcon>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--lifespring-gold)]">
                Phone
              </p>
              <p className="mt-1 font-semibold">+2349053646313</p>
            </div>
          </div>
        </div>
      </section>

      <section className="site-shell grid gap-10 py-14 lg:grid-cols-[20%_1fr] lg:py-20">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--lifespring-gold)]">
            Programme Areas
          </p>
          <div className="mt-3 h-1 w-10 bg-[var(--lifespring-gold)]" />
          <h2 className="mt-5 text-3xl font-extrabold leading-tight lg:text-4xl">
            Practical support for urgent needs and future opportunity
          </h2>
          <p className="mt-5 text-sm leading-7 text-[var(--lifespring-muted)]">
            LIFESPRING HUMANITARIAN FOUNDATION works across education, relief,
            healthcare, empowerment, and community development to help people
            move forward with dignity.
          </p>
          <Link
            to="/programs"
            className="mt-7 inline-flex items-center gap-3 rounded-md bg-[var(--lifespring-burgundy)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--lifespring-burgundy-dark)]"
          >
            View All Programmes <ArrowIcon />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {programmeAreas.map((area) => (
            <ProgrammeCard key={area.title} area={area} />
          ))}
        </div>
      </section>
    </main>
  );
}

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[var(--lifespring-burgundy-dark)] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.3fr_0.8fr_1fr] md:items-end">
        <div>
          <div className="flex items-center gap-4">
            <img
              src="/lifespring-emblem.png"
              alt="LIFESPRING HUMANITARIAN FOUNDATION emblem"
              className="h-14 w-14 rounded-full bg-white object-contain p-1"
            />
            <div>
              <h2 className="text-lg font-extrabold tracking-wide">
                LIFESPRING HUMANITARIAN FOUNDATION
              </h2>
              <p className="mt-1 text-sm text-[#f1d79f]">
                Restoring Hope. Empowering Futures.
              </p>
              <p className="mt-2 max-w-xl text-sm text-[#fff4dd]">
                Lifespring Humanitarian Foundation — a humanitarian initiative
                of Christ Warriors.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px w-24 bg-[var(--lifespring-gold)]" />
            <div className="flex items-center gap-2 text-xs text-[#d9c8a5]">
              <img
                src="/logo.png"
                alt="Christ Warriors logo"
                className="h-8 w-8 rounded-full bg-white object-contain p-0.5 opacity-90"
              />
              <span>Christ Warriors</span>
            </div>
          </div>
        </div>

        <nav className="space-y-2 text-sm text-[#fff4dd]" aria-label="Governance links">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#f1d79f]">
            Governance
          </h2>
          <Link className="block hover:text-white" to="/governance">
            Governance & Policies
          </Link>
          <Link className="block hover:text-white" to="/governance/safeguarding">
            Safeguarding
          </Link>
          <Link className="block hover:text-white" to="/complaints">
            Make a Complaint
          </Link>
          <Link className="block hover:text-white" to="/report-a-concern">
            Report a Concern
          </Link>
          <Link className="block hover:text-white" to="/governance/privacy">
            Privacy
          </Link>
        </nav>

        <div className="space-y-2 text-sm text-[#fff4dd] md:text-right">
          <p>www.lifespringhf.org</p>
          <p>info@lifespringhf.org</p>
          <p>+2349053646313</p>
          <p className="pt-3 text-xs text-[#d9c8a5]">
            (c) 2026 LIFESPRING HUMANITARIAN FOUNDATION. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

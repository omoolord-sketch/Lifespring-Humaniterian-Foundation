import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/programs", label: "Our Programmes" },
  { to: "/scholarship", label: "Scholarships" },
  { to: "/support-request", label: "Community Support" },
  { to: "/donate", label: "Get Involved" },
  { to: "/governance", label: "Governance" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `block text-sm font-semibold transition ${
      isActive
        ? "text-[var(--lifespring-burgundy)]"
        : "text-[var(--lifespring-text)] hover:text-[var(--lifespring-burgundy)]"
    }`;

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--lifespring-ivory)]/95 backdrop-blur">
      <div className="bg-[var(--lifespring-burgundy-dark)] text-white">
        <div className="site-shell flex items-center justify-center gap-4 py-2 text-[10px] font-semibold sm:text-xs md:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-8">
            <span className="text-[#f1d79f]">www.lifespringhf.org</span>
            <span className="text-[#f1d79f]">info@lifespringhf.org</span>
            <span>+2349053646313</span>
          </div>
          <div className="hidden items-center gap-4 md:flex" aria-label="Social links">
            <span>f</span>
            <span>x</span>
            <span>ig</span>
            <span>in</span>
          </div>
        </div>
      </div>

      <div className="border-b border-[#eadfcb] bg-[var(--lifespring-ivory)]">
      <div className="site-shell py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3"
          >
            <img
              src="/lifespring-emblem.png"
              alt="LIFESPRING HUMANITARIAN FOUNDATION logo"
              className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
            />

            <div className="min-w-0 max-w-[190px] sm:max-w-none">
              <p className="truncate text-xs font-extrabold tracking-wide text-[var(--lifespring-burgundy)] sm:text-lg">
                LIFESPRING HUMANITARIAN FOUNDATION
              </p>
              <p className="text-xs font-medium text-[var(--lifespring-muted)]">
                Restoring Hope. Empowering Futures.
              </p>
              <p className="hidden text-[11px] font-medium text-[var(--lifespring-burgundy)]/80 sm:block">
                A humanitarian initiative of Christ Warriors
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            ))}

            <Link
              to="/donate"
              className="rounded-md bg-[var(--lifespring-burgundy)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--lifespring-burgundy-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lifespring-gold)]"
            >
              Donate
            </Link>
          </nav>

          <button
            type="button"
            className="shrink-0 rounded-md border border-[#d9c8a5] px-3 py-2 text-sm font-bold text-[var(--lifespring-burgundy)] lg:hidden"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        {menuOpen && (
          <div className="mt-4 rounded-md border border-[#eadfcb] bg-white p-4 shadow-sm lg:hidden">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navClass}
                  onClick={closeMenu}
                >
                  {item.label}
                </NavLink>
              ))}

              <Link
                to="/donate"
                onClick={closeMenu}
                className="rounded-md bg-[var(--lifespring-burgundy)] px-4 py-3 text-center text-sm font-bold text-white"
              >
                Donate
              </Link>
            </div>
          </div>
        )}
      </div>
      </div>
    </header>
  );
}

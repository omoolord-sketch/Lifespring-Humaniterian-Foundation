import { useState } from "react";
import type { FormEvent } from "react";
import { apiUrl, readApiMessage } from "../lib/api";

export default function DonatePage() {
  const [selectedArea, setSelectedArea] = useState("Educational Support");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  function handleDonate(area: string) {
    setSelectedArea(area);
    document.getElementById("donation-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setStatusMessage("");
    setIsSuccess(false);

    try {
      const form = event.currentTarget;
      const payload = Object.fromEntries(new FormData(form).entries());

      const response = await fetch(apiUrl("/api/donation-intent"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const message = await readApiMessage(response);

      if (!response.ok) {
        throw new Error(message || "Failed to submit donation pledge");
      }

      setIsSuccess(true);
      setStatusMessage(message);
      form.reset();
      setSelectedArea("Educational Support");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting the donation pledge.";
      setIsSuccess(false);
      setStatusMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-[var(--lifespring-burgundy-dark)] text-white">
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f1d79f]">
            Sponsor / Donate
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            Support education, widow care, and widower welfare
          </h1>

          <p className="mt-5 text-lg leading-8 text-[#fff4dd]">
            Your support helps vulnerable individuals and families through
            educational assistance, welfare support, compassionate outreach, and
            humanitarian community care.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Sponsor a Student</h2>
            <p className="mt-3 leading-7 text-[#fff4dd]">
              Help cover school fees, books, uniforms, and exam support.
            </p>
            <button
              onClick={() => handleDonate("Educational Support")}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[var(--lifespring-burgundy)]"
            >
              Support Education
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Support a Widow</h2>
            <p className="mt-3 leading-7 text-[#fff4dd]">
              Provide welfare support and compassionate care for widows in need.
            </p>
            <button
              onClick={() => handleDonate("Widow Support")} 
              className="mt-6 rounded-2xl bg-white px-5 py-3 font-semibold text-[var(--lifespring-burgundy-dark)]">
              Support Widows
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Support a Widower</h2>
            <p className="mt-3 leading-7 text-[#fff4dd]">
              Help widowers through practical assistance and community support.
            </p>
            <button 
              onClick={() => handleDonate("Widower Support")}
              className="mt-6 rounded-2xl bg-white px-5 py-3 font-semibold text-[var(--lifespring-burgundy-dark)]">
              Support Widowers
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 ring-1 ring-white/10">
            <h2 className="text-xl font-semibold">General Giving</h2>
            <p className="mt-3 leading-7 text-[#fff4dd]">
              Give toward the broader mission wherever support is most needed.
            </p>
            <button 
              onClick={() => handleDonate("General Mission Support")}
              className="mt-6 rounded-2xl bg-white px-5 py-3 font-semibold text-[var(--lifespring-burgundy-dark)]">
              Give to the Mission
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white text-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-20 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--lifespring-burgundy)]">
              Why give
            </p>

            <h2 className="mt-4 text-3xl font-bold">
              Your donation creates direct and meaningful impact
            </h2>

            <p className="mt-4 leading-8 text-slate-700">
              LIFESPRING HUMANITARIAN FOUNDATION uses donor support to
              strengthen education, relieve hardship, and care for vulnerable
              people within the community.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900">Educational Aid</h3>
                <p className="mt-2 text-slate-600 leading-7">
                  Scholarships, tuition support, books, uniforms, and school needs.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900">Widow Welfare</h3>
                <p className="mt-2 text-slate-600 leading-7">
                  Relief support, care outreach, and compassionate welfare assistance.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900">Widower Support</h3>
                <p className="mt-2 text-slate-600 leading-7">
                  Practical care, community support, and dignity-restoring assistance.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div
              id="donation-form"
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--lifespring-burgundy)]">
                Donation Form
              </p>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                Make a contribution
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Share your pledge details and the foundation will follow up
                with the safest available giving method.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Support Area
                  </label>
                  <select
                    name="supportArea"
                    value={selectedArea}
                    onChange={(event) => setSelectedArea(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  >
                    <option>Educational Support</option>
                    <option>Widow Support</option>
                    <option>Widower Support</option>
                    <option>General Mission Support</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    min="1"
                    step="0.01"
                    placeholder="Enter donation amount"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                    required
                  />
                </div>

                {statusMessage && (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                      isSuccess
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {statusMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-[var(--lifespring-burgundy)] px-6 py-3 font-semibold text-white hover:bg-[var(--lifespring-burgundy-dark)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Submitting..." : "Submit Donation Pledge"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

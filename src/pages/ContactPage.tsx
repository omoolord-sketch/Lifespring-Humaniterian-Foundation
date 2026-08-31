import { useState } from "react";
import type { FormEvent } from "react";
import { apiUrl, readApiMessage } from "../lib/api";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setStatusMessage("");
    setIsSuccess(false);

    try {
      const form = event.currentTarget;
      const payload = Object.fromEntries(new FormData(form).entries());

      const response = await fetch(apiUrl("/api/contact"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const message = await readApiMessage(response);

      if (!response.ok) {
        throw new Error(message || "Failed to send message");
      }

      setIsSuccess(true);
      setStatusMessage(message);
      form.reset();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while sending the message.";
      setIsSuccess(false);
      setStatusMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-20 text-[var(--lifespring-text)]">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--lifespring-burgundy)]">
          Contact
        </p>

        <h1 className="mt-4 text-4xl font-bold text-slate-900">
          Get in touch with LIFESPRING HUMANITARIAN FOUNDATION
        </h1>

        <p className="mt-4 text-slate-700 leading-8">
          Reach out for scholarship enquiries, sponsorship questions, partnership
          opportunities, or general support.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Contact Details
            </h2>

            <div className="mt-4 space-y-3 text-slate-700">
              <p>
                <span className="font-semibold">Email:</span>{" "}
                info@lifespringhf.org
              </p>
              <p>
                <span className="font-semibold">Phone:</span> +2349053646313
              </p>
              <p>
                <span className="font-semibold">Website:</span>{" "}
                www.lifespringhf.org
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-[var(--lifespring-burgundy)] p-6 text-white">
            <h2 className="text-xl font-semibold">Office Hours</h2>
            <p className="mt-3 text-[#fff4dd] leading-7">
              Monday to Friday: 9:00 AM - 5:00 PM
            </p>
            <p className="mt-2 text-[#fff4dd] leading-7">
              Saturday and Sunday: Closed
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Send a Message</h2>
          <p className="mt-3 text-slate-600 leading-7">
            Fill in the form below and the foundation will respond as soon as
            possible.
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
                Subject
              </label>
              <input
                type="text"
                name="subject"
                placeholder="Enter message subject"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Message
              </label>
              <textarea
                rows={6}
                name="message"
                placeholder="Write your message here"
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
              className="rounded-2xl bg-[var(--lifespring-burgundy)] px-6 py-3 font-semibold text-white hover:bg-[var(--lifespring-burgundy-dark)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

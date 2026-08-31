import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiUrl, readApiMessage } from "../lib/api";

export default function ComplaintsPage() {
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
      const formData = new FormData(form);
      const response = await fetch(apiUrl("/api/complaints"), {
        method: "POST",
        body: formData,
      });
      const message = await readApiMessage(response);

      if (!response.ok) {
        throw new Error(message || "Failed to submit complaint");
      }

      setIsSuccess(true);
      setStatusMessage(message);
      form.reset();
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting the complaint."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="site-shell py-16 text-[var(--lifespring-text)]">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--lifespring-burgundy)]">
          Feedback
        </p>
        <h1 className="mt-4 text-4xl font-extrabold">Make a Complaint</h1>
        <p className="mt-5 leading-8 text-[var(--lifespring-muted)]">
          Use this form to raise a complaint or provide feedback about a
          Lifespring service, application, programme or representative.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="mt-10 grid gap-5 rounded-md border border-[#eadfcb] bg-white p-6 shadow-sm md:grid-cols-2 md:p-8"
      >
        {[
          ["Name", "name", "text"],
          ["Email", "email", "email"],
          ["Phone", "phone", "tel"],
          ["Application / Beneficiary Reference if applicable", "reference", "text"],
        ].map(([label, name, type]) => (
          <label key={name} className="block text-sm font-semibold text-[var(--lifespring-text)]">
            {label}
            <input
              type={type}
              name={name}
              className="mt-2 w-full rounded-md border border-[#d9c8a5] px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
              required={name !== "reference"}
            />
          </label>
        ))}

        <label className="block text-sm font-semibold text-[var(--lifespring-text)]">
          Relationship to Foundation
          <input
            name="relationship"
            className="mt-2 w-full rounded-md border border-[#d9c8a5] px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
            required
          />
        </label>

        <label className="block text-sm font-semibold text-[var(--lifespring-text)]">
          Complaint Category
          <select
            name="category"
            className="mt-2 w-full rounded-md border border-[#d9c8a5] px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
            required
          >
            <option value="">Select category</option>
            <option>Application Process</option>
            <option>Programme Delivery</option>
            <option>Staff or Volunteer Conduct</option>
            <option>Safeguarding</option>
            <option>Data or Privacy</option>
            <option>Other</option>
          </select>
        </label>

        <label className="block text-sm font-semibold text-[var(--lifespring-text)] md:col-span-2">
          Complaint Details
          <textarea
            name="details"
            rows={6}
            className="mt-2 w-full rounded-md border border-[#d9c8a5] px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
            required
          />
        </label>

        <label className="block text-sm font-semibold text-[var(--lifespring-text)] md:col-span-2">
          Desired Resolution
          <textarea
            name="desiredResolution"
            rows={4}
            className="mt-2 w-full rounded-md border border-[#d9c8a5] px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
            required
          />
        </label>

        <label className="block text-sm font-semibold text-[var(--lifespring-text)] md:col-span-2">
          Attachment
          <input
            type="file"
            name="attachment"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="mt-2 w-full rounded-md border border-[#d9c8a5] px-4 py-3"
          />
        </label>

        <label className="flex gap-3 text-sm leading-6 text-[var(--lifespring-muted)] md:col-span-2">
          <input type="checkbox" name="privacyAccepted" required className="mt-1 h-4 w-4" />
          <span>
            I confirm that I have read the{" "}
            <Link
              to="/governance/privacy"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-[var(--lifespring-burgundy)]"
            >
              Privacy & Data Protection Policy
            </Link>{" "}
            and consent to Lifespring using this information to review my
            complaint.
          </span>
        </label>

        {statusMessage && (
          <div
            className={`rounded-md px-4 py-3 text-sm font-semibold md:col-span-2 ${
              isSuccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {statusMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-[var(--lifespring-burgundy)] px-6 py-3 font-bold text-white hover:bg-[var(--lifespring-burgundy-dark)] disabled:opacity-70 md:w-fit"
        >
          {isSubmitting ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
    </main>
  );
}

import { useState } from "react";
import type { FormEvent } from "react";
import { apiUrl, readApiMessage } from "../lib/api";

const categories = [
  "Safeguarding Concern",
  "Fraud or Financial Misconduct",
  "Bribery or Corruption",
  "Harassment or Abuse",
  "Conflict of Interest",
  "Misuse of Foundation Resources",
  "Data/Privacy Concern",
  "Other",
];

export default function ReportConcernPage() {
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
      const response = await fetch(apiUrl("/api/report-a-concern"), {
        method: "POST",
        body: formData,
      });
      const message = await readApiMessage(response);

      if (!response.ok) {
        throw new Error(message || "Failed to submit concern");
      }

      setIsSuccess(true);
      setStatusMessage(message);
      form.reset();
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting the concern."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="site-shell py-16 text-[var(--lifespring-text)]">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[var(--lifespring-burgundy)]">
          Speak Up
        </p>
        <h1 className="mt-4 text-4xl font-extrabold">Report a Concern</h1>
        <p className="mt-5 leading-8 text-[var(--lifespring-muted)]">
          Report safeguarding, fraud, bribery, harassment, conflict of interest,
          misuse of resources, privacy or other serious concerns connected with
          Lifespring Humanitarian Foundation.
        </p>
        <div className="mt-6 rounded-md border border-[#d9c8a5] bg-[#fff7e6] p-4 font-semibold text-[var(--lifespring-burgundy)]">
          If someone is in immediate danger, contact the appropriate emergency
          or statutory authority. This form is not an emergency service.
        </div>
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
          ["Relationship to Foundation", "relationship", "text"],
          ["People involved", "peopleInvolved", "text"],
          ["Date of incident", "incidentDate", "date"],
          ["Location", "location", "text"],
        ].map(([label, name, type]) => (
          <label key={name} className="block text-sm font-semibold text-[var(--lifespring-text)]">
            {label}
            <input
              type={type}
              name={name}
              className="mt-2 w-full rounded-md border border-[#d9c8a5] px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
            />
          </label>
        ))}

        <label className="block text-sm font-semibold text-[var(--lifespring-text)]">
          Concern Category
          <select
            name="category"
            className="mt-2 w-full rounded-md border border-[#d9c8a5] px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
            required
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-[var(--lifespring-text)]">
          Is anyone currently at immediate risk?
          <select
            name="immediateRisk"
            className="mt-2 w-full rounded-md border border-[#d9c8a5] px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
            required
          >
            <option value="">Select answer</option>
            <option>Yes</option>
            <option>No</option>
            <option>Not sure</option>
          </select>
        </label>

        <label className="block text-sm font-semibold text-[var(--lifespring-text)] md:col-span-2">
          Description
          <textarea
            name="description"
            rows={7}
            className="mt-2 w-full rounded-md border border-[#d9c8a5] px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
            required
          />
        </label>

        <label className="block text-sm font-semibold text-[var(--lifespring-text)] md:col-span-2">
          Supporting Document
          <input
            type="file"
            name="attachment"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="mt-2 w-full rounded-md border border-[#d9c8a5] px-4 py-3"
          />
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
          {isSubmitting ? "Submitting..." : "Submit Concern"}
        </button>
      </form>
    </main>
  );
}

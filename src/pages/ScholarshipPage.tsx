import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiUrl, readApiMessage } from "../lib/api";
import { findPolicyById } from "../data/policies";

const scholarshipCode = findPolicyById("SCHOLARSHIP_CODE");
const privacyPolicy = findPolicyById("PRIVACY");

export default function ScholarshipPage() {
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

      const response = await fetch(apiUrl("/api/scholarship"), {
        method: "POST",
        body: formData,
      });

      const message = await readApiMessage(response);

      if (!response.ok) {
        throw new Error(message || "Failed to submit application");
      }

      setIsSuccess(true);
      setStatusMessage(message);
      form.reset();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting the application.";
      setIsSuccess(false);
      setStatusMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-20">
      <div className="max-w-3xl mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--lifespring-burgundy)]">
          Scholarship Application
        </p>

        <h1 className="mt-4 text-4xl font-bold text-slate-900">
          Apply for educational support
        </h1>

        <p className="mt-4 text-slate-700 leading-8">
          This application is for students requesting educational support from
          LIFESPRING HUMANITARIAN FOUNDATION. This scholarship is strictly for
          primary school pupils. Please fill in your details carefully and
          upload the current bill and report card of the beneficiary.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter first name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Address
                </label>
                <input
                  type="text"
                  name="homeAddress"
                  placeholder="Enter home address"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  name="guardianName"
                  placeholder="Enter parent or guardian name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Parent / Guardian Email
                </label>
                <input
                  type="email"
                  name="guardianEmail"
                  placeholder="Enter parent or guardian email"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Parent / Guardian Phone Number
                </label>
                <input
                  type="tel"
                  name="guardianPhone"
                  placeholder="Enter parent or guardian phone number"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Parent / Guardian Occupation
                </label>
                <input
                  type="text"
                  name="guardianOccupation"
                  placeholder="Enter parent or guardian occupation"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Parent / Guardian Monthly Income
                </label>
                <input
                  type="text"
                  name="guardianMonthlyIncome"
                  placeholder="Enter monthly income"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div className="md:col-span-2 rounded-2xl border border-[#d9c8a5] bg-[#fff7e6] p-4">
                <label className="flex gap-3 text-sm font-semibold leading-6 text-[var(--lifespring-burgundy)]">
                  <input
                    type="checkbox"
                    name="primarySchoolOnlyAcknowledged"
                    value="accepted"
                    required
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    I understand that this scholarship is strictly for primary
                    school pupils.
                  </span>
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Name of Beneficiary School
                </label>
                <input
                  type="text"
                  name="schoolName"
                  placeholder="Enter school name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Current Class of Beneficiary
                </label>
                <input
                  type="text"
                  name="classLevel"
                  placeholder="Enter class or level"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  School Location
                </label>
                <input
                  type="text"
                  name="schoolLocation"
                  placeholder="Enter school location"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  School Phone Number
                </label>
                <input
                  type="tel"
                  name="schoolPhone"
                  placeholder="Enter school phone number"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  School Address
                </label>
                <input
                  type="text"
                  name="schoolAddress"
                  placeholder="Enter school address"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  School Contact Person Name
                </label>
                <input
                  type="text"
                  name="schoolContactPerson"
                  placeholder="Enter school contact person name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Give a Summary on Why You Need the Scholarship
                </label>
                <textarea
                  rows={6}
                  name="academicNeed"
                  placeholder="Explain your academic need and why you are requesting support"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-8">
              <h2 className="text-xl font-semibold text-slate-900">
                Required Uploads
              </h2>
              <p className="mt-2 text-slate-600 leading-7">
                Attach the current bill and report card of the beneficiary.
                You may also upload a passport photograph and any additional
                supporting document for review.
              </p>

              <div className="mt-6 grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Passport Photograph
                  </label>
                  <input
                    type="file"
                    name="passportPhoto"
                    accept="image/*"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Current Report Card of Beneficiary
                  </label>
                  <input
                    type="file"
                    name="termResult"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Current Bill of Beneficiary
                  </label>
                  <input
                    type="file"
                    name="currentBill"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-700"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Additional Supporting Document
                  </label>
                  <input
                    type="file"
                    name="supportingDocument"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-8">
              <h2 className="text-xl font-semibold text-slate-900">
                Applicant Declarations
              </h2>
              <p className="mt-2 leading-7 text-slate-600">
                Please read each declaration carefully. These acknowledgements
                are recorded with the policy version that applies when you
                submit the application.
              </p>

              <input
                type="hidden"
                name="scholarshipCodePolicyId"
                value={scholarshipCode?.id ?? "SCHOLARSHIP_CODE"}
              />
              <input
                type="hidden"
                name="scholarshipCodePolicyVersion"
                value={scholarshipCode?.version ?? "1.0"}
              />
              <input
                type="hidden"
                name="privacyPolicyId"
                value={privacyPolicy?.id ?? "PRIVACY"}
              />
              <input
                type="hidden"
                name="privacyPolicyVersion"
                value={privacyPolicy?.version ?? "1.0"}
              />

              <div className="mt-5 space-y-4">
                <label className="flex gap-3 text-sm leading-6 text-slate-700">
                  <input
                    type="checkbox"
                    name="truthDeclaration"
                    value="accepted"
                    required
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    I confirm that the information provided in this application
                    is true and accurate to the best of my knowledge.
                  </span>
                </label>

                <label className="flex gap-3 text-sm leading-6 text-slate-700">
                  <input
                    type="checkbox"
                    name="codeOfConductAccepted"
                    value="accepted"
                    required
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    I have read and agree to comply with the Lifespring
                    Humanitarian Foundation{" "}
                    <Link
                      to="/governance/scholarship-code-of-conduct"
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[var(--lifespring-burgundy)]"
                    >
                      Code of Conduct
                    </Link>{" "}
                    for Scholarship Applicants, Beneficiaries, Parents and
                    Guardians.
                  </span>
                </label>

                <label className="flex gap-3 text-sm leading-6 text-slate-700">
                  <input
                    type="checkbox"
                    name="verificationAcknowledged"
                    value="accepted"
                    required
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    I acknowledge that Lifespring Humanitarian Foundation may
                    reasonably verify information provided in this application
                    for assessment, monitoring and safeguarding purposes.
                  </span>
                </label>

                <label className="flex gap-3 text-sm leading-6 text-slate-700">
                  <input
                    type="checkbox"
                    name="privacyPolicyAccepted"
                    value="accepted"
                    required
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    I have read the{" "}
                    <Link
                      to="/governance/privacy"
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[var(--lifespring-burgundy)]"
                    >
                      Privacy & Data Protection Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>
            </div>

            {statusMessage && (
              <div
                className={`mt-6 rounded-2xl px-4 py-3 text-sm font-medium ${
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
              className="mt-8 rounded-2xl bg-[var(--lifespring-burgundy)] px-6 py-3 font-semibold text-white hover:bg-[var(--lifespring-burgundy-dark)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>

        <div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Application Guide
            </h2>

            <ul className="mt-4 space-y-4 text-slate-600 leading-7">
              <li>Fill in all personal, guardian, and school details correctly.</li>
              <li>Upload a clear passport photograph.</li>
              <li>Attach your previous term result.</li>
              <li>Payment receipt is helpful but optional.</li>
              <li>Use truthful and accurate information only.</li>
            </ul>
          </div>

          <div className="mt-6 rounded-3xl bg-[var(--lifespring-burgundy)] p-6 text-white">
            <h2 className="text-xl font-semibold">Important Note</h2>
            <p className="mt-3 leading-7 text-[#fff4dd]">
              Applications may be reviewed through the contact details of the
              school and parent or guardian provided.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

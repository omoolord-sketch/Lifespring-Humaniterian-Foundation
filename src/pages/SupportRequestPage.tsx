import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiUrl, readApiMessage } from "../lib/api";
import { findPolicyById } from "../data/policies";

const communityCode = findPolicyById("COMMUNITY_SUPPORT_CODE");
const privacyPolicy = findPolicyById("PRIVACY");

export default function SupportRequestPage() {
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
      const payload = Object.fromEntries(formData.entries());

      const response = await fetch(apiUrl("/api/support-request"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const message = await readApiMessage(response);

      if (!response.ok) {
        throw new Error(message || "Failed to submit support request");
      }

      setIsSuccess(true);
      setStatusMessage(message);
      form.reset();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting the support request.";
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
          Community Support Application
        </p>

        <h1 className="mt-4 text-4xl font-bold text-slate-900">
          Apply for community and welfare support
        </h1>

        <p className="mt-4 text-slate-700 leading-8">
          This application form is for individuals seeking welfare, family, or
          community support from LIFESPRING HUMANITARIAN FOUNDATION. Please choose the
          type of support you are applying for and provide accurate details.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
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

              <div className="md:col-span-2">
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
                  Support Category
                </label>
                <select
                  name="supportCategory"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                >
                  <option value="">Select support category</option>
                  <option>Widow Support</option>
                  <option>Widower Support</option>
                  <option>Humanitarian Relief</option>
                  <option>Healthcare Support</option>
                  <option>Women & Youth Empowerment</option>
                  <option>Counselling</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter location"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Home Address
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
                  Describe the Support Needed
                </label>
                <textarea
                  rows={6}
                  name="supportNeeded"
                  placeholder="Explain the kind of help needed"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[var(--lifespring-gold)]"
                  required
                />
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-8">
              <h2 className="text-xl font-semibold text-slate-900">
                Applicant Declarations
              </h2>
              <p className="mt-2 leading-7 text-slate-600">
                Please read each declaration carefully. These acknowledgements
                are recorded with the policy version that applies when you
                submit the request.
              </p>

              <input
                type="hidden"
                name="communityCodePolicyId"
                value={communityCode?.id ?? "COMMUNITY_SUPPORT_CODE"}
              />
              <input
                type="hidden"
                name="communityCodePolicyVersion"
                value={communityCode?.version ?? "1.0"}
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
                      to="/governance/community-support-code-of-conduct"
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[var(--lifespring-burgundy)]"
                    >
                      Code of Conduct
                    </Link>{" "}
                    for Community Support Applicants and Beneficiaries.
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
              className="mt-6 rounded-2xl bg-[var(--lifespring-burgundy)] px-6 py-3 font-semibold text-white hover:bg-[var(--lifespring-burgundy-dark)] disabled:cursor-not-allowed disabled:opacity-70"
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
              <li>Select the correct support category.</li>
              <li>Provide accurate contact and address details.</li>
              <li>Clearly explain the help being requested.</li>
              <li>The foundation may contact you for follow-up.</li>
            </ul>
          </div>

          <div className="mt-6 rounded-3xl bg-[var(--lifespring-burgundy)] p-6 text-white">
            <h2 className="text-xl font-semibold">Available Support Areas</h2>
            <p className="mt-3 leading-7 text-[#fff4dd]">
              Applications can be made for widow support, widower support,
              humanitarian relief, healthcare support, empowerment support, and
              counselling.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export type PolicySection = {
  heading: string;
  body: string[];
};

export type Policy = {
  id: string;
  title: string;
  path: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  intro: string;
  sections: PolicySection[];
};

const standardProtection =
  "Nothing in this policy prevents any person from making a genuine complaint, raising a safeguarding concern, reporting suspected misconduct, whistleblowing, or exercising any right available under applicable law.";

export const policies: Policy[] = [
  {
    id: "BOARD_CODE",
    title: "Code of Conduct - Board Members",
    path: "/governance/board-code-of-conduct",
    version: "1.0",
    effectiveDate: "21 August 2026",
    lastUpdated: "21 August 2026",
    intro:
      "This Code sets out the standards expected of trustees and board members acting for Lifespring Humanitarian Foundation.",
    sections: [
      {
        heading: "Purpose",
        body: [
          "Board members are expected to provide responsible leadership, act in the best interests of the Foundation, and protect the dignity of beneficiaries, applicants, donors, staff, volunteers and partners.",
        ],
      },
      {
        heading: "Integrity, Stewardship and Accountability",
        body: [
          "Board members must act honestly, avoid misuse of funds or influence, make decisions with care, and support transparent governance.",
          "Foundation resources, information and authority must be used only for legitimate Foundation purposes.",
        ],
      },
      {
        heading: "Conflicts of Interest",
        body: [
          "Actual, potential or perceived conflicts must be disclosed promptly. Affected board members should withdraw from discussions or decisions where their independence could reasonably be questioned.",
        ],
      },
      {
        heading: "Safeguarding and Respect",
        body: [
          "Board members must promote a culture that protects children and vulnerable persons from abuse, exploitation, harassment and neglect.",
          "They must treat all people with dignity and must not tolerate discrimination, intimidation or retaliation.",
        ],
      },
      {
        heading: "Confidentiality and Reporting",
        body: [
          "Confidential information must be handled carefully and shared only with people who have a legitimate need to know.",
          "Concerns about fraud, safeguarding, serious misconduct or governance failures should be reported through the appropriate Foundation channel.",
          standardProtection,
        ],
      },
    ],
  },
  {
    id: "SCHOLARSHIP_CODE",
    title:
      "Code of Conduct - Scholarship Applicants, Beneficiaries, Parents & Guardians",
    path: "/governance/scholarship-code-of-conduct",
    version: "1.0",
    effectiveDate: "21 August 2026",
    lastUpdated: "21 August 2026",
    intro:
      "This Code applies to scholarship applicants, beneficiaries, parents and guardians participating in Lifespring Humanitarian Foundation education support.",
    sections: [
      {
        heading: "Purpose",
        body: [
          "The Code helps ensure scholarship support is delivered fairly, responsibly and for its intended educational purpose.",
        ],
      },
      {
        heading: "Integrity and Respect",
        body: [
          "Applicants, beneficiaries, parents and guardians should communicate respectfully with Foundation representatives, schools, volunteers and other beneficiaries.",
          "Harassment, threats, abuse, intimidation or discriminatory conduct may lead to review of an application or support arrangement.",
        ],
      },
      {
        heading: "Responsible Communication",
        body: [
          "Communication with the Foundation should be truthful, proportionate and respectful. Legitimate complaints, safeguarding disclosures and whistleblowing are protected and will not be treated as misconduct merely because they criticise the Foundation.",
          standardProtection,
        ],
      },
      {
        heading: "Use of the Foundation's Name and Identity",
        body: [
          "Applicants and beneficiaries must not misuse the Lifespring name, logo, documents, letters or identity to raise funds, make promises, obtain goods, or represent the Foundation without written permission.",
        ],
      },
      {
        heading: "Accurate and Truthful Information",
        body: [
          "All information and documents submitted must be accurate to the best of the applicant's knowledge. Forged, altered, misleading or incomplete information may affect eligibility.",
        ],
      },
      {
        heading: "Scholarship Eligibility and Ongoing Responsibility",
        body: [
          "Beneficiaries must remain eligible under the programme criteria and promptly inform the Foundation of material changes affecting school enrolment, contact details, financial need or guardian information.",
        ],
      },
      {
        heading: "Monitoring and Verification",
        body: [
          "The Foundation may reasonably verify application information, school attendance, academic progress and use of support for assessment, monitoring, safeguarding and accountability purposes.",
        ],
      },
      {
        heading: "Attendance and Educational Progress Where Applicable",
        body: [
          "Beneficiaries should attend school regularly, participate in learning, and provide reasonable updates where requested. The Foundation recognises that illness, family circumstances and other hardship may affect attendance or progress.",
        ],
      },
      {
        heading: "Use of Scholarship Support",
        body: [
          "Scholarship funds or materials must be used for the approved purpose, such as school fees, books, uniforms, examination costs, learning materials or other agreed educational needs.",
        ],
      },
      {
        heading: "Cooperation with Reasonable Monitoring",
        body: [
          "Applicants, beneficiaries, parents and guardians should cooperate with reasonable checks, requests for updates and programme reviews, provided these are conducted respectfully and lawfully.",
        ],
      },
      {
        heading: "Protection of Foundation Property and Reputation",
        body: [
          "Foundation property, documents and communications must be handled carefully. Serious misuse, impersonation or fraudulent representation may result in action.",
        ],
      },
      {
        heading: "Safeguarding and Appropriate Behaviour",
        body: [
          "All parties must support safe, respectful interaction and must report concerns involving children, vulnerable persons, abuse, exploitation or harassment through the appropriate channel.",
        ],
      },
      {
        heading: "Fraud and Misrepresentation",
        body: [
          "Fraud, forged documents, duplicate applications, impersonation or deliberate misrepresentation may lead to rejection, suspension, withdrawal of support and referral where appropriate.",
        ],
      },
      {
        heading: "Complaints and Reporting Concerns",
        body: [
          "Applicants and beneficiaries may make complaints, provide feedback or report concerns without retaliation. Complaints should be raised honestly and with enough detail to allow fair review.",
        ],
      },
      {
        heading: "Privacy and Confidentiality",
        body: [
          "Personal information will be handled in line with the Privacy & Data Protection Policy. Applicants should also respect confidential information received through the programme.",
        ],
      },
      {
        heading: "Misconduct and Breach",
        body: [
          "Where a material breach is alleged, the Foundation may review the facts, request information and take proportionate action based on seriousness, impact and fairness.",
        ],
      },
      {
        heading: "Suspension or Withdrawal of Support",
        body: [
          "Scholarship support may be suspended or withdrawn only for material breach, fraud, loss of eligibility, serious misconduct, safeguarding concerns, or other clearly justified programme reasons.",
        ],
      },
      {
        heading: "Right to Review",
        body: [
          "A person affected by a decision may request a review where they believe relevant information was missed or the process was unfair.",
        ],
      },
      {
        heading: "Acceptance and Acknowledgement",
        body: [
          "Applicants, beneficiaries, parents and guardians may be asked to acknowledge this Code during application and again if support is approved.",
        ],
      },
    ],
  },
  {
    id: "COMMUNITY_SUPPORT_CODE",
    title: "Code of Conduct - Community Support Applicants & Beneficiaries",
    path: "/governance/community-support-code-of-conduct",
    version: "1.0",
    effectiveDate: "21 August 2026",
    lastUpdated: "21 August 2026",
    intro:
      "This Code applies to people applying for, receiving, or supporting community and welfare assistance from Lifespring Humanitarian Foundation.",
    sections: [
      {
        heading: "Our Commitment to Applicants and Beneficiaries",
        body: [
          "Lifespring commits to dignity, fairness, confidentiality, reasonable transparency, non-discrimination, safeguarding, proper handling of personal information and fair consideration of complaints.",
        ],
      },
      {
        heading: "Honesty and Accurate Information",
        body: [
          "Applicants must provide truthful information about identity, contact details, circumstances, eligibility and requested support.",
          "Supporting documents must be genuine and must not be forged, altered or misleading.",
        ],
      },
      {
        heading: "Eligibility and Documents",
        body: [
          "The Foundation may ask for documents or information needed to assess eligibility and need. Duplicate or fraudulent applications may be declined or reviewed.",
        ],
      },
      {
        heading: "No Bribery or Inducement",
        body: [
          "No applicant, beneficiary, representative or staff member should request, offer or accept money, gifts, favours or inducements in exchange for selection or support.",
        ],
      },
      {
        heading: "Proper Use of Approved Assistance",
        body: [
          "Approved assistance should be used only for the agreed purpose. Where conditions apply, they will be explained clearly and proportionately.",
        ],
      },
      {
        heading: "Verification and Communication",
        body: [
          "Applicants should cooperate with reasonable verification and communicate respectfully. Harassment, threats, abuse, impersonation or misuse of the Lifespring name or logo may result in review.",
        ],
      },
      {
        heading: "Confidentiality, Safeguarding and Privacy",
        body: [
          "Personal information will be handled carefully. Safeguarding concerns involving children or vulnerable persons should be reported promptly.",
          standardProtection,
        ],
      },
      {
        heading: "Complaints, Fraud and Misconduct",
        body: [
          "Complaints and feedback are welcome and will be considered fairly. Fraud, misconduct or serious breach may lead to suspension or withdrawal of assistance.",
        ],
      },
      {
        heading: "Review of Decisions and Acknowledgement",
        body: [
          "Applicants may request review of decisions where appropriate. Applicants and beneficiaries may be asked to acknowledge this Code during application and approval.",
        ],
      },
    ],
  },
  {
    id: "STAFF_VOLUNTEER_CODE",
    title: "Code of Conduct - Staff & Volunteers",
    path: "/governance/staff-volunteer-code-of-conduct",
    version: "1.0",
    effectiveDate: "21 August 2026",
    lastUpdated: "21 August 2026",
    intro:
      "This Code describes the conduct expected of Lifespring staff, volunteers and representatives.",
    sections: [
      {
        heading: "Professional Behaviour and Beneficiary Dignity",
        body: [
          "Staff and volunteers must act with compassion, respect, honesty and care, preserving the dignity and privacy of every beneficiary and applicant.",
          "Harassment, discrimination, intimidation, exploitation and abusive language are not acceptable.",
        ],
      },
      {
        heading: "Safeguarding and Boundaries",
        body: [
          "Interactions with children and vulnerable persons must be appropriate, accountable and never exploitative. Staff and volunteers must avoid inappropriate relationships, private dependency, or conduct that could cause harm.",
        ],
      },
      {
        heading: "Confidentiality, Photos and Social Media",
        body: [
          "Personal information, photographs and stories must be used only with proper permission and for legitimate Foundation purposes. Sensitive beneficiary information must not be posted publicly.",
        ],
      },
      {
        heading: "Conflicts, Gifts, Bribery and Fraud",
        body: [
          "Conflicts of interest must be disclosed. Gifts or benefits that could influence decisions must not be accepted. Fraud, bribery, kickbacks and falsification are prohibited.",
        ],
      },
      {
        heading: "Foundation Property and Reporting",
        body: [
          "Foundation money, documents, equipment and digital access must be used responsibly. Concerns about misconduct, safeguarding or financial wrongdoing should be reported promptly.",
        ],
      },
      {
        heading: "Consequences",
        body: [
          "Breaches may result in proportionate disciplinary action, removal from duties, reporting to authorities or other steps appropriate to the seriousness of the matter.",
        ],
      },
    ],
  },
  {
    id: "SAFEGUARDING",
    title: "Safeguarding Policy",
    path: "/governance/safeguarding",
    version: "1.0",
    effectiveDate: "21 August 2026",
    lastUpdated: "21 August 2026",
    intro:
      "Lifespring is committed to protecting children, vulnerable persons and communities from abuse, exploitation, harassment and avoidable harm.",
    sections: [
      {
        heading: "Scope and Responsibilities",
        body: [
          "Trustees, staff, volunteers, partners and representatives must support safe programme delivery and act promptly when safeguarding concerns arise.",
        ],
      },
      {
        heading: "Prevention of Abuse and Exploitation",
        body: [
          "The Foundation prohibits abuse, neglect, harassment, sexual exploitation and abuse, coercion, exploitation of dependency, and inappropriate relationships with beneficiaries.",
        ],
      },
      {
        heading: "Safer Interaction with Beneficiaries",
        body: [
          "Interactions should be transparent, respectful, appropriate to the programme purpose, and mindful of power imbalance, age, vulnerability and cultural context.",
        ],
      },
      {
        heading: "Reporting, Confidentiality and Escalation",
        body: [
          "Concerns should be reported through Foundation channels and escalated where necessary. Confidentiality should be maintained, but information may be shared with appropriate persons or authorities when needed to protect someone or comply with law.",
        ],
      },
      {
        heading: "Immediate Danger",
        body: [
          "If someone is in immediate danger, contact the appropriate emergency or statutory authority. The Foundation's reporting routes do not replace police, emergency services or statutory safeguarding authorities.",
        ],
      },
      {
        heading: "Photography and Media Consent",
        body: [
          "Images, videos and stories of children or vulnerable persons should be collected and used only with appropriate consent and safeguards.",
        ],
      },
    ],
  },
  {
    id: "COMPLAINTS",
    title: "Complaints & Feedback Policy",
    path: "/governance/complaints",
    version: "1.0",
    effectiveDate: "21 August 2026",
    lastUpdated: "21 August 2026",
    intro:
      "This policy explains how applicants, beneficiaries, donors, partners and members of the public can raise complaints or feedback.",
    sections: [
      {
        heading: "Who Can Complain",
        body: [
          "Any applicant, beneficiary, parent, guardian, donor, partner, volunteer, staff member or member of the public may raise a complaint or provide feedback.",
        ],
      },
      {
        heading: "How Complaints Are Handled",
        body: [
          "Complaints will be acknowledged where contact details are provided, reviewed fairly, investigated where appropriate, and handled confidentially as far as practicable.",
        ],
      },
      {
        heading: "No Retaliation",
        body: [
          "People who complain honestly or raise genuine concerns must not be punished, threatened or disadvantaged for doing so.",
        ],
      },
      {
        heading: "Safeguarding and Anonymous Concerns",
        body: [
          "Safeguarding complaints should be escalated promptly. Anonymous concerns may be considered where practicable, although limited contact information may affect follow-up.",
        ],
      },
      {
        heading: "Outcome and Escalation",
        body: [
          "Where appropriate, complainants will be told the outcome or next step. Serious complaints may be escalated to senior leadership, trustees or relevant authorities.",
        ],
      },
    ],
  },
  {
    id: "PRIVACY",
    title: "Privacy & Data Protection Policy",
    path: "/governance/privacy",
    version: "1.0",
    effectiveDate: "21 August 2026",
    lastUpdated: "21 August 2026",
    intro:
      "This policy explains how Lifespring handles personal information in connection with applications, programmes, donations, communications and agreements.",
    sections: [
      {
        heading: "Information We Collect",
        body: [
          "We may collect application data, beneficiary data, parent or guardian information, donor and contact details, uploaded documents, programme records, agreement records and correspondence.",
        ],
      },
      {
        heading: "Why Information Is Used",
        body: [
          "Information may be used to assess applications, deliver support, verify eligibility, protect beneficiaries, administer donations, communicate with applicants, manage agreements and meet accountability obligations.",
          "Where consent is required, it will be requested. Some processing may also be necessary for legitimate programme administration, safeguarding, legal compliance or fraud prevention.",
        ],
      },
      {
        heading: "Security, Retention and Sharing",
        body: [
          "The Foundation takes reasonable steps to protect personal information and retain it only for appropriate programme, legal, safeguarding, accounting or audit purposes.",
          "Information may be shared with authorised staff, volunteers, schools, service providers, email providers, DocuSign, advisers or authorities where appropriate and lawful.",
        ],
      },
      {
        heading: "Children's Data",
        body: [
          "Information relating to children is handled with additional care and should be provided by a parent, guardian or authorised person where required.",
        ],
      },
      {
        heading: "Cookies and Website Data",
        body: [
          "The website may use essential technical data needed to operate forms and pages. Additional cookie practices should be documented if analytics or marketing tools are introduced.",
        ],
      },
      {
        heading: "Rights and Contact",
        body: [
          "Requests or questions about personal information may be sent to info@lifespringhf.org. Specific legal rights depend on applicable law and the circumstances of the request.",
        ],
      },
    ],
  },
  {
    id: "CONFLICT_OF_INTEREST",
    title: "Conflict of Interest Policy",
    path: "/governance/conflict-of-interest",
    version: "1.0",
    effectiveDate: "21 August 2026",
    lastUpdated: "21 August 2026",
    intro:
      "This policy helps protect Foundation decisions from actual, potential or perceived conflicts of interest.",
    sections: [
      {
        heading: "Types of Conflict",
        body: [
          "A conflict may be actual, potential or perceived. It may involve personal relationships, financial interests, related-party decisions, employment, gifts, benefits or other circumstances that could affect judgement.",
        ],
      },
      {
        heading: "Disclosure and Recusal",
        body: [
          "Trustees, staff and volunteers must disclose conflicts promptly. A conflicted person should not influence, decide or improperly access information about the matter unless authorised safeguards are in place.",
        ],
      },
      {
        heading: "Documentation and Gifts",
        body: [
          "Material conflicts and decisions should be documented. Gifts or benefits must not be accepted where they could influence or appear to influence Foundation decisions.",
        ],
      },
    ],
  },
  {
    id: "ANTI_FRAUD_BRIBERY",
    title: "Anti-Fraud, Anti-Bribery & Anti-Corruption Policy",
    path: "/governance/anti-fraud-bribery",
    version: "1.0",
    effectiveDate: "21 August 2026",
    lastUpdated: "21 August 2026",
    intro:
      "Lifespring does not tolerate fraud, bribery, corruption, falsification, kickbacks or misuse of Foundation resources.",
    sections: [
      {
        heading: "Prohibited Conduct",
        body: [
          "Prohibited conduct includes false beneficiary claims, forged documents, financial manipulation, misuse of funds, bribery, kickbacks, collusion, theft and deliberate misrepresentation.",
        ],
      },
      {
        heading: "Reporting and Investigation",
        body: [
          "Suspected fraud, bribery or corruption should be reported promptly. Reports will be reviewed and investigated fairly, with confidentiality maintained as far as practicable.",
        ],
      },
      {
        heading: "Action and Referral",
        body: [
          "Confirmed wrongdoing may lead to disciplinary action, withdrawal of support, recovery steps, termination of involvement, and referral to authorities where appropriate.",
        ],
      },
    ],
  },
  {
    id: "WHISTLEBLOWING",
    title: "Whistleblowing / Speak-Up Policy",
    path: "/governance/whistleblowing",
    version: "1.0",
    effectiveDate: "21 August 2026",
    lastUpdated: "21 August 2026",
    intro:
      "This policy encourages people to speak up about serious wrongdoing connected with the Foundation.",
    sections: [
      {
        heading: "What Can Be Reported",
        body: [
          "Reports may concern fraud, safeguarding concerns, corruption, serious policy breaches, abuse of authority, financial misconduct, data misuse or other serious wrongdoing.",
        ],
      },
      {
        heading: "Confidentiality and Anonymous Reporting",
        body: [
          "Reports will be handled confidentially as far as practicable. Anonymous reports may be considered, although they may limit follow-up or investigation.",
        ],
      },
      {
        heading: "Protection Against Retaliation",
        body: [
          "People who raise genuine concerns must not face retaliation. A report that is mistaken but made honestly should be distinguished from a malicious allegation made knowingly or recklessly.",
        ],
      },
      {
        heading: "Escalation and Investigation",
        body: [
          "Concerns will be reviewed and escalated where appropriate. Serious matters may be referred to trustees, safeguarding leads, advisers or authorities as required.",
        ],
      },
    ],
  },
];

export function findPolicyByPath(pathname: string) {
  return policies.find((policy) => policy.path === pathname);
}

export function findPolicyById(id: string) {
  return policies.find((policy) => policy.id === id);
}

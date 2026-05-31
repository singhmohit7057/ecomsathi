import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

// ---------------------------------------------------------------------------
// Shared typography helpers
// ---------------------------------------------------------------------------

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-xl font-bold text-[#0F172A] mb-3 mt-10 first:mt-0 scroll-mt-24"
    >
      {children}
    </h2>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[#475569] text-sm leading-relaxed space-y-3">{children}</div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-outside pl-5 space-y-1.5 text-sm text-[#475569] leading-relaxed">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function Divider() {
  return <hr className="border-t border-[#E2E8F0] my-8" />;
}

// ---------------------------------------------------------------------------
// Table of contents
// ---------------------------------------------------------------------------

const TOC_ITEMS = [
  { id: 'introduction', label: '1. Introduction' },
  { id: 'information-collected', label: '2. Information We Collect' },
  { id: 'how-we-use', label: '3. How We Use Your Information' },
  { id: 'uploaded-files', label: '4. Uploaded Files' },
  { id: 'data-sharing', label: '5. Data Sharing' },
  { id: 'cookies', label: '6. Cookies' },
  { id: 'data-retention', label: '7. Data Retention' },
  { id: 'data-security', label: '8. Data Security' },
  { id: 'your-rights', label: '9. Your Rights' },
  { id: 'children', label: '10. Children' },
  { id: 'changes', label: '11. Changes to This Policy' },
  { id: 'contact', label: '12. Contact Us' },
  { id: 'governing-law', label: '13. Governing Law' },
];

// ---------------------------------------------------------------------------
// PrivacyPage
// ---------------------------------------------------------------------------

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Hero ── */}
      <section className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center">
              <Shield size={20} className="text-[#2563EB]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB]">
              Legal
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#64748B]">
            Effective Date: <strong className="text-[#0F172A]">January 1, 2025</strong>
            &nbsp;&nbsp;·&nbsp;&nbsp;Last Reviewed: May 2025
          </p>
          <p className="text-sm text-[#475569] mt-3 max-w-2xl">
            This Privacy Policy explains how EcomSathi ("we", "our", or "us") collects, uses,
            and protects information when you use our website and tools at{' '}
            <a
              href="https://ecomsathi.in"
              className="text-[#2563EB] hover:underline"
            >
              ecomsathi.in
            </a>
            .
          </p>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* ── TOC Sidebar ── */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 bg-white border border-[#E2E8F0] rounded-[8px] p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#94A3B8] mb-3">
                Contents
              </p>
              <nav>
                <ul className="flex flex-col gap-1.5">
                  {TOC_ITEMS.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="text-xs text-[#64748B] hover:text-[#2563EB] transition-colors leading-snug block py-0.5"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          {/* ── Policy content ── */}
          <article className="lg:col-span-3 bg-white border border-[#E2E8F0] rounded-[8px] p-8 shadow-[#1E293B_2px_2px_0px_0px]">

            {/* 1. Introduction */}
            <SectionHeading id="introduction">1. Introduction</SectionHeading>
            <Prose>
              <p>
                EcomSathi is an Indian ecommerce SaaS platform operated by the EcomSathi team,
                based in India. Our platform, accessible at{' '}
                <a href="https://ecomsathi.in" className="text-[#2563EB] hover:underline">
                  ecomsathi.in
                </a>
                , provides free and premium tools to help Indian marketplace sellers manage their
                ecommerce operations.
              </p>
              <p>
                This Privacy Policy describes the information we collect when you visit or use
                EcomSathi, how we use and protect that information, your rights regarding your data,
                and how to contact us with questions or requests.
              </p>
              <p>
                By using EcomSathi you consent to the practices described in this policy. If you do
                not agree, please discontinue use of the platform.
              </p>
              <p>
                We are aware of the evolving data protection landscape in India, including the
                Digital Personal Data Protection Act 2023 (DPDPA), and are committed to aligning
                our practices with applicable requirements as they come into force.
              </p>
            </Prose>

            <Divider />

            {/* 2. Information We Collect */}
            <SectionHeading id="information-collected">2. Information We Collect</SectionHeading>
            <Prose>
              <p>We collect information in the following ways:</p>

              <p className="font-semibold text-[#0F172A]">a) Account Information (registered users only)</p>
              <BulletList
                items={[
                  'Name and display name',
                  'Email address',
                  'Password (stored as a bcrypt hash via Supabase Auth — we never see your plain-text password)',
                  'Account creation date and last login timestamp',
                  'Optional: business name and GSTIN (if provided in profile settings)',
                ]}
              />

              <p className="font-semibold text-[#0F172A]">b) Usage Data (all visitors)</p>
              <BulletList
                items={[
                  'Pages visited and tools used',
                  'Browser type, operating system, and screen resolution',
                  'Referring URL and search terms that led you to our site',
                  'Time spent on each page and interaction events',
                  'IP address (used for approximate geolocation and security; not linked to your identity for anonymous tool usage)',
                ]}
              />

              <p className="font-semibold text-[#0F172A]">c) Uploaded Files</p>
              <p>
                When you use tools that require file uploads (PDF tools, Image tools, Label Crop),
                your files are transmitted to our processing backend. See Section 4 for details on
                how these files are handled.
              </p>

              <p className="font-semibold text-[#0F172A]">d) Cookies and Local Storage</p>
              <p>
                We use browser cookies and localStorage for session management, preference storage,
                and analytics. See Section 6 for a detailed breakdown.
              </p>

              <p className="font-semibold text-[#0F172A]">e) Communications</p>
              <p>
                If you contact us via the contact form or email, we retain your message and email
                address to respond to and track your inquiry.
              </p>
            </Prose>

            <Divider />

            {/* 3. How We Use Your Information */}
            <SectionHeading id="how-we-use">3. How We Use Your Information</SectionHeading>
            <Prose>
              <p>We use the information we collect to:</p>
              <BulletList
                items={[
                  'Provide, operate, and maintain the EcomSathi platform and all tools',
                  'Authenticate your account and maintain session security',
                  'Process files you upload and return the results to you',
                  'Improve existing tools and develop new features based on usage patterns',
                  'Analyse platform performance and diagnose technical issues',
                  'Send transactional emails (account verification, password reset, subscription confirmations)',
                  'Send product updates and newsletters (you can unsubscribe at any time)',
                  'Respond to your support requests and feedback',
                  'Detect, prevent, and mitigate fraudulent or abusive activity',
                  'Comply with legal obligations under applicable Indian law',
                ]}
              />
              <p>
                We do not use your data for automated decision-making or profiling in ways that
                would significantly affect you.
              </p>
            </Prose>

            <Divider />

            {/* 4. Uploaded Files */}
            <SectionHeading id="uploaded-files">4. Uploaded Files</SectionHeading>
            <Prose>
              <p>
                Your privacy regarding uploaded files is a priority. Here is exactly how we handle
                them:
              </p>
              <BulletList
                items={[
                  'Browser-side tools (Background Remover, SKU Generator, Barcode Printer): processing happens entirely within your browser. No file data is ever sent to our servers.',
                  'Server-side tools (PDF OCR, PDF Merge/Split, Label Crop with server processing): your file is uploaded over HTTPS to our Railway-hosted processing backend.',
                  'Uploaded files are stored in temporary in-memory or ephemeral disk storage on the processing server.',
                  'Files are automatically deleted within 30 minutes of upload, regardless of whether processing succeeded or failed.',
                  'We do not read, index, log, or retain the content of your uploaded files.',
                  'Processed output files (e.g., cropped labels, compressed PDFs) are served back to your browser and then deleted from our servers within the same 30-minute window.',
                  'We do not share uploaded files with any third party.',
                ]}
              />
              <p>
                If you have concerns about a specific file, you can request deletion by emailing us
                at{' '}
                <a href="mailto:hello@ecomsathi.in" className="text-[#2563EB] hover:underline">
                  hello@ecomsathi.in
                </a>{' '}
                with details. However, because files are automatically deleted so quickly, by the
                time we receive your email the file will almost certainly already be deleted.
              </p>
            </Prose>

            <Divider />

            {/* 5. Data Sharing */}
            <SectionHeading id="data-sharing">5. Data Sharing</SectionHeading>
            <Prose>
              <p>
                <strong className="text-[#0F172A]">We do not sell your personal data.</strong> We
                do not share your personal information with advertisers or data brokers.
              </p>
              <p>We use the following sub-processors who may process your data:</p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border border-[#E2E8F0]">
                      <th className="text-left px-3 py-2 font-semibold text-[#0F172A] border-r border-[#E2E8F0]">Service</th>
                      <th className="text-left px-3 py-2 font-semibold text-[#0F172A] border-r border-[#E2E8F0]">Purpose</th>
                      <th className="text-left px-3 py-2 font-semibold text-[#0F172A]">Data Shared</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Supabase', 'Database hosting, authentication, file storage', 'Account data, usage logs'],
                      ['Google Analytics', 'Website analytics and usage metrics', 'Anonymised usage data, IP (anonymised)'],
                      ['Microsoft Clarity', 'UX heatmaps and session recordings', 'Anonymised interaction data'],
                      ['Cloudflare Turnstile', 'Bot detection on contact form', 'Browser fingerprint (no personal data)'],
                      ['Railway', 'Backend processing server', 'Uploaded files (deleted within 30 min)'],
                      ['Vercel', 'Frontend hosting and CDN', 'Request metadata, IP'],
                    ].map(([service, purpose, data], i) => (
                      <tr key={i} className="border border-[#E2E8F0]">
                        <td className="px-3 py-2 font-medium text-[#0F172A] border-r border-[#E2E8F0]">{service}</td>
                        <td className="px-3 py-2 text-[#475569] border-r border-[#E2E8F0]">{purpose}</td>
                        <td className="px-3 py-2 text-[#475569]">{data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p>
                We may also share information if required by applicable Indian law, court order, or
                regulatory authority, or to protect the rights, property, or safety of EcomSathi
                and its users.
              </p>
            </Prose>

            <Divider />

            {/* 6. Cookies */}
            <SectionHeading id="cookies">6. Cookies</SectionHeading>
            <Prose>
              <p>We use the following categories of cookies:</p>

              <p className="font-semibold text-[#0F172A]">Essential Cookies</p>
              <p>
                Required for the platform to function. These include authentication session cookies
                (set by Supabase) and CSRF protection tokens. You cannot opt out of essential
                cookies while using the platform.
              </p>

              <p className="font-semibold text-[#0F172A]">Analytics Cookies</p>
              <p>
                We use Google Analytics 4 (with IP anonymisation enabled) and Microsoft Clarity to
                understand how visitors use our platform. These cookies collect anonymised usage
                patterns, page views, and interaction events.
              </p>

              <p className="font-semibold text-[#0F172A]">Preference Cookies</p>
              <p>
                We store your tool preferences (e.g., selected label size, preferred barcode format)
                in localStorage so they persist across sessions. No personal data is stored in
                these preferences.
              </p>

              <p className="font-semibold text-[#0F172A]">Opting Out</p>
              <p>
                You can opt out of analytics cookies by installing the{' '}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:underline"
                >
                  Google Analytics opt-out browser add-on
                </a>
                , enabling "Do Not Track" in your browser, or using your browser's cookie management
                settings to block third-party cookies. Note that opting out of analytics does not
                affect your ability to use any EcomSathi tools.
              </p>
            </Prose>

            <Divider />

            {/* 7. Data Retention */}
            <SectionHeading id="data-retention">7. Data Retention</SectionHeading>
            <Prose>
              <BulletList
                items={[
                  'Account data: retained for as long as your account is active. If you delete your account, your data is deleted within 30 days.',
                  'Usage logs and analytics: retained for 90 days in our systems, then automatically purged. Aggregated (non-personal) analytics may be retained indefinitely.',
                  'Uploaded files: deleted within 30 minutes of upload (see Section 4).',
                  'Contact form messages: retained for up to 12 months to track the resolution of your inquiry.',
                  'Payment records (premium users): retained for 7 years as required by Indian tax law.',
                ]}
              />
            </Prose>

            <Divider />

            {/* 8. Data Security */}
            <SectionHeading id="data-security">8. Data Security</SectionHeading>
            <Prose>
              <p>We implement the following security measures to protect your data:</p>
              <BulletList
                items={[
                  'All data in transit is encrypted using TLS 1.2 or higher (HTTPS enforced site-wide via Vercel and Cloudflare).',
                  'Data at rest is encrypted by Supabase (PostgreSQL with AES-256 encryption at the storage layer).',
                  'Passwords are hashed using bcrypt with a per-user salt via Supabase Auth.',
                  'Access to production databases is restricted to authorised personnel only, protected by multi-factor authentication.',
                  'File uploads use signed, expiring URLs — files cannot be accessed by third parties.',
                  'Our processing backend runs in an isolated Railway environment with network-level access controls.',
                ]}
              />
              <p>
                While we take reasonable steps to protect your data, no system is 100% secure. We
                will notify affected users of any data breach in accordance with applicable law.
              </p>
            </Prose>

            <Divider />

            {/* 9. Your Rights */}
            <SectionHeading id="your-rights">9. Your Rights</SectionHeading>
            <Prose>
              <p>
                Under applicable Indian data protection law, you have the following rights regarding
                your personal data:
              </p>
              <BulletList
                items={[
                  'Right to Access: request a copy of the personal data we hold about you.',
                  'Right to Correction: request that we correct inaccurate or incomplete personal data.',
                  'Right to Deletion: request deletion of your account and associated personal data.',
                  'Right to Withdraw Consent: withdraw consent for non-essential data processing (e.g., analytics cookies, marketing emails) at any time.',
                  'Right to Grievance Redressal: raise a complaint or grievance with us regarding data handling.',
                ]}
              />
              <p>
                To exercise any of these rights, email us at{' '}
                <a
                  href="mailto:hello@ecomsathi.in"
                  className="text-[#2563EB] hover:underline"
                >
                  hello@ecomsathi.in
                </a>{' '}
                with the subject line "Data Request". We will respond within 30 days. For account
                deletion, you can also use the Account Settings page after logging in.
              </p>
            </Prose>

            <Divider />

            {/* 10. Children */}
            <SectionHeading id="children">10. Children</SectionHeading>
            <Prose>
              <p>
                EcomSathi is not intended for use by individuals under the age of 18. We do not
                knowingly collect personal information from minors. If you believe a minor has
                provided us with personal data, please contact us at{' '}
                <a
                  href="mailto:hello@ecomsathi.in"
                  className="text-[#2563EB] hover:underline"
                >
                  hello@ecomsathi.in
                </a>{' '}
                and we will promptly delete it.
              </p>
            </Prose>

            <Divider />

            {/* 11. Changes */}
            <SectionHeading id="changes">11. Changes to This Policy</SectionHeading>
            <Prose>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our
                practices, technology, or applicable law. When we make material changes, we will:
              </p>
              <BulletList
                items={[
                  'Update the "Last Reviewed" date at the top of this page.',
                  'Send an email notification to all registered users.',
                  'Display a prominent notice on the platform for at least 14 days.',
                ]}
              />
              <p>
                We encourage you to review this policy periodically. Continued use of EcomSathi
                after the effective date of an updated policy constitutes acceptance of the changes.
              </p>
            </Prose>

            <Divider />

            {/* 12. Contact */}
            <SectionHeading id="contact">12. Contact Us</SectionHeading>
            <Prose>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or
                our data handling practices, please contact us:
              </p>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                <p className="font-semibold text-[#0F172A] mb-1">EcomSathi</p>
                <p>
                  Email:{' '}
                  <a
                    href="mailto:hello@ecomsathi.in"
                    className="text-[#2563EB] hover:underline"
                  >
                    hello@ecomsathi.in
                  </a>
                </p>
                <p>Subject line: "Privacy Policy Query"</p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  Response time: within 30 days for data rights requests; within 2 business days
                  for general privacy queries.
                </p>
              </div>
              <p>
                You may also use our{' '}
                <Link to="/contact" className="text-[#2563EB] hover:underline">
                  Contact page
                </Link>{' '}
                to reach us.
              </p>
            </Prose>

            <Divider />

            {/* 13. Governing Law */}
            <SectionHeading id="governing-law">13. Governing Law</SectionHeading>
            <Prose>
              <p>
                This Privacy Policy and any disputes arising from it shall be governed by and
                construed in accordance with the laws of India, including the Information Technology
                Act 2000 (as amended), the Information Technology (Reasonable Security Practices
                and Procedures and Sensitive Personal Data or Information) Rules 2011, and the
                Digital Personal Data Protection Act 2023 (DPDPA) as it comes into force.
              </p>
              <p>
                Any legal proceedings arising out of or related to this Privacy Policy shall be
                subject to the exclusive jurisdiction of the courts of New Delhi, India.
              </p>
            </Prose>

          </article>
        </div>
      </div>
    </div>
  );
}

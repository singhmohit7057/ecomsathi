import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

// ---------------------------------------------------------------------------
// Shared typography helpers (mirrors PrivacyPage style)
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

function BulletList({ items }: { items: (string | React.ReactNode)[] }) {
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
  { id: 'acceptance', label: '1. Acceptance of Terms' },
  { id: 'description', label: '2. Description of Service' },
  { id: 'free-tools', label: '3. Free Tools Usage' },
  { id: 'account', label: '4. Account Registration' },
  { id: 'premium', label: '5. Premium Modules' },
  { id: 'ip', label: '6. Intellectual Property' },
  { id: 'prohibited', label: '7. Prohibited Uses' },
  { id: 'disclaimers', label: '8. Disclaimers' },
  { id: 'liability', label: '9. Limitation of Liability' },
  { id: 'indemnification', label: '10. Indemnification' },
  { id: 'termination', label: '11. Termination' },
  { id: 'changes', label: '12. Changes to Terms' },
  { id: 'governing-law', label: '13. Governing Law' },
  { id: 'contact', label: '14. Contact Us' },
];

// ---------------------------------------------------------------------------
// TermsPage
// ---------------------------------------------------------------------------

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Hero ── */}
      <section className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center">
              <FileText size={20} className="text-[#2563EB]" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2563EB]">
              Legal
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-[#64748B]">
            Effective Date: <strong className="text-[#0F172A]">January 1, 2025</strong>
            &nbsp;&nbsp;·&nbsp;&nbsp;Last Reviewed: May 2025
          </p>
          <p className="text-sm text-[#475569] mt-3 max-w-2xl">
            Please read these Terms of Service carefully before using EcomSathi. By accessing or
            using the platform you agree to be bound by these terms.
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

          {/* ── Terms content ── */}
          <article className="lg:col-span-3 bg-white border border-[#E2E8F0] rounded-[8px] p-8 shadow-[#1E293B_2px_2px_0px_0px]">

            {/* 1. Acceptance */}
            <SectionHeading id="acceptance">1. Acceptance of Terms</SectionHeading>
            <Prose>
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement between you
                ("User", "you", or "your") and EcomSathi ("EcomSathi", "we", "our", or "us")
                governing your access to and use of the EcomSathi website and all tools, features,
                and services available at{' '}
                <a href="https://ecomsathi.in" className="text-[#2563EB] hover:underline">
                  ecomsathi.in
                </a>{' '}
                (the "Platform").
              </p>
              <p>
                By accessing or using the Platform — whether or not you create an account — you
                acknowledge that you have read, understood, and agree to be bound by these Terms
                and our{' '}
                <Link to="/privacy" className="text-[#2563EB] hover:underline">
                  Privacy Policy
                </Link>
                , which is incorporated herein by reference.
              </p>
              <p>
                If you are using the Platform on behalf of a business entity, you represent that
                you have the authority to bind that entity to these Terms, and "you" refers to both
                you and that entity.
              </p>
              <p>
                If you do not agree to these Terms, you must not access or use the Platform.
              </p>
            </Prose>

            <Divider />

            {/* 2. Description of Service */}
            <SectionHeading id="description">2. Description of Service</SectionHeading>
            <Prose>
              <p>
                EcomSathi provides a suite of tools and services designed for Indian ecommerce
                sellers. The Platform consists of two categories of offerings:
              </p>

              <p className="font-semibold text-[#0F172A]">Free Tools (no account required)</p>
              <BulletList
                items={[
                  'SKU Generator and Bulk SKU Creator',
                  'Barcode Printer (Code 128, EAN-13, QR Code, and other formats)',
                  'Label Generator (A4 and thermal formats)',
                  'PDF Tools (merge, split, compress, OCR)',
                  'Image Tools (background remover, product image optimizer, format converter)',
                  'Label Crop (Amazon India, Flipkart, Meesho, and other marketplace label formats)',
                  'GST Tools (GSTIN verification, HSN/SAC lookup, PAN validator)',
                ]}
              />

              <p className="font-semibold text-[#0F172A]">Premium Modules (account + subscription required)</p>
              <BulletList
                items={[
                  'Reconciliation Module: marketplace payment reconciliation for Amazon India and Flipkart',
                  'Inventory Management Module: multi-warehouse stock tracking and reorder management',
                ]}
              />

              <p>
                We reserve the right to modify, suspend, or discontinue any part of the Platform
                at any time, with or without notice. We will endeavour to provide advance notice
                for material changes.
              </p>
            </Prose>

            <Divider />

            {/* 3. Free Tools Usage */}
            <SectionHeading id="free-tools">3. Free Tools Usage</SectionHeading>
            <Prose>
              <p>
                The free tools are provided for the personal and business use of individual Indian
                ecommerce sellers and small businesses. By using the free tools you agree to the
                following fair use policy:
              </p>
              <BulletList
                items={[
                  'You may use the tools for legitimate business purposes including generating SKUs, printing labels, processing your own PDF files, editing your own product images, and verifying GST information.',
                  'You may not use automated scripts, bots, crawlers, or any programmatic means to access or scrape the tools.',
                  'You may not use the tools to process files or data on behalf of third parties as a service bureau without our prior written consent.',
                  'Rate limits apply to server-side tools to ensure fair access for all users. Excessive usage that degrades the service for others may result in temporary access restrictions.',
                  'Files uploaded to server-side tools are deleted within 30 minutes. You must download your processed output before this window expires.',
                  'You are responsible for ensuring that any files you upload do not contain content that infringes third-party intellectual property rights, contains malware, or is otherwise unlawful.',
                ]}
              />
            </Prose>

            <Divider />

            {/* 4. Account Registration */}
            <SectionHeading id="account">4. Account Registration</SectionHeading>
            <Prose>
              <p>
                To access premium modules, save preferences, or use account-linked features, you
                must register for a free EcomSathi account.
              </p>
              <BulletList
                items={[
                  'You must provide accurate, current, and complete registration information, including a valid email address.',
                  'You must keep your account information up to date.',
                  'You are responsible for maintaining the confidentiality of your password. Do not share your password with anyone.',
                  'You are responsible for all activity that occurs under your account, whether or not you authorised it.',
                  'You must notify us immediately at hello@ecomsathi.in if you suspect unauthorised access to your account.',
                  'Each person may maintain only one account. Creating multiple accounts to circumvent usage limits is prohibited.',
                  'You must be at least 18 years of age to create an account.',
                ]}
              />
            </Prose>

            <Divider />

            {/* 5. Premium Modules */}
            <SectionHeading id="premium">5. Premium Modules</SectionHeading>
            <Prose>
              <p className="font-semibold text-[#0F172A]">Subscription</p>
              <p>
                Access to premium modules requires a paid subscription. Subscription fees, billing
                frequency (monthly or annual), and included features are detailed on our{' '}
                <a href="/pricing" className="text-[#2563EB] hover:underline">
                  Pricing page
                </a>
                . All prices are in Indian Rupees (INR) and inclusive of applicable GST. A GST
                invoice is issued for every payment.
              </p>

              <p className="font-semibold text-[#0F172A]">Billing</p>
              <BulletList
                items={[
                  'Subscriptions are billed in advance at the start of each billing period.',
                  'Payment is processed via our payment gateway. We do not store your payment card details.',
                  'Annual subscriptions are billed as a single payment for the full year.',
                  'Prices may change with 30 days advance notice to subscribers.',
                ]}
              />

              <p className="font-semibold text-[#0F172A]">Cancellation and Refunds</p>
              <BulletList
                items={[
                  'You may cancel your subscription at any time from Account Settings.',
                  'Upon cancellation, your subscription remains active until the end of the current billing period. No prorated refund is issued for the unused portion of the current period.',
                  'Annual subscriptions cancelled within 7 days of the initial purchase date are eligible for a full refund, minus any applicable payment processing fees.',
                  'EcomSathi reserves the right to offer refunds on a case-by-case basis at its discretion.',
                ]}
              />
            </Prose>

            <Divider />

            {/* 6. Intellectual Property */}
            <SectionHeading id="ip">6. Intellectual Property</SectionHeading>
            <Prose>
              <p className="font-semibold text-[#0F172A]">EcomSathi's Property</p>
              <p>
                The Platform, including its design, code, algorithms, text, graphics, logos,
                trademarks, and all tool outputs generated by EcomSathi's own processes (e.g.,
                the EcomSathi UI, processing logic, barcode rendering engine), are the exclusive
                intellectual property of EcomSathi and are protected by applicable Indian and
                international intellectual property laws. You may not copy, reproduce, distribute,
                modify, or create derivative works of any part of the Platform without our prior
                written consent.
              </p>

              <p className="font-semibold text-[#0F172A]">Your Data and Files</p>
              <p>
                You retain full ownership of all files you upload to the Platform and all data
                you input into the tools. EcomSathi does not claim any ownership over your
                uploaded content. You grant EcomSathi a limited, non-exclusive, royalty-free
                licence to process your files and data solely for the purpose of providing the
                requested service to you.
              </p>

              <p className="font-semibold text-[#0F172A]">Feedback</p>
              <p>
                If you submit feedback, suggestions, or ideas about EcomSathi, you grant us the
                right to use such feedback without any obligation to compensate you or keep it
                confidential.
              </p>
            </Prose>

            <Divider />

            {/* 7. Prohibited Uses */}
            <SectionHeading id="prohibited">7. Prohibited Uses</SectionHeading>
            <Prose>
              <p>You agree not to use the Platform to:</p>
              <BulletList
                items={[
                  'Use automated scripts, bots, scrapers, or crawlers to access any part of the Platform.',
                  'Abuse the free tools by making excessive requests that burden our infrastructure or degrade the experience for other users.',
                  'Attempt to gain unauthorised access to any part of the Platform, our servers, or any connected systems.',
                  'Reverse engineer, decompile, disassemble, or otherwise attempt to extract the source code or algorithms of the Platform.',
                  'Upload files containing malware, viruses, trojans, or any malicious code.',
                  'Upload files that infringe third-party copyright, trademarks, or other intellectual property rights.',
                  'Use the Platform for any unlawful purpose or in violation of any applicable Indian or international law.',
                  'Impersonate any person or entity, or misrepresent your affiliation with any person or entity.',
                  'Resell, sublicense, or commercialise access to the Platform or any of its tools without our written consent.',
                  'Interfere with or disrupt the integrity or performance of the Platform.',
                  'Collect or harvest personal information about other users of the Platform.',
                  'Use the GST or financial tools to make compliance decisions without independent professional verification.',
                ]}
              />
              <p>
                Violation of these prohibited uses may result in immediate suspension or termination
                of your account and, where applicable, legal action.
              </p>
            </Prose>

            <Divider />

            {/* 8. Disclaimers */}
            <SectionHeading id="disclaimers">8. Disclaimers</SectionHeading>
            <Prose>
              <p>
                <strong className="text-[#0F172A]">
                  THE PLATFORM AND ALL TOOLS ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                  WARRANTY OF ANY KIND.
                </strong>{' '}
                To the fullest extent permitted by applicable law, EcomSathi expressly disclaims
                all warranties, express or implied, including but not limited to:
              </p>
              <BulletList
                items={[
                  'Warranties of merchantability, fitness for a particular purpose, and non-infringement.',
                  'Warranties that the Platform will be uninterrupted, error-free, or free of viruses or other harmful components.',
                  'Warranties regarding the accuracy, reliability, or completeness of any tool output.',
                ]}
              />

              <p className="font-semibold text-[#0F172A]">GST and Tax Data</p>
              <p>
                GST-related tools (GSTIN verification, HSN/SAC lookup, PAN validator) are provided
                for informational and reference purposes only. Data is sourced from public
                government APIs and databases and is updated periodically, but may not always
                reflect the most current information. EcomSathi is not a tax advisor, chartered
                accountant, or legal professional. You should not rely solely on EcomSathi's GST
                tools for compliance decisions. Always verify critical tax information with a
                qualified professional.
              </p>

              <p className="font-semibold text-[#0F172A]">Tool Accuracy</p>
              <p>
                While we strive for accuracy in all tools (including OCR, barcode generation, and
                image processing), results may not be perfect in all cases. You are responsible
                for reviewing tool outputs before relying on them for business operations, printing,
                or filing purposes.
              </p>

              <p className="font-semibold text-[#0F172A]">Third-Party Services</p>
              <p>
                The Platform integrates with third-party services and APIs (such as the GST portal).
                We are not responsible for the availability, accuracy, or reliability of
                third-party services.
              </p>
            </Prose>

            <Divider />

            {/* 9. Limitation of Liability */}
            <SectionHeading id="liability">9. Limitation of Liability</SectionHeading>
            <Prose>
              <p>
                To the maximum extent permitted by applicable Indian law, in no event shall
                EcomSathi, its directors, employees, partners, agents, suppliers, or affiliates
                be liable for:
              </p>
              <BulletList
                items={[
                  'Any indirect, incidental, special, consequential, or punitive damages.',
                  'Loss of profits, revenue, data, goodwill, or business opportunities.',
                  'Damages arising from your reliance on tool outputs for business, tax, or legal decisions.',
                  'Damages resulting from unauthorised access to or alteration of your files or data.',
                  'Damages arising from interruption or cessation of the Platform.',
                ]}
              />
              <p>
                In all cases, EcomSathi's total aggregate liability to you for any claims arising
                out of or relating to these Terms or your use of the Platform shall not exceed the
                greater of: (a) the amount you paid to EcomSathi in the 12 months immediately
                preceding the event giving rise to the claim, or (b) INR 1,000 (one thousand
                Indian Rupees).
              </p>
              <p>
                Some jurisdictions do not allow the exclusion or limitation of certain warranties
                or liabilities. In such jurisdictions, our liability is limited to the maximum
                extent permitted by law.
              </p>
            </Prose>

            <Divider />

            {/* 10. Indemnification */}
            <SectionHeading id="indemnification">10. Indemnification</SectionHeading>
            <Prose>
              <p>
                You agree to defend, indemnify, and hold harmless EcomSathi and its directors,
                officers, employees, and agents from and against any and all claims, damages,
                losses, liabilities, costs, and expenses (including reasonable legal fees) arising
                out of or related to:
              </p>
              <BulletList
                items={[
                  'Your use of or access to the Platform.',
                  'Your violation of these Terms.',
                  'Your violation of any applicable law or regulation.',
                  'Any content, files, or data you upload to the Platform.',
                  'Any infringement by you of any third-party intellectual property, privacy, or other rights.',
                ]}
              />
            </Prose>

            <Divider />

            {/* 11. Termination */}
            <SectionHeading id="termination">11. Termination</SectionHeading>
            <Prose>
              <p className="font-semibold text-[#0F172A]">Termination by You</p>
              <p>
                You may close your account at any time via Account Settings. Upon account closure,
                your access to premium modules ends immediately and your account data is scheduled
                for deletion within 30 days, subject to our data retention obligations.
              </p>

              <p className="font-semibold text-[#0F172A]">Termination by EcomSathi</p>
              <p>
                EcomSathi reserves the right to suspend or terminate your account, with or without
                notice, if we reasonably believe you have:
              </p>
              <BulletList
                items={[
                  'Violated any provision of these Terms.',
                  'Engaged in abusive, fraudulent, or illegal activity on the Platform.',
                  'Caused harm or risk of harm to EcomSathi, other users, or third parties.',
                  'Provided false or misleading information at registration.',
                ]}
              />
              <p>
                Upon termination, your right to access and use the Platform ceases immediately.
                Sections 6, 8, 9, 10, and 13 of these Terms survive termination.
              </p>
            </Prose>

            <Divider />

            {/* 12. Changes to Terms */}
            <SectionHeading id="changes">12. Changes to Terms</SectionHeading>
            <Prose>
              <p>
                We reserve the right to modify these Terms at any time. When we make material
                changes, we will:
              </p>
              <BulletList
                items={[
                  'Update the "Last Reviewed" date at the top of this page.',
                  'Send an email notification to all registered users.',
                  'Display a notice on the Platform for at least 14 days prior to the changes taking effect.',
                ]}
              />
              <p>
                Your continued use of the Platform after the updated Terms take effect constitutes
                your acceptance of the revised Terms. If you do not agree to the modified Terms,
                you must stop using the Platform.
              </p>
            </Prose>

            <Divider />

            {/* 13. Governing Law */}
            <SectionHeading id="governing-law">13. Governing Law</SectionHeading>
            <Prose>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of
                India, including but not limited to:
              </p>
              <BulletList
                items={[
                  'The Information Technology Act, 2000 (as amended)',
                  'The Consumer Protection Act, 2019',
                  'The Indian Contract Act, 1872',
                  'Any other applicable Indian legislation',
                ]}
              />
              <p>
                Any dispute arising out of or in connection with these Terms, including any
                question regarding their existence, validity, or termination, shall be subject
                to the exclusive jurisdiction of the courts of New Delhi, India.
              </p>
              <p>
                Before initiating formal legal proceedings, the parties agree to attempt to
                resolve any dispute through good-faith negotiation for a period of 30 days.
              </p>
            </Prose>

            <Divider />

            {/* 14. Contact */}
            <SectionHeading id="contact">14. Contact Us</SectionHeading>
            <Prose>
              <p>
                If you have any questions about these Terms of Service, please contact us:
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
                <p>Subject line: "Terms of Service Query"</p>
              </div>
              <p>
                You may also use our{' '}
                <Link to="/contact" className="text-[#2563EB] hover:underline">
                  Contact page
                </Link>{' '}
                to reach us.
              </p>
            </Prose>

          </article>
        </div>
      </div>
    </div>
  );
}

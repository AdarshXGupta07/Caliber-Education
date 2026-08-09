"use client";

// Shared terms text — rendered both on the standalone /terms page and inside
// the scrollable acceptance box on signup, so there's exactly one copy to
// keep in sync. This is a reasonable starting template, not legal advice —
// have it reviewed by a lawyer familiar with Indian consumer/e-commerce law
// before relying on the refund clause for real transactions (the
// Consumer Protection (E-Commerce) Rules, 2020 and general contract law
// both affect how enforceable a blanket "non-refundable" clause is).

const LAST_UPDATED = "9 August 2026";
const SUPPORT_EMAIL = "support@calibereducation.com"; // TODO: replace with your real support inbox once you have one

export function TermsContent() {
  return (
    <div className="space-y-6 text-sm text-ink-navy dark:text-paper leading-relaxed">
      <div>
        <h1 className="font-heading font-extrabold text-2xl mb-1">Terms &amp; Conditions</h1>
        <p className="text-xs text-slate dark:text-paper/50">Last updated: {LAST_UPDATED}</p>
      </div>

      <Section title="1. Acceptance of Terms">
        <p>
          By creating an account on Caliber Education (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;the platform&rdquo;), or by purchasing or
          using any course, MCQ package, test series, or 1:1 mentorship session, you agree to be bound by these
          Terms &amp; Conditions. If you do not agree, please do not create an account or use the platform.
        </p>
      </Section>

      <Section title="2. What We Offer">
        <p>
          Caliber Education provides Chartered Accountancy exam-preparation resources, including recorded and live
          courses, MCQ practice tests, evaluated test series (paper-based mock tests reviewed by mentors), and
          paid 1:1 mentorship sessions. Content and features are provided as described on the platform at the time
          of purchase and may be updated, expanded, or discontinued over time.
        </p>
      </Section>

      <Section title="3. Account Registration">
        <ul className="list-disc pl-5 space-y-1">
          <li>You must provide accurate, current information when creating an account.</li>
          <li>You are responsible for keeping your login credentials confidential and for all activity under your account.</li>
          <li>One account is for one individual&apos;s personal use — sharing login access with others is not permitted.</li>
          <li>We reserve the right to suspend or terminate accounts used for fraud, abuse, or violation of these terms.</li>
        </ul>
      </Section>

      <Section title="4. Payments & Pricing" highlight>
        <p>
          All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.
          Payments are processed through our third-party payment gateway; we do not store your card or bank
          details. Access to paid content/services is granted only after payment is successfully verified.
        </p>
      </Section>

      <Section title="5. Refund Policy — All Sales Are Final" highlight strong>
        <p className="font-semibold">
          All purchases made on Caliber Education — including courses, MCQ subject/bundle access, test series
          access, and 1:1 mentorship sessions — are <span className="underline">non-refundable</span> once
          payment is confirmed and access is granted.
        </p>
        <p className="mt-2">This applies regardless of whether you use the purchased content, attend a scheduled session, or complete a test, and regardless of your exam outcome. By completing a purchase, you acknowledge and accept that no refund, credit, or exchange will be issued except in the limited cases below.</p>
        <p className="mt-2 font-semibold">The only exceptions are, at our sole discretion:</p>
        <ul className="list-disc pl-5 space-y-1 mt-1">
          <li>A duplicate or erroneous charge caused by a technical/payment-gateway error (verified against payment records).</li>
          <li>A paid 1:1 session that we are unable to deliver due to no mentor being available, where rescheduling is also not possible.</li>
        </ul>
        <p className="mt-2">
          Any refund request must be raised within 7 days of the transaction at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-signal-emerald font-semibold hover:underline">{SUPPORT_EMAIL}</a> with the payment reference. Approved refunds are processed to the original payment method within a reasonable time and may take several business days to reflect, depending on your bank/payment provider.
        </p>
      </Section>

      <Section title="6. License to Use Content">
        <p>
          Purchasing access grants you a personal, non-transferable, non-exclusive license to view and use the
          content for your own exam preparation. You may not copy, redistribute, resell, publicly share, or upload
          our course material, question banks, or evaluated papers to any other platform, group, or third party.
        </p>
      </Section>

      <Section title="7. Test Integrity & Fair Use">
        <p>
          MCQ tests and test-series evaluations are intended to reflect your own individual preparation. Sharing
          answer keys, using unauthorized assistance during a timed attempt, or attempting to manipulate test
          timers or scoring is a violation of these terms and may result in the attempt being invalidated and/or
          the account being suspended.
        </p>
      </Section>

      <Section title="8. 1:1 Mentorship Sessions">
        <ul className="list-disc pl-5 space-y-1">
          <li>Sessions are scheduled by mutual availability between you and the assigned mentor after purchase.</li>
          <li>Please join on time — repeated no-shows may affect your ability to reschedule.</li>
          <li>Session content is for your personal guidance and is not a substitute for official ICAI study material or professional financial/legal advice.</li>
        </ul>
      </Section>

      <Section title="9. Intellectual Property">
        <p>
          All course content, question banks, branding, and platform design are the property of Caliber Education
          or its content partners/mentors, and are protected by applicable copyright and intellectual property
          law. No rights are transferred to you beyond the limited usage license in Section 6.
        </p>
      </Section>

      <Section title="10. Limitation of Liability">
        <p>
          Caliber Education provides exam-preparation resources on a best-effort basis and does not guarantee any
          specific exam result, rank, or outcome. To the fullest extent permitted by law, we are not liable for
          any indirect, incidental, or consequential damages arising from your use of the platform.
        </p>
      </Section>

      <Section title="11. Changes to These Terms">
        <p>
          We may update these Terms &amp; Conditions from time to time to reflect changes in our services or legal
          requirements. Material changes will be reflected by updating the &ldquo;Last updated&rdquo; date above. Continued
          use of the platform after an update constitutes acceptance of the revised terms.
        </p>
      </Section>

      <Section title="12. Governing Law">
        <p>
          These terms are governed by the laws of India. Any disputes arising from these terms or your use of the
          platform will be subject to the exclusive jurisdiction of the courts having competent authority.
        </p>
      </Section>

      <Section title="13. Contact Us">
        <p>
          Questions about these terms or a specific transaction can be sent to{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-signal-emerald font-semibold hover:underline">{SUPPORT_EMAIL}</a>.
        </p>
      </Section>
    </div>
  );
}

function Section({
  title, children, highlight, strong,
}: {
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
  strong?: boolean;
}) {
  return (
    <section
      className={
        highlight
          ? `p-4 rounded-xl border ${strong ? "border-alert-coral/40 bg-alert-coral/5" : "border-signal-emerald/30 bg-signal-emerald/5"}`
          : ""
      }
    >
      <h2 className="font-heading font-bold text-base mb-1.5">{title}</h2>
      {children}
    </section>
  );
}

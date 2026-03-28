import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using the NEO ID platform.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-32 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Terms & Conditions</h1>
      <p className="mb-10 text-sm text-muted-foreground">Last updated: March 28, 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the NEO ID platform (&quot;Service&quot;), operated by Taqneo
            (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;), you agree to be bound by these
            Terms & Conditions. If you do not agree, do not use the Service. These terms are governed
            by the laws of the Kingdom of Saudi Arabia, including the E-Commerce Law (Royal Decree
            No. M/126) and the Personal Data Protection Law (PDPL).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">2. Service Description</h2>
          <p>
            NEO ID provides a digital platform for creating and managing digital business profiles
            linked to physical NFC-enabled smart business cards. The Service includes profile
            creation, QR code generation, card template customization, physical card ordering, and
            company account management with employee seat allocation.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">3. Account Registration</h2>
          <p>
            You must provide accurate and complete information during registration. You are
            responsible for maintaining the confidentiality of your account credentials. You must be
            at least 18 years old or have the legal capacity to enter into contracts under Saudi
            Arabian law. Company accounts require authorized representatives.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">4. Subscriptions & Payments</h2>
          <p>
            All subscription plans are billed annually in Saudi Riyal (SAR). Prices are exclusive of
            Value Added Tax (VAT) at 15%, which is applied at checkout in accordance with the Zakat,
            Tax and Customs Authority (ZATCA) regulations. Payments are processed through PayPal.
            Subscriptions auto-renew unless cancelled before the renewal date. Refunds are handled in
            accordance with the Saudi E-Commerce Law and our refund policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">5. Physical Card Orders</h2>
          <p>
            Physical NFC card orders are subject to production and shipping timelines. Cards are
            shipped within Saudi Arabia. Delivery estimates are provided at checkout but are not
            guaranteed. Orders cannot be cancelled once production has started. Defective cards will
            be replaced at no additional cost.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">6. User Content</h2>
          <p>
            You retain ownership of content you upload to your profiles. By using the Service, you
            grant us a non-exclusive license to display your content on your public profile page.
            You are solely responsible for ensuring your content complies with Saudi Arabian laws,
            including regulations on public decency, intellectual property, and anti-fraud provisions.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">7. Prohibited Use</h2>
          <p>
            You may not use the Service for any unlawful purpose, to distribute harmful or
            fraudulent content, to impersonate others, or to violate any applicable laws of the
            Kingdom of Saudi Arabia. We reserve the right to suspend or terminate accounts that
            violate these terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">8. Intellectual Property</h2>
          <p>
            The NEO ID name, logo, card designs, templates, and platform code are the intellectual
            property of Taqneo. You may not copy, modify, or distribute any part of the Service
            without our written consent. Card template designs remain our property even when applied
            to your physical cards.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by Saudi Arabian law, Taqneo shall not be liable for
            any indirect, incidental, or consequential damages arising from your use of the Service.
            Our total liability shall not exceed the amount you paid for the Service in the twelve
            months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">10. Governing Law & Disputes</h2>
          <p>
            These terms are governed by the laws of the Kingdom of Saudi Arabia. Any disputes
            arising from these terms shall be resolved through the competent courts in the Kingdom
            of Saudi Arabia, or through arbitration in accordance with Saudi Arbitration Law (Royal
            Decree No. M/34).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">11. Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of the Service after changes
            constitutes acceptance of the updated terms. We will notify users of material changes
            via email or in-app notification.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">12. Contact</h2>
          <p>
            For questions about these terms, contact us at{" "}
            <a href="mailto:hello@neo-id.com" className="text-neo-teal hover:underline">
              hello@neo-id.com
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How NEO ID collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-32 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mb-10 text-sm text-muted-foreground">Last updated: March 28, 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">1. Introduction</h2>
          <p>
            Taqneo (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;) operates the NEO ID
            platform. This Privacy Policy explains how we collect, use, disclose, and protect your
            personal data in compliance with the Kingdom of Saudi Arabia&apos;s Personal Data
            Protection Law (PDPL), issued by Royal Decree No. M/19, and its implementing
            regulations issued by the Saudi Data and Artificial Intelligence Authority (SDAIA).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">2. Data We Collect</h2>
          <p className="mb-2">We collect the following categories of personal data:</p>
          <ul className="list-inside list-disc space-y-1 pl-2">
            <li><strong>Account data:</strong> Name, email address, phone number, profile photo</li>
            <li><strong>Profile data:</strong> Job title, bio, social links, contact information you choose to display publicly</li>
            <li><strong>Company data:</strong> Company name (English/Arabic), CR number, logo, brand colors</li>
            <li><strong>Payment data:</strong> Processed by PayPal. We do not store card numbers or bank details</li>
            <li><strong>Shipping data:</strong> Delivery address for physical card orders</li>
            <li><strong>Usage data:</strong> Profile views, NFC taps, device information, analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">3. Legal Basis for Processing</h2>
          <p>
            Under the PDPL, we process your personal data based on: (a) your consent provided during
            registration, (b) the necessity to perform our contract with you (providing the Service),
            (c) our legitimate interests in improving the Service, and (d) compliance with legal
            obligations under Saudi Arabian law, including ZATCA tax regulations.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">4. How We Use Your Data</h2>
          <ul className="list-inside list-disc space-y-1 pl-2">
            <li>To create and maintain your digital business profile</li>
            <li>To process physical card orders and deliver them</li>
            <li>To manage subscription billing and payments</li>
            <li>To provide analytics on profile views and NFC interactions</li>
            <li>To send service-related communications</li>
            <li>To comply with legal and regulatory requirements in KSA</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">5. Data Sharing</h2>
          <p>We share your personal data only with:</p>
          <ul className="list-inside list-disc space-y-1 pl-2 mt-2">
            <li><strong>Payment processors:</strong> PayPal, for processing subscriptions and orders</li>
            <li><strong>Authentication provider:</strong> Kinde, for secure login</li>
            <li><strong>Cloud infrastructure:</strong> For hosting and data storage</li>
            <li><strong>Your employer:</strong> If you are on a company plan, your company administrator can view your profile and order status</li>
          </ul>
          <p className="mt-2">
            We do not sell your personal data to third parties. Any cross-border data transfer
            complies with the PDPL requirements for adequate data protection.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">6. Public Profiles</h2>
          <p>
            Information you add to your NEO ID profile (name, title, bio, social links, contact
            info) is publicly accessible via your profile URL and QR code. NFC card taps direct
            visitors to your public profile. You can unpublish your profile at any time to remove
            public access.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">7. Data Retention</h2>
          <p>
            We retain your personal data for as long as your account is active. If you delete your
            account, we will delete your personal data within 30 days, except where retention is
            required by Saudi Arabian law (e.g., financial records required by ZATCA for a minimum
            of 6 years).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">8. Your Rights Under PDPL</h2>
          <p className="mb-2">Under the Saudi Personal Data Protection Law, you have the right to:</p>
          <ul className="list-inside list-disc space-y-1 pl-2">
            <li>Access your personal data held by us</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data (subject to legal retention requirements)</li>
            <li>Withdraw consent for data processing</li>
            <li>Request a copy of your data in a structured format</li>
            <li>Object to processing based on legitimate interests</li>
            <li>Lodge a complaint with the Saudi Data and Artificial Intelligence Authority (SDAIA)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">9. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal
            data, including encryption in transit (TLS), secure authentication, and access controls.
            In the event of a data breach, we will notify affected users and the relevant authorities
            as required by the PDPL.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">10. Cookies & Analytics</h2>
          <p>
            We use essential cookies for authentication and session management. We collect anonymized
            analytics data (profile views, tap counts) to help you understand your card performance.
            No third-party advertising cookies are used.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">11. Changes to This Policy</h2>
          <p>
            We may update this policy to reflect changes in our practices or Saudi regulations.
            We will notify users of material changes via email or in-app notification. Continued
            use of the Service constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">12. Contact</h2>
          <p>
            For privacy-related inquiries or to exercise your PDPL rights, contact us at{" "}
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

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Verve",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-content px-6 py-24">
      <h1 className="font-heading text-4xl font-semibold text-text-primary">Terms of Service</h1>
      <p className="mt-2 text-sm text-text-muted">Last updated: July 2026</p>

      <div className="mt-10 space-y-6 text-text-secondary leading-relaxed">
        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">1. Acceptance</h2>
          <p>
            By creating an account or using Verve, you agree to these terms. If you do not agree,
            you must not use the service.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">2. Account</h2>
          <p>
            You are responsible for maintaining the confidentiality of your credentials and for
            all activity under your account. You must be at least 13 years old to use Verve.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">3. Acceptable Use</h2>
          <p>
            You agree not to misuse the service, including attempting to circumvent rate limits,
            scraping data, or submitting harmful content. We reserve the right to suspend
            accounts that violate these rules.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">4. Subscriptions & Billing</h2>
          <p>
            Free accounts are subject to a weekly session limit. Pro subscriptions are billed
            monthly or annually through our payment partner Stripe. Refunds follow Stripe&apos;s
            refund policy. You may cancel anytime from the billing portal.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">5. Intellectual Property</h2>
          <p>
            The Verve platform, including its design, code, and branding, is owned by Verve.
            Feedback generated during sessions is provided for personal use and may not be
            redistributed commercially.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">6. Limitation of Liability</h2>
          <p>
            Verve is provided &quot;as is&quot; without warranties of any kind. We are not liable for
            damages arising from use of the service, including loss of data or interruption of
            service, to the maximum extent permitted by law.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">7. Changes</h2>
          <p>
            We may update these terms at any time. Continued use after changes constitutes
            acceptance of the new terms. Material changes will be notified via email.
          </p>
        </section>
      </div>
    </main>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Verve",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-content px-6 py-24">
      <h1 className="font-heading text-4xl font-semibold text-text-primary">Privacy Policy</h1>
      <p className="mt-2 text-sm text-text-muted">Last updated: July 2026</p>

      <div className="mt-10 space-y-6 text-text-secondary leading-relaxed">
        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">1. Information We Collect</h2>
          <p>
            When you create an account, we collect your email address, display name, and a password
            (stored as a salted hash). During practice sessions we record audio, which is transcribed
            and analyzed to provide feedback. We also collect usage data such as session timestamps,
            mode selections, and skill scores.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">2. How We Use Your Information</h2>
          <p>
            Your data is used to deliver our service: generate feedback, display progress,
            maintain leaderboards, and improve our AI models. We never sell your personal data.
            Audio recordings are stored temporarily for processing and may be retained for
            quality improvement with your consent.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">3. Data Sharing</h2>
          <p>
            We use third-party services for cloud infrastructure (hosting), email delivery,
            payment processing, and error monitoring. Each provider is contractually bound to
            protect your data. We may share anonymized aggregate data for research or marketing.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">4. Your Rights</h2>
          <p>
            You may request access, correction, or deletion of your personal data at any time
            by contacting us. You may export your data and cancel your account from the settings page.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">5. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. Optional analytics
            cookies help us understand usage patterns. You can manage your preferences via the
            cookie banner.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-3">6. Contact</h2>
          <p>
            Questions about this policy can be sent to{" "}
            <span className="text-gold">privacy@verve.app</span>.
          </p>
        </section>
      </div>
    </main>
  );
}

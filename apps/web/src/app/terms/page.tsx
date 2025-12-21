export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-300 sm:py-20">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-4 border-b border-slate-800 pb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Terms of Service</h1>
          <p className="text-lg text-slate-400">Last updated: December 21, 2025</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using TimeTwin, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. Description of Service</h2>
          <p>
            TimeTwin is a free application designed to help users track specific time timestamps ("synchronicities") and share them with others. The service is provided "as is" and is free of charge.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. User Conduct</h2>
          <p>
            You agree not to use the service for any unlawful purpose. You are responsible for all content (notes, moods) you post. We reserve the right to terminate accounts that engage in harassment, abuse, or post inappropriate content.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. Intellectual Property</h2>
          <p>
            The TimeTwin app, logo, and design are the property of the TimeTwin team. You retain ownership of the data you generate (your journals and captures).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">5. Limitation of Liability</h2>
          <p>
            In no event shall TimeTwin be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will indicate that changes have been made by updating the "Last updated" date at the top of this page.
          </p>
        </section>
      </div>
    </div>
  )
}

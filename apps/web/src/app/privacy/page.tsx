export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-300 sm:py-20">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-4 border-b border-slate-800 pb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Privacy Policy</h1>
          <p className="text-lg text-slate-400">Last updated: December 21, 2025</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
          <p>
            Welcome to TimeTwin ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and mobile application. This policy outlines our practices freely and transparently. We do not sell your data.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Account Information:</strong> When you sign up, we collect your email address and username to create your account and sync your data across devices.
            </li>
            <li>
              <strong>User Content:</strong> We store the "captures" you create, including timestamps, notes, mood tags, and any images you choose to upload as an avatar.
            </li>
            <li>
              <strong>Usage Data:</strong> We track basic usage statistics (e.g., streak counts, capture frequency) to generate your leaderboard stats and personal history.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. How We Use Your Information</h2>
          <p>We use your information solely to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide and maintain the TimeTwin service.</li>
            <li>Sync your captures across your devices.</li>
            <li>Display your public profile and stats on the Leaderboard (unless you opt-out or set your profile to private).</li>
            <li>Enable social features like friend requests and sharing.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. Data Sharing and Third Parties</h2>
          <p>
            We do not sell, trade, or rent your personal identification information to others. We use trusted third-party services like <strong>Supabase</strong> for secure authentication and database hosting. These providers are bound by confidentiality agreements and standard data protection laws.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">5. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your account at any time. You can delete your account directly within the app settings, which will permanently remove all your data from our servers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">6. Children's Privacy</h2>
          <p>
            Our service is not directed to anyone under the age of 13. We do not knowingly collect personal information from children under 13.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at support@timetwin.app.
          </p>
        </section>
      </div>
    </div>
  )
}

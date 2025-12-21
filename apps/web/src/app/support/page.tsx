
import Link from 'next/link';

export const metadata = {
  title: 'Support - TimeTwin',
  description: 'Get help and support for TimeTwin. FAQs, contact information, and troubleshooting.',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#0D0F12] text-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-8">
          Support Center
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-xl text-gray-300 mb-12">
            Having trouble with TimeTwin? We're here to help you capture every magic moment.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-white border-b border-gray-800 pb-2">Frequently Asked Questions</h2>
            
            <div className="space-y-8">
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-medium text-blue-300 mb-2">Why can't I capture at any time?</h3>
                <p className="text-gray-400">
                  TimeTwin is designed to track synchronicities. You can only capture when the current time is a "Twin Minute" (e.g., 11:11, 22:22) or a special sequence. This ensures every capture on the platform is genuine magic.
                </p>
              </div>

              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-medium text-blue-300 mb-2">My time seems off?</h3>
                <p className="text-gray-400">
                  TimeTwin relies on your device's network time and validates it against our servers. Ensure your phone is set to "Set Automatically" for date and time settings.
                </p>
              </div>

              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <h3 className="text-xl font-medium text-blue-300 mb-2">How do I delete my account?</h3>
                <p className="text-gray-400">
                  You can invoke your right to be forgotten at any time. Please email us at <a href="mailto:privacy@timetwin.xyz" className="text-blue-400 hover:underline">privacy@timetwin.xyz</a> with the subject "Delete Account" and we will process your request immediately.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-white border-b border-gray-800 pb-2">Contact Us</h2>
            <p className="text-gray-300 mb-4">
              Cant find what you're looking for? Reach out to our team directly.
            </p>
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-2xl border border-gray-700 text-center">
              <p className="text-gray-400 mb-2">General Inquiries & Support</p>
              <a href="mailto:support@timetwin.xyz" className="text-3xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
                support@timetwin.xyz
              </a>
            </div>
          </section>
        </div>

        <div className="mt-20 pt-8 border-t border-gray-800 text-center text-gray-500">
          <Link href="/" className="hover:text-white transition-colors">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

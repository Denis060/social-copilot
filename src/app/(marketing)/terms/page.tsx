import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Last updated: March 31, 2026
      </p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        <p>
          Welcome to Social-Copilot. By accessing or using our Service, you
          agree to be bound by these Terms of Service ("Terms"). If you do not
          agree, do not use the Service.
        </p>

        <h2>1. Description of Service</h2>
        <p>
          Social-Copilot is a social media management platform that allows users
          to connect social media accounts, create and schedule posts, generate
          AI-powered captions, set up auto-reply rules, and view analytics
          across multiple platforms.
        </p>

        <h2>2. Eligibility</h2>
        <p>
          You must be at least 13 years old to use the Service. By using the
          Service, you represent that you meet this requirement and have the
          legal capacity to enter into these Terms.
        </p>

        <h2>3. Account Registration</h2>
        <ul>
          <li>You must provide accurate and complete information when creating an account</li>
          <li>You are responsible for maintaining the security of your account credentials</li>
          <li>You are responsible for all activity that occurs under your account</li>
          <li>You must notify us immediately of any unauthorized use of your account</li>
        </ul>

        <h2>4. Connected Social Media Accounts</h2>
        <ul>
          <li>You authorize us to access your connected social media accounts to perform actions on your behalf (posting content, reading comments, fetching analytics)</li>
          <li>You are solely responsible for the content you publish through the Service</li>
          <li>You must comply with each platform's terms of service and community guidelines</li>
          <li>You may disconnect any social media account at any time from the Accounts page</li>
          <li>We are not responsible for any changes to third-party APIs that may affect the Service</li>
        </ul>

        <h2>5. AI-Generated Content</h2>
        <ul>
          <li>The Service uses Google Gemini AI to generate captions and auto-replies</li>
          <li>AI-generated content is provided as suggestions — you are responsible for reviewing and approving content before publication</li>
          <li>Auto-reply rules that you enable may send responses automatically — you are responsible for configuring appropriate rules and monitoring their output</li>
          <li>We do not guarantee the accuracy, appropriateness, or quality of AI-generated content</li>
        </ul>

        <h2>6. Plans & Billing</h2>

        <h3>Free Plan</h3>
        <ul>
          <li>1 connected social media account</li>
          <li>10 posts per month</li>
          <li>Basic scheduling and analytics</li>
        </ul>

        <h3>Premium Plan ($29/month or $23/month billed annually)</h3>
        <ul>
          <li>Unlimited connected social media accounts</li>
          <li>Unlimited posts</li>
          <li>AI Caption Magic and AI Auto-Reply</li>
          <li>Advanced analytics</li>
          <li>Priority support</li>
        </ul>

        <h3>Payment Terms</h3>
        <ul>
          <li>Payments are processed securely through Stripe</li>
          <li>Subscriptions renew automatically unless cancelled</li>
          <li>You may cancel your subscription at any time through the Billing settings</li>
          <li>Refunds are handled on a case-by-case basis</li>
          <li>We reserve the right to change pricing with 30 days notice</li>
        </ul>

        <h2>7. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service to post spam, malware, or harmful content</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe upon the intellectual property rights of others</li>
          <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
          <li>Use the Service to harass, abuse, or harm others</li>
          <li>Reverse engineer, decompile, or disassemble the Service</li>
          <li>Use automated tools to scrape or access the Service beyond normal usage</li>
          <li>Resell or redistribute the Service without authorization</li>
        </ul>

        <h2>8. Intellectual Property</h2>
        <ul>
          <li>The Service, including its design, code, and branding, is owned by Jobos Technologies LLC</li>
          <li>You retain ownership of all content you create and publish through the Service</li>
          <li>You grant us a limited license to store and process your content solely to provide the Service</li>
        </ul>

        <h2>9. Data & Privacy</h2>
        <p>
          Your use of the Service is also governed by our{" "}
          <a href="/privacy" className="text-primary underline">
            Privacy Policy
          </a>
          , which describes how we collect, use, and protect your data.
        </p>

        <h2>10. Service Availability</h2>
        <ul>
          <li>We strive to maintain 99.9% uptime but do not guarantee uninterrupted service</li>
          <li>We may perform scheduled maintenance with advance notice when possible</li>
          <li>We are not liable for downtime caused by third-party services (social platforms, Stripe, etc.)</li>
        </ul>

        <h2>11. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Jobos Technologies LLC shall not be
          liable for any indirect, incidental, special, consequential, or
          punitive damages, including but not limited to loss of profits, data,
          or business opportunities, arising from your use of the Service.
        </p>

        <h2>12. Termination</h2>
        <ul>
          <li>You may delete your account at any time from the Settings → Danger Zone page</li>
          <li>We may suspend or terminate your account if you violate these Terms</li>
          <li>Upon termination, your data will be deleted in accordance with our Privacy Policy</li>
        </ul>

        <h2>13. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. We will notify you of
          material changes by email or through the Service. Continued use of the
          Service after changes constitutes acceptance of the updated Terms.
        </p>

        <h2>14. Governing Law</h2>
        <p>
          These Terms are governed by and construed in accordance with
          applicable laws. Any disputes shall be resolved through good-faith
          negotiation before pursuing formal legal action.
        </p>

        <h2>15. Contact Us</h2>
        <p>
          If you have questions about these Terms, please contact us at{" "}
          <a href="mailto:support@social-copilot.com" className="text-primary underline">
            support@social-copilot.com
          </a>.
        </p>
      </div>
    </div>
  );
}

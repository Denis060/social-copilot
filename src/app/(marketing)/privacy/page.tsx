import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Last updated: March 31, 2026
      </p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        <p>
          Social-Copilot ("we", "our", or "us") operates the Social-Copilot
          platform (the "Service"). This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you use our Service.
        </p>

        <h2>1. Information We Collect</h2>

        <h3>Account Information</h3>
        <p>
          When you create an account, we collect your email address, name, and
          profile picture. If you sign in via a third-party provider (e.g.,
          Google), we receive your basic profile information from that provider.
        </p>

        <h3>Social Media Account Data</h3>
        <p>
          When you connect a social media platform (Instagram, YouTube, TikTok,
          Facebook, LinkedIn, Pinterest, Discord, Twitter/X, Slack), we receive
          and store OAuth access tokens and refresh tokens. These tokens are
          encrypted using AES-256-GCM encryption before storage and are used
          solely to perform actions you authorize (publishing posts, reading
          comments, etc.).
        </p>

        <h3>Content Data</h3>
        <p>
          We store the posts you create, schedule, and publish through our
          Service, including text content, media files (uploaded via ImageKit),
          and scheduling metadata.
        </p>

        <h3>Analytics Data</h3>
        <p>
          We collect engagement metrics (likes, comments, shares, reach) from
          your connected social media accounts to display analytics within the
          Service.
        </p>

        <h3>Payment Information</h3>
        <p>
          Payment processing is handled by Stripe. We do not store your credit
          card numbers or payment details. We store your Stripe customer ID and
          subscription status to manage your plan.
        </p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provide and maintain the Service</li>
          <li>To publish posts on your behalf to connected social platforms</li>
          <li>To generate AI-powered captions and auto-replies using Google Gemini</li>
          <li>To display analytics and engagement metrics</li>
          <li>To process payments and manage subscriptions</li>
          <li>To send you notifications about your account and posts</li>
          <li>To improve and optimize the Service</li>
        </ul>

        <h2>3. Data Sharing & Third-Party Services</h2>
        <p>We share your data with the following third-party services solely to operate the Service:</p>
        <ul>
          <li><strong>Supabase</strong> — Database hosting and authentication</li>
          <li><strong>Stripe</strong> — Payment processing</li>
          <li><strong>Google Gemini</strong> — AI caption generation and auto-reply</li>
          <li><strong>ImageKit</strong> — Media file storage and transformation</li>
          <li><strong>Inngest</strong> — Background job scheduling</li>
          <li><strong>Vercel</strong> — Application hosting</li>
          <li><strong>Social media platforms</strong> — Only platforms you explicitly connect</li>
        </ul>
        <p>
          We do not sell, rent, or trade your personal information to any third
          parties for marketing purposes.
        </p>

        <h2>4. Data Security</h2>
        <ul>
          <li>All OAuth tokens are encrypted using AES-256-GCM before database storage</li>
          <li>Database access is protected by Row Level Security (RLS) policies</li>
          <li>All connections use HTTPS/TLS encryption in transit</li>
          <li>Stripe webhook signatures are verified for payment events</li>
          <li>Service role keys are restricted to server-side operations only</li>
        </ul>

        <h2>5. Data Retention</h2>
        <p>
          We retain your data for as long as your account is active. When you
          delete your account, we delete all associated data including posts,
          connected accounts, analytics, and encrypted tokens. Payment records
          may be retained as required by law.
        </p>

        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access and download your personal data</li>
          <li>Correct inaccurate information via the Settings page</li>
          <li>Disconnect any social media account at any time</li>
          <li>Delete your account and all associated data</li>
          <li>Opt out of non-essential notifications</li>
        </ul>

        <h2>7. Cookies</h2>
        <p>
          We use essential cookies for authentication and session management.
          We do not use advertising or tracking cookies.
        </p>

        <h2>8. Children's Privacy</h2>
        <p>
          The Service is not intended for users under the age of 13. We do not
          knowingly collect personal information from children under 13.
        </p>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new policy on this page and updating
          the "Last updated" date.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:support@social-copilot.com" className="text-primary underline">
            support@social-copilot.com
          </a>.
        </p>
      </div>
    </div>
  );
}

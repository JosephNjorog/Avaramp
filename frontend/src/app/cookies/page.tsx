import type { Metadata } from "next";
import LegalPage, { Section, SubSection, Callout, Ul } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy — AvaRamp",
  description: "AvaRamp's Cookie Policy explaining how we use cookies and similar tracking technologies.",
};

const SECTIONS = [
  { id: "what-are-cookies",  title: "1. What Are Cookies?"           },
  { id: "why-we-use",        title: "2. Why We Use Cookies"          },
  { id: "types",             title: "3. Types of Cookies We Use"     },
  { id: "third-party",       title: "4. Third-Party Cookies"         },
  { id: "local-storage",     title: "5. Local Storage & Similar"     },
  { id: "your-choices",      title: "6. Your Choices"                },
  { id: "do-not-track",      title: "7. Do Not Track"                },
  { id: "updates",           title: "8. Updates to This Policy"      },
  { id: "contact",           title: "9. Contact"                     },
];

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      subtitle="This Cookie Policy explains how AvaRamp uses cookies and similar technologies when you visit our website or use our platform. It should be read alongside our Privacy Policy."
      lastUpdated="April 10, 2026"
      sections={SECTIONS}
    >
      <Callout type="info">
        By continuing to use our website and platform after seeing our cookie notice, you consent to our use of cookies as described in this policy. You can manage or withdraw consent at any time using the methods described in Section 6.
      </Callout>

      <Section id="what-are-cookies" title="1. What Are Cookies?">
        <p>
          Cookies are small text files that are placed on your computer, smartphone, or other device by websites you visit. They are widely used to make websites work efficiently and to provide information to website operators. Cookies allow a website to remember your actions and preferences (such as login status or theme preference) over a period of time.
        </p>
        <p>
          Cookies can be "session cookies" (temporary, deleted when you close your browser) or "persistent cookies" (stored on your device for a set period or until you delete them). Cookies can be "first-party" (set by AvaRamp) or "third-party" (set by third-party services we use).
        </p>
        <p>
          Similar technologies include web beacons (small images that track whether an email was opened), pixel tags, and local storage — all of which we may use for similar purposes to cookies. This policy covers all such technologies.
        </p>
      </Section>

      <Section id="why-we-use" title="2. Why We Use Cookies">
        <p>AvaRamp uses cookies and similar technologies for the following reasons:</p>
        <Ul items={[
          "To keep you logged in to your Merchant account securely across page navigations",
          "To remember your display preferences (light or dark theme)",
          "To protect against cross-site request forgery (CSRF) attacks",
          "To maintain the state of your session when using our API and dashboard",
          "To understand how users navigate our website so we can improve it",
          "To diagnose and fix technical errors on the platform",
          "To ensure the website displays correctly on your device",
        ]} />
        <p>We do not use cookies for advertising, profiling, or tracking you across third-party websites.</p>
      </Section>

      <Section id="types" title="3. Types of Cookies We Use">
        <SubSection title="3.1 Strictly Necessary Cookies">
          <p>These cookies are essential for the website and platform to function correctly. Without them, services like secure login, dashboard access, and payment processing cannot work. These cookies do not require your consent under applicable law because they are necessary to provide a service you have explicitly requested.</p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-6 font-semibold text-primary">Cookie Name</th>
                  <th className="text-left py-2 pr-6 font-semibold text-primary">Purpose</th>
                  <th className="text-left py-2 font-semibold text-primary">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["avaramp_session",   "Maintains your authenticated session",              "Session"],
                  ["avaramp_csrf",      "Prevents cross-site request forgery attacks",       "Session"],
                  ["__Secure-authToken","Stores your JWT authentication token (HttpOnly)",   "7 days"],
                ].map(([name, purpose, duration]) => (
                  <tr key={name}>
                    <td className="py-2.5 pr-6 font-mono text-xs text-primary">{name}</td>
                    <td className="py-2.5 pr-6 text-secondary">{purpose}</td>
                    <td className="py-2.5 text-secondary">{duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SubSection>

        <SubSection title="3.2 Functional / Preference Cookies">
          <p>These cookies enable the platform to remember choices you make and provide enhanced, personalized features. If you do not allow these cookies, some features may not function correctly.</p>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-6 font-semibold text-primary">Storage Key</th>
                  <th className="text-left py-2 pr-6 font-semibold text-primary">Purpose</th>
                  <th className="text-left py-2 font-semibold text-primary">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["avaramp-theme",       "Remembers your chosen light/dark theme",           "localStorage"],
                  ["avaramp-auth",        "Persists your login state between sessions",        "localStorage"],
                  ["avaramp-wc2",        "WalletConnect session state for payment pages",      "localStorage"],
                ].map(([key, purpose, type]) => (
                  <tr key={key}>
                    <td className="py-2.5 pr-6 font-mono text-xs text-primary">{key}</td>
                    <td className="py-2.5 pr-6 text-secondary">{purpose}</td>
                    <td className="py-2.5 text-secondary">{type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SubSection>

        <SubSection title="3.3 Analytics Cookies">
          <p>We may use analytics cookies to understand how visitors interact with our website. These cookies collect information in an aggregated, anonymized form and help us improve the platform. We do not use analytics cookies to identify individual users.</p>
          <p>Currently, AvaRamp uses only self-hosted analytics with no third-party tracking cookies. If we introduce third-party analytics tools in the future, we will update this policy and obtain your consent as required.</p>
        </SubSection>

        <SubSection title="3.4 Cookies We Do NOT Use">
          <p>AvaRamp does not use:</p>
          <Ul items={[
            "Advertising or retargeting cookies",
            "Cross-site tracking cookies",
            "Social media tracking pixels (Facebook Pixel, Twitter Pixel, etc.)",
            "Fingerprinting or other persistent user tracking technologies",
          ]} />
        </SubSection>
      </Section>

      <Section id="third-party" title="4. Third-Party Cookies">
        <p>Some features of our platform involve third-party services that may set their own cookies or use similar technologies. We have no control over these third-party cookies. The third parties that may set cookies in connection with our Service include:</p>

        <div className="space-y-4 mt-3">
          {[
            {
              name:    "WalletConnect (Reown)",
              purpose: "Enables browser wallet connections on our payment pages. WalletConnect may store session data in localStorage to maintain your wallet connection.",
              link:    "https://walletconnect.com/privacy",
            },
            {
              name:    "Vercel",
              purpose: "Our frontend hosting provider. Vercel may set performance and analytics cookies to optimize content delivery.",
              link:    "https://vercel.com/legal/privacy-policy",
            },
            {
              name:    "Render",
              purpose: "Our backend hosting provider. May use cookies for routing and load balancing.",
              link:    "https://render.com/privacy",
            },
          ].map(({ name, purpose, link }) => (
            <div key={name} className="p-4 bg-card border border-border rounded-xl">
              <p className="font-semibold text-primary text-sm mb-1">{name}</p>
              <p className="text-sm text-secondary mb-2">{purpose}</p>
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-DEFAULT hover:underline">
                View their privacy policy →
              </a>
            </div>
          ))}
        </div>
      </Section>

      <Section id="local-storage" title="5. Local Storage & Similar Technologies">
        <p>In addition to cookies, AvaRamp uses the browser's <code className="text-xs bg-surface px-1.5 py-0.5 rounded font-mono">localStorage</code> API to store certain preferences and session data. Unlike cookies, localStorage data is not sent to our servers with every request — it remains on your device until you clear it.</p>
        <p>We use localStorage specifically for:</p>
        <Ul items={[
          "Your theme preference (light or dark mode) so it is remembered across visits",
          "Your authentication state to keep you logged in between browser sessions",
          "WalletConnect wallet session data for the payment pages",
        ]} />
        <p>You can clear localStorage data at any time through your browser's Developer Tools or by clearing your browser's site data. Clearing this data will log you out and reset your display preferences.</p>
      </Section>

      <Section id="your-choices" title="6. Your Choices">
        <SubSection title="6.1 Browser Controls">
          <p>Most web browsers allow you to control cookies through their settings. You can:</p>
          <Ul items={[
            "View what cookies are stored on your device",
            "Delete all cookies or cookies from specific websites",
            "Block cookies from all websites or specific websites",
            "Configure your browser to alert you when a cookie is set",
          ]} />
          <p>Cookie settings are typically found in your browser's Privacy, Security, or Settings menu. Instructions for common browsers:</p>
          <Ul items={[
            "Google Chrome: Settings → Privacy and Security → Cookies and other site data",
            "Mozilla Firefox: Settings → Privacy & Security → Cookies and Site Data",
            "Apple Safari: Preferences → Privacy → Manage Website Data",
            "Microsoft Edge: Settings → Privacy, search, and services → Cookies and site permissions",
          ]} />
        </SubSection>

        <SubSection title="6.2 Effect of Disabling Cookies">
          <Callout type="warning">
            Disabling strictly necessary cookies will prevent you from logging in to the AvaRamp Merchant dashboard and will impair or disable most platform functionality. Disabling functional cookies will cause your theme preferences and login state to be lost between sessions. We recommend keeping strictly necessary cookies enabled while using AvaRamp.
          </Callout>
        </SubSection>

        <SubSection title="6.3 Clearing localStorage">
          <p>To clear AvaRamp-specific localStorage data, open your browser's Developer Tools (F12 or Cmd+Option+I), navigate to the Application tab, select Local Storage, find avarampsure.vercel.app (or your configured domain), and delete the entries listed in Section 3.2.</p>
        </SubSection>

        <SubSection title="6.4 Withdrawing Consent">
          <p>If you previously consented to analytics or functional cookies and wish to withdraw consent, email us at <a href="mailto:privacy@avaramp.com" className="text-indigo-DEFAULT hover:underline">privacy@avaramp.com</a> and we will guide you through the process. Note that withdrawing consent does not affect the lawfulness of any processing that occurred before withdrawal, and does not apply to strictly necessary cookies.</p>
        </SubSection>
      </Section>

      <Section id="do-not-track" title="7. Do Not Track">
        <p>Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not wish to be tracked. Currently, there is no universally agreed technical standard for how websites should respond to DNT signals. AvaRamp does not currently alter its data collection and use practices in response to DNT signals, but we will revisit this as standards develop.</p>
        <p>Regardless of DNT signals, AvaRamp does not use advertising cookies or cross-site tracking, so the practical impact of a DNT signal on your AvaRamp experience is minimal.</p>
      </Section>

      <Section id="updates" title="8. Updates to This Policy">
        <p>We may update this Cookie Policy from time to time to reflect changes in the cookies we use, our privacy practices, or applicable law. The updated policy will be posted on this page with a revised "Last Updated" date. If changes are material, we will notify you by email or via a dashboard notice.</p>
        <p>We encourage you to review this policy periodically to stay informed about how we use cookies.</p>
      </Section>

      <Section id="contact" title="9. Contact">
        <p>If you have questions or concerns about our use of cookies or this Cookie Policy, please contact:</p>
        <div className="bg-card border border-border rounded-xl p-5 space-y-2 mt-4">
          <p><strong className="text-primary">AvaRamp Technologies Ltd.</strong></p>
          <p>Data Protection Officer</p>
          <p>Email: <a href="mailto:privacy@avaramp.com" className="text-indigo-DEFAULT hover:underline">privacy@avaramp.com</a></p>
        </div>
      </Section>
    </LegalPage>
  );
}

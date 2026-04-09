import type { Metadata } from "next";
import LegalPage, { Section, SubSection, Callout, Ul } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — AvaRamp",
  description: "AvaRamp's Privacy Policy explaining how we collect, use, and protect your personal data.",
};

const SECTIONS = [
  { id: "introduction",    title: "1. Introduction"                    },
  { id: "controller",      title: "2. Data Controller"                 },
  { id: "what-we-collect", title: "3. Information We Collect"          },
  { id: "how-we-use",      title: "4. How We Use Your Information"     },
  { id: "legal-basis",     title: "5. Legal Basis for Processing"      },
  { id: "sharing",         title: "6. Information Sharing"             },
  { id: "blockchain",      title: "7. Blockchain Transparency"         },
  { id: "retention",       title: "8. Data Retention"                  },
  { id: "rights",          title: "9. Your Rights"                     },
  { id: "international",   title: "10. International Transfers"        },
  { id: "security",        title: "11. Security Measures"              },
  { id: "children",        title: "12. Children's Privacy"             },
  { id: "cookies-ref",     title: "13. Cookies"                        },
  { id: "third-party",     title: "14. Third-Party Links"              },
  { id: "changes",         title: "15. Changes to This Policy"         },
  { id: "contact",         title: "16. Contact & Complaints"           },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="AvaRamp is committed to protecting your privacy. This policy explains what personal data we collect, why we collect it, how we use it, and the rights you have over your information."
      lastUpdated="April 10, 2026"
      sections={SECTIONS}
    >
      <Callout type="info">
        This Privacy Policy applies to all users of AvaRamp — including Merchants, Customers accessing payment pages, and visitors to our website. It is compliant with the <strong>Kenya Data Protection Act, 2019</strong> (Cap. 411C) and aligned with international best practices including GDPR principles.
      </Callout>

      <Section id="introduction" title="1. Introduction">
        <p>
          AvaRamp Technologies Ltd. ("AvaRamp," "we," "us," or "our") operates a cryptocurrency-to-fiat payment gateway that enables businesses (Merchants) to accept USDC on the Avalanche blockchain and receive settlement in African mobile money (M-Pesa, MTN, Airtel, and others). In doing so, we collect and process personal data about Merchants, their Customers, and website visitors.
        </p>
        <p>
          We take your privacy seriously. We collect only what we need, store it securely, and will never sell your personal data to third parties for marketing purposes. This policy describes our practices in plain language. Where legal terminology is necessary, we explain it.
        </p>
        <p>
          By using AvaRamp, you consent to the collection and use of your personal data as described in this Privacy Policy. If you do not agree, you must not use our services.
        </p>
      </Section>

      <Section id="controller" title="2. Data Controller">
        <p>The data controller responsible for your personal data is:</p>
        <div className="bg-card border border-border rounded-xl p-5 space-y-1">
          <p><strong className="text-primary">AvaRamp Technologies Ltd.</strong></p>
          <p>Nairobi, Republic of Kenya</p>
          <p>Data Protection Officer: <a href="mailto:privacy@avaramp.com" className="text-indigo-DEFAULT hover:underline">privacy@avaramp.com</a></p>
        </div>
        <p>
          AvaRamp is registered as a data controller under the Kenya Data Protection Act, 2019. Any questions about how we process your data should be directed to our Data Protection Officer.
        </p>
      </Section>

      <Section id="what-we-collect" title="3. Information We Collect">
        <SubSection title="3.1 Information You Provide Directly">
          <p><strong className="text-primary">Merchant Registration:</strong></p>
          <Ul items={[
            "Business name and legal entity type",
            "Work email address",
            "Mobile phone number (for M-Pesa/MTN/Airtel settlement and account alerts)",
            "Password (stored as a salted cryptographic hash — we never store plaintext passwords)",
            "M-Pesa Till number, MTN or Airtel mobile money number for settlement",
            "Webhook URL and webhook secret for API integrations",
          ]} />

          <p className="mt-3"><strong className="text-primary">KYC Verification (when required):</strong></p>
          <Ul items={[
            "Government-issued photo ID (national identity card, passport, or driver's license)",
            "Business registration documents",
            "Proof of address (utility bill, bank statement)",
            "Tax identification number (KRA PIN or equivalent)",
            "Beneficial ownership declarations",
          ]} />

          <p className="mt-3"><strong className="text-primary">Payment Data (per transaction):</strong></p>
          <Ul items={[
            "Customer mobile phone number (for fiat settlement to the customer's recipient, if applicable)",
            "Payment reference or description",
            "USDC amount requested",
            "Fiat currency and estimated fiat amount",
            "Any metadata you attach to the payment via API",
          ]} />

          <p className="mt-3"><strong className="text-primary">Support & Communications:</strong></p>
          <Ul items={[
            "Name and contact details when you contact our support team",
            "Content of your communications with us",
            "Survey responses or feedback you voluntarily provide",
          ]} />
        </SubSection>

        <SubSection title="3.2 Information Collected Automatically">
          <p>When you use our website or API, we automatically collect:</p>
          <Ul items={[
            "IP address and approximate geolocation (country/city level)",
            "Browser type, version, and operating system",
            "Device type and screen resolution",
            "Pages visited, time spent, and navigation paths",
            "Referring website or search query",
            "Date and time of access",
            "API request logs including endpoint, response times, and status codes (excluding request/response bodies containing personal data)",
            "Error logs for debugging purposes",
          ]} />
        </SubSection>

        <SubSection title="3.3 Blockchain Data">
          <p>As part of payment processing, we collect on-chain data associated with transactions, including:</p>
          <Ul items={[
            "Ethereum/Avalanche wallet addresses used to send USDC",
            "Transaction hashes (txHash)",
            "Block numbers and confirmation timestamps",
            "Token transfer amounts",
          ]} />
          <Callout type="warning">
            Note: Wallet addresses and transaction hashes are public information on the Avalanche blockchain. They are permanently and publicly visible to anyone regardless of AvaRamp's privacy practices. See Section 7 for more detail.
          </Callout>
        </SubSection>

        <SubSection title="3.4 Information from Third Parties">
          <p>We may receive information about you from:</p>
          <Ul items={[
            "Identity verification service providers (e.g., for KYC checks)",
            "Sanctions and PEP (Politically Exposed Persons) screening databases",
            "Mobile money providers (M-Pesa, MTN, Airtel) — confirmation of payment delivery",
            "Blockchain analytics providers for AML screening of wallet addresses",
          ]} />
        </SubSection>
      </Section>

      <Section id="how-we-use" title="4. How We Use Your Information">
        <p>We use your personal data only for the following purposes:</p>

        <SubSection title="4.1 Service Delivery">
          <Ul items={[
            "Creating and managing your Merchant account",
            "Generating unique Deposit Addresses for each payment",
            "Monitoring the blockchain for incoming USDC deposits",
            "Converting USDC to your chosen fiat currency at live market rates",
            "Initiating Mobile Money settlements to your registered number",
            "Sending payment confirmation notifications and webhooks",
            "Providing your transaction history and analytics in the dashboard",
          ]} />
        </SubSection>

        <SubSection title="4.2 Compliance & Legal Obligations">
          <Ul items={[
            "KYC/AML identity verification as required by Kenyan law",
            "Transaction monitoring for suspicious activity under POCAMLA",
            "Sanctions screening against OFAC, UN, and EU lists",
            "Maintaining records required by Kenyan financial regulations and tax law",
            "Responding to lawful requests from government authorities",
            "Fraud prevention and security investigations",
          ]} />
        </SubSection>

        <SubSection title="4.3 Account & Security Management">
          <Ul items={[
            "Authenticating your identity when you log in",
            "Sending password reset and security alert emails",
            "Detecting and preventing unauthorized account access",
            "Rotating and invalidating compromised API keys",
          ]} />
        </SubSection>

        <SubSection title="4.4 Service Improvement">
          <Ul items={[
            "Analyzing aggregated, anonymized usage data to improve the platform",
            "Diagnosing and fixing technical errors and bugs",
            "Developing new features based on aggregated usage patterns",
            "Conducting internal research and analytics",
          ]} />
        </SubSection>

        <SubSection title="4.5 Communications">
          <Ul items={[
            "Transaction confirmations and settlement notifications",
            "Important service announcements and Terms of Service updates",
            "Account security alerts",
            "Product updates and new features (you may opt out of these)",
          ]} />
        </SubSection>
      </Section>

      <Section id="legal-basis" title="5. Legal Basis for Processing">
        <p>Under the Kenya Data Protection Act, 2019 and GDPR-aligned principles, we process your data on the following legal bases:</p>
        <div className="space-y-3 mt-3">
          {[
            {
              basis: "Contractual Necessity",
              use:   "Processing your account data, executing payments, and settling funds — without this, we cannot provide the Service.",
            },
            {
              basis: "Legal Obligation",
              use:   "KYC/AML verification, sanctions screening, record-keeping, and reporting to authorities as required by the Proceeds of Crime and Anti-Money Laundering Act (POCAMLA) and Kenya Revenue Authority regulations.",
            },
            {
              basis: "Legitimate Interests",
              use:   "Fraud prevention, security monitoring, service improvement, and customer support. Our legitimate interests are proportionate and do not override your privacy rights.",
            },
            {
              basis: "Consent",
              use:   "Marketing communications and optional analytics. You may withdraw consent at any time by contacting privacy@avaramp.com.",
            },
          ].map(({ basis, use }) => (
            <div key={basis} className="flex gap-3 p-4 bg-card border border-border rounded-xl">
              <div className="shrink-0">
                <span className="text-xs font-bold text-primary bg-surface px-2 py-1 rounded-md">{basis}</span>
              </div>
              <p className="text-sm text-secondary">{use}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="sharing" title="6. Information Sharing">
        <p>We do not sell your personal data. We share information only in the following limited circumstances:</p>

        <SubSection title="6.1 Service Providers">
          <p>We share data with carefully selected service providers who process it on our behalf under strict data processing agreements:</p>
          <Ul items={[
            "Safaricom Limited (M-Pesa) — phone number and payment amount for settlement",
            "MTN Group / Airtel Africa — phone number and payment amount for settlement",
            "Neon / database infrastructure providers — encrypted transaction and account data",
            "Render / cloud hosting providers — application data within their infrastructure",
            "KYC verification providers — identity documents for verification",
            "Blockchain analytics providers — wallet addresses for AML screening",
          ]} />
        </SubSection>

        <SubSection title="6.2 Legal Requirements">
          <p>We may disclose your information when required to do so by law, regulation, or valid legal process, including:</p>
          <Ul items={[
            "Court orders, subpoenas, or search warrants",
            "Requests from the Financial Reporting Centre (FRC) of Kenya",
            "Requests from the Kenya Revenue Authority (KRA)",
            "Orders from the Communications Authority of Kenya (CA)",
            "Requests from OFAC, the UN, or other sanctions enforcement bodies",
            "Requests from law enforcement in connection with a criminal investigation",
          ]} />
          <p>Where legally permissible, we will attempt to notify you before making such a disclosure. We cannot notify you if we have received a government order prohibiting disclosure or if doing so would prejudice a law enforcement investigation.</p>
        </SubSection>

        <SubSection title="6.3 Business Transfers">
          <p>If AvaRamp is involved in a merger, acquisition, asset sale, or similar corporate transaction, your personal data may be transferred to the acquirer. We will notify you via email and a dashboard notice before your data is transferred and becomes subject to a different privacy policy.</p>
        </SubSection>

        <SubSection title="6.4 With Your Consent">
          <p>We will share your data with any third party where you have given us your explicit consent to do so.</p>
        </SubSection>

        <SubSection title="6.5 Aggregated Data">
          <p>We may share aggregated, anonymized data (e.g., total transaction volumes, industry trends) that cannot identify any individual person.</p>
        </SubSection>
      </Section>

      <Section id="blockchain" title="7. Blockchain Transparency Notice">
        <Callout type="critical">
          <strong>IMPORTANT:</strong> The Avalanche blockchain is a public, immutable, decentralized ledger. Any data recorded on-chain — including wallet addresses, transaction amounts, and transaction hashes — is permanently and publicly visible to anyone in the world. This is an inherent property of blockchain technology that neither AvaRamp nor anyone else can change or reverse.
        </Callout>
        <p>This means:</p>
        <Ul items={[
          "The Deposit Address we generate for each payment and the USDC amount sent to it are permanently public",
          "The blockchain transaction connecting a Customer's wallet to that address is permanently public",
          "While names and phone numbers are NOT recorded on-chain, sophisticated parties may be able to link wallet addresses to real-world identities through other means",
          "AvaRamp cannot delete, modify, or obscure any on-chain data — blockchain records are immutable by design",
        ]} />
        <p>By using AvaRamp, both Merchants and Customers acknowledge and accept this transparency as a fundamental characteristic of blockchain-based payment processing.</p>
      </Section>

      <Section id="retention" title="8. Data Retention">
        <p>We retain your personal data for as long as necessary to fulfil the purposes for which it was collected, subject to the following minimum retention periods:</p>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-semibold text-primary">Data Category</th>
                <th className="text-left py-2 font-semibold text-primary">Retention Period</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Account information",          "Duration of account + 7 years after closure"],
                ["Transaction records",          "7 years (Kenya tax & AML law requirement)"],
                ["KYC documents",                "5 years after account closure (POCAMLA requirement)"],
                ["Communication logs",           "3 years"],
                ["Security & access logs",       "2 years"],
                ["Blockchain data (wallet addresses, txHash)", "Permanently — we cannot delete public blockchain data"],
                ["Marketing preferences",        "Until you withdraw consent or close your account"],
                ["Aggregated analytics",         "Indefinitely (no personal data retained after aggregation)"],
              ].map(([cat, period]) => (
                <tr key={cat}>
                  <td className="py-2.5 pr-4 text-secondary">{cat}</td>
                  <td className="py-2.5 text-secondary">{period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>After the applicable retention period, we securely delete or anonymize your personal data. Where data is shared with service providers, we require them to adhere to comparable retention limits.</p>
      </Section>

      <Section id="rights" title="9. Your Rights">
        <p>Under the Kenya Data Protection Act, 2019 and applicable law, you have the following rights regarding your personal data:</p>
        <div className="space-y-3 mt-3">
          {[
            {
              right: "Right of Access",
              desc:  "You may request a copy of the personal data we hold about you, information about how we use it, and who we share it with.",
            },
            {
              right: "Right to Rectification",
              desc:  "You may request that we correct any inaccurate or incomplete personal data about you.",
            },
            {
              right: "Right to Erasure (\"Right to be Forgotten\")",
              desc:  "You may request deletion of your personal data where we no longer have a legal basis to retain it. This right does not apply to data we are legally required to retain (e.g., transaction records under POCAMLA or tax law), or to blockchain data which is inherently immutable.",
            },
            {
              right: "Right to Restriction",
              desc:  "You may request that we restrict processing of your data in certain circumstances, such as while a dispute is being resolved.",
            },
            {
              right: "Right to Data Portability",
              desc:  "You may request your personal data in a structured, machine-readable format (JSON or CSV) to transfer to another service provider.",
            },
            {
              right: "Right to Object",
              desc:  "You may object to processing based on our legitimate interests. We will stop processing unless we can demonstrate compelling legitimate grounds that override your rights.",
            },
            {
              right: "Right to Withdraw Consent",
              desc:  "Where processing is based on your consent, you may withdraw it at any time. This does not affect the lawfulness of processing before withdrawal.",
            },
            {
              right: "Right to Lodge a Complaint",
              desc:  "You have the right to lodge a complaint with the Office of the Data Protection Commissioner (ODPC) of Kenya at odpc.go.ke if you believe your rights have been violated.",
            },
          ].map(({ right, desc }) => (
            <div key={right} className="p-4 bg-card border border-border rounded-xl">
              <p className="font-semibold text-primary text-sm mb-1">{right}</p>
              <p className="text-sm text-secondary">{desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4">To exercise any of these rights, contact our Data Protection Officer at <a href="mailto:privacy@avaramp.com" className="text-indigo-DEFAULT hover:underline">privacy@avaramp.com</a>. We will respond within 21 days as required by the Kenya Data Protection Act. We may need to verify your identity before processing your request.</p>
      </Section>

      <Section id="international" title="10. International Data Transfers">
        <p>AvaRamp is based in Kenya, but we use service providers whose infrastructure may be located in other countries including the United States, the European Union, and other regions. When we transfer your personal data outside Kenya, we ensure appropriate safeguards are in place, including:</p>
        <Ul items={[
          "Adequacy decisions where the destination country provides comparable data protection",
          "Standard contractual clauses approved by the Office of the Data Protection Commissioner",
          "Binding corporate rules where applicable",
          "Your explicit consent where required",
        ]} />
        <p>By using AvaRamp, you acknowledge that your data may be transferred to, and processed in, countries with different data protection laws than your country of residence. We will always take steps to ensure your data is handled with equivalent protections.</p>
      </Section>

      <Section id="security" title="11. Security Measures">
        <p>We implement industry-standard technical and organizational security measures to protect your personal data, including:</p>

        <SubSection title="11.1 Technical Controls">
          <Ul items={[
            "AES-256-GCM encryption for stored private keys and sensitive data",
            "TLS 1.2+ encryption for all data in transit",
            "Bcrypt hashing with salts for all passwords",
            "HTTPS-only access with HSTS headers",
            "API key authentication for all API endpoints",
            "JWT-based authentication with short-lived tokens",
            "Rate limiting to prevent brute force attacks",
            "Webhook signature verification (HMAC-SHA256)",
            "Database encryption at rest",
            "Regular security audits and penetration testing",
          ]} />
        </SubSection>

        <SubSection title="11.2 Organizational Controls">
          <Ul items={[
            "Access to personal data is restricted to employees who need it for their role",
            "All staff with data access are trained on data protection obligations",
            "Contractors and service providers are bound by data processing agreements",
            "We conduct background checks on staff with access to sensitive data",
          ]} />
        </SubSection>

        <SubSection title="11.3 Breach Notification">
          <p>In the event of a personal data breach that poses a risk to your rights and freedoms, we will notify the Office of the Data Protection Commissioner within 72 hours and will notify you without undue delay where the breach is likely to result in a high risk to your personal rights. Our notification will describe the nature of the breach, the data involved, and the steps we are taking.</p>
        </SubSection>

        <Callout type="warning">
          While we take extensive security precautions, no system connected to the internet can be guaranteed 100% secure. You are responsible for maintaining the security of your account credentials and for using secure devices and networks when accessing the Service.
        </Callout>
      </Section>

      <Section id="children" title="12. Children's Privacy">
        <p>The Service is not directed at children under the age of 18. We do not knowingly collect personal data from anyone under 18 years of age. If you are under 18, you must not use AvaRamp or provide any personal data to us.</p>
        <p>If we discover that we have collected personal data from a child under 18 without verifiable parental consent, we will delete that data immediately. If you believe we may have collected data from a child, please contact us at privacy@avaramp.com.</p>
      </Section>

      <Section id="cookies-ref" title="13. Cookies">
        <p>AvaRamp uses cookies and similar tracking technologies on our website and platform. We use essential cookies for authentication and security, preference cookies to remember your theme (light/dark) and settings, and may use analytics cookies to understand how users interact with our platform.</p>
        <p>For full details on the cookies we use, how they work, and how to manage or disable them, please read our <a href="/cookies" className="text-indigo-DEFAULT hover:underline font-medium">Cookie Policy</a>.</p>
      </Section>

      <Section id="third-party" title="14. Third-Party Links">
        <p>Our website and documentation may contain links to third-party websites, including Safaricom, MTN, Airtel, Avalanche Foundation, WalletConnect, and others. These links are provided for your convenience only. We have no control over those sites and are not responsible for their privacy practices or content. We encourage you to read the privacy policies of every website you visit.</p>
      </Section>

      <Section id="changes" title="15. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time to reflect changes in our practices, the Service, or applicable law. We will notify you of material changes by:</p>
        <Ul items={[
          "Updating the \"Last Updated\" date at the top of this page",
          "Sending an email notification to your registered email address",
          "Displaying a prominent notice on your dashboard for 30 days after the change",
        ]} />
        <p>We encourage you to review this policy periodically. Your continued use of the Service after the effective date of any update constitutes acceptance of the revised policy. For changes that require your consent under applicable law, we will obtain your affirmative agreement before the change takes effect.</p>
      </Section>

      <Section id="contact" title="16. Contact & Complaints">
        <p>For privacy-related questions, access requests, or complaints:</p>
        <div className="bg-card border border-border rounded-xl p-5 space-y-2 mt-4">
          <p><strong className="text-primary">Data Protection Officer</strong></p>
          <p>AvaRamp Technologies Ltd., Nairobi, Kenya</p>
          <p>Email: <a href="mailto:privacy@avaramp.com" className="text-indigo-DEFAULT hover:underline">privacy@avaramp.com</a></p>
          <p>Response time: Within 21 days of receipt</p>
        </div>
        <p className="mt-4">If you are not satisfied with our response, you have the right to escalate your complaint to:</p>
        <div className="bg-card border border-border rounded-xl p-5 space-y-2 mt-2">
          <p><strong className="text-primary">Office of the Data Protection Commissioner (ODPC)</strong></p>
          <p>Nairobi, Kenya</p>
          <p>Website: <a href="https://www.odpc.go.ke" target="_blank" rel="noopener noreferrer" className="text-indigo-DEFAULT hover:underline">odpc.go.ke</a></p>
        </div>
      </Section>
    </LegalPage>
  );
}

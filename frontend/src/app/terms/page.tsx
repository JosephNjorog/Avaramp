import type { Metadata } from "next";
import LegalPage, { Section, SubSection, Callout, Ul } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — AvaRamp",
  description: "Terms of Service governing the use of AvaRamp's crypto-to-fiat payment gateway.",
};

const SECTIONS = [
  { id: "agreement",       title: "1. Agreement to Terms"           },
  { id: "definitions",     title: "2. Definitions"                  },
  { id: "eligibility",     title: "3. Eligibility"                  },
  { id: "accounts",        title: "4. Accounts & Security"          },
  { id: "merchant",        title: "5. Merchant Services"            },
  { id: "payments",        title: "6. Payment Processing"           },
  { id: "fees",            title: "7. Fees & Charges"               },
  { id: "kyc",             title: "8. KYC / AML Compliance"         },
  { id: "prohibited",      title: "9. Prohibited Activities"        },
  { id: "crypto-risk",     title: "10. Cryptocurrency Risks"        },
  { id: "third-party",     title: "11. Third-Party Services"        },
  { id: "ip",              title: "12. Intellectual Property"       },
  { id: "warranties",      title: "13. Disclaimer of Warranties"    },
  { id: "liability",       title: "14. Limitation of Liability"     },
  { id: "indemnification", title: "15. Indemnification"             },
  { id: "force-majeure",   title: "16. Force Majeure"               },
  { id: "termination",     title: "17. Termination"                 },
  { id: "disputes",        title: "18. Dispute Resolution"          },
  { id: "governing-law",   title: "19. Governing Law"              },
  { id: "changes",         title: "20. Changes to Terms"            },
  { id: "contact",         title: "21. Contact Information"         },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="Please read these terms carefully before using AvaRamp. By creating an account or using our services, you agree to be legally bound by these terms."
      lastUpdated="April 10, 2026"
      sections={SECTIONS}
    >
      <Callout type="critical">
        <strong>IMPORTANT:</strong> These Terms of Service constitute a legally binding agreement between you and AvaRamp Technologies Ltd. If you do not agree to all of these terms, you must not use our services. Your continued use constitutes ongoing acceptance.
      </Callout>

      <Section id="agreement" title="1. Agreement to Terms">
        <p>
          These Terms of Service ("Terms") are entered into by and between AvaRamp Technologies Ltd. ("AvaRamp," "we," "us," or "our"), a company incorporated under the laws of the Republic of Kenya, and you ("User," "Merchant," or "you") as an individual or legal entity accessing or using any AvaRamp service, platform, API, or related software (collectively, the "Service").
        </p>
        <p>
          By clicking "I Agree," creating an account, accessing our platform, or using any portion of the Service in any manner, you acknowledge that you have read, understood, and agree to be legally bound by these Terms and our Privacy Policy and Cookie Policy, which are incorporated herein by reference. If you are accepting these Terms on behalf of a company or other legal entity, you represent and warrant that you have the authority to bind that entity to these Terms.
        </p>
        <p>
          These Terms apply to all users of the Service including merchants, developers integrating our API, and any individual accessing the payment pages we generate.
        </p>
      </Section>

      <Section id="definitions" title="2. Definitions">
        <p>For the purposes of these Terms, the following definitions apply:</p>
        <div className="space-y-2 mt-2">
          {[
            { term: "\"Service\"",             def: "The AvaRamp platform, website (avarampsure.vercel.app and associated domains), APIs, smart contracts, and all related software and services." },
            { term: "\"Merchant\"",            def: "Any business or individual that registers an account with AvaRamp to accept cryptocurrency payments and receive fiat settlement." },
            { term: "\"Customer\"",            def: "The end-user who makes a payment to a Merchant via the AvaRamp payment page." },
            { term: "\"Payment\"",             def: "A crypto-to-fiat transaction initiated through the Service, involving USDC sent by a Customer to a Merchant's designated deposit address." },
            { term: "\"USDC\"",                def: "USD Coin, a regulated stablecoin issued by Circle Internet Financial, LLC, operating on the Avalanche C-Chain blockchain." },
            { term: "\"Settlement\"",          def: "The disbursement of fiat currency (KES, NGN, GHS, TZS, or UGX) to the Merchant's designated mobile money account following a confirmed USDC Payment." },
            { term: "\"Protocol Fee\"",        def: "The fee charged by AvaRamp per successful Settlement, currently 1.5% of the Payment value unless otherwise agreed in writing." },
            { term: "\"Deposit Address\"",     def: "A unique Avalanche C-Chain wallet address generated by AvaRamp for each individual Payment to receive USDC." },
            { term: "\"FX Rate\"",             def: "The foreign exchange rate applied to convert USDC to fiat currency at the time of Settlement, sourced from third-party providers." },
            { term: "\"KYC\"",                 def: "Know Your Customer — identity verification procedures required by applicable law." },
            { term: "\"AML\"",                 def: "Anti-Money Laundering — compliance measures to prevent use of the Service for illicit financial activity." },
            { term: "\"Mobile Money\"",        def: "M-Pesa (Safaricom), MTN Mobile Money, Airtel Money, and other mobile money platforms used for Settlement." },
            { term: "\"Smart Contract\"",      def: "Self-executing code deployed on the Avalanche blockchain that facilitates payment processing." },
            { term: "\"API\"",                 def: "Application Programming Interface provided by AvaRamp to enable programmatic integration of the Service." },
          ].map(({ term, def }) => (
            <div key={term} className="flex gap-2">
              <span className="font-semibold text-primary shrink-0">{term}:</span>
              <span>{def}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="eligibility" title="3. Eligibility">
        <p>To use the Service, you must meet and continuously maintain all of the following eligibility requirements:</p>
        <Ul items={[
          "You must be at least 18 years of age or the age of majority in your jurisdiction, whichever is greater.",
          "If registering as a Merchant, you must be a duly organized and validly existing legal entity (sole trader, partnership, limited company, or corporation) in good standing in your jurisdiction of incorporation or residence.",
          "You must have full legal authority to enter into binding contracts in your jurisdiction.",
          "You must not be located in, organized under the laws of, or a citizen or resident of any country subject to comprehensive trade or economic sanctions, including but not limited to: Cuba, Iran, North Korea, Syria, or the Crimea region.",
          "You must not be designated on any list of prohibited or restricted parties maintained by the United Nations, the United States Office of Foreign Assets Control (OFAC), the European Union, or any other relevant authority.",
          "Your use of the Service must not violate any applicable law, regulation, or ordinance in your jurisdiction.",
          "You must not have had a previous AvaRamp account terminated for cause.",
          "Your business, if applicable, must be engaged in lawful commercial activities.",
        ]} />
        <Callout type="warning">
          AvaRamp reserves the right to decline service to any individual or entity at our sole discretion, including where we believe eligibility requirements are not met or where providing service would expose AvaRamp to regulatory, legal, or reputational risk.
        </Callout>
      </Section>

      <Section id="accounts" title="4. Account Registration & Security">
        <SubSection title="4.1 Account Creation">
          <p>To access the Service as a Merchant, you must complete our registration process by providing accurate, complete, and current information including your legal business name, valid email address, phone number registered with your Mobile Money provider, and a secure password. You agree to update this information promptly if it changes.</p>
          <p>You may not create accounts using false identities, automated means, or on behalf of another person without authorization. Each Merchant may maintain only one active account unless explicitly permitted in writing by AvaRamp.</p>
        </SubSection>

        <SubSection title="4.2 Account Security">
          <p>You are solely responsible for:</p>
          <Ul items={[
            "Maintaining the confidentiality of your account credentials (email, password, API keys, and webhook secrets).",
            "All activities that occur under your account, whether authorized by you or not.",
            "Immediately notifying AvaRamp at security@avaramp.com if you suspect any unauthorized access to your account.",
            "Not sharing your credentials with third parties, including employees or contractors, without implementing proper access controls.",
            "Using a strong, unique password and enabling any additional security measures we make available.",
          ]} />
          <p>AvaRamp will never ask for your password. We are not responsible for losses arising from unauthorized account access due to your failure to maintain credential security.</p>
        </SubSection>

        <SubSection title="4.3 API Keys">
          <p>API keys and webhook secrets generated through the Service are treated as credentials. You must store them securely (e.g., in environment variables, secrets managers), rotate them if compromised, and never commit them to public code repositories. AvaRamp bears no liability for losses arising from exposed API credentials.</p>
        </SubSection>
      </Section>

      <Section id="merchant" title="5. Merchant Services">
        <SubSection title="5.1 Payment Links">
          <p>AvaRamp enables Merchants to generate payment links and QR codes through which Customers can send USDC on the Avalanche C-Chain to a unique Deposit Address. Upon confirmed receipt and validation, AvaRamp initiates Settlement to the Merchant's registered Mobile Money account.</p>
        </SubSection>

        <SubSection title="5.2 Merchant Representations">
          <p>By using the Merchant services, you represent and warrant that:</p>
          <Ul items={[
            "Your business and all transactions processed through AvaRamp are lawful under applicable law.",
            "You have all necessary licenses, permits, and authorizations to operate your business and accept payments.",
            "You will only create payment links for legitimate commercial transactions for bona fide goods and services.",
            "You will accurately describe the nature of goods or services to your Customers.",
            "You will maintain adequate records of all transactions for a minimum of 7 years as required by Kenyan tax law and applicable regulations.",
            "You will cooperate fully with AvaRamp in any compliance review, audit, or investigation.",
            "You will promptly notify AvaRamp of any regulatory inquiry, investigation, or legal proceeding involving your use of the Service.",
          ]} />
        </SubSection>

        <SubSection title="5.3 Settlement to Mobile Money">
          <p>Settlement is made to the Mobile Money account (M-Pesa Till, MTN, or Airtel number) registered at account creation. It is your responsibility to ensure this number is correct and active. AvaRamp is not responsible for failed settlements resulting from incorrect phone numbers, deactivated accounts, or Mobile Money provider errors.</p>
          <p>Settlement is typically completed within 5 minutes of USDC confirmation but may be delayed due to blockchain confirmation times, Mobile Money provider outages, regulatory holds, or AvaRamp's compliance review processes. Delays do not entitle you to compensation.</p>
        </SubSection>

        <SubSection title="5.4 Payment Expiry">
          <p>Each payment link expires 30 minutes after generation. USDC sent to a Deposit Address after expiry may not be automatically processed. You must contact AvaRamp support immediately if a Customer has sent funds to an expired address. AvaRamp will make reasonable efforts to resolve such situations but cannot guarantee recovery in all cases, particularly if funds have not been confirmed on-chain.</p>
        </SubSection>

        <SubSection title="5.5 Webhooks">
          <p>AvaRamp will attempt to deliver payment event notifications to your registered webhook URL. Webhook delivery is best-effort. You should not rely solely on webhooks for payment confirmation — always verify payment status via the AvaRamp API or dashboard. AvaRamp is not liable for losses arising from missed or delayed webhook deliveries.</p>
        </SubSection>
      </Section>

      <Section id="payments" title="6. Payment Processing">
        <SubSection title="6.1 USDC on Avalanche C-Chain">
          <p>AvaRamp processes payments exclusively in USDC (USD Coin) on the Avalanche C-Chain (Chain ID: 43114). Payments sent in any other token, on any other network, or to addresses other than the AvaRamp-generated Deposit Address will not be processed and may be permanently lost. AvaRamp has no ability to recover funds sent to incorrect addresses or networks.</p>
        </SubSection>

        <SubSection title="6.2 Blockchain Confirmation">
          <p>A payment is considered confirmed after receiving a sufficient number of block confirmations on the Avalanche C-Chain as determined by AvaRamp in its sole discretion (currently a minimum of 1 confirmation). AvaRamp relies on third-party blockchain infrastructure and cannot guarantee confirmation times.</p>
        </SubSection>

        <SubSection title="6.3 Irreversibility">
          <Callout type="critical">
            <strong>BLOCKCHAIN TRANSACTIONS ARE IRREVERSIBLE.</strong> Once a Customer has sent USDC to a Deposit Address, the transaction cannot be reversed, cancelled, or recalled. Neither AvaRamp nor the Merchant can retrieve funds from the blockchain once sent. You and your Customers must verify all payment details carefully before sending.
          </Callout>
        </SubSection>

        <SubSection title="6.4 FX Rate Risk">
          <p>The FX rate applied to your Settlement is determined at the time of Settlement processing, not at the time the payment link is generated. Cryptocurrency and fiat exchange rates fluctuate. The fiat amount you receive may differ from the estimated amount shown at payment creation due to market movements during the confirmation and settlement period. AvaRamp is not liable for losses arising from FX rate fluctuations.</p>
        </SubSection>

        <SubSection title="6.5 Idempotency">
          <p>The Service includes idempotency controls to prevent duplicate payment processing. However, you are responsible for implementing appropriate safeguards on your end to prevent duplicate orders or payment requests.</p>
        </SubSection>
      </Section>

      <Section id="fees" title="7. Fees & Charges">
        <SubSection title="7.1 Protocol Fee">
          <p>AvaRamp charges a Protocol Fee of <strong>1.5% per successful Settlement</strong>. This fee is deducted from the USDC amount before conversion to fiat. No fee is charged on failed, expired, or unconfirmed payments.</p>
          <p>Enterprise Merchants with high volume may negotiate custom fee arrangements by contacting business@avaramp.com. Any such arrangement must be agreed in writing and supersedes these standard fee terms.</p>
        </SubSection>

        <SubSection title="7.2 Mobile Money Provider Fees">
          <p>Settlement via M-Pesa B2C, MTN Mobile Money, or Airtel Money may attract transaction fees charged by those providers. These fees are separate from the AvaRamp Protocol Fee and will be reflected in the final amount you receive. AvaRamp will make commercially reasonable efforts to disclose applicable provider fees but does not guarantee their accuracy as providers may change their fee structures without notice.</p>
        </SubSection>

        <SubSection title="7.3 No Refund of Fees">
          <p>Protocol Fees are non-refundable once a Settlement has been initiated, except where AvaRamp has made a demonstrable processing error. Fee disputes must be raised within 30 days of the transaction.</p>
        </SubSection>

        <SubSection title="7.4 Tax Obligations">
          <p>You are solely responsible for determining and fulfilling all tax obligations arising from your use of the Service, including income tax, value-added tax, capital gains tax, and any other applicable taxes in your jurisdiction. AvaRamp does not provide tax advice. You must keep accurate records of all transactions for tax reporting purposes.</p>
        </SubSection>
      </Section>

      <Section id="kyc" title="8. KYC / AML Compliance">
        <SubSection title="8.1 Verification Requirements">
          <p>AvaRamp is committed to compliance with the Proceeds of Crime and Anti-Money Laundering Act (POCAMLA) of Kenya, the Kenya Revenue Authority requirements, and applicable international standards. We may require you to provide identity verification documents including but not limited to:</p>
          <Ul items={[
            "Government-issued photo identification (national ID, passport, driver's license)",
            "Proof of business registration (Certificate of Incorporation, Business Name Certificate)",
            "Proof of address (utility bill, bank statement dated within 3 months)",
            "Tax identification number (KRA PIN, TIN, or equivalent)",
            "Bank statements or financial records",
            "Beneficial ownership information for companies",
            "Source of funds documentation",
          ]} />
        </SubSection>

        <SubSection title="8.2 Ongoing Monitoring">
          <p>AvaRamp monitors transactions on an ongoing basis for suspicious activity. We reserve the right to delay, hold, or reject any transaction pending compliance review without prior notice. We are required by law to report suspicious transactions to relevant authorities and cannot notify you when such a report has been made.</p>
        </SubSection>

        <SubSection title="8.3 Account Freezing">
          <p>AvaRamp may immediately freeze your account and withhold settlement funds if we have reasonable grounds to believe that your account or transactions are involved in money laundering, terrorist financing, fraud, sanctions violations, or any other illegal activity. Frozen funds may be held pending investigation or turned over to relevant authorities.</p>
        </SubSection>

        <SubSection title="8.4 Cooperation">
          <p>You agree to cooperate fully and promptly with any AvaRamp compliance request, provide all requested documentation within 5 business days, and immediately notify AvaRamp of any changes in your business structure, ownership, or activities that may affect your compliance status.</p>
        </SubSection>
      </Section>

      <Section id="prohibited" title="9. Prohibited Activities">
        <p>You must not use the Service for any of the following activities. Violation will result in immediate account termination, forfeiture of funds pending settlement, and potential reporting to law enforcement:</p>
        <Ul items={[
          "Money laundering, terrorist financing, or any transaction that violates applicable financial regulations",
          "Fraud, deception, misrepresentation, or creation of payment links for non-existent goods or services",
          "Gambling, betting, or lottery services unless you hold all required licenses in every jurisdiction where you operate",
          "Illegal drug sales, controlled substance transactions, or any activity prohibited under applicable narcotics law",
          "Sale of counterfeit goods, pirated software, or items that infringe intellectual property rights",
          "Adult content, pornography, or escort services of any kind",
          "Weapons sales including firearms, ammunition, explosives, or military equipment without appropriate government licenses",
          "Pyramid schemes, Ponzi schemes, multi-level marketing with no genuine product, or any fraudulent investment scheme",
          "Hacking tools, malware, ransomware, or services that compromise the security of others",
          "Processing payments on behalf of third parties (payment aggregation) without express written permission from AvaRamp",
          "Circumventing AvaRamp's compliance controls, including creating multiple accounts to evade limits",
          "Using the Service to send payments to sanctioned persons, entities, or jurisdictions",
          "Violating any applicable securities law, including the unregistered offer or sale of securities",
          "High-risk financial services including unlicensed money transmission, foreign exchange dealing, or cryptocurrency exchanges",
          "Any activity that, in AvaRamp's sole determination, exposes AvaRamp to legal, regulatory, or reputational risk",
        ]} />
      </Section>

      <Section id="crypto-risk" title="10. Cryptocurrency Risks & Disclaimers">
        <Callout type="warning">
          Cryptocurrency involves significant financial and technological risk. By using AvaRamp, you acknowledge and accept all of the following risks:
        </Callout>

        <SubSection title="10.1 Market Volatility">
          <p>Although USDC is designed as a stablecoin pegged to the US Dollar, no guarantee of price stability can be given. The value of USDC relative to local fiat currencies (KES, NGN, etc.) fluctuates with forex markets. AvaRamp makes no representation about the exchange rate you will receive.</p>
        </SubSection>

        <SubSection title="10.2 Regulatory Risk">
          <p>The regulatory status of cryptocurrency is evolving rapidly in Kenya and across Africa. Future legislation or regulatory guidance may restrict, prohibit, or impose additional requirements on the use of cryptocurrency for commercial payments. AvaRamp will comply with all applicable regulations and may be required to restrict or terminate service with limited notice in response to regulatory changes.</p>
        </SubSection>

        <SubSection title="10.3 Blockchain Network Risk">
          <p>The Avalanche network, like all blockchain networks, may experience congestion, forks, outages, or protocol changes that delay or prevent transaction processing. AvaRamp has no control over the underlying blockchain protocol and is not liable for network-related disruptions.</p>
        </SubSection>

        <SubSection title="10.4 Smart Contract Risk">
          <p>AvaRamp utilizes smart contracts on the Avalanche C-Chain. While we have taken reasonable steps to audit and secure our smart contracts, no software is free from bugs or vulnerabilities. In the event of a smart contract exploit or failure, AvaRamp's liability is limited as described in Section 14.</p>
        </SubSection>

        <SubSection title="10.5 Custodial Risk">
          <p>AvaRamp generates and temporarily holds custody of private keys for Deposit Addresses. While keys are encrypted using AES-256-GCM, no system is completely secure. AvaRamp implements industry-standard security practices but cannot guarantee that our systems will never be compromised.</p>
        </SubSection>

        <SubSection title="10.6 No Financial Advice">
          <p>AvaRamp is a payment processing service, not a financial advisor, investment advisor, or broker-dealer. Nothing in our Service, website, documentation, or communications constitutes financial, investment, tax, or legal advice. You should consult qualified professionals before making financial decisions.</p>
        </SubSection>
      </Section>

      <Section id="third-party" title="11. Third-Party Services">
        <p>The Service integrates with and depends upon third-party services including:</p>
        <Ul items={[
          "Avalanche Network — a public blockchain protocol we do not control",
          "Safaricom M-Pesa (Daraja API) — for Kenya settlement",
          "MTN Mobile Money — for Ghana, Uganda, and Nigeria settlement",
          "Airtel Money — for additional African market settlement",
          "Circle Internet Financial (USDC issuer) — we are not affiliated with Circle",
          "WalletConnect / Reown — for browser wallet connections on payment pages",
          "Neon / PostgreSQL — database infrastructure",
          "Render / cloud infrastructure providers — hosting and computing",
        ]} />
        <p>AvaRamp is not responsible for the availability, accuracy, security, or performance of these third-party services. Disruptions to any of these services may affect the availability or functionality of AvaRamp. We do not endorse any third-party service and disclaim all liability for their actions or failures.</p>
        <p>Your use of third-party services connected to AvaRamp is also governed by those services' own terms and privacy policies. It is your responsibility to review and comply with those terms.</p>
      </Section>

      <Section id="ip" title="12. Intellectual Property">
        <SubSection title="12.1 AvaRamp IP">
          <p>The Service, including the AvaRamp website, platform, APIs, smart contracts, software, trademarks, logos, and all related intellectual property, are owned by or licensed to AvaRamp Technologies Ltd. and are protected by Kenyan and international intellectual property laws. You may not copy, modify, distribute, sell, sublicense, or create derivative works of any AvaRamp intellectual property without our prior written consent.</p>
        </SubSection>

        <SubSection title="12.2 Limited License">
          <p>AvaRamp grants you a limited, non-exclusive, non-transferable, revocable license to use the Service solely for the purpose of accepting cryptocurrency payments from your Customers in accordance with these Terms. This license terminates immediately upon your violation of any term of this Agreement.</p>
        </SubSection>

        <SubSection title="12.3 Merchant Content">
          <p>You retain ownership of your business information, branding, and content. By submitting information to AvaRamp, you grant us a worldwide, royalty-free license to use, process, and display that information solely to provide the Service to you.</p>
        </SubSection>

        <SubSection title="12.4 Feedback">
          <p>If you provide AvaRamp with feedback, suggestions, or ideas about the Service, you grant AvaRamp a perpetual, irrevocable, royalty-free license to use that feedback for any purpose without compensation to you.</p>
        </SubSection>
      </Section>

      <Section id="warranties" title="13. Disclaimer of Warranties">
        <Callout type="critical">
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, AVARAMP EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
        </Callout>
        <Ul items={[
          "WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT",
          "WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE FROM VIRUSES OR HARMFUL COMPONENTS",
          "WARRANTIES REGARDING THE ACCURACY, RELIABILITY, COMPLETENESS, OR TIMELINESS OF ANY INFORMATION OR CONTENT",
          "WARRANTIES THAT SETTLEMENTS WILL BE DELIVERED WITHIN ANY PARTICULAR TIMEFRAME",
          "WARRANTIES REGARDING FX RATES OR THE FIAT AMOUNT YOU WILL RECEIVE",
          "WARRANTIES REGARDING THE CONTINUED AVAILABILITY OR LEGAL STATUS OF CRYPTOCURRENCY IN ANY JURISDICTION",
          "WARRANTIES THAT ANY DEFECTS IN THE SERVICE WILL BE CORRECTED",
        ]} />
        <p>Some jurisdictions do not allow the exclusion of certain warranties. In such jurisdictions, our liability is limited to the minimum extent permitted by law.</p>
      </Section>

      <Section id="liability" title="14. Limitation of Liability">
        <Callout type="critical">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, AVARAMP, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, LICENSORS, AND SERVICE PROVIDERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
        </Callout>
        <Ul items={[
          "Loss of profits, revenue, data, business, goodwill, or anticipated savings",
          "Loss of or corruption to cryptocurrency or fiat funds",
          "Delays in settlement or payment processing",
          "Losses arising from FX rate fluctuations",
          "Losses resulting from blockchain network failures, forks, or smart contract vulnerabilities",
          "Losses arising from unauthorized access to your account due to your failure to maintain security",
          "Losses resulting from Mobile Money provider errors or outages",
          "Losses arising from regulatory action against you or AvaRamp",
          "Any loss arising from reliance on information provided by the Service",
        ]} />
        <p>
          <strong>Aggregate Cap:</strong> In no event shall AvaRamp's total aggregate liability to you for all claims arising out of or relating to these Terms or the Service exceed the greater of: (a) the total Protocol Fees paid by you to AvaRamp in the three (3) months preceding the event giving rise to liability, or (b) USD 500.
        </p>
        <p>These limitations apply regardless of the legal theory (contract, tort, negligence, strict liability, or otherwise), even if AvaRamp has been advised of the possibility of such damages.</p>
      </Section>

      <Section id="indemnification" title="15. Indemnification">
        <p>You agree to indemnify, defend, and hold harmless AvaRamp Technologies Ltd. and its officers, directors, employees, contractors, agents, licensors, service providers, successors, and assigns from and against any and all claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable legal fees) arising out of or relating to:</p>
        <Ul items={[
          "Your violation of these Terms",
          "Your use or misuse of the Service",
          "Your breach of any representation, warranty, or obligation under these Terms",
          "Any claim by a Customer or third party arising from your business operations or your use of AvaRamp",
          "Your violation of any applicable law, regulation, or third-party right",
          "Any content, data, or materials you provide to AvaRamp",
          "Any tax liability arising from your transactions",
          "Any claim that your use of the Service infringes the intellectual property or other rights of a third party",
        ]} />
        <p>AvaRamp reserves the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate with our defense of these claims.</p>
      </Section>

      <Section id="force-majeure" title="16. Force Majeure">
        <p>AvaRamp shall not be liable for any failure or delay in performance of its obligations under these Terms arising from causes beyond its reasonable control, including but not limited to:</p>
        <Ul items={[
          "Acts of God, natural disasters, earthquakes, floods, or severe weather",
          "Government action, legislation, regulation, sanctions, or orders",
          "War, civil unrest, terrorism, or acts of sabotage",
          "Blockchain network failures, protocol changes, or hard forks on the Avalanche network",
          "Widespread internet or telecommunications infrastructure failures",
          "DDoS attacks, cyberattacks, or other malicious acts beyond our reasonable security controls",
          "Safaricom, MTN, Airtel, or other Mobile Money provider service disruptions",
          "Power outages or failures of cloud infrastructure providers",
          "USDC de-pegging or Circle Internet Financial service disruptions",
          "Pandemic, epidemic, or public health emergency",
        ]} />
        <p>In such events, AvaRamp will provide notice as soon as reasonably practicable and will use commercially reasonable efforts to resume normal service.</p>
      </Section>

      <Section id="termination" title="17. Termination">
        <SubSection title="17.1 By You">
          <p>You may terminate your AvaRamp account at any time by contacting support@avaramp.com. Termination does not relieve you of any obligations or liabilities arising prior to termination, including payment of any outstanding fees. Any pending settlements at the time of termination will be processed in the ordinary course.</p>
        </SubSection>

        <SubSection title="17.2 By AvaRamp">
          <p>AvaRamp may, at its sole discretion, suspend or terminate your account and access to the Service at any time with or without notice, including for:</p>
          <Ul items={[
            "Violation of any provision of these Terms",
            "Engaging in any Prohibited Activity",
            "Failure to pass or maintain KYC/AML verification",
            "Reasonable belief that your account poses a compliance, legal, or reputational risk",
            "Extended period of account inactivity (more than 12 months)",
            "Regulatory requirement or government order",
            "Fraudulent activity or disputes raised by Customers or financial institutions",
            "Any other reason at our sole discretion",
          ]} />
        </SubSection>

        <SubSection title="17.3 Effect of Termination">
          <p>Upon termination: (a) your license to use the Service immediately ceases; (b) you must cease all use of our APIs and remove any AvaRamp branding from your platforms; (c) AvaRamp may retain your data for as long as required by law or legitimate business purpose; (d) provisions of these Terms that by their nature should survive termination shall survive, including Sections 12, 13, 14, 15, 18, and 19.</p>
        </SubSection>
      </Section>

      <Section id="disputes" title="18. Dispute Resolution">
        <SubSection title="18.1 Informal Resolution">
          <p>Before filing any formal legal claim, you agree to first contact AvaRamp at legal@avaramp.com and attempt to resolve the dispute informally for a period of 30 days. Many disputes can be resolved quickly through direct communication.</p>
        </SubSection>

        <SubSection title="18.2 Arbitration">
          <p>Any dispute, controversy, or claim arising out of or relating to these Terms, including questions about its existence, validity, or termination, that cannot be resolved informally shall be referred to and finally resolved by arbitration administered under the Nairobi Centre for International Arbitration (NCIA) Arbitration Rules, which are deemed incorporated into this clause. The seat of arbitration shall be Nairobi, Kenya. The language of arbitration shall be English. The arbitral award shall be final and binding on both parties.</p>
        </SubSection>

        <SubSection title="18.3 Class Action Waiver">
          <p>To the maximum extent permitted by law, you waive any right to bring any dispute as a class action, class arbitration, or any other representative proceeding. All disputes must be brought in your individual capacity only.</p>
        </SubSection>

        <SubSection title="18.4 Exceptions">
          <p>Nothing in this Section prevents AvaRamp from seeking emergency injunctive or other equitable relief from a court of competent jurisdiction to protect its intellectual property rights or prevent irreparable harm.</p>
        </SubSection>
      </Section>

      <Section id="governing-law" title="19. Governing Law">
        <p>These Terms and any dispute arising from them shall be governed by and construed in accordance with the laws of the Republic of Kenya, without regard to its conflict of laws provisions. To the extent that any claim must be resolved in a court of law rather than arbitration, you consent to the exclusive jurisdiction of the courts of Nairobi, Kenya.</p>
        <p>If you access the Service from a jurisdiction where doing so is restricted or regulated, you do so at your own risk and are responsible for compliance with all applicable local laws.</p>
      </Section>

      <Section id="changes" title="20. Changes to Terms">
        <p>AvaRamp reserves the right to modify these Terms at any time. We will provide notice of material changes by:</p>
        <Ul items={[
          "Posting the updated Terms on our website with a new \"Last Updated\" date",
          "Sending an email notification to your registered email address",
          "Displaying a prominent notice on your dashboard",
        ]} />
        <p>Changes become effective 14 days after notice for existing Merchants, or immediately for new users. Your continued use of the Service after the effective date constitutes acceptance of the revised Terms. If you do not agree to the changes, you must stop using the Service and close your account before the effective date.</p>
        <p>For material changes that significantly alter your rights or obligations, we will seek your affirmative consent where required by applicable law.</p>
      </Section>

      <Section id="contact" title="21. Contact Information">
        <p>For any questions, concerns, or notices regarding these Terms, please contact:</p>
        <div className="bg-card border border-border rounded-xl p-5 mt-4 space-y-2">
          <p><strong className="text-primary">AvaRamp Technologies Ltd.</strong></p>
          <p>Nairobi, Kenya</p>
          <p>General enquiries: <a href="mailto:hello@avaramp.com" className="text-indigo-DEFAULT hover:underline">hello@avaramp.com</a></p>
          <p>Legal matters: <a href="mailto:legal@avaramp.com" className="text-indigo-DEFAULT hover:underline">legal@avaramp.com</a></p>
          <p>Security issues: <a href="mailto:security@avaramp.com" className="text-indigo-DEFAULT hover:underline">security@avaramp.com</a></p>
          <p>Compliance: <a href="mailto:compliance@avaramp.com" className="text-indigo-DEFAULT hover:underline">compliance@avaramp.com</a></p>
        </div>
        <p className="mt-4 text-xs text-muted">These Terms were last reviewed by legal counsel on April 10, 2026 and supersede all prior versions.</p>
      </Section>
    </LegalPage>
  );
}

export type PolicyInline = string | { text: string; strong?: true; href?: string };

export type PolicyBlock =
  | { type: "heading"; level: 2 | 3; id?: string; text: string }
  | { type: "paragraph"; id?: string; content: PolicyInline[] }
  | { type: "list"; ordered?: true; start?: number; items: PolicyInline[][] }
  | { type: "table"; head: string[]; rows: string[][] };

export const PRIVACY_POLICY_UPDATED = "September 01, 2022";

export const PRIVACY_POLICY: PolicyBlock[] = [
  {
    type: "paragraph",
    content: [
      "This privacy notice for NUBELITY LLC (\"",
      { text: "Company", strong: true },
      ",\" \"",
      { text: "we", strong: true },
      ",\" \"",
      { text: "us", strong: true },
      ",\" or \"",
      { text: "our", strong: true },
      "\"), describes how and why we might collect, store, use, and/or share (\"",
      { text: "process", strong: true },
      "\") your information when you use our services (\"",
      { text: "Services", strong: true },
      "\"), such as when you:",
    ],
  },
  {
    type: "list",
    items: [
      [
        "Visit our website at ",
        { text: "https://nubelity.com/", href: "https://nubelity.com/" },
        ", or any website of ours that links to this privacy notice",
      ],
      [
        "Engage with us in other related ways, including any sales, marketing, or events",
      ],
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "Questions or concerns?", strong: true },
      " Reading this privacy notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at contact@nubelity.com.",
    ],
  },
  {
    type: "heading",
    level: 2,
    text: "SUMMARY OF KEY POINTS",
  },
  {
    type: "paragraph",
    content: [
      { text: "This summary provides key points from our privacy notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our", strong: true },
      " ",
      { text: "table of contents", href: "#toc" },
      " ",
      { text: "below to find the section you are looking for.", strong: true },
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "What personal information do we process?", strong: true },
      " When you visit, use, or navigate our Services, we may process personal information depending on how you interact with NUBELITY LLC and the Services, the choices you make, and the products and features you use. Learn more about ",
      { text: "personal information you disclose to us", href: "#personalinfo" },
      ".",
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "Do we process any sensitive personal information?", strong: true },
      " We do not process sensitive personal information.",
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "Do we receive any information from third parties?", strong: true },
      " We do not receive any information from third parties.",
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "How do we process your information?", strong: true },
      " We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so. Learn more about ",
      { text: "how we process your information", href: "#infouse" },
      ".",
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "In what situations and with which parties do we share personal information?", strong: true },
      " We may share information in specific situations and with specific third parties. Learn more about ",
      { text: "when and with whom we share your personal information", href: "#whoshare" },
      ".",
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "How do we keep your information safe?", strong: true },
      " We have organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Learn more about ",
      { text: "how we keep your information safe", href: "#infosafe" },
      ".",
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "What are your rights?", strong: true },
      " Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Learn more about ",
      { text: "your privacy rights", href: "#privacyrights" },
      ".",
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "How do you exercise your rights?", strong: true },
      " The easiest way to exercise your rights is by visiting contact@nubelity.com, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Want to learn more about what NUBELITY LLC does with any information we collect? ",
      { text: "Review the privacy notice in full", href: "#toc" },
      ".",
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "toc",
    text: "TABLE OF CONTENTS",
  },
  {
    type: "list",
    items: [
      [
        { text: "1. WHAT INFORMATION DO WE COLLECT?", href: "#infocollect" },
      ],
      [
        { text: "2. HOW DO WE PROCESS YOUR INFORMATION?", href: "#infouse" },
      ],
      [
        { text: "3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?", href: "#legalbases" },
      ],
      [
        { text: "4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?", href: "#whoshare" },
      ],
      [
        { text: "5. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?", href: "#intltransfers" },
      ],
      [
        { text: "6. HOW LONG DO WE KEEP YOUR INFORMATION?", href: "#inforetain" },
      ],
      [
        { text: "7. HOW DO WE KEEP YOUR INFORMATION SAFE?", href: "#infosafe" },
      ],
      [
        { text: "8. DO WE COLLECT INFORMATION FROM MINORS?", href: "#infominors" },
      ],
      [
        { text: "9. WHAT ARE YOUR PRIVACY RIGHTS?", href: "#privacyrights" },
      ],
      [
        { text: "10. CONTROLS FOR DO-NOT-TRACK FEATURES", href: "#DNT" },
      ],
      [
        { text: "11. DO CALIFORNIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?", href: "#caresidents" },
      ],
      [
        { text: "12. DO VIRGINIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?", href: "#virginia" },
      ],
      [
        { text: "13. DO WE MAKE UPDATES TO THIS NOTICE?", href: "#policyupdates" },
      ],
      [
        { text: "14. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?", href: "#contact" },
      ],
      [
        { text: "15. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?", href: "#request" },
      ],
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "infocollect",
    text: "1. WHAT INFORMATION DO WE COLLECT?",
  },
  {
    type: "heading",
    level: 3,
    id: "personalinfo",
    text: "Personal information you disclose to us",
  },
  {
    type: "paragraph",
    content: [
      { text: "In Short:", strong: true },
      " We collect personal information that you provide to us.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.",
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "Personal Information Provided by You.", strong: true },
      " The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:",
    ],
  },
  {
    type: "list",
    items: [
      [
        "names",
      ],
      [
        "phone numbers",
      ],
      [
        "email addresses",
      ],
      [
        "mailing addresses",
      ],
      [
        "job titles",
      ],
      [
        "usernames",
      ],
      [
        "passwords",
      ],
      [
        "contact preferences",
      ],
      [
        "contact or authentication data",
      ],
      [
        "billing addresses",
      ],
      [
        "debit/credit card numbers",
      ],
    ],
  },
  {
    type: "paragraph",
    id: "sensitiveinfo",
    content: [
      { text: "Sensitive Information.", strong: true },
      " We do not process sensitive information.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.",
    ],
  },
  {
    type: "heading",
    level: 3,
    text: "Information automatically collected",
  },
  {
    type: "paragraph",
    content: [
      { text: "In Short:", strong: true },
      " Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. This information is primarily needed to maintain the security and operation of our Services, and for our internal analytics and reporting purposes.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "The information we collect includes:",
    ],
  },
  {
    type: "list",
    items: [
      [
        "Log and Usage Data.Log and usage data is service-related, diagnostic, usage, and performance information our servers automatically collect when you access or use our Services and which we record in log files. Depending on how you interact with us, this log data may include your IP address, device information, browser type, and settings and information about your activity in the Services (such as the date/time stamps associated with your usage, pages and files viewed, searches, and other actions you take such as which features you use), device event information (such as system activity, error reports (sometimes called \"crash dumps\"), and hardware settings).",
      ],
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "infouse",
    text: "2. HOW DO WE PROCESS YOUR INFORMATION?",
  },
  {
    type: "paragraph",
    content: [
      { text: "In Short:", strong: true },
      " We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.",
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "We process your personal information for a variety of reasons, depending on how you interact with our Services, including:", strong: true },
    ],
  },
  {
    type: "list",
    items: [
      [
        { text: "To facilitate account creation and authentication and otherwise manage user accounts.", strong: true },
        " We may process your information so you can create and log in to your account, as well as keep your account in working order.",
      ],
      [
        { text: "To save or protect an individual's vital interest.", strong: true },
        " We may process your information when necessary to save or protect an individual’s vital interest, such as to prevent harm.",
      ],
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "legalbases",
    text: "3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?",
  },
  {
    type: "paragraph",
    content: [
      { text: "In Short:", strong: true },
      " We only process your personal information when we believe it is necessary and we have a valid legal reason (i.e., legal basis) to do so under applicable law, like with your consent, to comply with laws, to provide you with services to enter into or fulfill our contractual obligations, to protect your rights, or to fulfill our legitimate business interests.",
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "If you are located in the EU or UK, this section applies to you.", strong: true },
    ],
  },
  {
    type: "paragraph",
    content: [
      "The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on in order to process your personal information. As such, we may rely on the following legal bases to process your personal information:",
    ],
  },
  {
    type: "list",
    items: [
      [
        { text: "Consent.", strong: true },
        " We may process your information if you have given us permission (i.e., consent) to use your personal information for a specific purpose. You can withdraw your consent at any time. Learn more about ",
        { text: "withdrawing your consent", href: "#withdrawconsent" },
        ".",
      ],
      [
        { text: "Legal Obligations.", strong: true },
        " We may process your information where we believe it is necessary for compliance with our legal obligations, such as to cooperate with a law enforcement body or regulatory agency, exercise or defend our legal rights, or disclose your information as evidence in litigation in which we are involved.",
      ],
      [
        { text: "Vital Interests.", strong: true },
        " We may process your information where we believe it is necessary to protect your vital interests or the vital interests of a third party, such as situations involving potential threats to the safety of any person.",
      ],
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "If you are located in Canada, this section applies to you.", strong: true },
    ],
  },
  {
    type: "paragraph",
    content: [
      "We may process your information if you have given us specific permission (i.e., express consent) to use your personal information for a specific purpose, or in situations where your permission can be inferred (i.e., implied consent). You can ",
      { text: "withdraw your consent", href: "#withdrawconsent" },
      " at any time.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "In some exceptional cases, we may be legally permitted under applicable law to process your information without your consent, including, for example:",
    ],
  },
  {
    type: "list",
    items: [
      [
        "If collection is clearly in the interests of an individual and consent cannot be obtained in a timely way",
      ],
      [
        "For investigations and fraud detection and prevention",
      ],
      [
        "For business transactions provided certain conditions are met",
      ],
      [
        "If it is contained in a witness statement and the collection is necessary to assess, process, or settle an insurance claim",
      ],
      [
        "For identifying injured, ill, or deceased persons and communicating with next of kin",
      ],
      [
        "If we have reasonable grounds to believe an individual has been, is, or may be victim of financial abuse",
      ],
      [
        "If it is reasonable to expect collection and use with consent would compromise the availability or the accuracy of the information and the collection is reasonable for purposes related to investigating a breach of an agreement or a contravention of the laws of Canada or a province",
      ],
      [
        "If disclosure is required to comply with a subpoena, warrant, court order, or rules of the court relating to the production of records",
      ],
      [
        "If it was produced by an individual in the course of their employment, business, or profession and the collection is consistent with the purposes for which the information was produced",
      ],
      [
        "If the collection is solely for journalistic, artistic, or literary purposes",
      ],
      [
        "If the information is publicly available and is specified by the regulations",
      ],
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "whoshare",
    text: "4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?",
  },
  {
    type: "paragraph",
    content: [
      { text: "In Short:", strong: true },
      " We may share information in specific situations described in this section and/or with the following third parties.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "We may need to share your personal information in the following situations:",
    ],
  },
  {
    type: "list",
    items: [
      [
        { text: "Business Transfers.", strong: true },
        " We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.",
      ],
      [
        { text: "Affiliates.", strong: true },
        " We may share your information with our affiliates, in which case we will require those affiliates to honor this privacy notice. Affiliates include our parent company and any subsidiaries, joint venture partners, or other companies that we control or that are under common control with us.",
      ],
      [
        { text: "Business Partners.", strong: true },
        " We may share your information with our business partners to offer you certain products, services, or promotions.",
      ],
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "intltransfers",
    text: "5. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?",
  },
  {
    type: "paragraph",
    content: [
      { text: "In Short:", strong: true },
      " We may transfer, store, and process your information in countries other than your own.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Our servers are located in. If you are accessing our Services from outside, please be aware that your information may be transferred to, stored, and processed by us in our facilities and by those third parties with whom we may share your personal information (see \"",
      { text: "WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?", href: "#whoshare" },
      "\" above), in Mexico, and other countries.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "If you are a resident in the European Economic Area (EEA) or United Kingdom (UK), then these countries may not necessarily have data protection laws or other similar laws as comprehensive as those in your country. However, we will take all necessary measures to protect your personal information in accordance with this privacy notice and applicable law.",
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "inforetain",
    text: "6. HOW LONG DO WE KEEP YOUR INFORMATION?",
  },
  {
    type: "paragraph",
    content: [
      { text: "In Short:", strong: true },
      " We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).No purpose in this notice will require us keeping your personal information for longer than thirty six (36)months past the start of the idle period of the user's account.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.",
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "infosafe",
    text: "7. HOW DO WE KEEP YOUR INFORMATION SAFE?",
  },
  {
    type: "paragraph",
    content: [
      { text: "In Short:", strong: true },
      " We aim to protect your personal information through a system of organizational and technical security measures.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.",
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "infominors",
    text: "8. DO WE COLLECT INFORMATION FROM MINORS?",
  },
  {
    type: "paragraph",
    content: [
      { text: "In Short:", strong: true },
      " We do not knowingly collect data from or market to children under 18 years of age.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "We do not knowingly solicit data from or market to children under 18 years of age. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent’s use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18, please contact us at contact@nubelity.com.",
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "privacyrights",
    text: "9. WHAT ARE YOUR PRIVACY RIGHTS?",
  },
  {
    type: "paragraph",
    content: [
      { text: "In Short:", strong: true },
      " In some regions, such as the European Economic Area (EEA), United Kingdom (UK), and Canada, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "In some regions (like the EEA, UK, and Canada), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to object to the processing of your personal information. You can make such a request by contacting us by using the contact details provided in the section \"",
      { text: "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?", href: "#contact" },
      "\" below.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "We will consider and act upon any request in accordance with applicable data protection laws.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your ",
      { text: "Member State data protection authority", href: "https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm" },
      " or ",
      { text: "UK data protection authority", href: "https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/" },
      ".",
    ],
  },
  {
    type: "paragraph",
    content: [
      "If you are located in Switzerland, you may contact the ",
      { text: "Federal Data Protection and Information Commissioner", href: "https://www.edoeb.admin.ch/edoeb/en/home.html" },
      ".",
    ],
  },
  {
    type: "paragraph",
    id: "withdrawconsent",
    content: [
      { text: "Withdrawing your consent:", strong: true },
      " If we are relying on your consent to process your personal information,which may be express and/or implied consent depending on the applicable law,you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section \"",
      { text: "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?", href: "#contact" },
      "\" below.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "However, please note that this will not affect the lawfulness of the processing before its withdrawal nor,when applicable law allows,will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.",
    ],
  },
  {
    type: "heading",
    level: 3,
    text: "Account Information",
  },
  {
    type: "paragraph",
    content: [
      "If you would at any time like to review or change the information in your account or terminate your account, you can:",
    ],
  },
  {
    type: "list",
    items: [
      [
        "Log in to your account settings and update your user account.",
      ],
      [
        "Contact us using the contact information provided.",
      ],
    ],
  },
  {
    type: "paragraph",
    content: [
      "Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "If you have questions or comments about your privacy rights, you may email us at contact@nubelity.com.",
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "DNT",
    text: "10. CONTROLS FOR DO-NOT-TRACK FEATURES",
  },
  {
    type: "paragraph",
    content: [
      "Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track (\"DNT\") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this privacy notice.",
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "caresidents",
    text: "11. DO CALIFORNIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?",
  },
  {
    type: "paragraph",
    content: [
      { text: "In Short:", strong: true },
      " Yes, if you are a resident of California, you are granted specific rights regarding access to your personal information.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "California Civil Code Section 1798.83, also known as the \"Shine The Light\" law, permits our users who are California residents to request and obtain from us, once a year and free of charge, information about categories of personal information (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all third parties with which we shared personal information in the immediately preceding calendar year. If you are a California resident and would like to make such a request, please submit your request in writing to us using the contact information provided below.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "If you are under 18 years of age, reside in California, and have a registered account with Services, you have the right to request removal of unwanted data that you publicly post on the Services. To request removal of such data, please contact us using the contact information provided below and include the email address associated with your account and a statement that you reside in California. We will make sure the data is not publicly displayed on the Services, but please be aware that the data may not be completely or comprehensively removed from all our systems (e.g., backups, etc.).",
    ],
  },
  {
    type: "heading",
    level: 3,
    text: "CCPA Privacy Notice",
  },
  {
    type: "paragraph",
    content: [
      "The California Code of Regulations defines a \"resident\" as:",
    ],
  },
  {
    type: "paragraph",
    content: [
      "(1) every individual who is in the State of California for other than a temporary or transitory purpose and",
    ],
  },
  {
    type: "paragraph",
    content: [
      "(2) every individual who is domiciled in the State of California who is outside the State of California for a temporary or transitory purpose",
    ],
  },
  {
    type: "paragraph",
    content: [
      "All other individuals are defined as \"non-residents.\"",
    ],
  },
  {
    type: "paragraph",
    content: [
      "If this definition of \"resident\" applies to you, we must adhere to certain rights and obligations regarding your personal information.",
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "What categories of personal information do we collect?", strong: true },
    ],
  },
  {
    type: "paragraph",
    content: [
      "We have collected the following categories of personal information in the past twelve (12) months:",
    ],
  },
  {
    type: "table",
    head: ["Category", "Examples", "Collected"],
    rows: [
      ["A. Identifiers", "Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name", "YES"],
      ["B. Personal information categories listed in the California Customer Records statute", "Name, contact information, education, employment, employment history, and financial information", "YES"],
      ["C. Protected classification characteristics under California or federal law", "Gender and date of birth", "NO"],
      ["D. Commercial information", "Transaction information, purchase history, financial details, and payment information", "NO"],
      ["E. Biometric information", "Fingerprints and voiceprints", "NO"],
      ["F. Internet or other similar network activity", "Browsing history, search history, online behavior, interest data, and interactions with our and other websites, applications, systems, and advertisements", "NO"],
      ["G. Geolocation data", "Device location", "NO"],
      ["H. Audio, electronic, visual, thermal, olfactory, or similar information", "Images and audio, video or call recordings created in connection with our business activities", "NO"],
      ["I. Professional or employment-related information", "Business contact details in order to provide you our Services at a business level or job title, work history, and professional qualifications if you apply for a job with us", "YES"],
      ["J. Education Information", "Student records and directory information", "NO"],
      ["K. Inferences drawn from other personal information", "Inferences drawn from any of the collected personal information listed above to create a profile or summary about, for example, an individual’s preferences and characteristics", "NO"],
      ["L. Sensitive Personal Information", "", "NO"],
    ],
  },
  {
    type: "paragraph",
    content: [
      "We will use and retain the collected personal information as needed to provide the Services or for:",
    ],
  },
  {
    type: "list",
    items: [
      [
        "Category A - As long as the user has an account with us",
      ],
      [
        "Category B - As long as the user has an account with us",
      ],
      [
        "Category I - As long as the user has an account with us",
      ],
    ],
  },
  {
    type: "paragraph",
    content: [
      "We may also collect other personal information outside of these categories through instances where you interact with us in person, online, or by phone or mail in the context of:",
    ],
  },
  {
    type: "list",
    items: [
      [
        "Receiving help through our customer support channels;",
      ],
      [
        "Participation in customer surveys or contests; and",
      ],
      [
        "Facilitation in the delivery of our Services and to respond to your inquiries.",
      ],
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "How do we use and share your personal information?", strong: true },
    ],
  },
  {
    type: "paragraph",
    content: [
      "More information about our data collection and sharing practices can be found in this privacy notice.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "You may contact us by email at contact@nubelity.com, or by referring to the contact details at the bottom of this document.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "If you are using an authorized agent to exercise your right to opt out we may deny a request if the authorized agent does not submit proof that they have been validly authorized to act on your behalf.",
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "Will your information be shared with anyone else?", strong: true },
    ],
  },
  {
    type: "paragraph",
    content: [
      "We may disclose your personal information with our service providers pursuant to a written contract between us and each service provider. Each service provider is a for-profit entity that processes the information on our behalf, following the same strict privacy protection obligations mandated by the CCPA.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "We may use your personal information for our own business purposes, such as for undertaking internal research for technological development and demonstration. This is not considered to be \"selling\" of your personal information.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "NUBELITY LLC has not disclosed, sold, or shared any personal information to third parties for a business or commercial purpose in the preceding twelve (12) months. NUBELITY LLC will not sell or share personal information in the future belonging to website visitors, users, and other consumers.",
    ],
  },
  {
    type: "paragraph",
    content: [
      { text: "Your rights with respect to your personal data", strong: true },
    ],
  },
  {
    type: "paragraph",
    content: [
      "Right to request deletion of the data — Request to delete",
    ],
  },
  {
    type: "paragraph",
    content: [
      "You can ask for the deletion of your personal information. If you ask us to delete your personal information, we will respect your request and delete your personal information, subject to certain exceptions provided by law, such as (but not limited to) the exercise by another consumer of his or her right to free speech, our compliance requirements resulting from a legal obligation, or any processing that may be required to protect against illegal activities.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Right to be informed — Request to know",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Depending on the circumstances, you have a right to know:",
    ],
  },
  {
    type: "list",
    items: [
      [
        "whether we collect and use your personal information;",
      ],
      [
        "the categories of personal information that we collect;",
      ],
      [
        "the purposes for which the collected personal information is used;",
      ],
      [
        "whether we sell or share personal information to third parties;",
      ],
      [
        "the categories of personal information that we sold, shared, or disclosed for a business purpose;",
      ],
      [
        "the categories of third parties to whom the personal information was sold, shared, or disclosed for a business purpose;",
      ],
      [
        "the business or commercial purpose for collecting, selling, or sharing personal information; and",
      ],
      [
        "the specific pieces of personal information we collected about you.",
      ],
    ],
  },
  {
    type: "paragraph",
    content: [
      "In accordance with applicable law, we are not obligated to provide or delete consumer information that is de-identified in response to a consumer request or to re-identify individual data to verify a consumer request.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Right to Non-Discrimination for the Exercise of a Consumer’s Privacy Rights",
    ],
  },
  {
    type: "paragraph",
    content: [
      "We will not discriminate against you if you exercise your privacy rights.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Right to Limit Use and Disclosure of Sensitive Personal Information",
    ],
  },
  {
    type: "paragraph",
    content: [
      "We do not process consumer's sensitive personal information.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Verification process",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Upon receiving your request, we will need to verify your identity to determine you are the same person about whom we have the information in our system. These verification efforts require us to ask you to provide information so that we can match it with information you have previously provided us. For instance, depending on the type of request you submit, we may ask you to provide certain information so that we can match the information you provide with the information we already have on file, or we may contact you through a communication method (e.g., phone or email) that you have previously provided to us. We may also use other verification methods as the circumstances dictate.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "We will only use personal information provided in your request to verify your identity or authority to make the request. To the extent possible, we will avoid requesting additional information from you for the purposes of verification. However, if we cannot verify your identity from the information already maintained by us, we may request that you provide additional information for the purposes of verifying your identity and for security or fraud-prevention purposes. We will delete such additionally provided information as soon as we finish verifying you.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Other privacy rights",
    ],
  },
  {
    type: "list",
    items: [
      [
        "You may object to the processing of your personal information.",
      ],
      [
        "You may request correction of your personal data if it is incorrect or no longer relevant, or ask to restrict the processing of the information.",
      ],
      [
        "You can designate an authorized agent to make a request under the CCPA on your behalf. We may deny a request from an authorized agent that does not submit proof that they have been validly authorized to act on your behalf in accordance with the CCPA.",
      ],
      [
        "You may request to opt out from future selling or sharing of your personal information to third parties. Upon receiving an opt-out request, we will act upon the request as soon as feasibly possible, but no later than fifteen (15) days from the date of the request submission.",
      ],
    ],
  },
  {
    type: "paragraph",
    content: [
      "To exercise these rights, you can contact us by email at contact@nubelity.com, or by referring to the contact details at the bottom of this document. If you have a complaint about how we handle your data, we would like to hear from you.",
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "virginia",
    text: "12. DO VIRGINIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?",
  },
  {
    type: "paragraph",
    content: [
      { text: "In Short:", strong: true },
      " Yes, if you are a resident of Virginia, you may be granted specific rights regarding access to and use of your personal information.",
    ],
  },
  {
    type: "heading",
    level: 3,
    text: "Virginia CDPA Privacy Notice",
  },
  {
    type: "paragraph",
    content: [
      "Under the Virginia Consumer Data Protection Act (CDPA):",
    ],
  },
  {
    type: "paragraph",
    content: [
      "\"Consumer\" means a natural person who is a resident of the Commonwealth acting only in an individual or household context. It does not include a natural person acting in a commercial or employment context.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "\"Personal data\" means any information that is linked or reasonably linkable to an identified or identifiable natural person. \"Personal data\" does not include de-identified data or publicly available information.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "\"Sale of personal data\" means the exchange of personal data for monetary consideration.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "If this definition \"consumer\" applies to you, we must adhere to certain rights and obligations regarding your personal data.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "The information we collect, use, and disclose about you will vary depending on how you interact with NUBELITY LLC and our Services. To find out more, please visit the following links:",
    ],
  },
  {
    type: "list",
    items: [
      [
        { text: "Personal data we collect", href: "#infocollect" },
      ],
      [
        { text: "How we use your personal data", href: "#infouse" },
      ],
      [
        { text: "When and with whom we share your personal data", href: "#whoshare" },
      ],
    ],
  },
  {
    type: "paragraph",
    content: [
      "Your rights with respect to your personal data",
    ],
  },
  {
    type: "list",
    items: [
      [
        "Right to be informed whether or not we are processing your personal data",
      ],
      [
        "Right to access your personal data",
      ],
      [
        "Right to correct inaccuracies in your personal data",
      ],
      [
        "Right to request deletion of your personal data",
      ],
      [
        "Right to obtain a copy of the personal data you previously shared with us",
      ],
      [
        "Right to opt out of the processing of your personal data if it is used for targeted advertising, the sale of personal data, or profiling in furtherance of decisions that produce legal or similarly significant effects (\"profiling\")",
      ],
    ],
  },
  {
    type: "paragraph",
    content: [
      "NUBELITY LLC has not sold any personal data to third parties for business or commercial purposes. NUBELITY LLC will not sell personal data in the future belonging to website visitors, users, and other consumers.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Exercise your rights provided under the Virginia CDPA",
    ],
  },
  {
    type: "paragraph",
    content: [
      "More information about our data collection and sharing practices can be found in this privacy notice.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "You may contact us by email at contact@nubelity.com, by visiting contact@nubelity.com, or by referring to the contact details at the bottom of this document.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "If you are using an authorized agent to exercise your rights, we may deny a request if the authorized agent does not submit proof that they have been validly authorized to act on your behalf.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Verification process",
    ],
  },
  {
    type: "paragraph",
    content: [
      "We may request that you provide additional information reasonably necessary to verify you and your consumer's request. If you submit the request through an authorized agent, we may need to collect additional information to verify your identity before processing your request.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Upon receiving your request, we will respond without undue delay, but in all cases, within forty-five (45) days of receipt. The response period may be extended once by forty-five (45) additional days when reasonably necessary. We will inform you of any such extension within the initial 45-day response period, together with the reason for the extension.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Right to appeal",
    ],
  },
  {
    type: "paragraph",
    content: [
      "If we decline to take action regarding your request, we will inform you of our decision and reasoning behind it. If you wish to appeal our decision, please email us at contact@nubelity.com. Within sixty (60) days of receipt of an appeal, we will inform you in writing of any action taken or not taken in response to the appeal, including a written explanation of the reasons for the decisions. If your appeal if denied, you may contact the ",
      { text: "Attorney General to submit a complaint", href: "https://www.oag.state.va.us/consumer-protection/index.php/file-a-complaint" },
      ".",
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "policyupdates",
    text: "13. DO WE MAKE UPDATES TO THIS NOTICE?",
  },
  {
    type: "paragraph",
    content: [
      { text: "In Short:", strong: true },
      " Yes, we will update this notice as necessary to stay compliant with relevant laws.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "We may update this privacy notice from time to time. The updated version will be indicated by an updated \"Revised\" date and the updated version will be effective as soon as it is accessible. If we make material changes to this privacy notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.",
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "contact",
    text: "14. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?",
  },
  {
    type: "paragraph",
    content: [
      "If you have questions or comments about this notice, you may email us at contact@nubelity.com or by post to:",
    ],
  },
  {
    type: "paragraph",
    content: [
      "NUBELITY LLC",
    ],
  },
  {
    type: "paragraph",
    content: [
      "__________",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Austin, TX 78750",
    ],
  },
  {
    type: "paragraph",
    content: [
      "United States",
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "request",
    text: "15. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?",
  },
  {
    type: "paragraph",
    content: [
      "Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, change that information, or delete it. To request to review, update, or delete your personal information, please visit: contact@nubelity.com.",
    ],
  },
  {
    type: "heading",
    level: 2,
    id: "socialmedia",
    text: "16. ABOUT SOCIAL MEDIA",
  },
  {
    type: "heading",
    level: 3,
    text: "I. Responsible for protecting your personal data:",
  },
  {
    type: "paragraph",
    content: [
      "Nubelity, located at 13359 N Highway 183 Austin, TX 78750 USA, is responsible for handling the personal data shared by those who interact with Nubelity through social media, in accordance with the provisions of Articles 3 Section XIV and 37 Section III of the Federal Law on the Protection of Personal Data Held by Private Parties (LFPDPPP) and Article 70 of the Regulations of the aforementioned Law (LFPDPPP).",
    ],
  },
  {
    type: "heading",
    level: 3,
    text: "II. Types of personal data collected and purposes of processing:",
  },
  {
    type: "paragraph",
    content: [
      "The general personal data collected directly from users by Nubelity through our official social media channels will be used for the following purposes:",
    ],
  },
  {
    type: "list",
    items: [
      [
        "To identify you if you request information about the products offered by Nubelity;",
      ],
      [
        "To send you information about promotions and events through the information you freely decide to share;",
      ],
      [
        "To generate statistics on the use of Nubelity’s social media;",
      ],
      [
        "To address your questions, concerns, and complaints related to the products and services marketed by Nubelity.",
      ],
    ],
  },
  {
    type: "heading",
    level: 3,
    text: "III. Processing of Sensitive Personal Data:",
  },
  {
    type: "paragraph",
    content: [
      "The responsible party does not collect sensitive personal data for the purposes listed in the following section, and social media users should refrain from sending such data through the available channels on these networks.",
    ],
  },
  {
    type: "heading",
    level: 3,
    text: "IV. Responsibility of the Responsible Party, social media users, and social media service providers:",
  },
  {
    type: "paragraph",
    content: [
      "The Responsible Party processes personal data of social media users by accessing and managing the information that these users publish or disseminate through the profiles they have created on each of the social media networks used to interact with the Responsible Party. This processing also includes the use of personal data for the dissemination of activities of the Responsible Party or its group of companies.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "The Responsible Party accesses, manages, and uses the personal data of social media users only for the period during which the users remain linked to the profiles that the Responsible Party administers on each of the involved social media networks.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Users are responsible for the accuracy, veracity, and current status of the personal data they publish on their social media profiles, as well as for the degree of dissemination of their information and the access they allow or authorize third parties through these operations. Nubelity recommends all social media users to continuously review the privacy settings of their profiles on each of the websites they use to connect with the Responsible Party.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Social media service providers are responsible for the databases created with the personal data of users of these networks. These service providers are also responsible for the security measures they adopt to safeguard the personal data of their users.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Accordingly, Nubelity is responsible for the proper access, management, and use of the personal data of users who connect to the profiles that the Responsible Party administers on various social media networks. Nubelity does not create new databases with the information and/or personal data of social media users.",
    ],
  },
  {
    type: "heading",
    level: 3,
    text: "V. Purposes of Processing:",
  },
  {
    type: "paragraph",
    content: [
      "Original and necessary purposes:",
    ],
  },
  {
    type: "list",
    items: [
      [
        "Management of social media followers (Facebook, X, YouTube, Google +, LinkedIn, etc).",
      ],
      [
        "Communication of Nubelity promotions.",
      ],
      [
        "Social media follower statistics.",
      ],
    ],
  },
  {
    type: "heading",
    level: 3,
    text: "VI. Transfer of Personal Data:",
  },
  {
    type: "paragraph",
    content: [
      "For the indicated purposes, Nubelity does not transfer personal data to third parties.",
    ],
  },
  {
    type: "heading",
    level: 3,
    text: "VII. Consent for Data Transfer:",
  },
  {
    type: "paragraph",
    content: [
      "Your personal data will not be transferred to third parties without your consent, except for the exceptions provided for in Article 37 of the LFPD and in any case complying with the conditions established by Article 17 of the LFPD Regulations.",
    ],
  },
  {
    type: "heading",
    level: 3,
    text: "VIII. Exercise of ARCO Rights before the Responsible Party:",
  },
  {
    type: "paragraph",
    content: [
      "In all legally applicable cases, you may exercise your rights of access, rectification, cancellation, and opposition (ARCO Rights) at any time through the procedures we have implemented.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "The corresponding request must comply with the requirements established by the current legislation, by means of a written request addressed to our Personal Data Responsible Party at 13359 N Highway 183 Austin, TX 78750 USA. The request must contain and include the following:",
    ],
  },
  {
    type: "list",
    items: [
      [
        "Your name and address and another means to communicate the response to your request.",
      ],
      [
        "The documents that prove your identity or, where applicable, legal representation.",
      ],
      [
        "A clear and precise description of the personal data for which you seek to exercise any of the ARCO Rights; and",
      ],
      [
        "Any other element or document that facilitates the location of the personal data.",
      ],
    ],
  },
  {
    type: "paragraph",
    content: [
      "The Responsible Party will notify you, within a maximum period of twenty business days from the date it receives the corresponding request, of the determination made. If the request is appropriate, it will be effective within fifteen business days following the date on which the Responsible Party communicates the response. If the information provided in the request is incorrect or insufficient, or if the necessary documents to prove your identity or legal representation are not included, the Responsible Party, within five business days following receipt of your request, will require you to rectify the deficiencies in order to process it. In these cases, you will have ten business days to meet the rectification requirement, counted from the day following the date you received it. The corresponding request will be considered not submitted if you do not respond within this period.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "You can obtain the requested information or personal data through simple copies, electronic documents in conventional formats (Word, PDF, etc.), restricted and authorized access to the system that processes your personal data (access), or through any other legitimate means that guarantees and proves the effective exercise of the requested right.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Alternatively, the Holder may direct their request to informes@sulens.com, meeting all the previously listed requirements, establishing as the Subject of the communication \"ARCO Rights and/or Revocation of Consent\". The procedure deadlines will be the same as those referred to in the previous paragraph. The use of electronic means for the exercise of ARCO rights authorizes the Responsible Party to respond to the corresponding request through the same means, unless the holder clearly and expressly indicates another means.",
    ],
  },
  {
    type: "list",
    ordered: true,
    start: 1,
    items: [
      [
        { text: "Exercise of ARCO rights before social media service providers.", strong: true },
        "\nThe exercise of ARCO rights before the social media service providers where the users have created a profile will be governed, in accordance with applicable legislation, under the terms and conditions established in the Privacy Notices, Privacy Policies, and/or Legal Notices that each service provider has made available on the social media they operate and manage.",
      ],
      [
        { text: "Revocation of Consent", strong: true },
        "\nYou can revoke your consent for the processing of your personal data by unlinking from the Responsible Party's profile on any of the corresponding social media networks.",
      ],
    ],
  },
  {
    type: "paragraph",
    content: [
      "The procedure for revoking consent, if applicable, will be the same as that established in the previous section for the exercise of ARCO rights.",
    ],
  },
  {
    type: "list",
    ordered: true,
    start: 3,
    items: [
      [
        { text: "Limitations on the disclosure of your personal data.", strong: true },
        "\nYou can limit the use or disclosure of your personal data by directing the corresponding request to our Personal Data Department. The requirements to prove your identity, as well as the procedure to handle your request, will be the same as those indicated in section G) of this Privacy Notice (Exercise of ARCO rights).",
      ],
    ],
  },
  {
    type: "paragraph",
    content: [
      "However, we remind you that you, as a social media user, are responsible for the accuracy, veracity, and current status of the personal data you publish on your social media profiles, as well as for the degree of dissemination of your information and the access you allow or authorize to third parties through these profiles.",
    ],
  },
  {
    type: "list",
    ordered: true,
    start: 4,
    items: [
      [
        { text: "Modifications or updates to this Comprehensive Privacy Notice", strong: true },
        "\nNubelity may modify, update, extend, or in any other way change the content and scope of this Privacy Notice at any time and at its complete discretion. In all cases, Nubelity will publish these changes on the website https://www.sulens.com, \"Social Media Privacy Notice\".",
      ],
    ],
  },
  {
    type: "paragraph",
    content: [
      "Changes to this Privacy Notice may also be communicated via email when such a medium has been established as a communication channel between you and the Responsible Party during your connection to the Responsible Party, or when the social media interface permits it.",
    ],
  },
  {
    type: "paragraph",
    content: [
      "Last updated: May 15, 2024",
    ],
  },
];

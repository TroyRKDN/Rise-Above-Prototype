const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "data", "site-data.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(root, "assets", "asset-map.json"), "utf8"));

const byPath = new Map(data.pages.map((page) => [page.path, page]));

const navGroups = [
  {
    label: "Get Help",
    href: "financial-assistance.html",
    items: [
      ["Financial Assistance", "financial-assistance.html"],
      ["Eligibility & How It Works", "eligibility-how-it-works.html"],
      ["What We Can Help With", "what-we-can-help-with.html"],
      ["Support Services", "directory-support-services.html"],
      ["FAQs", "faqs.html"],
      ["Patient Stories", "patient-stories.html"],
      ["Urgent Help Information", "urgent-help-information.html"],
    ],
  },
  {
    label: "Ways to Help",
    href: "donate.html",
    items: [
      ["Donate", "donate.html"],
      ["Fundraise", "fundraise.html"],
      ["Volunteer", "volunteer.html"],
      ["Corporate Partnerships", "partner-with-us.html"],
      ["Leave a Bequest", "leave-a-bequest.html"],
      ["Give in Memory", "in-memory.html"],
      ["Become a Sponsor", "become-a-sponsor.html"],
      ["Workplace Giving", "workplace-giving.html"],
    ],
  },
  {
    label: "Events",
    href: "join-an-event.html",
    items: [
      ["Upcoming Events", "join-an-event.html"],
      ["Community Events", "community-events.html"],
      ["Fundraising Events", "fundraising-events.html"],
      ["Host Your Own Event", "host-your-own-event.html"],
      ["Event Calendar", "event-calendar.html"],
      ["Past Events / Gallery", "past-events-gallery.html"],
    ],
  },
  {
    label: "Refer Someone",
    href: "refer.html",
    items: [
      ["Refer a Patient", "refer.html"],
      ["Referral Process", "referral-process.html"],
      ["Eligibility Criteria", "referral-eligibility.html"],
      ["Information for Health Professionals", "information-for-health-professionals.html"],
      ["Required Documentation", "required-documentation.html"],
      ["Referral FAQs", "referral-faqs.html"],
      ["Contact the Support Team", "support-team-contact.html"],
    ],
  },
  {
    label: "About Us",
    href: "who-are-we.html",
    items: [
      ["Our Story", "who-are-we.html"],
      ["Our Mission & Values", "mission-values.html"],
      ["Meet the Team", "board-staff.html"],
      ["Governance / Reports", "governance-reports.html"],
      ["Sponsors & Partners", "sponsors-partners.html"],
      ["Careers / Volunteering", "careers-volunteering.html"],
      ["News & Updates", "news.html"],
    ],
  },
  {
    label: "Contact",
    href: "contact.html",
    items: [
      ["Contact Us", "contact.html"],
      ["Office Locations", "office-locations.html"],
      ["Opening Hours", "opening-hours.html"],
      ["Request a Callback", "request-callback.html"],
      ["General Enquiries", "general-enquiries.html"],
      ["Social Media", "social-media.html"],
    ],
  },
];

const legacyRedirects = [
  ["support-services.html", "directory-support-services.html", "Support Services"],
  ["corporate-partnerships.html", "partner-with-us.html", "Corporate Partnerships"],
  ["community-partners.html", "sponsors-partners.html", "Community Partners"],
  ["foundation-partners.html", "sponsors-partners.html", "Foundation Partners"],
  ["charity-partners.html", "sponsors-partners.html", "Charity Partners"],
  ["supporters.html", "sponsors-partners.html", "Supporters"],
  ["life-members.html", "governance-reports.html", "Life Members"],
  ["ambassadors-patrons.html", "who-are-we.html", "Ambassadors & Patrons"],
  ["member.html", "donate.html", "Become a Member"],
  ["store.html", "donate.html", "Store"],
];

const legacySourcePaths = {
  "support-services.html": "/directory/support-services",
  "corporate-partnerships.html": "/partner-with-us",
  "community-partners.html": "/community-partners",
  "foundation-partners.html": "/foundation-partners",
  "charity-partners.html": "/charity-partners",
  "supporters.html": "/supporters",
  "life-members.html": "/life-members",
  "ambassadors-patrons.html": "/ambassadors-patrons",
  "member.html": "/member",
  "store.html": "/store",
};

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function localAsset(url) {
  return manifest[url] || "";
}

function source(pathname) {
  return byPath.get(pathname) || byPath.get("/");
}

function cleanLines(pathname) {
  const page = source(pathname);
  const title = (page.h1 || "").toUpperCase();
  const skip = new Set([
    "ABOUT RA",
    "SUPPORT",
    "GET INVOLVED",
    "OUR PARTNERS",
    "NEWS",
    "CONTACT US",
    "REFER A FRIEND",
    "LOGIN",
    "DONATE",
    "GET SUPPORT",
    "EXIT",
    "SIGN UP",
    "Follow us",
    "Privacy Policy",
    "Terms and Conditions",
    "Terms & Conditions",
  ]);
  let lines = page.text
    .split("\n")
    .map((line) => line.replace(/\u00a0/g, " ").trim())
    .filter(Boolean)
    .filter((line) => !skip.has(line));
  const titleIndex = lines.findIndex((line) => line.toUpperCase() === title);
  if (titleIndex >= 0) lines = lines.slice(titleIndex + 1);
  const stop = lines.findIndex((line) => line.includes("Rise Above provides assistance & support") || line.includes("Keep up with the latest"));
  if (stop >= 0) lines = lines.slice(0, stop);
  return lines.filter((line, index, arr) => arr.indexOf(line) === index || line.length > 40);
}

function pick(pathname, tests, limit = 3) {
  const lines = cleanLines(pathname);
  return tests
    .map((test) => lines.find((line) => test.test(line)))
    .filter(Boolean)
    .filter((line, index, arr) => arr.indexOf(line) === index)
    .slice(0, limit);
}

function asset(pathname, patterns, fallback = [/About-RA-Desktop4/i]) {
  const assets = source(pathname).assets || [];
  for (const pattern of patterns) {
    const match = assets.find((url) => pattern.test(decodeURIComponent(url)) && !/logo|favicon/i.test(url));
    if (match) return localAsset(match);
  }
  for (const pattern of fallback) {
    const match = data.assets.find((url) => pattern.test(decodeURIComponent(url)));
    if (match) return localAsset(match);
  }
  return localAsset(data.assets.find((url) => /Homepage-banner/i.test(url)) || data.assets[0]);
}

const supportCategories = [
  ["Medication support", "Help with eligible medication-related expenses that add pressure during a cancer diagnosis."],
  ["Food supplements", "Practical support with dietary supplements when cancer adds extra household pressure."],
  ["Food & petrol vouchers", "Food and petrol vouchers to help with everyday costs while appointments and care are underway."],
  ["Electricity accounts", "Support with electricity accounts when cancer disrupts household finances."],
  ["Fertility preservation", "Assistance with fertility preservation expenses connected to a cancer diagnosis."],
  ["UC Cancer Wellness Clinic", "Support connected with the UC Cancer Wellness Clinic."],
];

const partnerSections = [
  {
    title: "Foundation Partners",
    intro: "Long-time donors who have championed local cancer patients through ongoing financial and in-kind support.",
    className: "foundation",
    partners: [
      ["Capital Chemist", "https://rariseabovecbr.blob.core.windows.net/assets/nova/Cap-logo.jpg"],
      ["Queanbeyan Leagues Club", "https://rariseabovecbr.blob.core.windows.net/assets/nova/Quean-logo.jpg"],
    ],
  },
  {
    title: "Community Partners",
    intro: "Community partners help keep practical support available for people and families facing the surrounding costs of cancer.",
    groups: [
      {
        title: "Extraordinary Impact",
        intro: "Major community partners represented first, using the current live public partner logos.",
        partners: [
          ["Brilliant Admin Solutions", "https://rariseabovecbr.blob.core.windows.net/assets/nova/Brilliant-Admin-logo.jpg"],
          ["Express Truck Services", "https://rariseabovecbr.blob.core.windows.net/assets/nova/Express-logo.jpg"],
          ["Canberra Craft Beer & Cider Festival", "https://rariseabovecbr.blob.core.windows.net/assets/nova/Canberra-Craft-Cider-logo.jpg"],
        ],
      },
      {
        title: "Extended Impact",
        intro: "Ongoing community partners who provide meaningful financial, event and in-kind support.",
        partners: [
          ["The Pink Party", "https://rariseabovecbr.blob.core.windows.net/assets/nova/Pink-Party-logo_1.jpg"],
          ["Lone Wolf Promotions", "https://rariseabovecbr.blob.core.windows.net/assets/nova/Lone-wolf-promotions-logo_1.jpg"],
          ["Elvin Group", "https://rariseabovecbr.blob.core.windows.net/assets/nova/Elvin-group-logo_1.jpg"],
          ["Icon Water", "https://rariseabovecbr.blob.core.windows.net/assets/nova/icon-logo_1.jpg"],
          ["Queanbeyan Rodeo", "https://rariseabovecbr.blob.core.windows.net/assets/nova/Queanbeyan-rodeo-logo_1.jpg"],
          ["xAmplify", "https://rariseabovecbr.blob.core.windows.net/assets/nova/xAmplify-logo_1.jpg"],
          ["The Dock Kingston", "https://rariseabovecbr.blob.core.windows.net/assets/nova/the-dock-logo_1.jpg"],
          ["Gallagher Wines", "https://rariseabovecbr.blob.core.windows.net/assets/nova/Gallagher-wines-logo_1.jpg"],
        ],
      },
      {
        title: "Essential Impact",
        intro: "The broad base of community support that helps Rise Above continue practical local assistance.",
        partners: [
          ["Rose Cottage Canberra", "https://rariseabovecbr.blob.core.windows.net/assets/nova/rose-cottage-logo_1.jpg"],
          ["Handmade Canberra", "https://rariseabovecbr.blob.core.windows.net/assets/nova/handmade-logo_1.jpg"],
          ["Tall Foundation", "https://rariseabovecbr.blob.core.windows.net/assets/nova/tall-foundation-logo_1.jpg"],
          ["Amplify", "https://rariseabovecbr.blob.core.windows.net/assets/nova/amplify-logo_2.jpg"],
          ["Supercurious", "https://rariseabovecbr.blob.core.windows.net/assets/nova/supercurious-logo_1.jpg"],
          ["Lindbeck's Butchery", "https://rariseabovecbr.blob.core.windows.net/assets/nova/lindbecks-butchery-logo_1.jpg"],
          ["Data#3", "https://rariseabovecbr.blob.core.windows.net/assets/nova/Untitled-design--5-_3.png"],
          ["Thoroughbred Park", "https://rariseabovecbr.blob.core.windows.net/assets/nova/ThoroughbredPark--Logo_1.png"],
          ["The Jetty Canberra", "https://rariseabovecbr.blob.core.windows.net/assets/nova/jtt_2.png"],
          ["Weston Cruise & Travel", "https://rariseabovecbr.blob.core.windows.net/assets/nova/471738962-1182453933401046-9195374659788071246-n_4.jpg"],
          ["Veterans Motorcycle Club Canberra", "https://rariseabovecbr.blob.core.windows.net/assets/nova/Logo.jpg"],
          ["Canberra Southern Cross Club", "https://rariseabovecbr.blob.core.windows.net/assets/nova/CSCC-cmyk_3.png"],
        ],
      },
    ],
  },
  {
    title: "Social Impact Partner",
    intro: "Collab for impact: local social-impact partners working alongside Rise Above to support the community.",
    className: "social",
    partners: [
      ["Respite Care for QBN", "https://rariseabovecbr.blob.core.windows.net/assets/nova/respite-logo.jpg"],
      ["Running for Resilience", "https://rariseabovecbr.blob.core.windows.net/assets/nova/R4R.jpg"],
    ],
  },
];

function basePages() {
  const financialIntro = [
    "Helping patients feel safe and supported through cancer by providing unbiased financial support for surrounding expenses.",
    "Rise Above is committed to ensuring that people in the Canberra and QPRC region, regardless of age or cancer type, have unbiased access to practical support.",
    "Rise Above helps patients by assisting with surrounding expenses such as food, petrol, electricity and other practical supports listed on the current site.",
  ];
  const donateIntro = pick("/donate", [/Every day/, /Over 2400 locals/, /A donation to Rise Above/], 3);
  const partnerIntro = pick("/partner-with-us", [/working together/, /currently supports/, /Your organisation can be a partner/], 4);
  const volunteerIntro = pick("/volunteer", [/When you volunteer/, /Volunteers form/, /Our volunteering model/, /Due to patients/], 4);
  const eventsIntro = pick("/join-an-event", [/Be part of something powerful/, /Explore our upcoming events/, /Throughout the year/, /Want to host/], 4);
  const referIntro = [
    "Know someone diagnosed with cancer? Rise Above provides a simple referral pathway so a friend, family member or patient can be connected with support.",
    "Rise Above asks referrers to confirm they have the patient or loved one's permission before sending details through.",
    "Once details are submitted, Rise Above emails the patient information about available support and next steps.",
  ];
  const storyIntro = [
    "The Cancer Support Group (Rise Above) began in 1985 when Yvonne Cuschieri started raising funds to enable 13 local teenagers to attend a CanTeen national camp.",
    "We adopted the name Rise Above – Capital Region Cancer Relief in 2017 to focus on supporting patients from the Capital Region to rise above and fight cancer.",
    "Today, Rise Above assists hundreds of patients yearly and looks for opportunities to lessen the surrounding financial burden of cancer for patients and their loved ones.",
  ];
  const contactIntro = [
    "Do you need help fighting the cost of cancer, want to support local cancer patients, or want to volunteer?",
    "Pop some details into the contact form and Rise Above will be in touch. If you prefer to speak directly, the office phone number is 02 6297 1261.",
    "Office address: 21 Cooma Street, Queanbeyan NSW 2620. Postal address: PO Box 1351, Queanbeyan NSW 2620.",
    "For media enquiries or interview requests, contact hello@riseabovecbr.org.au.",
  ];

  return [
    {
      file: "index.html",
      title: "Practical financial support for people facing cancer.",
      sourcePath: "/",
      template: "home",
      heroTitle: "Practical financial support for people facing cancer.",
      summary: "We help individuals and families across the Canberra and Capital Region manage the surrounding financial pressures of cancer.",
      image: asset("/", [/Homepage-banner\.jpg/i]),
    },
    {
      file: "financial-assistance.html",
      title: "Financial Assistance",
      sourcePath: "/financial-assistance",
      heroTitle: "Financial Assistance",
      summary: financialIntro[0],
      lead: financialIntro[1] || financialIntro[0],
      paragraphs: financialIntro,
      cards: supportCategories.slice(0, 6),
      cta: ["Apply for Assistance", "refer.html"],
      formNote: "Existing financial assistance form flow retained for prototype placement.",
    },
    {
      file: "eligibility-how-it-works.html",
      title: "Eligibility & How It Works",
      sourcePath: "/financial-assistance",
      heroTitle: "Eligibility & How It Works",
      summary: "Rise Above assists patients in the Canberra and Queanbeyan Region and does not means test.",
      lead: "Understand who can apply and what happens after you register.",
      paragraphs: [
        "Rise Above is committed to ensuring that all people in the Canberra and QPRC region, regardless of age or the type of cancer diagnosed, have unbiased access to the funding provided.",
        "Every local cancer patient can seek Rise Above’s support, regardless of age or the type of cancer.",
        "If you have questions about the form, call the office on 6297 1261 or email assistance@riseabovecbr.org.au.",
      ],
      cards: [
        ["Who can apply", "Cancer patients in the Canberra, Queanbeyan and surrounding Capital Region can seek support."],
        ["No means test", "Rise Above states that cancer does not discriminate, so neither does its financial assistance."],
        ["What happens next", "After registration, the team reviews the request and contacts the patient about the next steps."],
      ],
      cta: ["Apply for Assistance", "financial-assistance.html"],
    },
    {
      file: "what-we-can-help-with.html",
      title: "What We Can Help With",
      sourcePath: "/financial-assistance",
      heroTitle: "What We Can Help With",
      summary: "Practical financial assistance for the extra surrounding costs that come with cancer.",
      lead: "Rise Above helps patients with practical household and everyday costs around a cancer diagnosis.",
      paragraphs: ["Cancer can add pressure to everyday household costs. The current site lists the following support areas."],
      cards: supportCategories,
      cta: ["Apply for Assistance", "financial-assistance.html"],
    },
    {
      file: "directory-support-services.html",
      title: "Support Services",
      sourcePath: "/directory/support-services",
      heroTitle: "Support Services",
      summary: "Find a service that helps you feel safe and supported.",
      lead: "Use the support services directory to find practical, health, wellbeing and community services.",
      paragraphs: ["The current directory includes categories such as accommodation, counselling and mental health, family and carer support, health and wellbeing, medical products, transport and community support."],
      cards: [
        ["Find by category", "Browse service categories including accommodation, community support, counselling, education, transport and health and wellbeing."],
        ["Refine your search", "The existing directory supports filtering by support type and category."],
        ["Need help choosing?", "Contact Rise Above if you are unsure which service or support pathway is right for you."],
      ],
      formNote: "Existing support services directory/search functionality retained for prototype placement.",
    },
    {
      file: "faqs.html",
      title: "FAQs",
      sourcePath: "/financial-assistance",
      heroTitle: "FAQs",
      summary: "Quick answers for people seeking support, referring someone, or trying to understand Rise Above assistance.",
      lead: "Common questions gathered from support, referral, donation and event content.",
      faq: [
        ["Do you support all cancer types?", "Yes. The current site states that Rise Above assists patients diagnosed with any type of cancer, across all ages."],
        ["Do you means test?", "The current homepage says Rise Above does not means test."],
        ["What costs can be supported?", "The site lists medication support, food supplements, food and petrol vouchers, electricity accounts, fertility preservation and UC Cancer Wellness Clinic support."],
        ["Can someone refer a patient?", "Yes. The current referral page asks referrers to confirm they have permission before sending details to Rise Above."],
        ["Where does donated money go?", "The donation page states that funds stay local and go directly to patients and families struggling with the cost of cancer."],
      ],
    },
    {
      file: "patient-stories.html",
      title: "Patient Stories",
      sourcePath: "/news",
      heroTitle: "Patient Stories",
      summary: "Stories from local people and families who have experienced the financial pressure of cancer.",
      lead: "Real stories help explain why practical support matters.",
      paragraphs: [
        "The current site includes patient and community stories through the News section, including Larissa’s story and reflections from people supported during cancer.",
        "A patient story on the donation page describes how Rise Above relieved stress the family did not know they could face.",
      ],
      cards: [
        ["Larissa’s Story", "A local story about breast cancer diagnosis, financial pressure and the relief of practical support."],
        ["Oregano", "A story listed in the current News section about the reality of cancer and family pressure."],
        ["But I didn’t know…", "A Purpose Media article sharing Jerri’s story, listed in the current News section."],
      ],
      cta: ["Read News & Updates", "news.html"],
    },
    {
      file: "urgent-help-information.html",
      title: "Urgent Help Information",
      sourcePath: "/financial-assistance",
      heroTitle: "Urgent Help Information",
      summary: "Rise Above provides practical financial support, but it is not an emergency or crisis response service.",
      lead: "If there is immediate danger or urgent medical need, use emergency services first.",
      paragraphs: [
        "For life-threatening or emergency situations in Australia, call Triple Zero (000) for police, fire or ambulance.",
        "For 24/7 crisis support, Lifeline is available on 13 11 14.",
        "For Rise Above financial assistance questions, call 6297 1261 or email assistance@riseabovecbr.org.au during office follow-up.",
      ],
      cards: [
        ["Emergency", "Call Triple Zero (000) for urgent medical help or life-threatening situations."],
        ["Crisis support", "Call Lifeline on 13 11 14 for 24/7 crisis support."],
        ["Financial assistance", "Contact Rise Above for practical financial support with surrounding expenses connected to cancer."],
      ],
    },
    {
      file: "donate.html",
      title: "Donate",
      sourcePath: "/donate",
      heroTitle: "Donate Today",
      summary: donateIntro[1],
      lead: "Your donation helps local patients cope with additional surrounding costs while navigating cancer.",
      paragraphs: donateIntro,
      cards: [
        ["$20", "Supports practical medication-related expenses listed on the current donation page."],
        ["$50", "Supports practical, local assistance for patients and families."],
        ["Funds stay local", "The current donation page states donations stay local and go directly to patients and families."],
      ],
      formNote: "Existing donation flow retained for prototype placement.",
    },
    {
      file: "fundraise.html",
      title: "Fundraise",
      sourcePath: "/fundraise",
      heroTitle: "Fundraise",
      summary: "Join team Rise Above and create positive change for locals navigating cancer.",
      lead: "Anything you can imagine can come to life with a fundraiser.",
      paragraphs: pick("/fundraise", [/With a few clicks/, /Ask everyone/, /funds raised stay local/, /Help Rise Above support locals/], 4),
      cards: [
        ["Celebrate an occasion", "Turn a birthday, milestone or gathering into support for local patients."],
        ["Challenge yourself", "Use a personal challenge to raise funds and awareness."],
        ["Host an event", "Bring people together through a movie night, workplace fundraiser or community activity."],
      ],
      cta: ["Start Fundraising", "fundraise.html"],
      formNote: "Existing fundraising page creation flow retained for prototype placement.",
    },
    {
      file: "volunteer.html",
      title: "Volunteer",
      sourcePath: "/volunteer",
      heroTitle: "Volunteer",
      summary: volunteerIntro[0],
      lead: "Volunteer in a way that fits your time and capacity.",
      paragraphs: volunteerIntro,
      cards: [
        ["Event preparation", "Support the setup and delivery of Rise Above fundraising activities."],
        ["Donation entry", "Collect donation entry at various events."],
        ["Merchandise", "Help sell merchandise at events."],
      ],
      formNote: "Existing register-to-volunteer flow retained for prototype placement.",
    },
    {
      file: "partner-with-us.html",
      title: "Corporate Partnerships",
      sourcePath: "/partner-with-us",
      heroTitle: "Corporate Partnerships",
      summary: partnerIntro[0],
      lead: "Partnering with Rise Above helps address the financial challenges faced by local cancer patients.",
      paragraphs: partnerIntro,
      cards: [
        ["Fundraising events", "Run fundraising events with staff, customers or your community."],
        ["In-kind support", "Provide business support to Rise Above operations."],
        ["Staff volunteering", "Encourage staff to volunteer for Rise Above."],
      ],
      cta: ["Discuss a Partnership", "contact.html"],
    },
    {
      file: "leave-a-bequest.html",
      title: "Leave a Bequest",
      sourcePath: "/leave-a-bequest",
      heroTitle: "Leave a Bequest",
      summary: "The thoughtful act of leaving a bequest can ensure that future cancer patients are financially supported.",
      lead: "Make a lasting mark on your community.",
      paragraphs: pick("/leave-a-bequest", [/thoughtful act/, /A bequest in a Will/, /including a bequest/], 3),
      cta: ["Contact Us", "contact.html"],
    },
    {
      file: "in-memory.html",
      title: "Give in Memory",
      sourcePath: "/in-memory",
      heroTitle: "Give in Memory",
      summary: "Honour the life and legacy of a loved one while changing the life of a local cancer patient.",
      lead: "A special way to honour a loved one is by helping the next patient diagnosed with cancer.",
      paragraphs: pick("/in-memory", [/special way/, /memorial donation/, /Create an in memory/], 3),
      formNote: "Existing in-memory page creation/search flow retained for prototype placement.",
    },
    {
      file: "become-a-sponsor.html",
      title: "Become a Sponsor",
      sourcePath: "/partner-with-us",
      heroTitle: "Become a Sponsor",
      summary: "Support Rise Above through ongoing business, community or in-kind support.",
      lead: "Sponsors and partners help Rise Above assist hundreds of local cancer patients each year.",
      paragraphs: [
        "The current site recognises foundation, community and charity partners who provide financial and in-kind support.",
        "As a charitable organisation, Rise Above relies on fundraising, community partners, generous businesses and the local community to meet increasing need.",
      ],
      cards: [
        ["Foundation partners", "Ongoing major support for local patients."],
        ["Community partners", "Businesses and community groups helping fund practical assistance."],
        ["Charity partners", "Local charities collaborating to support the community."],
      ],
      cta: ["Contact Us", "contact.html"],
    },
    {
      file: "workplace-giving.html",
      title: "Workplace Giving",
      sourcePath: "/partner-with-us",
      heroTitle: "Workplace Giving",
      summary: "Create a simple way for staff to support local cancer patients through the workplace.",
      lead: "Workplace giving fits within the current partnership pathways.",
      paragraphs: [
        "The current partnership page invites organisations to encourage staff to volunteer, run fundraising events, ask for donations at company events and encourage customers to support Rise Above.",
        "A workplace giving pathway can sit alongside those existing business support options.",
      ],
      cards: [
        ["Staff participation", "Invite staff to give, volunteer or fundraise together."],
        ["Company events", "Ask for donations at company events."],
        ["Local impact", "Funds raised support local patients and families struggling with the cost of cancer."],
      ],
      cta: ["Discuss Workplace Giving", "contact.html"],
    },
    {
      file: "join-an-event.html",
      title: "Upcoming Events",
      sourcePath: "/join-an-event",
      heroTitle: "Upcoming Events",
      summary: eventsIntro[0],
      lead: "Explore upcoming events and find a way to get involved.",
      paragraphs: eventsIntro,
      cards: [
        ["Rise Above Trivia Party", "One of Rise Above’s biggest fundraising events, known for selling out quickly.", "join-an-event-trivia-party.html"],
        ["Community events", "Local events that raise vital funds and awareness.", "community-events.html"],
        ["Host your own event", "Talk to Rise Above about holding an event.", "host-your-own-event.html"],
      ],
      formNote: "Existing event listing/calendar functionality retained for prototype placement.",
    },
    {
      file: "community-events.html",
      title: "Community Events",
      sourcePath: "/join-an-event",
      heroTitle: "Community Events",
      summary: "Community events raise vital funds and awareness for individuals and families affected by cancer.",
      lead: "Year-round involvement helps bring hope and practical support to those who need it most.",
      paragraphs: pick("/join-an-event", [/Throughout the year/, /There's always/, /Join one of our events/], 3),
      cards: [["Volunteer at events", "Support community activities with time and practical help."], ["Spread the word", "Help raise awareness of Rise Above support."], ["Attend locally", "Join activities in the Canberra and Queanbeyan Region."]],
    },
    {
      file: "fundraising-events.html",
      title: "Fundraising Events",
      sourcePath: "/join-an-event",
      heroTitle: "Fundraising Events",
      summary: "Events that help Rise Above support local patients with the cost of cancer.",
      lead: "Join or host fundraising activities that keep support local.",
      paragraphs: eventsIntro.concat(pick("/fundraise", [/funds raised stay local/], 1)).slice(0, 4),
      cards: [["Trivia Party", "A major annual fundraising event."], ["Convoy", "A community fundraising event featured on the current homepage."], ["Host an activity", "Create a fundraiser with your workplace, friends or community."]],
    },
    {
      file: "host-your-own-event.html",
      title: "Host Your Own Event",
      sourcePath: "/join-an-event",
      heroTitle: "Host Your Own Event",
      summary: "Want to host or discuss an event with Rise Above? The current site says the team would love to hear from you.",
      lead: "Bring your community together and direct the result toward local patients.",
      paragraphs: [
        "Rise Above invites people to celebrate an occasion, challenge themselves, host a movie night or bring another fundraising idea to life.",
        "Funds raised stay local and go directly to patients and families struggling with the cost of cancer.",
      ],
      cta: ["Contact Us", "contact.html"],
    },
    {
      file: "event-calendar.html",
      title: "Event Calendar",
      sourcePath: "/join-an-event",
      heroTitle: "Event Calendar",
      summary: "A calendar-oriented view of existing event listings.",
      lead: "Adapt the existing event listing functionality into a simple calendar view.",
      paragraphs: eventsIntro.slice(0, 2),
      formNote: "Existing event listing/filter/calendar functionality retained for prototype placement.",
    },
    {
      file: "past-events-gallery.html",
      title: "Past Events / Gallery",
      sourcePath: "/join-an-event/trivia-party",
      heroTitle: "Past Events / Gallery",
      summary: "Use existing event and news imagery to show community participation without overwhelming primary pathways.",
      lead: "Past events can support trust after users have found their main pathway.",
      paragraphs: [
        "The current site includes event stories, news posts and event imagery that can be reused here.",
        "This section should remain secondary to Apply, Donate, Refer and Volunteer pathways.",
      ],
      cards: [["Trivia Party", "A major fundraising event."], ["Convoy", "Community activation and carnival-style fundraising."], ["Community fundraisers", "Local events hosted by supporters."]],
    },
    {
      file: "refer.html",
      title: "Refer a Patient",
      sourcePath: "/refer",
      heroTitle: "Refer a Patient",
      summary: "Help someone diagnosed with cancer connect with Rise Above support.",
      lead: "Please confirm you have the patient’s permission before sending their details.",
      paragraphs: referIntro,
      formNote: "Existing Refer a Friend form/functionality retained and renamed for prototype placement.",
      cta: ["Start Referral", "refer.html"],
    },
    {
      file: "referral-process.html",
      title: "Referral Process",
      sourcePath: "/refer",
      heroTitle: "Referral Process",
      summary: "A clearer step-by-step version of the current referral guidance.",
      lead: "Know someone diagnosed with cancer? You can help them connect with Rise Above.",
      paragraphs: [
        "Check that the person gives permission for their details to be sent to Rise Above.",
        "Submit the referral form with their details.",
        "Rise Above emails the patient information about support and next steps.",
      ],
      cards: [["1. Ask permission", "Confirm the patient is comfortable being contacted."], ["2. Submit details", "Use the referral form."], ["3. Patient follow-up", "Rise Above sends information directly to the patient."]],
    },
    {
      file: "referral-eligibility.html",
      title: "Eligibility Criteria",
      sourcePath: "/financial-assistance",
      heroTitle: "Eligibility Criteria",
      summary: "Eligibility guidance for referrers and patients.",
      lead: "Rise Above supports local cancer patients across cancer type and age.",
      paragraphs: [
        "The current site states Rise Above assists patients of all ages and covers all cancer types.",
        "Support is focused on patients in the Canberra, Queanbeyan and surrounding region.",
        "Rise Above does not means test.",
      ],
      cta: ["Apply for Assistance", "financial-assistance.html"],
    },
    {
      file: "information-for-health-professionals.html",
      title: "Information for Health Professionals",
      sourcePath: "/refer",
      heroTitle: "Information for Health Professionals",
      summary: "A dedicated referral pathway for clinicians, social workers and health professionals.",
      lead: "Help a patient connect with practical financial support for the surrounding costs of cancer.",
      paragraphs: [
        "Rise Above supports cancer patients in the Canberra, Queanbeyan and surrounding Capital Region with practical financial assistance for surrounding expenses such as groceries, petrol, electricity and other household pressures.",
        "The current referral pathway asks that a referrer has the patient or loved one's permission before sending details through to Rise Above. That same consent-first approach should be retained for health professionals.",
        "Rise Above assists patients of all ages and cancer types. The current site also states that Rise Above does not means test because cancer does not discriminate.",
        "After a referral is received, Rise Above can email the patient information about available support and next steps. Questions can be directed to the office on 6297 1261 or assistance@riseabovecbr.org.au.",
      ],
      cards: [
        ["Who can refer", "Clinicians, social workers, practice staff and other health professionals can use this pathway when they have patient consent."],
        ["What support covers", "Practical assistance can relate to food, petrol, electricity, medication-related expenses and other surrounding pressures listed by Rise Above."],
        ["Before submitting", "Confirm consent, gather contact details and include enough context for the Rise Above team to follow up appropriately."],
      ],
      cta: ["Refer a Patient", "refer.html"],
    },
    {
      file: "required-documentation.html",
      title: "Required Documentation",
      sourcePath: "/financial-assistance",
      heroTitle: "Required Documentation",
      summary: "A plain-language page for application and referral requirements.",
      lead: "Keep the form simple and tell people what to prepare before they start.",
      paragraphs: [
        "The current source content confirms that patients can register for assistance through the financial assistance form.",
        "Indicative requirements for this prototype include patient contact details, confirmation of cancer diagnosis or care context, and a clear description of the support being requested.",
        "Final documentation requirements should be confirmed from Rise Above's existing operational form before production launch.",
        "Until confirmed, direct questions to 6297 1261 or assistance@riseabovecbr.org.au.",
      ],
      cards: [
        ["Contact details", "Name, phone, email and preferred contact method for the patient or authorised contact."],
        ["Support request", "A short explanation of the practical cost pressure, such as petrol, groceries, electricity or another surrounding expense."],
        ["Consent", "For referrals, confirmation that the patient has agreed to their details being sent to Rise Above."],
      ],
    },
    {
      file: "referral-faqs.html",
      title: "Referral FAQs",
      sourcePath: "/refer",
      heroTitle: "Referral FAQs",
      summary: "Answers for people referring a friend, family member or patient.",
      lead: "Referral content should reduce hesitation and make consent clear.",
      faq: [
        ["Do I need permission?", "Yes. The current referral page asks referrers to ensure they have permission before sending details to Rise Above."],
        ["What happens after I refer someone?", "Rise Above emails the patient information about support."],
        ["Can the patient apply directly?", "Yes. Patients can register for financial assistance through the assistance page."],
      ],
    },
    {
      file: "support-team-contact.html",
      title: "Contact the Support Team",
      sourcePath: "/contact",
      heroTitle: "Contact the Support Team",
      summary: "For questions about assistance, referrals or the application form.",
      lead: "Use a support-specific contact path for stressed users.",
      paragraphs: ["For form questions, call 6297 1261 or email assistance@riseabovecbr.org.au.", "General contact details remain phone 02 6297 1261 and 21 Cooma Street, Queanbeyan."],
      cta: ["Contact Us", "contact.html"],
    },
    {
      file: "who-are-we.html",
      title: "Our Story",
      sourcePath: "/who-are-we",
      heroTitle: "Our Story",
      summary: "Rise Above is a not-for-profit organisation providing financial assistance and support to cancer patients and families in the ACT, Queanbeyan and surrounds.",
      lead: "Helping patients feel safe and supported when cancer is diagnosed.",
      paragraphs: storyIntro,
    },
    {
      file: "mission-values.html",
      title: "Our Mission & Values",
      sourcePath: "/who-are-we",
      heroTitle: "Our Mission & Values",
      summary: "Helping patients feel safe and supported when cancer is diagnosed by providing unbiased financial support.",
      lead: "Practical support, local focus and unbiased access sit at the centre of Rise Above’s current messaging.",
      paragraphs: [
        "Rise Above provides financial assistance and support to cancer patients and families residing with them within the ACT, Queanbeyan and surrounds.",
        "The organisation focuses on lessening the surrounding financial burden of cancer so patients can concentrate on care, family and mental wellbeing.",
        "Rise Above relies on fundraising, community partners, generous businesses and the local community.",
      ],
    },
    {
      file: "board-staff.html",
      title: "Meet the Team",
      sourcePath: "/board-staff",
      heroTitle: "Meet the Team",
      summary: "Meet the staff and board members behind Rise Above.",
      lead: "People working with the community to support local patients.",
      paragraphs: pick("/board-staff", [/Renee brings/, /Renee is happiest/, /Rise Above Staff/], 3),
      formNote: "Existing staff and board member profile content retained for prototype placement.",
    },
    {
      file: "governance-reports.html",
      title: "Governance / Reports",
      sourcePath: "/who-are-we",
      heroTitle: "Governance / Reports",
      summary: "Annual reports, life members and governance-related information consolidated under About.",
      lead: "The current site references Annual Report 2025 and recognises life members for long-standing contribution.",
      paragraphs: [
        "Our most recent annual report shows Rise Above’s successes and challenges over the past year.",
        "Rise Above recognises the contribution of long-standing members with Life Membership.",
      ],
      cards: [["Annual Report 2025", "Current annual report reference from the Who We Are page."], ["Life members", "Recognition of dedicated long-standing members."], ["Board", "Board member content remains available through Meet the Team."]],
    },
    {
      file: "sponsors-partners.html",
      title: "Sponsors & Partners",
      sourcePath: "/community-partners",
      heroTitle: "Sponsors & Partners",
      summary: "Partners make positive financial change for locals navigating a cancer diagnosis.",
      template: "partners",
      lead: "Foundation, community and social impact partners are consolidated here.",
      paragraphs: [
        "From the beginning, foundation partners have championed local cancer patients by providing ongoing financial and in-kind support.",
        "Making positive financial change to locals navigating cancer would not be possible without ongoing community partners.",
        "Rise Above also collaborates with social impact partners to provide broader support to the community.",
      ],
    },
    {
      file: "careers-volunteering.html",
      title: "Careers / Volunteering",
      sourcePath: "/volunteer",
      heroTitle: "Careers / Volunteering",
      summary: "Volunteer and community participation pathways consolidated under About.",
      lead: "Volunteers form the backbone of the organisation.",
      paragraphs: volunteerIntro,
      cta: ["Volunteer", "volunteer.html"],
    },
    {
      file: "news.html",
      title: "News & Updates",
      sourcePath: "/news",
      heroTitle: "News & Updates",
      summary: "Stories, updates and community news from Rise Above.",
      lead: "News now sits under About rather than competing with urgent user pathways.",
      paragraphs: [
        "The current News section includes patient stories, community grants, partner updates and features from across the Rise Above community.",
        "In the restructured navigation, News & Updates sits under About so it remains available without competing with urgent support, donation or referral pathways.",
        "This page can surface a simple listing, featured story cards and filters once the existing news listing functionality is connected.",
      ],
      cards: [
        ["Patient stories", "Human stories that explain why practical support matters."],
        ["Community updates", "Fundraising, partner and grant news from across the region."],
        ["Event stories", "Recaps and galleries from Rise Above and community events."],
      ],
    },
    {
      file: "contact.html",
      title: "Contact Us",
      sourcePath: "/contact",
      heroTitle: "Contact Us",
      summary: "We love a good chat, let’s talk.",
      lead: "Contact Rise Above for help, volunteering, fundraising, partnerships or general enquiries.",
      paragraphs: contactIntro,
      cards: [["Phone", "02 6297 1261"], ["Email", "hello@riseabovecbr.org.au"], ["Visit", "21 Cooma Street, Queanbeyan NSW 2620"]],
    },
    {
      file: "office-locations.html",
      title: "Office Locations",
      sourcePath: "/contact",
      heroTitle: "Office Locations",
      summary: "Rise Above is based in Queanbeyan and supports Canberra, Queanbeyan and the surrounding Capital Region.",
      lead: "Office address",
      paragraphs: [
        "Rise Above is based at 21 Cooma Street, Queanbeyan NSW 2620.",
        "Postal address: PO Box 1351, Queanbeyan NSW 2620.",
        "This page can hold the embedded map, parking guidance and arrival notes once those details are confirmed for the final site.",
      ],
      cards: [["Street address", "21 Cooma Street, Queanbeyan NSW 2620"], ["Postal address", "PO Box 1351, Queanbeyan NSW 2620"], ["Phone", "02 6297 1261"]],
    },
    {
      file: "opening-hours.html",
      title: "Opening Hours",
      sourcePath: "/contact",
      heroTitle: "Opening Hours",
      summary: "A dedicated place for office availability and response expectations.",
      lead: "Opening hours need confirmation before publishing.",
      paragraphs: [
        "The current public content includes contact details but does not provide verified office opening hours in the crawled source.",
        "Indicative content can be used here in the prototype to show the intended layout while final hours are confirmed.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante facilisis, sed cursus neque gravida.",
      ],
      cards: [["Office hours", "Indicative placeholder pending confirmation."], ["Response time", "Use this space for expected response timing."], ["After-hours support", "For urgent medical help, call Triple Zero (000)."]],
    },
    {
      file: "request-callback.html",
      title: "Request a Callback",
      sourcePath: "/contact",
      heroTitle: "Request a Callback",
      summary: "A low-pressure contact option for people who would prefer the team to call them.",
      lead: "This is a new form requirement based on the existing contact pathway.",
      paragraphs: [
        "A callback request gives stressed users a lower-pressure contact option while still reusing the existing contact form pattern.",
        "Recommended fields include name, phone number, preferred contact time, reason for callback and consent to be contacted by Rise Above.",
        "For urgent medical or crisis help, use emergency or crisis support services rather than waiting for a callback.",
      ],
      cards: [["Your details", "Name, phone and email."], ["Best time to call", "Morning, afternoon or a specific preferred time."], ["Reason for callback", "Financial assistance, referral, fundraising, volunteering, partnership or general enquiry."]],
    },
    {
      file: "general-enquiries.html",
      title: "General Enquiries",
      sourcePath: "/contact",
      heroTitle: "General Enquiries",
      summary: "For questions that are not about an immediate assistance application.",
      lead: "Use the current contact details and contact form.",
      paragraphs: ["Phone: 02 6297 1261", "Address: 21 Cooma Street, QUEANBEYAN, NSW, 2620", "Use this pathway for fundraising, volunteering, partnership or general questions."],
      cards: [["Fundraising", "Ask about events, fundraising pages or community activities."], ["Volunteering", "Ask how to give time or support an event."], ["Partnerships", "Ask how an organisation can support Rise Above."]],
    },
    {
      file: "social-media.html",
      title: "Social Media",
      sourcePath: "/contact",
      heroTitle: "Social Media",
      summary: "Follow Rise Above through the social links currently presented in the footer.",
      lead: "Keep social links secondary to direct help and donation pathways.",
      paragraphs: ["The current footer links to Facebook, Instagram and LinkedIn profiles for Rise Above."],
      cards: [["Facebook", "facebook.com/riseabovecbr"], ["Instagram", "instagram.com/riseabovecbr"], ["LinkedIn", "linkedin.com/company/riseabovecbr"]],
    },
    {
      file: "privacy-policy.html",
      title: "Privacy Policy",
      sourcePath: "/privacy-policy",
      heroTitle: "Privacy Policy",
      summary: "Policy information retained from the current website.",
      lead: "Privacy content should be preserved during the IA change.",
      paragraphs: cleanLines("/privacy-policy").slice(0, 5),
    },
    {
      file: "terms-conditions.html",
      title: "Terms & Conditions",
      sourcePath: "/terms-conditions",
      heroTitle: "Terms & Conditions",
      summary: "Terms content retained from the current website.",
      lead: "Terms content should be preserved during the IA change.",
      paragraphs: cleanLines("/terms-conditions").slice(0, 5),
    },
    {
      file: "join-an-event-trivia-party.html",
      title: "Rise Above Trivia Party",
      sourcePath: "/join-an-event/trivia-party",
      heroTitle: "Rise Above Trivia Party",
      summary: "Get the gang together for trivia, fun, laughter, prizes, games and silent auctions.",
      lead: "Always a sellout, always fun.",
      paragraphs: pick("/join-an-event/trivia-party", [/Trivia Party/, /Imagine a night/, /Register for the next/], 3),
      cta: ["Upcoming Events", "join-an-event.html"],
    },
    {
      file: "queanbeyan-monopoly.html",
      title: "Queanbeyan Monopoly",
      sourcePath: "/queanbeyan-monopoly",
      heroTitle: "Queanbeyan Monopoly",
      summary: "Something iconic is coming to Queanbeyan and it’s going to change the game.",
      lead: "Secure your street and support a historic community project.",
      paragraphs: cleanLines("/queanbeyan-monopoly").slice(0, 4),
      cta: ["Upcoming Events", "join-an-event.html"],
    },
  ];
}

function currentActive(file) {
  return navGroups.some((group) => group.items.some(([, href]) => href === file));
}

function navHtml(currentFile) {
  const groups = navGroups
    .map((group) => {
      const active = group.items.some(([, href]) => href === currentFile) || group.href === currentFile ? " active" : "";
      return `<div class="nav-group${active}"><a href="${group.href}">${esc(group.label)}</a><div class="nav-menu">${group.items
        .map(([label, href]) => `<a href="${href}">${esc(label)}</a>`)
        .join("")}</div></div>`;
    })
    .join("");

  return `
    <header class="site-header">
      <div class="header-main">
        <a class="brand" href="index.html"><img src="${localAsset("https://rariseabovecbr.blob.core.windows.net/assets/uploads/cms_nova/header-footer/RA-Header%20Logo.svg")}" alt="Rise Above"></a>
        <nav class="nav-primary" aria-label="Primary navigation">${groups}</nav>
        <div class="header-actions">
          <a class="btn btn-primary" href="donate.html">Donate</a>
          <a class="btn btn-secondary" href="financial-assistance.html">Get Support</a>
        </div>
        <nav class="nav-secondary" aria-label="Utility navigation">
          <a href="login.html">Login</a>
          <span class="search-icon" aria-hidden="true"></span>
        </nav>
      </div>
    </header>`;
}

function footerHtml() {
  const columns = navGroups
    .map((group) => `<div><h3>${esc(group.label)}</h3>${group.items.slice(0, 6).map(([label, href]) => `<a href="${href}">${esc(label)}</a>`).join("")}</div>`)
    .join("");
  return `
    <footer class="site-footer">
      <div class="footer-main">
        <div class="footer-brand">
          <img src="${localAsset("https://rariseabovecbr.blob.core.windows.net/assets/uploads/cms_nova/header-footer/RA-Footer%20Logo.svg") || localAsset("https://rariseabovecbr.blob.core.windows.net/assets/uploads/cms_nova/header-footer/RA-Header%20Logo.svg")}" alt="Rise Above">
          <p>Helping local cancer patients and families across Canberra, Queanbeyan and surrounding regions.</p>
          <p><strong>(02) 6297 1261</strong><br>hello@riseabovecbr.org.au<br>21 Cooma Street, Queanbeyan</p>
        </div>
        <div class="footer-columns">${columns}</div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 Rise Above</span>
        <span><a href="privacy-policy.html">Privacy Policy</a> <a href="terms-conditions.html">Terms and Conditions</a></span>
      </div>
    </footer>`;
}

function hero(page) {
  const image = page.image || asset(page.sourcePath || "/", [/desktop|banner|page-header|supporters|volunteers|memory|refer|monopoly|Homepage/i], [/About-RA-Desktop4/i]);
  return `
    <section class="hero${page.template === "home" ? " hero-home" : ""}" style="background-image: url('${image}')">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>${esc(page.heroTitle || page.title)}</h1>
        ${page.summary ? `<p>${esc(page.summary)}</p>` : ""}
      </div>
    </section>`;
}

function homeBody() {
  const actionTiles = [
    ["I need", "Financial Assistance", "Start here for practical financial help with petrol, groceries and other surrounding costs.", "financial-assistance.html", "emphasis"],
    ["I want to", "Donate", "Help local patients and families manage the surrounding costs of cancer.", "donate.html"],
    ["I want to", "Fundraise", "Create a fundraiser and keep support local.", "fundraise.html"],
    ["I want to", "Refer Someone", "Connect a patient with Rise Above support.", "refer.html"],
    ["I’m looking for", "Events", "Find upcoming events and community activities.", "join-an-event.html"],
    ["I want to", "Volunteer", "Give your time in a way that fits your capacity.", "volunteer.html"],
    ["I want to", "Partner", "Work with Rise Above as a business or organisation.", "partner-with-us.html"],
    ["I want to", "Learn About Rise Above", "Read the story, mission, team and community impact.", "who-are-we.html"],
  ];
  return `
    <section class="home-intro">
      <p>We help individuals and families across the Canberra and Capital Region manage the surrounding financial pressures of cancer.</p>
    </section>
    <section class="routing-section">
      <div class="section-heading centered">
        <h2>How can we help <strong>you</strong> today?</h2>
      </div>
      <div class="intent-grid">${actionTiles
        .map(([prefix, topic, body, href, emphasis]) => `<a class="intent-card ${emphasis || ""}" href="${href}"><h3><span>${esc(prefix)}</span><strong>${esc(topic)}</strong></h3><p>${esc(body)}</p><em>Go</em></a>`)
        .join("")}</div>
    </section>
    <section class="impact-section">
      <div class="section-heading centered">
        <h2>Our <strong>impact</strong> in the community</h2>
      </div>
      <div class="stats-grid">
        <article><strong>632</strong><span>Number of individuals and families assisted</span></article>
        <article><strong>40</strong><span>Years Supporting the Region</span></article>
        <article><strong>$712,274</strong><span>Dollars Given in Support</span></article>
      </div>
    </section>
    <section class="supporting-section">
      <article class="supporting-card">
        <img src="${asset("/join-an-event/trivia-party", [/Trivia-desktop/i])}" alt="">
        <div><p class="eyebrow">Featured event</p><h2>Rise Above Trivia Party</h2><p>One of Rise Above’s biggest fundraising events, known for selling out quickly.</p><a href="join-an-event-trivia-party.html">View event</a></div>
      </article>
      <article class="supporting-card">
        <img src="${asset("/donate", [/Panel 3|desktop banner/i])}" alt="">
        <div><p class="eyebrow">Patient story</p><h2>Support that reduces pressure</h2><p>Existing patient stories describe the relief practical assistance can provide around the wider costs of cancer.</p><a href="patient-stories.html">Read stories</a></div>
      </article>
      <article class="supporting-card">
        <img src="${asset("/community-partners", [/Brilliant|Express|logo/i])}" alt="">
        <div><p class="eyebrow">Community support</p><h2>Sponsors & partners</h2><p>Foundation, community and charity partners help keep support available locally.</p><a href="sponsors-partners.html">View partners</a></div>
      </article>
    </section>`;
}

function standardBody(page) {
  const paragraphs = page.paragraphs && page.paragraphs.length ? page.paragraphs : fallbackParagraphs(page);
  const cards = page.cards && page.cards.length ? page.cards : fallbackCards(page);
  return `
    <section class="body-section">
      ${page.lead ? `<h2>${esc(page.lead)}</h2>` : ""}
      <div class="copy-block">${paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
      ${page.faq ? faqHtml(page.faq) : ""}
      ${cards.length ? `<div class="info-grid">${cards.map(card).join("")}</div>` : ""}
      ${page.cta ? `<div class="page-actions"><a class="btn btn-primary" href="${page.cta[1]}">${esc(page.cta[0])}</a></div>` : ""}
    </section>`;
}

function fallbackParagraphs(page) {
  const sourced = cleanLines(page.sourcePath || "/").filter((line) => line.length > 35).slice(0, 3);
  if (sourced.length) return sourced;
  return [
    "This prototype page reserves space for final approved content while showing how the page will read once copy is available.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante facilisis, sed cursus neque gravida.",
    "Curabitur blandit tempus porttitor. Donec ullamcorper nulla non metus auctor fringilla.",
  ];
}

function fallbackCards(page) {
  if (page.faq || page.template === "partners") return [];
  return [
    ["Primary information", `A short summary block for ${page.title.toLowerCase()} content.`],
    ["What to do next", "A practical next step or contact pathway can be shown here."],
    ["Related support", "This space can point visitors to another useful page in the new site structure."],
  ];
}

function partnersBody(page) {
  return `
    <section class="body-section partners-page">
      ${page.lead ? `<h2>${esc(page.lead)}</h2>` : ""}
      <div class="copy-block">${(page.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join("")}</div>
      <div class="partner-sections">${partnerSections.map(partnerSectionHtml).join("")}</div>
    </section>`;
}

function partnerSectionHtml(section) {
  const groups = section.groups || [{ title: "", intro: "", partners: section.partners, className: section.className }];
  return `<section class="partner-section ${section.className || ""}">
    <div class="partner-section-heading">
      <h2>${esc(section.title)}</h2>
      ${section.intro ? `<p>${esc(section.intro)}</p>` : ""}
    </div>
    ${groups.map(partnerGroupHtml).join("")}
  </section>`;
}

function partnerGroupHtml(group) {
  return `<div class="partner-group ${group.className || ""}">
    ${group.title || group.intro ? `<div class="partner-group-heading">
      ${group.title ? `<h3>${esc(group.title)}</h3>` : ""}
      ${group.intro ? `<p>${esc(group.intro)}</p>` : ""}
    </div>` : ""}
    <div class="logo-grid">${group.partners.map(partnerLogoHtml).join("")}</div>
  </div>`;
}

function partnerLogoHtml([name, url]) {
  return `<article class="logo-card"><img src="${localAsset(url)}" alt="${esc(name)} logo"><span>${esc(name)}</span></article>`;
}

function card(item) {
  const [title, body, href] = item;
  return `<article class="info-card"><h3>${esc(title)}</h3><p>${esc(body)}</p>${href ? `<a href="${href}">Open</a>` : ""}</article>`;
}

function faqHtml(items) {
  return `<div class="faq-list">${items.map(([q, a]) => `<details open><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>`;
}

function html(page) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(page.title)} | Rise Above Wireframe</title>
  <meta name="description" content="${esc(page.summary || page.lead || "Rise Above Capital Region Cancer Relief")}">
  <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
  ${navHtml(page.file)}
  <main>
    ${hero(page)}
    ${page.template === "home" ? homeBody() : page.template === "partners" ? partnersBody(page) : standardBody(page)}
  </main>
  ${footerHtml()}
</body>
</html>
`;
}

function redirectHtml(file, target, title) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url=${target}">
  <title>${esc(title)} moved | Rise Above Wireframe</title>
  <link rel="canonical" href="${target}">
  <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
  ${navHtml(target)}
  <main class="redirect-page">
    <h1>${esc(title)} has moved</h1>
    <p>This prototype consolidates that content into a clearer intent-based page.</p>
    <a class="btn btn-primary" href="${target}">Continue</a>
  </main>
</body>
</html>
`;
}

function legacyPage(file, target, title) {
  const sourcePath = legacySourcePaths[file] || "/";
  const sourceCopy = cleanLines(sourcePath).filter((line) => line.length > 35).slice(0, 4);
  const destination = target.replace(/\.html$/, "").replace(/-/g, " ");
  return {
    file,
    title,
    sourcePath,
    heroTitle: title,
    summary: `${title} content is represented in the updated prototype structure.`,
    lead: `${title} in the updated navigation`,
    paragraphs: sourceCopy.length
      ? sourceCopy
      : [
          `This prototype keeps a visible page for ${title.toLowerCase()} so legacy content has a clear home during the IA restructure.`,
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante facilisis, sed cursus neque gravida.",
          "Curabitur blandit tempus porttitor. Donec ullamcorper nulla non metus auctor fringilla.",
        ],
    cards: [
      ["Updated destination", `This content is consolidated under ${destination}.`],
      ["Prototype purpose", "The page remains available so stakeholders can review the proposed mapping instead of landing on a blank placeholder."],
      ["Next step", "Final implementation can use redirects once page mapping and copy are approved."],
    ],
    cta: ["View Updated Page", target],
  };
}

function css() {
  return `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');

:root {
  --purple: #a32fa6;
  --purple-dark: #561858;
  --yellow: #f8d429;
  --cream: #fdf8fd;
  --ink: #282828;
  --muted: #5f5961;
  --line: #ead8ea;
  --white: #fff;
  --shadow: 0 18px 45px rgba(70, 20, 72, .13);
}
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: var(--ink); background: var(--white); line-height: 1.5; }
a { color: inherit; }
img { max-width: 100%; display: block; }
.site-header { position: sticky; top: 0; z-index: 100; background: var(--white); box-shadow: 0 2px 12px rgba(0,0,0,.08); }
.header-main { max-width: none; min-height: 136px; margin: 0 auto; padding: 18px clamp(72px, 20vw, 550px) 14px clamp(32px, 5vw, 72px); display: grid; grid-template-columns: 256px minmax(0, 1fr) auto; grid-template-rows: 50px 44px; column-gap: 34px; align-items: center; }
.brand { grid-row: 1 / 3; align-self: center; }
.brand img { width: 226px; }
.nav-primary, .nav-secondary { display: flex; align-items: center; text-transform: uppercase; letter-spacing: 0; }
.nav-primary { grid-column: 2 / 4; grid-row: 2; justify-content: space-between; justify-self: end; width: min(100%, 860px); align-self: end; padding-bottom: 6px; font-family: Montserrat, Arial, sans-serif; font-size: 15px; font-weight: 600; }
.nav-secondary { grid-column: 3; grid-row: 1; gap: 14px; justify-content: flex-end; font-size: 16px; text-transform: none; }
nav a { text-decoration: none; padding: 10px 0; white-space: nowrap; }
.nav-group { position: relative; }
.nav-group.active > a, nav > a.active { color: var(--purple); }
.nav-menu { position: absolute; top: 100%; left: -18px; min-width: 265px; padding: 12px; background: var(--white); box-shadow: var(--shadow); display: none; text-transform: none; font-weight: 600; font-size: 14px; z-index: 30; }
.nav-menu a { display: block; padding: 9px 10px; text-decoration: none; }
.nav-menu a:hover { color: var(--purple); }
.nav-group:hover .nav-menu { display: block; }
.header-actions { grid-column: 2; grid-row: 1; display: flex; gap: 16px; align-items: center; justify-content: flex-end; }
.search-icon { width: 20px; height: 20px; border: 3px solid var(--ink); border-radius: 50%; position: relative; display: inline-block; }
.search-icon::after { content: ""; position: absolute; width: 9px; height: 3px; right: -8px; bottom: -5px; background: var(--ink); transform: rotate(45deg); border-radius: 3px; }
.btn { display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 8px 31px; border-radius: 999px; border: 2px solid transparent; text-decoration: none; text-transform: uppercase; font-family: Montserrat, Arial, sans-serif; font-size: 14px; font-weight: 600; line-height: 1.2; letter-spacing: .4px; }
.header-actions .btn { min-width: 160px; white-space: nowrap; }
.btn-primary { background: var(--purple); color: var(--white); }
.btn-secondary { background: var(--yellow); color: var(--ink); }
.btn-light { color: var(--purple-dark); background: var(--white); }
.hero { position: relative; min-height: 205px; display: grid; align-items: center; background-size: cover; background-position: center 42%; color: var(--white); }
.hero-home { min-height: 205px; align-items: center; background-position: center 42%; }
.hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,.42), rgba(0,0,0,.16) 48%, rgba(0,0,0,0) 72%); }
.hero-content { position: relative; width: min(1296px, calc(100% - 144px)); margin: 0 auto; padding: 28px 0; }
.hero h1 { max-width: 760px; margin: 0 0 12px; font-family: Montserrat, Arial, sans-serif; font-size: clamp(30px, 3.05vw, 44px); line-height: 1.08; font-weight: 500; letter-spacing: .8px; text-transform: uppercase; }
.hero p { max-width: 760px; margin: 0; font-family: Montserrat, Arial, sans-serif; font-size: clamp(16px, 1.35vw, 19px); line-height: 1.35; font-weight: 500; color: var(--white); }
.hero-home .hero-content { width: min(1296px, calc(100% - 144px)); padding: 28px 0; transform: none; }
.hero-home h1 { max-width: 410px; margin: 0; font-size: clamp(28px, 3vw, 42px); line-height: 1.08; text-transform: none; letter-spacing: 0; font-weight: 500; }
.hero-home p { display: none; }
.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 30px; }
.home-intro { width: min(1296px, calc(100% - 144px)); margin: 0 auto; padding: 26px 0 0; }
.home-intro p { width: 100%; margin: 0; font-size: 21px; line-height: 1.35; font-weight: 500; }
.routing-section, .impact-section, .supporting-section, .body-section { width: min(1296px, calc(100% - 144px)); margin: 0 auto; padding: 78px 0; }
.routing-section { padding-top: 18px; padding-bottom: 34px; }
.section-heading.centered { text-align: left; justify-content: flex-start; margin-bottom: 24px; }
h2 { margin: 0; font-family: Montserrat, Arial, sans-serif; font-size: clamp(36px, 3.4vw, 49px); line-height: 1.15; font-weight: 500; letter-spacing: .98px; color: var(--ink); }
.routing-section h2, .impact-section h2 { color: var(--purple); }
.routing-section h2 strong, .impact-section h2 strong { font-weight: 800; }
h3 { margin: 0 0 10px; font-family: Montserrat, Arial, sans-serif; font-size: 22px; line-height: 1.2; color: var(--ink); }
.eyebrow { margin: 0 0 8px; color: var(--purple); text-transform: uppercase; font-size: 12px; font-weight: 800; }
.intent-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.intent-card { min-height: 136px; padding: 18px 18px 16px; border: 2px solid var(--yellow); border-radius: 0; text-decoration: none; background: var(--cream); box-shadow: none; display: flex; flex-direction: column; justify-content: center; text-align: center; }
.intent-card.emphasis { background: var(--yellow); color: var(--ink); }
.intent-card.emphasis h3, .intent-card.emphasis p { color: var(--ink); }
.intent-card p, .info-card p, .copy-block p, .supporting-card p { color: var(--muted); }
.intent-card p { margin: 18px 0 0; color: var(--ink); }
.intent-card h3 { margin: 0; font-size: 17px; font-weight: 400; }
.intent-card h3 span, .intent-card h3 strong { display: block; }
.intent-card h3 strong { font-weight: 800; }
.intent-card em { display: none; }
.info-card a, .supporting-card a { color: var(--purple); font-weight: 800; text-transform: uppercase; font-size: 12px; text-decoration: none; }
.impact-section { width: min(1296px, calc(100% - 144px)); max-width: 1296px; padding: 20px 0 52px; background: transparent; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.stats-grid article { background: transparent; border: 0; border-radius: 0; padding: 12px 12px 0; text-align: center; box-shadow: none; display: flex; flex-direction: column-reverse; gap: 16px; }
.stats-grid strong { display: block; font-family: Montserrat, Arial, sans-serif; font-size: clamp(46px, 5vw, 72px); line-height: 1; color: #7db51e; margin-bottom: 0; font-weight: 800; }
.stats-grid span { color: var(--ink); font-weight: 800; font-size: 17px; line-height: 1.15; }
.supporting-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.supporting-card, .info-card { background: var(--white); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; box-shadow: var(--shadow); }
.supporting-card img { width: 100%; height: 190px; object-fit: cover; }
.supporting-card div, .info-card { padding: 24px; }
.body-section { width: min(1076px, calc(100% - 144px)); }
.body-section h2 { max-width: 960px; margin-bottom: 24px; font-size: 39px; line-height: 1.2; letter-spacing: .78px; }
.copy-block { max-width: 1076px; }
.copy-block p { margin: 0 0 18px; color: var(--ink); font-size: 16px; }
.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 34px; }
.info-card a { display: inline-block; margin-top: 8px; }
.faq-list { display: grid; gap: 12px; margin-top: 24px; }
details { border: 1px solid var(--line); border-radius: 8px; padding: 18px 20px; background: var(--white); }
summary { cursor: pointer; font-weight: 700; font-family: Montserrat, Arial, sans-serif; }
details p { margin: 12px 0 0; color: var(--muted); }
.page-actions { margin-top: 30px; }
.partners-page { width: min(1180px, calc(100% - 144px)); }
.partner-sections { display: grid; gap: 58px; margin-top: 46px; }
.partner-section { border-top: 1px solid var(--line); padding-top: 42px; }
.partner-section:first-child { border-top: 0; padding-top: 0; }
.partner-section-heading { margin-bottom: 28px; }
.partner-section-heading h2 { color: var(--purple); }
.partner-section-heading p, .partner-group-heading p { max-width: 850px; color: var(--muted); margin: 10px 0 0; }
.partner-group { margin-top: 34px; }
.partner-group:first-of-type { margin-top: 0; }
.partner-group-heading { margin-bottom: 18px; }
.partner-group-heading h3 { font-size: 26px; color: var(--ink); }
.logo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; align-items: stretch; }
.partner-section.foundation .logo-grid, .partner-section.social .logo-grid { grid-template-columns: repeat(2, minmax(220px, 1fr)); max-width: 720px; }
.logo-card { min-height: 168px; padding: 22px; border: 1px solid var(--line); border-radius: 8px; background: var(--white); box-shadow: var(--shadow); display: grid; gap: 14px; align-content: center; justify-items: center; text-align: center; }
.logo-card img { width: 100%; max-width: 210px; height: 92px; object-fit: contain; }
.partner-section.foundation .logo-card img, .partner-section.social .logo-card img { max-width: 260px; height: 120px; }
.logo-card span { font-weight: 700; font-family: Montserrat, Arial, sans-serif; font-size: 14px; }
.site-footer { background: var(--purple-dark); color: var(--white); }
.footer-main { width: min(1180px, calc(100% - 48px)); margin: 0 auto; padding: 54px 0; display: grid; grid-template-columns: 260px 1fr; gap: 56px; }
.footer-brand img { width: 190px; margin-bottom: 18px; }
.footer-brand p { color: #f3dff3; }
.footer-columns { display: grid; grid-template-columns: repeat(6, 1fr); gap: 18px; }
.footer-columns h3 { color: var(--yellow); font-size: 14px; text-transform: uppercase; }
.footer-columns a { display: block; margin: 7px 0; color: #f7eaf7; text-decoration: none; font-size: 13px; }
.footer-bottom { border-top: 1px solid rgba(255,255,255,.18); padding: 18px max(24px, calc((100% - 1180px) / 2)); display: flex; justify-content: space-between; gap: 18px; font-size: 13px; color: #f6eaf6; }
.footer-bottom a { margin-left: 16px; color: #fff; text-decoration: none; }
.redirect-page { width: min(760px, calc(100% - 48px)); margin: 100px auto; }

@media (max-width: 1180px) {
  .header-main { grid-template-columns: 220px 1fr; grid-template-rows: auto auto auto; row-gap: 10px; }
  .brand { grid-row: 1 / 4; }
  .nav-primary, .nav-secondary, .header-actions { grid-column: 2; grid-row: auto; justify-content: flex-end; flex-wrap: wrap; }
  .intent-grid, .supporting-section, .footer-columns { grid-template-columns: repeat(2, 1fr); }
  .info-grid, .logo-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 760px) {
  .header-main { display: block; padding: 14px 20px; min-height: auto; }
  .brand img { width: 150px; margin: 0 auto 14px; }
  .nav-primary, .nav-secondary { justify-content: center; flex-wrap: wrap; gap: 12px; font-size: 12px; }
  .nav-menu { display: none !important; }
  .header-actions { justify-content: center; margin-top: 12px; flex-wrap: wrap; }
  .hero, .hero-home { min-height: 260px; }
  .hero-content, .routing-section, .supporting-section, .body-section { width: min(100% - 40px, 100%); }
  .impact-section { padding-left: 20px; padding-right: 20px; }
  .intent-grid, .stats-grid, .supporting-section, .info-grid, .logo-grid, .partner-section.foundation .logo-grid, .partner-section.social .logo-grid, .footer-main, .footer-columns { grid-template-columns: 1fr; }
  .footer-bottom { display: block; }
}
`;
}

function main() {
  fs.mkdirSync(path.join(root, "assets", "css"), { recursive: true });
  fs.writeFileSync(path.join(root, "assets", "css", "styles.css"), css());

  const rootHtml = fs.readdirSync(root).filter((file) => file.endsWith(".html"));
  for (const file of rootHtml) fs.unlinkSync(path.join(root, file));

  for (const page of basePages()) {
    fs.writeFileSync(path.join(root, page.file), html(page));
  }
  for (const [file, target, title] of legacyRedirects) {
    if (!fs.existsSync(path.join(root, file))) {
      fs.writeFileSync(path.join(root, file), html(legacyPage(file, target, title)));
    }
  }
  fs.writeFileSync(path.join(root, "login.html"), html({
    file: "login.html",
    title: "Login",
    sourcePath: "/",
    heroTitle: "Login",
    summary: "A placeholder for the existing login pathway in the prototype.",
    lead: "Existing login pathway",
    paragraphs: [
      "The current public site includes a Login link in the header. This prototype keeps that pathway visible so the header and account-access layout can be reviewed.",
      "Final implementation should retain the existing authentication destination or integration used by Rise Above.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante facilisis, sed cursus neque gravida.",
    ],
    cards: [["Account access", "Placeholder for the existing login integration."], ["Support pathway", "People seeking financial assistance should use Get Support instead of Login."], ["Implementation note", "Confirm the current authentication endpoint before launch."]],
    cta: ["Get Support", "financial-assistance.html"],
  }));
}

main();

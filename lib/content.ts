// Single source of truth for every word and picture on the site.
// Sources: LinkedIn profile and professional CV (Nov 2026), certificate files, GitHub repositories.

export const media = (slug: string) => `/media/${slug}.webp`;

export const profile = {
  name: "Fajar Ilham Surya Wisesa",
  short: "Fajar",
  nick: "Wise",
  role: "Aspiring Data Scientist",
  school: "Informatics, President University",
  location: "Cikarang, Indonesia",
  origin: "Gunung Sahilan, Riau",
  tagline: "I turn messy data into decisions people can act on.",
  focus: ["Python", "SQL", "Machine Learning"],
  availability: "Aspiring AI & Data Science ",
  email: "fajarilhamsuryawisesa@gmail.com",
  /** Public CV file. Empty = the "Download CV" buttons are hidden. */
  cv: "",
  socials: [
    { id: "linkedin", label: "LinkedIn", handle: "in/fajar-wisesa", href: "https://www.linkedin.com/in/fajar-wisesa" },
    { id: "github", label: "GitHub", handle: "@fajarwisesa-maker", href: "https://github.com/fajarwisesa-maker" },
    { id: "instagram", label: "Instagram", handle: "@wise_esaa", href: "https://instagram.com/wise_esaa" },
    { id: "youtube", label: "YouTube", handle: "@hi.bewise", href: "https://www.youtube.com/@hi.bewise" },
    { id: "email", label: "Email", handle: "fajarilhamsuryawisesa@gmail.com", href: "mailto:fajarilhamsuryawisesa@gmail.com" },
  ],
  portraits: {
    casual: media("portrait-casual"),
    formal: media("portrait-formal"),
    org: media("portrait-gils"),
  },
};

export const greetings = ["Halo", "Hello", "こんにちは", "안녕하세요", "Bonjour", "Hola", "مرحبا", "Hi, I'm Fajar"];

export const about = {
  lead: "I'm an Informatics student who likes the part of data science that comes before the model: asking the right question and checking whether the answer really holds up.",
  body: [
    "I work mostly in Python and SQL: cleaning data, exploring it, and testing models until I understand why they work. In my phishing-detection paper the model scored 98.9% accuracy, and then I went looking for where it fails. That habit matters to me more than the headline number.",
    "Outside the notebook I have led teams since high school: student council president, chair of the student representative council, and project manager for campus events and product teams. That is where I learned to explain technical results in plain words.",
  ],
  facts: [
    { value: "3.92", label: "GPA out of 4.00" },
    { value: "8", label: "Certificates" },
    { value: "6", label: "Projects" },
    { value: "2", label: "Awards & finals in 2026" },
  ],
};

export type SkillGroup = { id: string; title: string; blurb: string; items: { name: string; note: string }[] };
export const skills: SkillGroup[] = [
  {
    id: "data",
    title: "Data & AI",
    blurb: "Where I'm heading. Certified by Dicoding and Google, used in real projects.",
    items: [
      { name: "Python", note: "pandas, scikit-learn" },
      { name: "SQL", note: "Querying & analysis" },
      { name: "Exploratory Data Analysis", note: "Cleaning, exploring, explaining" },
      { name: "Machine Learning", note: "XGBoost, SVM, Naive Bayes" },
      { name: "NLP", note: "TF-IDF text classification" },
      { name: "Explainable AI", note: "SHAP" },
    ],
  },
  {
    id: "engineering",
    title: "Engineering",
    blurb: "The tools I use to actually ship things.",
    items: [
      { name: "FastAPI", note: "Model APIs" },
      { name: "React & JavaScript", note: "Dashboards, web apps" },
      { name: "HTML & CSS", note: "Responsive layout" },
      { name: "Java", note: "OOP coursework" },
      { name: "C", note: "Programming fundamentals" },
      { name: "Git & GitHub", note: "Version control" },
    ],
  },
  {
    id: "people",
    title: "People",
    blurb: "Years of leading councils, events and teams.",
    items: [
      { name: "Project Management", note: "Events & product teams" },
      { name: "Public Speaking", note: "MC & presentations" },
      { name: "Graphic Design & Multimedia", note: "Video, motion, photo" },
      { name: "Research", note: "Writing & evaluation" },
      { name: "English", note: "Intermediate · TOEFL Prediction 506" },
      { name: "Indonesian", note: "Native · UKBI 674" },
    ],
  },
];

export type Project = {
  id: string; index: string; title: string; kind: string; role: string; year: string;
  summary: string; problem: string; did: string[]; outcome: string; tags: string[];
  image: string; links: { label: string; href: string }[];
};
export const projects: Project[] = [
  {
    id: "stratum",
    index: "01",
    title: "Stratum",
    kind: "AI platform · Explainable ML",
    role: "Business Strategist & Lead",
    year: "2026",
    summary: "An AI quality-intelligence platform that certifies biscuit quality for TÜV NORD, with an explanation for every decision.",
    problem: "Lab results are interpreted by hand and black-box AI is hard to trust in an audit.",
    did: [
      "Led product strategy and the roadmap for an enterprise B2B SaaS",
      "Built the model with XGBoost and SHAP explainability so every result has an audit trail",
      "Validated it with stratified 5-fold cross-validation",
    ],
    outcome: "F1-score 0.872, targeting a 60% cut in manual lab interpretation time. FastAPI backend, React dashboard.",
    tags: ["Python", "XGBoost", "SHAP", "FastAPI", "React"],
    image: media("project-stratum"),
    links: [
      { label: "Live demo", href: "https://stratum-wine.vercel.app" },
      { label: "GitHub", href: "https://github.com/fajarwisesa-maker/Stratum" },
    ],
  },
  {
    id: "siaga",
    index: "02",
    title: "SIAGA",
    kind: "AI agent · Hackathon finalist",
    role: "Finalist team",
    year: "2026",
    summary: "A supervised-autonomy AI agent that turns informal supply-chain disruption signals into verified, constraint-checked actions.",
    problem: "Supply-chain disruptions often show up first in informal messages, long before they reach a dashboard.",
    did: [
      "Built an agent that reads informal disruption signals and proposes actions",
      "Kept a human in control: every action is verified against constraints first",
      "Built on SAP AI Core, AWS and Claude, and pitched it to a judging panel",
    ],
    outcome: "Finalist at the Agentic AI Hackathon 2026 (Intelligent Supply Chain) by Socrates, Final Demo Day on 31 Oct 2026.",
    tags: ["Agentic AI", "Claude", "SAP AI Core", "AWS"],
    image: media("project-siaga"),
    links: [{ label: "GitHub", href: "https://github.com/fajarwisesa-maker/Socrates" }],
  },
  {
    id: "phishing",
    index: "03",
    title: "Phishing SMS Detection",
    kind: "Research paper · NLP",
    role: "Author",
    year: "2026",
    summary: "Detecting Indonesian phishing text messages with NLP, comparing SVM and Naive Bayes with a two-layer evaluation.",
    problem: "Smishing uses persuasive text to steal credentials, and models that look accurate can still flag real messages.",
    did: [
      "Built a TF-IDF pipeline on 1,143 messages (normal, fraud, promotional)",
      "Compared SVM and Multinomial Naive Bayes across four preprocessing scenarios",
      "Tested on 239 promotional messages as hard negatives to measure false positives",
    ],
    outcome: "SVM-RBF reached 98.90% accuracy (F1 0.9851), but flagged 49% of promo messages. Showed why a second test layer is needed before deployment.",
    tags: ["Python", "NLP", "TF-IDF", "SVM", "Naive Bayes"],
    image: media("project-phishing"),
    links: [],
  },
  {
    id: "cascade",
    index: "04",
    title: "Cascade",
    kind: "Knowledge hub · Q&A",
    role: "Builder",
    year: "2026",
    summary: "A manufacturing knowledge hub that answers plant-equipment questions and reconstructs failure chains from a committee dataset.",
    problem: "Engineers need answers they can trust, and AI chatbots can make things up.",
    did: [
      "Built a deterministic answer engine where every answer keeps its evidence IDs",
      "Let an optional LLM only pick from already-verified claims, never write new text",
      "Shipped it as one offline-ready HTML file with automated parity tests",
    ],
    outcome: "467 parity-checked answers and 1,800 retrieval comparisons between the Python and JavaScript engines.",
    tags: ["Python", "JavaScript", "Retrieval", "LLM"],
    image: media("project-cascade"),
    links: [{ label: "GitHub", href: "https://github.com/fajarwisesa-maker/Cascade" }],
  },
  {
    id: "lido-flow",
    index: "05",
    title: "Lido Flow",
    kind: "Mobile app · AI assistant",
    role: "Project Manager",
    year: "2025–2026",
    summary: "A student finance assistant (first called AssistFinance) for tracking expenses, savings goals and budgeting advice from a chatbot.",
    problem: "Students lose track of small daily expenses and have no simple way to plan savings.",
    did: [
      "Led product development, team management and the business model",
      "Supervised UI/UX and technical implementation",
      "Integrated a smart budgeting chatbot and delivered the final presentation",
    ],
    outcome: "A complete app concept with expense tracking, savings goals, a spending breakdown and a budgeting chatbot.",
    tags: ["Flutter", "Supabase", "AI Chatbot", "Product"],
    image: media("project-lido-flow"),
    links: [],
  },
  {
    id: "escape-room",
    index: "06",
    title: "Cyber Escape",
    kind: "Workshop · Education",
    role: "Project Manager",
    year: "2026",
    summary: "A cybersecurity workshop built around Cyber Escape, a scam-investigation game, for 41 vocational students at SMK Budi Perkasa.",
    problem: "Students meet online scams every day but rarely practise spotting them.",
    did: [
      "Led a cross-functional team with agile planning",
      "Handled logistics, stakeholder communication and risk management",
      "Measured learning with a pre-test and post-test",
    ],
    outcome: "Understanding rose 31.36% (average score 45.08 → 59.22), and 22 of 41 students passed the mastery baseline.",
    tags: ["Project Management", "Cybersecurity", "Education"],
    image: media("project-escape-room"),
    links: [
      { label: "Play it", href: "https://edu-scam.vercel.app" },
      { label: "GitHub", href: "https://github.com/fajarwisesa-maker/A-escape-scam-room" },
    ],
  },
];

export type Role = { title: string; org?: string; period?: string; note: string };
export type Experience = {
  id: string; place: string; program: string; period: string; logo: string; city: string;
  highlights?: string[];
  roles: Role[];
};
export const experience: Experience[] = [
  {
    id: "presuniv",
    place: "President University",
    program: "Bachelor of Science, Informatics · GPA 3.92/4.00",
    period: "2025 – now",
    city: "Cikarang, West Java",
    logo: media("logo-presuniv"),
    highlights: [
      "Finalist, Agentic AI Hackathon 2026 (Intelligent Supply Chain) · Socrates",
      "3rd Winner, Business Plan Competition Grand Economic 2026 · PUMA Management",
    ],
    roles: [
      { title: "Creative Media Specialist", org: "CompSphere Hackathon", period: "Apr 2026 – now", note: "Designed event visuals, including a large motion-graphic videotron, and kept the brand consistent across all materials." },
      { title: "Public Relations", org: "Hackathon by DKI Jakarta Provincial Government × President University", period: "2026", note: "Managed external communication, partnerships, press releases and social media." },
      { title: "Project Manager", org: "Company Visit I 2026 to PT United Tractors Tbk.", period: "Nov 2025 – Apr 2026", note: "Ran an industrial visit program and coordinated six divisions." },
      { title: "Event Organizer", org: "Informatics Connect (President University × IPB University)", period: "Nov 2025 – Apr 2026", note: "Coordinated a cross-campus benchmarking event for 100+ students." },
      { title: "Food & Beverage", org: "Company Visit 2 to BSSN", period: "Apr – Jun 2026", note: "Ran F&B operations for 60+ participants and officials." },
      { title: "Relations & Communication", org: "PUMA Informatics", period: "Oct 2025 – Aug 2026", note: "Handled external communication, sponsor and stakeholder partnerships, and event branding." },
    ],
  },
  {
    id: "sman2",
    place: "SMAN 2 Gunung Sahilan",
    program: "Science Program",
    period: "2022 – 2025",
    city: "Gunung Sahilan, Riau",
    logo: media("logo-sman2"),
    highlights: ["Finalist, Cultural Quiz Competition (LCC), 2024"],
    roles: [
      { title: "Chairperson", org: "Student Representative Council (MPK)", period: "2024", note: "Led the council and its governance." },
      { title: "President", org: "Student Council (OSIS)", period: "2023", note: "Organised school events and student activities." },
      { title: "Head of Ethics & Moral Values Division", org: "Student Council", note: "Led a Student Council division." },
      { title: "Master of Ceremony", org: "Graduation, anniversary and school events", period: "2024", note: "Hosted the school's main ceremonies." },
    ],
  },
];

export type Certificate = {
  id: string; title: string; issuer: string; date: string;
  credential?: string; verify?: string; image?: string;
  /** Courses inside a professional certificate, each with an optional badge image. */
  courses?: { name: string; badge?: string }[];
};
export const certificates: Certificate[] = [
  {
    id: "google-ai",
    title: "Google AI Professional Certificate",
    issuer: "Google · Coursera",
    date: "Aug 2026",
    credential: "9Z7O5QV2XTHP",
    verify: "https://www.coursera.org/account/accomplishments/professional-cert/9Z7O5QV2XTHP",
    courses: [
      { name: "AI Fundamentals" },
      { name: "AI for Brainstorming and Planning", badge: media("badge-ai-for-brainstorming-and-planning") },
      { name: "AI for Research and Insights", badge: media("badge-ai-for-research-and-insights") },
      { name: "AI for Writing and Communicating", badge: media("badge-ai-for-writing-and-communicating") },
      { name: "AI for Content Creation", badge: media("badge-ai-for-content-creation") },
      { name: "AI for Data Analysis", badge: media("badge-ai-for-data-analysis") },
      { name: "AI for App Building", badge: media("badge-ai-for-app-building") },
      { name: "AI for App Deployment", badge: media("badge-ai-for-app-deployment") },
    ],
  },
  { id: "ml", title: "Belajar Machine Learning untuk Pemula", issuer: "Dicoding Indonesia", date: "Feb 2026", credential: "4EXG3WGLQZRL", verify: "https://www.dicoding.com/certificates/4EXG3WGLQZRL" },
  { id: "python", title: "Memulai Pemrograman dengan Python", issuer: "Dicoding Indonesia", date: "Jan 2026", credential: "RVZKG3OGOXD5", verify: "https://www.dicoding.com/certificates/RVZKG3OGOXD5" },
  { id: "sql", title: "Belajar Dasar Structured Query Language (SQL)", issuer: "Dicoding Indonesia", date: "Dec 2025", credential: "EYX4KNJQ6PDL", verify: "https://www.dicoding.com/certificates/EYX4KNJQ6PDL" },
  { id: "ds", title: "Belajar Dasar Data Science", issuer: "Dicoding Indonesia", date: "Nov 2025", credential: "4EXG3ODDDZRL", verify: "https://www.dicoding.com/certificates/4EXG3ODDDZRL", image: media("cert-dicoding-ds") },
  { id: "ai", title: "Belajar Dasar AI", issuer: "Dicoding Indonesia", date: "Oct 2025", credential: "81P25VYJNPOY", verify: "https://www.dicoding.com/certificates/81P25VYJNPOY", image: media("cert-dicoding-ai") },
  { id: "thunderbird", title: "Global Entrepreneurship & Innovation Bootcamp", issuer: "Thunderbird School of Global Management", date: "Dec 2025", image: media("cert-thunderbird") },
  { id: "ict", title: "Interactive Communication Training 2025", issuer: "President University Student Board", date: "Sep 2025", image: media("cert-ict-2025") },
];

export type Moment = { id: string; caption: string; place: string; era: "school" | "college"; image: string; w: number; h: number };
export const moments: Moment[] = [
  // Newest first. College photos are from LinkedIn posts.
  { id: "siaga-team", caption: "Finalist, Agentic AI Hackathon 2026", place: "Final Demo Day · Oct 2026", era: "college", image: media("moment-siaga-team"), w: 480, h: 319 },
  { id: "siaga-demo", caption: "Presenting SIAGA to the judges", place: "Agentic AI Hackathon · Oct 2026", era: "college", image: media("moment-siaga-demo"), w: 480, h: 320 },
  { id: "bpc-trophy", caption: "3rd Winner, Business Plan Competition", place: "Grand Economics 2026", era: "college", image: media("moment-bpc-trophy"), w: 480, h: 853 },
  { id: "bpc-team", caption: "Team Vamos on the Podium", place: "Grand Economics 2026", era: "college", image: media("moment-bpc-team"), w: 480, h: 320 },
  { id: "ut-team", caption: "Company Visit to PT United Tractors", place: "Project Manager · Apr 2026", era: "college", image: media("moment-ut-team"), w: 480, h: 640 },
  { id: "ut-appreciation", caption: "Appreciation to United Tractors", place: "Company Visit · Apr 2026", era: "college", image: media("moment-ut-appreciation"), w: 480, h: 640 },
  { id: "company-visit", caption: "Pre-Visit to PT United Tractors Tbk", place: "Company Visit · Apr 2026", era: "college", image: media("project-company-visit"), w: 1280, h: 852 },
  { id: "puma", caption: "Relations & Communication, PUMA Informatics", place: "President University · 2025–2026", era: "college", image: media("exp-puma"), w: 960, h: 1280 },
  { id: "interact", caption: "INTERACT 2025 communication training", place: "President University · Sep 2025", era: "college", image: media("moment-interact"), w: 800, h: 533 },
  { id: "osis-president", caption: "President of the Student Council", place: "SMAN 2 Gunung Sahilan", era: "school", image: media("exp-osis-president"), w: 800, h: 565 },
  { id: "mpk", caption: "Chairperson of the Student Representative Council", place: "SMAN 2 Gunung Sahilan", era: "school", image: media("exp-mpk"), w: 1400, h: 1050 },
  { id: "mc-graduation", caption: "MC, Graduation Ceremony", place: "Riau", era: "school", image: media("exp-mc-graduation"), w: 800, h: 533 },
  { id: "mc-anniversary", caption: "MC, School Anniversary", place: "Riau", era: "school", image: media("exp-mc-anniversary"), w: 503, h: 1117 },
  { id: "mc-school-event", caption: "MC, School Event", place: "Riau", era: "school", image: media("exp-mc-school-event"), w: 800, h: 599 },
  { id: "mc-isra-miraj", caption: "MC, Isra Mi'raj Commemoration", place: "Riau", era: "school", image: media("exp-mc-isra-miraj"), w: 502, h: 1118 },
  { id: "osis-division", caption: "Head of Ethics & Moral Values Division", place: "SMAN 2 Gunung Sahilan", era: "school", image: media("exp-osis-division"), w: 800, h: 565 },
];

export const nav = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "certificates", label: "Certificates" },
  { id: "moments", label: "Moments" },
  { id: "guestbook", label: "Guestbook" },
  { id: "contact", label: "Contact" },
];

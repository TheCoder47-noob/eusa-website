/* =========================================================
   EUSA demo — ALL editable content lives in this one file.
   Future execs: change the values here, save, refresh the page.
   Anything set to null shows a "to be included" placeholder.
   ========================================================= */
window.EUSA = {

  site: {
    name: "Endocrinology Undergraduate Students Association",
    short: "EUSA",
    university: "University of Waterloo",
    tagline: "By Students, for Science!",
    email: "eusauw@gmail.com",
    instagram: "https://www.instagram.com/uw_eusa/",
    instagramHandle: "@uw_eusa",
    linktree: "https://linktr.ee/uw_eusa",
    rolesDoc: "https://docs.google.com/document/d/129ZLSRT3OtHFzKKCxsQ9HZYobVwiQKfEzJSH-pYHsT4/edit",
    founded: null            // e.g. "Spring 2026" — to be confirmed by the club
  },

  /* ---- "We're hiring" banner: flip open to true/false ---- */
  hiring: {
    open: false,
    term: null,              // e.g. "Winter 2027"
    deadline: null,          // e.g. "2027-01-15T23:59"
    formUrl: null,           // Google Form link
    roles: []                // e.g. ["VP Events", "Events Coordinator"]
  },

  /* ---- Events: the site splits upcoming / past by date automatically ---- */
  events: [
    {
      id: "periodic-picnic-jul-16",
      title: "The Periodic Picnic",
      date: "2026-07-16", startTime: "17:00", endTime: "19:00",
      location: "SLC Green Space",
      description: "Free food and drinks, chill music and board games out on the SLC Green Space. Co-hosted with other student groups.",
      partners: ["Science Society"],
      partnersTbi: true,     // more partner logos on the poster — to be confirmed
      rsvpUrl: null,
      poster: "periodic",
      dateNote: "Instagram shows both July 16 and July 29 — to be confirmed (two picnics, or one rescheduled?)"
    },
    {
      id: "periodic-picnic-jul-29",
      title: "The Periodic Picnic",
      date: "2026-07-29", startTime: "17:00", endTime: "19:00",
      location: "SLC Green Space",
      description: "Free food and drinks, chill music and board games out on the SLC Green Space. Co-hosted with other student groups.",
      partners: ["Science Society"],
      partnersTbi: true,
      rsvpUrl: null,
      poster: "periodic"
    },
    {
      id: "fall-2026-tba",
      title: "Fall 2026 event",
      date: null,             // no date yet = shows as "Date TBA" under Upcoming
      tba: true,
      location: null,
      description: null,
      partners: [],
      rsvpUrl: null
    }
  ],

  /* ---- Learn (Endo 101) articles ----
     Each article is a scroll story: every entry in `steps` is one card, and `scene` picks the
     animation that plays behind it (scenes are defined in assets/js/learn-anim.js).
     Written from the club's Instagram carousels, then fact-checked. See `note` on any change. */
  learn: [
    {
      slug: "intro-to-endocrinology",
      title: "Introduction to Endocrinology",
      summary: "What endocrinology is, what glands do, how hormones find their target cells, and why the whole system is a balancing act.",
      tags: ["basics", "hormones", "glands"],
      icon: "glands",
      readMins: 4,
      author: null,
      status: "draft",
      steps: [
        { scene: "what", num: "01 · The field", title: "What is endocrinology?",
          html: "<p>Endocrinology is the branch of medicine that <strong>diagnoses and treats disorders of the endocrine system</strong>: the glands and organs that make hormones.</p><p>Common examples include <strong>diabetes, infertility</strong>, and <strong>thyroid, adrenal and pituitary</strong> gland problems.</p>" },
        { scene: "glands", num: "02 · Glands", title: "Hormone factories",
          html: "<p>A gland is a tissue that makes and releases substances. <strong>Endocrine glands</strong> make hormones and <strong>secrete them directly into the bloodstream</strong>, with no duct.</p><p>Examples: the <strong>thyroid, pituitary, parathyroid and pineal</strong> glands, plus the pancreas, adrenals and ovaries/testes.</p>" },
        { scene: "types", num: "03 · Hormones", title: "Messengers with many jobs",
          html: "<p>Glands release hormones in response to certain <strong>stimuli</strong>. Hormones are molecules carried in the blood to their <strong>target cells</strong>, where they start a specific job.</p><p><span class='hormone'>Glucagon</span> raises blood sugar. <span class='hormone'>Norepinephrine</span> helps regulate blood pressure. <span class='hormone'>Epinephrine</span> boosts blood flow, oxygen intake and heart rate.</p><p style='font-size:.9rem;opacity:.85'>One hormone, endless effects: some hormones have only a handful of target cell types, others a vast number.</p>" },
        { scene: "how", num: "04 · The lock", title: "Receptors decide who listens",
          html: "<p>Receptors determine <strong>which hormone matches which target cell</strong>. They sit on the cell's outer surface or inside the cell.</p><p>Hormone A only fits cells with an A receptor, and hormone B only fits B receptors. Some cells carry both.</p>" },
        { scene: "how", num: "04 · The key", title: "A match sets off a chain reaction",
          html: "<p>Once a hormone and its receptor connect, a <strong>series of biochemical reactions</strong> starts inside the target cell. In the end, they change what the cell is doing.</p>" },
        { scene: "daily", num: "05 · In real life", title: "Insulin",
          html: "<p>A <strong>peptide hormone</strong> made and released by the pancreas. It lowers blood sugar by letting muscle and fat cells take in glucose and telling the liver to store it, so your body can use or store sugar for energy.</p><p><a href='index.html#story-insulin' style='color:var(--mint)'>Watch insulin work on the home page →</a></p>" },
        { scene: "daily", num: "05 · In real life", title: "Cortisol",
          html: "<p>A <strong>steroid hormone</strong> known as the \"stress hormone\", made by the adrenal glands. It helps control how your body responds to stress: regulating blood sugar, reducing inflammation, and managing how your body uses glucose for energy.</p><p><a href='index.html#story-stress' style='color:var(--mint)'>See the stress chain on the home page →</a></p>" },
        { scene: "daily", num: "05 · In real life", title: "Melatonin",
          html: "<p>The \"darkness\" hormone. It's made by the <strong>pineal gland</strong>, a small gland deep in the centre of the brain. Levels rise at night to promote sleep and fall with bright light, helping regulate your sleep–wake cycle.</p><p><a href='article.html?slug=melatonin' style='color:var(--mint)'>Read the full melatonin story →</a></p>" },
        { scene: "balance", num: "06 · The big picture", title: "A constant balancing act",
          html: "<p>Hormones are the body's communication system (besides neurons). They work constantly to keep <strong>homeostasis</strong>, the stable internal environment you need to survive, through many <strong>negative feedback loops</strong>.</p><p>Without them, your blood sugar balance, sleep–wake cycles, and how you use or store energy would all be impaired. This system does its balancing all day, every day, without you ever noticing.</p>" }
      ],
      sources: [
        { label: "Cleveland Clinic — Endocrine System: What It Is, Function, Organs & Diseases", url: "https://my.clevelandclinic.org/health/body/21201-endocrine-system" },
        { label: "Hiller-Sturmhöfel S, Bartke A. The Endocrine System: An Overview. Alcohol Health & Research World. 1998;22(3):153–164.", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6761896/" },
        { label: "Johns Hopkins Medicine — hormone functions (the club's slide cites this; exact page link to be added)", url: null }
      ],
      sourcesTbi: true,
      note: "Dropped from the club's slide: 'niche system' and 'the only system whose organs aren't adjacent' (not accurate: hormones affect nearly every organ, and the immune system is also spread out)."
    },
    {
      slug: "melatonin",
      title: "Melatonin: How Does It Work?",
      summary: "Why you get sleepy when it's dark, how your brain's clock and pineal gland talk to each other, and what supplements can (and can't) do.",
      tags: ["sleep", "pineal gland", "circadian rhythm"],
      icon: "moon",
      readMins: 3,
      author: null,
      status: "draft",
      steps: [
        { scene: "sky", num: "01 · Nature's nightlight", title: "A hormone for the dark",
          html: "<p>Melatonin is a naturally occurring hormone made mainly by the <strong>pineal gland</strong> in the brain.</p><p>Its main job is to help regulate your <strong>circadian rhythm</strong>: the internal 24-hour clock behind your sleeping and waking cycles.</p>" },
        { scene: "sky", num: "01 · Nature's nightlight", title: "Dark in, melatonin out",
          html: "<p>Once it's dark, your body begins <strong>releasing melatonin</strong>, a signal that it's time to prepare for sleep. Production <strong>decreases with light</strong> as the sun comes up.</p>" },
        { scene: "messenger", num: "02 · How the messenger works", title: "The master clock listens",
          html: "<p>Your eyes report the light level to the <strong>suprachiasmatic nucleus (SCN)</strong>, the master clock in your <strong>hypothalamus</strong>. As darkness settles in, it tells the pineal gland to release melatonin, which signals your body to slow down for the day.</p>" },
        { scene: "messenger", num: "02 · How the messenger works", title: "Your body winds down",
          html: "<p>Overnight, <strong>body temperature and blood pressure naturally dip</strong>, and melatonin helps time that wind-down so your body can rest up.</p><p>As morning light appears, melatonin production decreases, you become active again, and the cycle repeats the next night.</p>" },
        { scene: "supp", num: "03 · Supplements", title: "Should you take them?",
          html: "<p>Melatonin supplements are an extra dose that can help some people fall asleep. Research suggests they may help with <strong>jet lag</strong>, certain sleep disorders in children, and anxiety before surgery.</p><p style='font-size:.9rem;opacity:.85'>Talk to a healthcare provider first, especially for children or if you take other medications.</p>" },
        { scene: "low", num: "04 · Too low", title: "When melatonin is too low",
          html: "<p><strong>Hypomelatoninemia</strong> is when the body makes less melatonin than expected for a person's age. It can contribute to <strong>circadian rhythm sleep disorders</strong>, affecting when you sleep, how well you sleep, and how well you function when you're awake.</p>" },
        { scene: "high", num: "05 · Too high", title: "When melatonin is too high",
          html: "<p><strong>Hypermelatoninemia</strong> means too much melatonin in the blood. It's usually caused by taking too many supplements, because the pineal gland rarely makes an excessive amount on its own.</p><p>Too much can cause side effects such as daytime sleepiness, headaches, dizziness and nausea. More isn't better.</p>" }
      ],
      sources: [
        { label: "NCCIH (NIH) — Melatonin: What You Need To Know", url: "https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know" },
        { label: "OpenStax, Anatomy and Physiology 2e — Chapter 17: The Endocrine System", url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/17-introduction" }
      ],
      sourcesTbi: true,
      note: "Changed from the club's slides: removed 'mood' from the list of things melatonin lowers, the 'alternative to anti-anxiety medication' wording, and the claim that high melatonin raises the risk of eating disorders (none of these are well supported). Replaced with the side effects NCCIH lists."
    }
  ],

  /* ---- Role descriptions (shown on the Get Involved page) ---- */
  roles: [
    { name: "Admin", members: [
      { role: "President", desc: "Leads the club, chairs meetings, and represents EUSA to the university and outside groups." },
      { role: "VP Internal", desc: "Meeting minutes, records, internal communication and scheduling." },
      { role: "VP Finance", desc: "Accounts, budgets and reimbursements, following WUSA finance policies." }
    ]},
    { name: "Academics", members: [
      { role: "VP Academics", desc: "Runs educational programming and checks that all content is accurate." },
      { role: "Academics Coordinator", desc: "Researches and prepares presentations and learning materials." }
    ]},
    { name: "Events", members: [
      { role: "VP Events", desc: "Plans and runs events from start to finish: rooms, timelines, logistics." },
      { role: "Events Coordinator", desc: "Helps with setup, attendee engagement and feedback; can run small events alone." }
    ]},
    { name: "Marketing", members: [
      { role: "VP Marketing", desc: "Social media, branding, the posting schedule and engagement." },
      { role: "Marketing Coordinator / Graphic Designer", desc: "Posters, graphics, slides and social content." }
    ]},
    { name: "Outreach", members: [
      { role: "First-Year Representative", desc: "The voice of first-years: outreach and recruitment in first-year classes." }
    ]}
  ],

  /* ---- Team: names + roles only for now (from the club's Spring 2026 master list).
          Optional per person: photo: "assets/img/team/name.jpg", program: "2A Biomedical Sciences" ---- */
  team: {
    term: "Spring 2026",
    groups: [
      { name: "Admin", blurb: "Keeps the club running.", members: [
        { role: "President", name: "Vaidik Shingala", desc: "Leads the club, chairs meetings, and represents EUSA to the university and outside groups." },
        { role: "VP Internal", name: "Kichu Pai", desc: "Meeting minutes, records, internal communication and scheduling." },
        { role: "VP Internal", name: "Kavya Desai", desc: "Meeting minutes, records, internal communication and scheduling." },
        { role: "VP Finance", name: "Kashpreet Sidhu", desc: "Accounts, budgets and reimbursements, following WUSA finance policies." },
        { role: "Graphic Design", name: "Krish Pathak", desc: "Posters, graphics, slides and social content." }
      ]},
      { name: "Events", blurb: "Picnics, workshops and everything in between.", members: [
        { role: "VP Events", name: "Amy Krosnicki", desc: "Plans and runs events from start to finish: rooms, timelines, logistics." },
        { role: "Events Coordinator", name: "Abir Wali", desc: "Helps with setup, attendee engagement and feedback; can run small events alone." },
        { role: "Events Coordinator", name: "Sara Rajesh", desc: "Helps with setup, attendee engagement and feedback; can run small events alone." }
      ]},
      { name: "Academics", blurb: "The science behind every post.", members: [
        { role: "VP Academic", name: "Zeel Patel", desc: "Runs educational programming and checks that all content is accurate." },
        { role: "Academic Coordinator", name: "Prabhroop Kaur", desc: "Researches and prepares presentations and learning materials." },
        { role: "Academic Coordinator", name: "Rifzah Ahmed", desc: "Researches and prepares presentations and learning materials." }
      ]}
    ]
  }
};

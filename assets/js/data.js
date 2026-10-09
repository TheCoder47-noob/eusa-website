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

  /* ---- Learn (Endo 101) articles ---- */
  learn: [
    {
      slug: "intro-to-endocrinology",
      title: "Introduction to Endocrinology",
      summary: "What endocrinology is, how hormones send messages around the body, and the most common endocrine disorders.",
      tags: ["basics", "hormones", "disorders"],
      icon: "glands",
      readMins: 4,
      author: null,
      status: "draft",
      body: `
<p><strong>Endocrinology</strong> is the branch of biology and medicine that studies <em>hormones</em> and the glands and organs that make them. Doctors who specialize in it, called <strong>endocrinologists</strong>, diagnose and treat problems with these glands.</p>

<h2>The endocrine system</h2>
<p>The endocrine system is a set of glands spread around the body, including the <strong>hypothalamus, pituitary, pineal, thyroid, parathyroids, adrenals, pancreas, ovaries and testes</strong>. Many other organs, such as the heart, kidneys, stomach and even fat tissue, release hormones too.</p>

<h2>How do hormones work?</h2>
<p>Hormones are chemical messengers. A gland releases them into the bloodstream, and the blood carries them almost everywhere. But only cells with a <strong>matching receptor</strong> respond, like a key that only fits certain locks. That's how a hormone can travel the whole body and still have a very specific effect.</p>
<div class="callout"><strong>Feedback loops.</strong> Most hormone levels are kept within a healthy range by <em>negative feedback</em>: when a hormone reaches its target level, it signals the system to slow down its own release, much like a thermostat.</div>

<h2>Common endocrine disorders</h2>
<ul>
  <li><strong>Diabetes:</strong> the body makes too little insulin (type 1) or doesn't respond to it well (type 2), so blood sugar runs high.</li>
  <li><strong>Thyroid disorders:</strong> an underactive (hypothyroidism) or overactive (hyperthyroidism) thyroid.</li>
  <li><strong>Reproductive hormone conditions:</strong> some causes of infertility, and conditions such as polycystic ovary syndrome (PCOS).</li>
  <li><strong>Adrenal disorders:</strong> for example Addison's disease (too little cortisol) or Cushing's syndrome (too much).</li>
  <li><strong>Pituitary disorders:</strong> often small, usually benign tumours that make too much or too little of a hormone.</li>
</ul>
<p class="tbi-block"><strong>To be included:</strong> final wording reviewed by the VP Academics, plus any slides or diagrams from the original Instagram post.</p>`,
      sources: [
        { label: "OpenStax, Anatomy and Physiology 2e — Chapter 17: The Endocrine System", url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/17-introduction" }
      ],
      sourcesTbi: true
    },
    {
      slug: "melatonin",
      title: "Melatonin: How Does It Work?",
      summary: "Why you get sleepy when it's dark, what your pineal gland has to do with it, and why late-night screens matter.",
      tags: ["sleep", "pineal gland", "circadian rhythm"],
      icon: "moon",
      readMins: 3,
      author: null,
      status: "draft",
      body: `
<p><strong>Melatonin</strong> is a hormone made mainly by the <strong>pineal gland</strong>, a tiny gland deep in the brain. Its main job is to tell your body that it's night.</p>

<h2>Light is the switch</h2>
<p>When light enters your eyes, signals travel to the <strong>suprachiasmatic nucleus (SCN)</strong> in the hypothalamus, which is your body's master clock. During the day the SCN keeps melatonin low. As it gets dark, the pineal gland releases more melatonin. Levels usually rise in the evening, peak in the middle of the night and drop by morning.</p>

<h2>What it does (and doesn't) do</h2>
<p>Melatonin isn't a knock-out sleeping pill. It works more like a timing signal that helps keep your <strong>sleep–wake cycle (circadian rhythm)</strong> in sync with day and night.</p>
<div class="callout"><strong>Screens at night:</strong> bright light in the evening, including from phones and laptops, can hold back melatonin and push back the time you start to feel sleepy.</div>

<h2>About supplements</h2>
<p>In Canada, melatonin is sold over the counter as a natural health product. Even so, talk to a healthcare provider before taking it, especially if you take other medications.</p>
<p class="tbi-block"><strong>To be included:</strong> final wording reviewed by the VP Academics, plus the original carousel graphics.</p>`,
      sources: [
        { label: "NCCIH (NIH) — Melatonin: What You Need To Know", url: "https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know" },
        { label: "OpenStax, Anatomy and Physiology 2e — Chapter 17: The Endocrine System", url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/17-introduction" }
      ],
      sourcesTbi: true
    }
  ],

  /* ---- Team: fill in name / program / photo once each person agrees ---- */
  team: {
    term: "Fall 2026",
    groups: [
      { name: "Admin", blurb: "Keeps the club running.", members: [
        { role: "President", desc: "Leads the club, chairs meetings, and represents EUSA to the university and outside groups." },
        { role: "VP Internal", desc: "Meeting minutes, records, internal communication and scheduling." },
        { role: "VP Finance", desc: "Accounts, budgets and reimbursements, following WUSA finance policies." }
      ]},
      { name: "Academics", blurb: "The science behind every post.", members: [
        { role: "VP Academics", desc: "Runs educational programming and checks that all content is accurate." },
        { role: "Academics Coordinator", desc: "Researches and prepares presentations and learning materials." }
      ]},
      { name: "Events", blurb: "Picnics, workshops and everything in between.", members: [
        { role: "VP Events", desc: "Plans and runs events from start to finish: rooms, timelines, logistics." },
        { role: "Events Coordinator", desc: "Helps with setup, attendee engagement and feedback; can run small events alone." }
      ]},
      { name: "Marketing", blurb: "The posters, posts and reels.", members: [
        { role: "VP Marketing", desc: "Social media, branding, the posting schedule and engagement." },
        { role: "Marketing Coordinator / Graphic Designer", desc: "Posters, graphics, slides and social content." }
      ]},
      { name: "Outreach", blurb: "Your first-year connection.", members: [
        { role: "First-Year Representative", desc: "The voice of first-years: outreach and recruitment in first-year classes." }
      ]}
    ]
  }
};

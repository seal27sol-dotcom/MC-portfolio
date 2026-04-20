# Christopher Musamali — Portfolio v2.0
## Setup & Deployment Guide

---

## What's in this folder

```
portfolio/
├── index.html          ← Home page (hero, stats, featured projects)
├── about.html          ← Personal story, education, contact details
├── projects.html       ← All 6 CV-accurate projects
├── experience.html     ← Full professional timeline
├── skills.html         ← All technical, business, and soft skills
├── certificates.html   ← Honest in-progress certifications + education
├── contact.html        ← Contact form + all contact details
├── css/
│   └── style.css       ← Complete shared stylesheet
├── assets/             ← PUT YOUR FILES HERE (see below)
└── README.md           ← This file
```

---

## One thing you MUST do before uploading

### Add your CV to the assets folder

The "Download CV" buttons on every page point to:
`assets/Musamali_Christopher_CV.pdf`

You need to:
1. Export your CV as a PDF from Word (File → Save As → PDF)
2. Rename it to exactly: `Musamali_Christopher_CV.pdf`
3. Place it inside the `assets/` folder

If you skip this step, the download button will 404.

---

## What was fixed from v1.0

### Bugs fixed
- ✅ Removed broken JS (`getElementById('welcomeScreen')` that didn't exist)
- ✅ Removed rogue comma in `projects.html` `<head>`
- ✅ Moved Font Awesome to proper `<head>` on ALL pages (was inside `<header>` on most)
- ✅ Fixed `text-emphasis-color: #fff` → `color: #fff` (text was invisible on skill badges)
- ✅ Removed duplicate `.container` CSS definition
- ✅ Fixed LinkedIn URL (`https://www.linkedin.com/in/musamali-christopher`)
- ✅ Added Certificates page to nav on ALL pages (was missing everywhere)
- ✅ Fixed box-shadow from red-tinted `rgba(182,35,35,0.1)` to neutral

### Content fixed to match your CV
- ✅ Projects now show all 6 from your CV (Banking System, Student Mgmt, Doc Converter, Media Player, Portfolio, CCTV) — old "Customer Feedback System" and vague "Network Setup" removed
- ✅ Experience now shows your real titles: Deputy Director of IT (Bouwen Legacy), Deputy Director of IT (Divine Guardian Foundation), IT Intern (MSkitech) — with full bullet points from your CV
- ✅ Certificates now honestly say "Pursuing" instead of fake "Verified" badges
- ✅ Skills now include Python, PyQt6, CCTV, Leadership, and all CV categories
- ✅ About page tells your real story with your real achievements
- ✅ GitHub and email links are correct throughout

### New features added
- ✅ Profile avatar with CM initials (replace with photo by swapping the `.hero-avatar` div with an `<img>`)
- ✅ "Download CV" button on home, about, experience, and contact pages
- ✅ Active nav highlight on every page (shows which page you're on)
- ✅ Mobile hamburger menu
- ✅ Stats section: 3+ Years, 6 Projects, 3 Companies, 50+ Staff Trained
- ✅ Skills marquee strip on home page
- ✅ "Open to work" badge on contact page
- ✅ Fade-in animations on all page loads
- ✅ Meta descriptions on every page (helps with Google search)

---

## How to add a profile photo

Replace the `<div class="hero-avatar">CM</div>` in `index.html` with:

```html
<img src="assets/photo.jpg" alt="Christopher Musamali" class="hero-avatar" style="object-fit:cover;" />
```

And in `about.html`, replace the `<div class="avatar-lg">CM</div>` with:

```html
<img src="assets/photo.jpg" alt="Christopher Musamali" class="avatar-lg" style="object-fit:cover;" />
```

---

## How to update your LinkedIn URL

Your LinkedIn username is not known for certain. Update it in:
- `about.html` — line with `linkedin.com/in/musamali-christopher`
- `contact.html` — same URL appears twice

Visit your LinkedIn profile, copy the URL from the address bar, and paste it in.

---

## How to deploy (upload to your host)

Upload the ENTIRE `portfolio/` folder to your web hosting provider (wuaze.com).
The folder structure must stay intact — all HTML files at root level, CSS in `css/`, assets in `assets/`.

---

*Built March 2026 — v2.0*

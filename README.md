# Christopher Musamali — Portfolio v4

## Deployment Structure

```
/                          ← Web root
├── index.html             ← Homepage (must be at root)
├── css/style.css
├── js/
│   ├── core/global.js
│   └── utils/visitor-tracker.js
├── assets/
│   ├── docs/Musamali_Christopher_CV.pdf
│   └── images/
│       ├── profile/my_img.jpg  ← ADD YOUR PHOTO HERE
│       ├── gallery/
│       └── projects/
└── pages/
    ├── about.html
    ├── blog.html
    ├── blog/
    │   └── blog-*.html
    ├── certificates.html
    ├── contact.html
    ├── experience.html
    ├── gallery.html
    ├── projects.html
    └── skills.html
```

## ⚠️ Action Required: Profile Photo

Your profile photo (`my_img.jpg`) was not included in the original zip.  
**Add it to:** `assets/images/profile/my_img.jpg`  
It is referenced on the homepage hero and the About page.

## CV Email Verification

The "Download CV" button on all pages triggers an email verification modal:
1. Visitor enters their email
2. A 6-digit OTP is generated (logged to console)
3. Visitor enters the code → CV downloads automatically

**To enable real email sending**, find the `sendCode()` function in each page  
and uncomment the `fetch('/api/send-otp', ...)` call, pointing to your backend.

## Deployment

Works on any static host: Netlify, GitHub Pages, Vercel, Apache, Nginx.  
Just drop the entire folder at your web root. No build step needed.

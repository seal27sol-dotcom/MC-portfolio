/**
 * site.config.js — Christopher Musamali Portfolio
 * Central configuration for site-wide constants.
 * Load this before other scripts in your HTML.
 *
 * For sensitive values (API keys, endpoints), read from .env
 * at build time or use a backend proxy — never hardcode secrets here.
 */
const SITE_CONFIG = Object.freeze({
  // Identity
  name:    "Christopher Musamali",
  tagline: "IT Technician · Software Developer · Technical Instructor",
  email:   "christophermusamali27@gmail.com",
  url:     "https://lakers-tech.wuaze.com",
  github:  "https://github.com/seal27sol-dotcom",
  location: "Kampala, Uganda",

  // Copyright
  year:    new Date().getFullYear(),

  // Download limits (used by download system)
  downloadLimit: 1,             // max downloads per article per browser
  downloadStoragePrefix: "cm-dl-", // localStorage key prefix

  // Theme
  defaultTheme: "dark",         // "dark" | "light"
  themePersistKey: "cm-theme",

  // Clock
  defaultClockMode: "digital",  // "digital" | "analog"
  clockPersistKey: "cm-clock",

  // Navigation pages (order = nav order)
  navPages: [
    { label: "Home",         href: "pages/index.html",        icon: "fa-house" },
    { label: "About",        href: "pages/about.html",        icon: "fa-user" },
    { label: "Projects",     href: "pages/projects.html",     icon: "fa-code" },
    { label: "Gallery",      href: "pages/gallery.html",      icon: "fa-images" },
    { label: "Experience",   href: "pages/experience.html",   icon: "fa-briefcase" },
    { label: "Skills",       href: "pages/skills.html",       icon: "fa-layer-group" },
    { label: "Certificates", href: "pages/certificates.html", icon: "fa-certificate" },
    { label: "Blog",         href: "pages/blog.html",         icon: "fa-pen-nib" },
    { label: "Contact",      href: "pages/contact.html",      icon: "fa-envelope" },
  ],
});

/**
 * Site-wide content that isn't page-specific. Edit here rather than
 * hunting through components.
 */

export const site = {
  name: 'Songeun Kim',
  tagline: 'Researcher',
  /**
   * Plain-text version, used for the meta description. The home page renders
   * its own markup so it can control where the line breaks — see index.astro.
   */
  intro:
    "Hello, I'm Songeun Kim (김송은) — or you can just call me Olivia. Welcome to my personal blog!",
  email: 'songeun22@snu.ac.kr',
  /** Path inside /public. Swap for a real photo whenever you like. */
  avatar: '/avatar.png',
  cv: '/cv.pdf',
};

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'CV', href: '/cv' },
  { label: 'Library', href: '/library' },
  { label: 'Gallery', href: '/gallery' },
];

/**
 * Rendered as icons only, in this order.
 * TODO: fill in the two placeholder URLs below with your real profiles.
 */
export const socials = [
  { label: 'GitHub', icon: 'github', href: 'https://github.com/songeun22' },
  { label: 'Email', icon: 'email', href: 'mailto:songeun22@snu.ac.kr' },
  { label: 'Google Scholar', icon: 'scholar', href: 'https://scholar.google.com/' },
  { label: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/' },
];

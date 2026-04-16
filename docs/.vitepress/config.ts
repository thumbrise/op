import {defineConfig} from 'vitepress'

export default defineConfig({
  title: 'op',
  description: 'Typed operation model for Go — separate the fundamental from the subjective',
  base: '/op/',
  sitemap: {
    hostname: 'https://thumbrise.github.io/op/',
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/op/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/op/favicon-96x96.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/op/apple-touch-icon.png' }],
    ['meta', { property: 'og:image', content: 'https://thumbrise.github.io/op/og-image.png' }],
    ['link', { rel: 'manifest', href: '/op/site.webmanifest' }],
  ],

  themeConfig: {
    nav: [
      {text: 'Devlog', link: '/devlog/'},
      {text: 'GitHub', link: 'https://github.com/thumbrise/op'},
    ],

    sidebar: {
      '/': [
        {
          text: 'Devlog',
          items: [
            {text: 'About', link: '/devlog/'},
            {text: '#1 — Why', link: '/devlog/001-why'},
            {text: '#2 — Research Trail', link: '/devlog/002-research-trail'},
          ],
        },
      ],
    },

    socialLinks: [
      {icon: 'github', link: 'https://github.com/thumbrise/op'},
    ],

    editLink: {
      pattern: 'https://github.com/thumbrise/op/edit/main/docs/:path',
    },

    footer: {
      message: 'Apache 2.0 · Built in public · Contributions welcome',
    },
  },
})

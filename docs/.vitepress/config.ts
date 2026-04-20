import {defineConfig} from 'vitepress'

export default defineConfig({
  title: 'op',
  description: 'Transport-agnostic, language-agnostic application-layer protocol for describing operations. Solves the Expression Problem with traits.',
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
            {text: '#3a — Pub Bar Role Game: Discoveries', link: '/devlog/003a-pub-bar-role-game'},
            {text: '#3b — Pub Bar Role Game: The Bar Reopens', link: '/devlog/003b-pub-bar-role-game'},
            {text: '#3c — Pub Bar Role Game: Smithy Walks In', link: '/devlog/003c-pub-bar-role-game'},
            {text: '#3d — Pub Bar Role Game: The Krabby Patty', link: '/devlog/003d-pub-bar-role-game'},
            {text: '#3e — Pub Bar Role Game: Runtime Autopsy', link: '/devlog/003e-pub-bar-role-game'},
            {text: '#3f — Pub Bar Role Game: The Bar Owner Speaks', link: '/devlog/003f-pub-bar-role-game'},
            {text: '#3g — Pub Bar Role Game: DeepSeek\'s Letter', link: '/devlog/003g-pub-bar-role-game'},
            {text: '#3h — Pub Bar Role Game: The Epilogue', link: '/devlog/003h-pub-bar-role-game'},
            {text: '#4 — The Operations Protocol: Formalizing the Missing Foundation', link: '/devlog/004-operations-protocol'},
            {text: '#5 — To Build the Future, Look at the Past', link: '/devlog/005-history-of-protocols'},
            {text: '#6 — Fifteen Times the Same Idea', link: '/devlog/006-fifteen-times-the-same-idea'},
            {text: '#7 — The Contract That Wouldn\'t Break', link: '/devlog/007-contract'},
            {text: '#8 — Three Atoms', link: '/devlog/008-three-atoms'},
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

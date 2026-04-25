import {defineConfig} from 'vitepress'
import {withMermaid} from 'vitepress-plugin-mermaid'
import {viteStaticCopy} from 'vite-plugin-static-copy'

export default withMermaid(defineConfig({
  title: 'op',
  description: 'Anything-agnostic operations protocol. For operations-driven future.',
  base: '/op/',
  // The JSON Schema is the public contract (referenced by $id URL) AND a TS
  // import inside the Playground. Vite forbids importing from /public via JS,
  // so we keep the master in .vitepress/schema/ and copy it into /public on
  // dev + build. Single source of truth, two delivery paths.
  vite: {
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: '.vitepress/schema/*',
            dest: 'schema',
          },
        ],
      }),
    ],
  },
  mermaid: {
    flowchart: {
      useMaxWidth: false,
      htmlLabels: false,
      padding: 15,
    },
  },
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
      {text: 'Playground', link: '/playground'},
      {text: 'Devlog', link: '/devlog/'},
      {text: 'Universal', link: '/universal/'},
      {text: 'GitHub', link: 'https://github.com/thumbrise/op'},
    ],

    sidebar: {
      '/playground': [],
      '/devlog/': [
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
            {text: '#9 — The Operation Comes First', link: '/devlog/009-operation-comes-first'},
            {text: '#10 — There Is No Generation', link: '/devlog/010-there-is-no-generation'},
            {text: '#11 — From Silicon to Struct', link: '/devlog/011-from-silicon-to-struct'},
            {text: '#12 — The Conference', link: '/devlog/012-the-conference'},
            {text: '#13 — Convergent Evolution', link: '/devlog/013-convergent-evolution'},
            {text: '#14 — The Fact', link: '/devlog/014-the-fact'},
            {text: '#15 — The Coexistence', link: '/devlog/015-the-coexistence'},
            {text: '#16 — The Founder\'s Dream', link: '/devlog/016-the-founders-dream'},
            {text: '#17 — The Gallium', link: '/devlog/017-the-gallium'},
            {text: '#18 — The Fourth Rail', link: '/devlog/018-the-fourth-rail'},
            {text: '#19 — The Missing Format', link: '/devlog/019-the-missing-format'},
            {text: '#20 — The Playground', link: '/devlog/020-the-playground'},
            {text: '#21 — The Atoms Speak', link: '/devlog/021-the-atoms-speak'},
            {text: '#22 — The Dream Layer', link: '/devlog/022-the-dream-layer'},
            {text: '#23 — The Vacant Cell', link: '/devlog/023-the-vacant-cell'},
            {text: '#24 — The Trial', link: '/devlog/024-the-trial'},
            {text: '#25 — The Manifesto', link: '/devlog/025-the-manifesto'},
            {text: '#26 — The Compilers', link: '/devlog/026-the-compilers'},
            {text: '#27 — Build, Link, Runtime', link: '/devlog/027-build-link-runtime'},
            {text: '#28 — Dobby Is Free', link: '/devlog/028-dobby-is-free'},
            {text: '#29 — The Anthill Organizes', link: '/devlog/029-the-anthill-organizes'},
            {text: '#30 — The First Stranger', link: '/devlog/030-the-first-stranger'},
            {text: '#31 — The Hamster Leaves the Wheel', link: '/devlog/031-the-hamster-leaves-the-wheel'},
            {text: '#32 — The Verdict', link: '/devlog/032-the-verdict'},
            {text: '#33 — The Amplifier', link: '/devlog/033-the-amplifier'},
          ],
        },
      ],
      '/universal/': [
        {
          text: 'Universal — Field Notes',
          items: [
            {text: 'About', link: '/universal/'},
            {text: '#1 — Curl Eyeballs', link: '/universal/001-curl-eyeballs'},
            {text: '#2 — Spiral as Gallium', link: '/universal/002-spiral'},
            {text: '#3 — RoadRunner Bleeds Across Layers', link: '/universal/003-roadrunner-bleeds-across-layers'},
            {text: '#4 — PHP PoC Struggle', link: '/universal/004-php-poc-struggle'},
            {text: '#5 — Single Source of Truth', link: '/universal/005-single-source-of-truth'},
            {text: '#6 — What Programs Forgot', link: '/universal/006-what-programs-forgot'},
            {text: '#7 — Why We Don\'t Call Linus', link: '/universal/007-why-we-dont-call-linus'},
            {text: '#8 — Configuration Is Not Parameterization', link: '/universal/008-configuration-is-not-parameterization'},
            {text: '#9 — Even What Looks Like Knowledge Isn\'t Yours', link: '/universal/009-even-what-looks-like-knowledge-isnt-yours'},
            {text: '#10 — Containers Are the Registers of Our Era', link: '/universal/010-containers-are-the-registers-of-our-era'},
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
}))

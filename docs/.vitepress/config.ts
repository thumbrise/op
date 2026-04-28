import {defineConfig} from 'vitepress'
import {withMermaid} from 'vitepress-plugin-mermaid'
import {viteStaticCopy} from 'vite-plugin-static-copy'

export default withMermaid(defineConfig({
  title: 'op',
  description: 'Anything-agnostic operation protocol. For operations-driven future.',
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
      {text: 'The Idea', link: '/idea'},
      {
        text: 'Notes',
        items: [
          {text: 'Form Of Operation', link: '/notes/form-of-operation/'},
          {text: 'Form Of Operation — Postscript', link: '/notes/form-of-operation-postscript/'},
          {text: 'Form Of Instruction', link: '/notes/form-of-instruction/'},
          {text: 'Universal', link: '/notes/universal/'},
        ],
      },
      {
        text: 'Books',
        items: [
          {text: "Tim's Dream", link: '/books/tims-dream/'},
        ],
      },
      {
        text: 'Reference',
        items: [
          {text: 'Operation', link: '/reference/operation/'},
          {text: 'Instruction', link: '/reference/instruction/'},
        ],
      },
      {text: 'Playground', link: '/playground'},
      {text: 'GitHub', link: 'https://github.com/thumbrise/op'},
    ],

    sidebar: {
      '/playground': [],
      '/notes/form-of-operation/': [
        {
          text: 'Form Of Operation',
          items: [
            {text: 'About', link: '/notes/form-of-operation/'},
            {text: '#1 — Why', link: '/notes/form-of-operation/001-why'},
            {text: '#2 — Research Trail', link: '/notes/form-of-operation/002-research-trail'},
            {text: '#3a — Pub Bar Role Game: Discoveries', link: '/notes/form-of-operation/003a-pub-bar-role-game'},
            {text: '#3b — Pub Bar Role Game: The Bar Reopens', link: '/notes/form-of-operation/003b-pub-bar-role-game'},
            {text: '#3c — Pub Bar Role Game: Smithy Walks In', link: '/notes/form-of-operation/003c-pub-bar-role-game'},
            {text: '#3d — Pub Bar Role Game: The Krabby Patty', link: '/notes/form-of-operation/003d-pub-bar-role-game'},
            {text: '#3e — Pub Bar Role Game: Runtime Autopsy', link: '/notes/form-of-operation/003e-pub-bar-role-game'},
            {text: '#3f — Pub Bar Role Game: The Bar Owner Speaks', link: '/notes/form-of-operation/003f-pub-bar-role-game'},
            {text: '#3g — Pub Bar Role Game: DeepSeek\'s Letter', link: '/notes/form-of-operation/003g-pub-bar-role-game'},
            {text: '#3h — Pub Bar Role Game: The Epilogue', link: '/notes/form-of-operation/003h-pub-bar-role-game'},
            {text: '#4 — The Operations Protocol: Formalizing the Missing Foundation', link: '/notes/form-of-operation/004-operations-protocol'},
            {text: '#5 — To Build the Future, Look at the Past', link: '/notes/form-of-operation/005-history-of-protocols'},
            {text: '#6 — Fifteen Times the Same Idea', link: '/notes/form-of-operation/006-fifteen-times-the-same-idea'},
            {text: '#7 — The Contract That Wouldn\'t Break', link: '/notes/form-of-operation/007-contract'},
            {text: '#8 — Three Atoms', link: '/notes/form-of-operation/008-three-atoms'},
            {text: '#9 — The Operation Comes First', link: '/notes/form-of-operation/009-operation-comes-first'},
            {text: '#10 — There Is No Generation', link: '/notes/form-of-operation/010-there-is-no-generation'},
            {text: '#11 — From Silicon to Struct', link: '/notes/form-of-operation/011-from-silicon-to-struct'},
            {text: '#12 — The Conference', link: '/notes/form-of-operation/012-the-conference'},
            {text: '#13 — Convergent Evolution', link: '/notes/form-of-operation/013-convergent-evolution'},
            {text: '#14 — The Fact', link: '/notes/form-of-operation/014-the-fact'},
            {text: '#15 — The Coexistence', link: '/notes/form-of-operation/015-the-coexistence'},
            {text: '#16 — The Founder\'s Dream', link: '/notes/form-of-operation/016-the-founders-dream'},
            {text: '#17 — The Gallium', link: '/notes/form-of-operation/017-the-gallium'},
            {text: '#18 — The Fourth Rail', link: '/notes/form-of-operation/018-the-fourth-rail'},
            {text: '#19 — The Missing Format', link: '/notes/form-of-operation/019-the-missing-format'},
            {text: '#20 — The Playground', link: '/notes/form-of-operation/020-the-playground'},
            {text: '#21 — The Atoms Speak', link: '/notes/form-of-operation/021-the-atoms-speak'},
            {text: '#22 — The Dream Layer', link: '/notes/form-of-operation/022-the-dream-layer'},
            {text: '#23 — The Vacant Cell', link: '/notes/form-of-operation/023-the-vacant-cell'},
            {text: '#24 — The Trial', link: '/notes/form-of-operation/024-the-trial'},
            {text: '#25 — The Manifesto', link: '/notes/form-of-operation/025-the-manifesto'},
            {text: '#26 — The Compilers', link: '/notes/form-of-operation/026-the-compilers'},
            {text: '#27 — Build, Link, Runtime', link: '/notes/form-of-operation/027-build-link-runtime'},
            {text: '#28 — Dobby Is Free', link: '/notes/form-of-operation/028-dobby-is-free'},
            {text: '#29 — The Anthill Organizes', link: '/notes/form-of-operation/029-the-anthill-organizes'},
            {text: '#30 — The First Stranger', link: '/notes/form-of-operation/030-the-first-stranger'},
            {text: '#31 — The Hamster Leaves the Wheel', link: '/notes/form-of-operation/031-the-hamster-leaves-the-wheel'},
            {text: '#32 — The Verdict', link: '/notes/form-of-operation/032-the-verdict'},
            {text: '#33 — The Amplifier', link: '/notes/form-of-operation/033-the-amplifier'},
          ],
        },
      ],
      '/notes/form-of-operation-postscript/': [
        {
          text: 'Form Of Operation — Postscript',
          items: [
            {text: 'About', link: '/notes/form-of-operation-postscript/'},
          ],
        },
      ],
      '/notes/form-of-instruction/': [
        {
          text: 'Form Of Instruction',
          items: [
            {text: 'About', link: '/notes/form-of-instruction/'},
          ],
        },
      ],
      '/notes/universal/': [
        {
          text: 'Universal — Field Notes',
          items: [
            {text: 'About', link: '/notes/universal/'},
            {text: '#1 — Eyeballs', link: '/notes/universal/001-curl-eyeballs'},
            {text: '#2 — Gallium', link: '/notes/universal/002-spiral'},
            {text: '#3 — Bleed', link: '/notes/universal/003-roadrunner-bleeds-across-layers'},
            {text: '#4 — Struggle', link: '/notes/universal/004-php-poc-struggle'},
            {text: '#5 — Truth', link: '/notes/universal/005-single-source-of-truth'},
            {text: '#6 — Forgotten', link: '/notes/universal/006-what-programs-forgot'},
            {text: '#7 — Linus', link: '/notes/universal/007-why-we-dont-call-linus'},
            {text: '#8 — Configuration', link: '/notes/universal/008-configuration-is-not-parameterization'},
            {text: '#9 — Address', link: '/notes/universal/009-the-address-is-a-detail'},
            {text: '#10 — Pistol', link: '/notes/universal/010-fifty-triggers-fifty-barrels'},
            {text: '#11 — Bundle', link: '/notes/universal/011-postgres-is-a-bundle'},
            {text: '#12 — Profession', link: '/notes/universal/012-the-disappearing-profession'},
            {text: '#13 — Lock', link: '/notes/universal/013-the-lock-that-disappeared'},
            {text: '#14 — Markets', link: '/notes/universal/014-two-invisible-markets'},
            {text: '#15 — Black', link: '/notes/universal/015-the-black-compiler'},
            {text: '#16 — Migrations', link: '/notes/universal/016-the-origin-of-migrations'},
            {text: '#17 — JIT', link: '/notes/universal/017-postgres-is-a-jit'},
            {text: '#18 — Guards', link: '/notes/universal/018-hand-written-deopt-guards'},
            {text: '#19 — MongoDB', link: '/notes/universal/019-nobody-chooses-mongodb'},
            {text: '#20 — Promise', link: '/notes/universal/020-how-much-you-promise'},
            {text: '#21 — Equality', link: '/notes/universal/021-all-programs-are-equal'},
            {text: '#22 — Nothing', link: '/notes/universal/022-why-nothing-lands'},
            {text: '#23 — Treaty', link: '/notes/universal/023-treaty-of-five'},
          ],
        },
      ],
      '/books/tims-dream/': [
        {
          text: "Tim's Dream",
          items: [
            {text: 'Opening', link: '/books/tims-dream/'},
            {text: 'Lesson 1 — What an operation is', link: '/books/tims-dream/001-what-is-an-operation'},
            {text: 'The handshake', link: '/books/tims-dream/002-the-handshake'},
            {text: 'The understory', link: '/books/tims-dream/003-the-understory'},
            {text: 'The mound', link: '/books/tims-dream/004-the-mound'},
            {text: 'The dial', link: '/books/tims-dream/005-the-dial'},
            {text: 'The four letters', link: '/books/tims-dream/006-the-four-letters'},
            {text: 'Lesson 2 — The book on the desk', link: '/books/tims-dream/007-the-book-on-the-desk'},
            {text: 'The harbourmaster', link: '/books/tims-dream/008-the-harbourmaster'},
            {text: 'The dance', link: '/books/tims-dream/009-the-dance'},
            {text: 'The murmuration', link: '/books/tims-dream/010-the-murmuration'},
            {text: 'The black square', link: '/books/tims-dream/011-the-black-square'},
            {text: 'Lesson 3 — The cover', link: '/books/tims-dream/012-the-cover'},
            {text: 'The dream fulfilled', link: '/books/tims-dream/013-the-dream-fulfilled'},
            {text: 'Epilogue', link: '/books/tims-dream/014-epilogue'},
          ],
        },
      ],
      '/reference/operation/': [
        {
          text: 'Operation',
          items: [
            {text: 'About', link: '/reference/operation/'},
          ],
        },
      ],
      '/reference/instruction/': [
        {
          text: 'Instruction',
          items: [
            {text: 'About', link: '/reference/instruction/'},
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

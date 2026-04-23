import DefaultTheme from 'vitepress/theme'
import './mermaid-fix.css'
import Playground from '../components/Playground.vue'
import TermEditor from '../components/TermEditor.vue'
import TermViz from '../components/TermViz.vue'
import SciTooltip from '../components/SciTooltip.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({app}) {
    app.component('Playground', Playground)
    app.component('TermEditor', TermEditor)
    app.component('TermViz', TermViz)
    app.component('SciTooltip', SciTooltip)
  },
}

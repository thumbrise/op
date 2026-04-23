<script setup lang="ts">
interface Term {
  id: string
  comment?: string
  required?: boolean
  kind?: string
  value?: string | number | boolean
  of?: Term[]
}

defineProps<{
  terms: Term[]
  depth?: number
}>()

interface SciRef {
  label: string
  href: string
}

interface KindMeta {
  face: string
  title: string
  body: string
  refs: SciRef[]
}

const kindMeta: Record<string, KindMeta> = {
  string: {
    face: '🔤 string',
    title: 'String — Bytes with encoding',
    body: 'A sequence of characters. At the hardware level — bytes interpreted through a character encoding. UTF-8 maps human symbols to binary. Every string is a convention between writer and reader.',
    refs: [
      {label: 'Character encoding', href: 'https://en.wikipedia.org/wiki/Character_encoding'},
      {label: 'UTF-8 — RFC 3629', href: 'https://datatracker.ietf.org/doc/html/rfc3629'},
      {label: 'Protobuf string', href: 'https://protobuf.dev/programming-guides/proto3/#scalar'},
      {label: 'JSON Schema — string', href: 'https://json-schema.org/understanding-json-schema/reference/string'},
    ],
  },
  integer: {
    face: '⚡ integer',
    title: 'Integer — Discrete quantity',
    body: 'A whole number. In a CPU register — a pattern of voltage levels interpreted as a magnitude. No fractions, no approximation. The quantum of counting. Discrete like particles.',
    refs: [
      {label: 'Integer (computer science)', href: 'https://en.wikipedia.org/wiki/Integer_(computer_science)'},
      {label: 'Two\'s complement', href: 'https://en.wikipedia.org/wiki/Two%27s_complement'},
      {label: 'Quantization (physics)', href: 'https://en.wikipedia.org/wiki/Quantization_(physics)'},
    ],
  },
  float: {
    face: '〰️ float',
    title: 'Float — Floating point',
    body: 'A number with a movable decimal point. IEEE 754 encodes it as sign, exponent, and mantissa. The point "floats" across the mantissa — hence the name. Continuous like waves. Always an approximation.',
    refs: [
      {label: 'IEEE 754', href: 'https://en.wikipedia.org/wiki/IEEE_754'},
      {label: 'Floating-point arithmetic', href: 'https://en.wikipedia.org/wiki/Floating-point_arithmetic'},
      {label: 'What every programmer should know about floating-point', href: 'https://floating-point-gui.de/'},
    ],
  },
  boolean: {
    face: '🔀 boolean',
    title: 'Boolean — One bit of truth',
    body: 'True or false. On or off. 1 or 0. The most fundamental unit of information — one bit. A transistor in its simplest role: conducting or not. George Boole formalized it in 1847.',
    refs: [
      {label: 'Boolean algebra', href: 'https://en.wikipedia.org/wiki/Boolean_algebra'},
      {label: 'Transistor as switch', href: 'https://en.wikipedia.org/wiki/Transistor#Transistor_as_a_switch'},
      {label: 'Shannon\'s information theory', href: 'https://en.wikipedia.org/wiki/Information_theory'},
    ],
  },
  binary: {
    face: '💾 binary',
    title: 'Binary — Raw bytes',
    body: 'Uninterpreted data. No encoding, no structure, no opinion. Just bytes as they are. The ground truth of all digital storage. Everything else is binary with an interpretation layered on top.',
    refs: [
      {label: 'Binary data', href: 'https://en.wikipedia.org/wiki/Binary_data'},
      {label: 'Byte', href: 'https://en.wikipedia.org/wiki/Byte'},
      {label: 'Base64 — RFC 4648', href: 'https://datatracker.ietf.org/doc/html/rfc4648'},
    ],
  },
  datetime: {
    face: '🌍 datetime',
    title: 'Datetime — Earth\'s rotation',
    body: 'A point in time. Ultimately derived from Earth\'s rotation (day), orbit (year), and atomic vibration (second). SI defines the second as 9,192,631,770 cesium-133 transitions. All timestamps trace back to physics.',
    refs: [
      {label: 'Unix time', href: 'https://en.wikipedia.org/wiki/Unix_time'},
      {label: 'ISO 8601', href: 'https://en.wikipedia.org/wiki/ISO_8601'},
      {label: 'SI second (cesium-133)', href: 'https://en.wikipedia.org/wiki/Second#History_of_definition'},
      {label: 'RFC 3339 — Date and Time on the Internet', href: 'https://datatracker.ietf.org/doc/html/rfc3339'},
    ],
  },
  array: {
    face: '🔁 array',
    title: 'Array — Repetition',
    body: 'A sequence of identical structures. The same pattern repeated N times. In nature: crystals repeat unit cells, DNA repeats base pairs, waves repeat cycles. Repetition is one of three universal containers.',
    refs: [
      {label: 'Crystal structure (unit cell repetition)', href: 'https://en.wikipedia.org/wiki/Crystal_structure'},
      {label: 'DNA — repeating nucleotides', href: 'https://en.wikipedia.org/wiki/Nucleic_acid_sequence'},
      {label: 'Homogeneous collection (type theory)', href: 'https://en.wikipedia.org/wiki/List_(abstract_data_type)'},
    ],
  },
  object: {
    face: '🧱 object',
    title: 'Object — Composition',
    body: 'A whole made of named parts. Atoms compose molecules, molecules compose cells, cells compose organs. Composition is one of three universal containers. "What am I made of?"',
    refs: [
      {label: 'Composition (objects)', href: 'https://en.wikipedia.org/wiki/Object_composition'},
      {label: 'Mereology — part-whole relations', href: 'https://en.wikipedia.org/wiki/Mereology'},
      {label: 'Emergence — wholes from parts', href: 'https://en.wikipedia.org/wiki/Emergence'},
    ],
  },
  enum: {
    face: '🎚️ enum',
    title: 'Enum — Finite choice',
    body: 'One value from a finite set. A switch with N positions. In quantum mechanics — discrete energy levels. In logic — a disjunction. Choice is one of three universal containers. "What can I be?"',
    refs: [
      {label: 'Enumerated type', href: 'https://en.wikipedia.org/wiki/Enumerated_type'},
      {label: 'Discrete energy levels (quantum)', href: 'https://en.wikipedia.org/wiki/Energy_level'},
      {label: 'Tagged union (type theory)', href: 'https://en.wikipedia.org/wiki/Tagged_union'},
    ],
  },
}
</script>

<template>
  <div class="tv">
    <div v-for="(term, i) in terms" :key="i" class="tv-term" :class="{'tv-term--compound': term.of}">
      <div class="tv-head">
        <div class="tv-head-left">
          <span class="tv-id"><span v-if="term.required" class="tv-req" title="required">●</span>{{ term.id || '?' }}</span>
          <span v-if="term.value !== undefined" class="tv-value">= {{ term.value }}</span>
          <span v-if="term.comment" class="tv-comment">{{ term.comment }}</span>
        </div>
        <SciTooltip
          v-if="term.kind && kindMeta[term.kind]"
          :title="kindMeta[term.kind].title"
          :body="kindMeta[term.kind].body"
          :refs="kindMeta[term.kind].refs"
        >
          <span class="tv-kind">{{ kindMeta[term.kind].face }}</span>
        </SciTooltip>
        <span v-else-if="term.kind" class="tv-kind">{{ term.kind }}</span>
      </div>
      <div v-if="term.of && term.of.length && (depth || 0) < 3" class="tv-of">
        <TermViz :terms="term.of" :depth="(depth || 0) + 1" />
      </div>
      <div v-else-if="term.of && term.of.length === 0" class="tv-of-empty">empty</div>
    </div>
  </div>
</template>

<style scoped>
.tv {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tv-term {
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}
.tv-term--compound {
  border-style: dashed;
}
.tv-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.tv-head-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.tv-id {
  font-weight: 600;
  font-size: 14px;
}
.tv-req {
  color: var(--vp-c-danger-1);
  margin-right: 4px;
  font-size: 10px;
}
.tv-value {
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-mono);
}
.tv-comment {
  font-size: 11px;
  color: var(--vp-c-text-3);
  font-style: italic;
  line-height: 1.3;
}
.tv-kind {
  font-size: 12px;
  color: var(--vp-c-text-2);
}
.tv-of {
  margin-top: 8px;
  padding-left: 12px;
  border-left: 2px solid var(--vp-c-divider);
}
.tv-of-empty {
  margin-top: 4px;
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-style: italic;
  padding-left: 12px;
}
</style>

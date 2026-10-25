<script setup>
import { computed } from 'vue'
import { renderInline, renderMarkdown } from '../lib/markdown.js'

const props = defineProps({
  text: { type: String, default: '' },
  block: { type: Boolean, default: false }, // true: 글 본문처럼 블록 렌더링
  tag: { type: String, default: 'div' },
})

const html = computed(() => (props.block ? renderMarkdown(props.text) : renderInline(props.text)))
</script>

<template>
  <!-- 저장소 안의 콘텐츠만 렌더링하며, markdown-it의 raw HTML은 꺼 두었다 -->
  <component :is="tag" class="md" v-html="html" />
</template>

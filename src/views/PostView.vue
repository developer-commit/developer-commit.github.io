<script setup>
import { computed } from 'vue'
import { findPost, categoryName } from '../lib/posts.js'
import { useTitle } from '../lib/title.js'
import MarkdownText from '../components/MarkdownText.vue'
import NotFoundView from './NotFoundView.vue'

const props = defineProps({ category: String, slug: String })
const post = computed(() => findPost(props.category, props.slug))

useTitle(() => post.value?.title || '')
</script>

<template>
  <NotFoundView v-if="!post" />
  <article v-else class="post">
    <header class="post-head">
      <RouterLink :to="`/${post.category}/`" class="chip">{{ categoryName(post.category) }}</RouterLink>
      <h1>{{ post.title }}</h1>
      <div class="meta">
        <time :datetime="post.date">{{ post.date }}</time>
        <RouterLink v-for="t in post.tags" :key="t" :to="`/tags/${t}/`" class="tag">#{{ t }}</RouterLink>
      </div>
    </header>
    <MarkdownText :text="post.body" block class="post-body" />
  </article>
</template>

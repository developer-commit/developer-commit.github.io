<script setup>
import { computed } from 'vue'
import { posts, categoryName, tagsWithCount } from '../lib/posts.js'
import { useTitle } from '../lib/title.js'
import PostItem from '../components/PostItem.vue'
import NotFoundView from './NotFoundView.vue'

const props = defineProps({ category: String, tag: String })

const list = computed(() => {
  if (props.tag) return posts.filter((p) => p.tags.includes(props.tag))
  if (props.category) return posts.filter((p) => p.category === props.category)
  return posts
})
const heading = computed(() =>
  props.tag ? `#${props.tag}` : props.category ? categoryName(props.category) : '전체 글',
)
const tags = tagsWithCount()

useTitle(heading)
</script>

<template>
  <NotFoundView v-if="(category || tag) && !list.length" />
  <template v-else>
    <h1 class="page-title">{{ heading }}</h1>
    <p class="muted">글 {{ list.length }}개</p>
    <PostItem v-for="p in list" :key="p.category + p.slug" :post="p" />
    <section v-if="!category && !tag" class="block">
      <h2>태그</h2>
      <div class="chips">
        <RouterLink v-for="t in tags" :key="t.name" :to="`/tags/${t.name}/`" class="chip">
          #{{ t.name }} <span class="muted">{{ t.count }}</span>
        </RouterLink>
      </div>
    </section>
  </template>
</template>

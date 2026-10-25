<script setup>
import { categoryName, postPath } from '../lib/posts.js'

defineProps({ post: { type: Object, required: true } })
</script>

<template>
  <article class="post-item">
    <div class="meta">
      <RouterLink :to="`/${post.category}/`" class="chip">{{ categoryName(post.category) }}</RouterLink>
      <time :datetime="post.date">{{ post.date }}</time>
    </div>
    <h3>
      <RouterLink :to="postPath(post)">{{ post.title }}</RouterLink>
    </h3>
    <p v-if="post.description" class="desc">{{ post.description }}</p>
  </article>
</template>

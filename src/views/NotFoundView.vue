<script setup>
import { useTitle } from '../lib/title.js'

useTitle('페이지를 찾을 수 없음')
</script>

<template>
  <section class="hero">
    <h1>404</h1>
    <p>찾는 페이지가 없습니다.</p>
    <p><RouterLink to="/">처음으로 돌아가기</RouterLink></p>
  </section>
</template>

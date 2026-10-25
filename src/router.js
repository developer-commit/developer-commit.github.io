import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

// 글 주소는 예전 Hugo 블로그와 같은 /<category>/<slug>/ 형태를 유지한다.
const routes = [
  { path: '/', component: HomeView },
  { path: '/posts/', component: () => import('./views/PostListView.vue') },
  { path: '/exams/', component: () => import('./views/ExamListView.vue') },
  { path: '/exams/:id/', component: () => import('./views/ExamView.vue'), props: true },
  { path: '/tags/:tag/', component: () => import('./views/PostListView.vue'), props: true },
  { path: '/:category/', component: () => import('./views/PostListView.vue'), props: true },
  { path: '/:category/:slug/', component: () => import('./views/PostView.vue'), props: true },
  { path: '/:pathMatch(.*)*', component: () => import('./views/NotFoundView.vue') },
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 80 }
    return { top: 0 }
  },
})

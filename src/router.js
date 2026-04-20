import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/HomeView.vue')
  },
  {
    path: '/info',
    name: 'info',
    component: () => import('./views/InfoView.vue')
  },
  {
    path: '/schedule',
    name: 'schedule',
    component: () => import('./views/ScheduleView.vue')
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('./views/MapView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
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
  history: createWebHashHistory(),
  routes
})

export default router

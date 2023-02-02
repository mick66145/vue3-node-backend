/* Layout */
import MainLayout from '@/layouts/MainLayout.vue'

const systemLogRouter = {
  path: '/system-log',
  component: MainLayout,
  meta: {
    title: '操作紀錄',
    slug: 'link',
    permissions: ['view system_log_manage'],
  },
  redirect: { name: 'SystemLogList' },
  children: [
    {
      path: 'list',
      component: () => import('@/views/system-log/SystemLogList.vue'),
      name: 'SystemLogList',
      meta: { title: '操作紀錄', icon: 'fas fa-genderless', permissions: ['view system_log_manage'] },
    },
  ],
}

export default systemLogRouter

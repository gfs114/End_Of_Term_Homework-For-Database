<template>
  <section class="admin-page">
    <aside :class="['admin-sidebar', { collapsed: isCollapsed }]">
      <div class="admin-brand">
        <div class="brand-title">
          <span class="brand-icon">A</span>
          <strong v-if="!isCollapsed">后台管理系统</strong>
        </div>
        <el-button text class="sidebar-toggle" title="折叠菜单" @click="toggleCollapse">
          <el-icon>
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
        </el-button>
      </div>

      <el-menu
        class="admin-menu"
        :collapse="isCollapsed"
        :default-active="activeMenuKey"
        background-color="#111827"
        text-color="#cbd5e1"
        active-text-color="#ffffff"
        @select="handleMenuSelect"
      >
        <el-sub-menu index="device-manage">
          <template #title>
            <el-icon><Monitor /></el-icon>
            <span>设备信息管理</span>
          </template>
          <el-sub-menu index="device-info">
            <template #title>
              <el-icon><Cpu /></el-icon>
              <span>设备信息</span>
            </template>
            <el-menu-item index="device-phone">
              <el-icon><Iphone /></el-icon>
              <span>手机</span>
            </el-menu-item>
            <el-menu-item index="device-computer">
              <el-icon><Monitor /></el-icon>
              <span>电脑</span>
            </el-menu-item>
          </el-sub-menu>
        </el-sub-menu>

        <el-sub-menu index="role-manage">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>角色管理</span>
          </template>
          <el-menu-item index="user-info">
            <el-icon><User /></el-icon>
            <span>用户信息</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>

      <div class="sidebar-footer">
        <el-button class="logout-button" text @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span v-if="!isCollapsed">退出管理端</span>
        </el-button>
      </div>
    </aside>

    <main class="admin-main">
      <header class="admin-header">
        <div>
          <span>数码产品配置对比系统</span>
          <strong>{{ pageTitle }}</strong>
        </div>
        <div class="admin-identity">
          <el-icon><Avatar /></el-icon>
          <div>
            <span>{{ currentUser.role || '管理员' }}</span>
            <strong>{{ currentUser.account }}</strong>
          </div>
        </div>
      </header>

      <section class="admin-content">
        <router-view />
      </section>
    </main>
  </section>
</template>

<script>
import { clearAuthSession, getAuthUser } from '@/utils/auth'

export default {
  name: 'AdminPage',
  data() {
    return {
      isCollapsed: false,
      activeMenuKey: 'user-info',
      currentUser: getAuthUser() || {},
      menuRouteMap: {
        'device-phone': '/admin/products/phone',
        'device-computer': '/admin/products/computer',
        'user-info': '/admin/users'
      }
    }
  },
  computed: {
    pageTitle() {
      if (this.$route.path === '/admin/products/phone') return '手机设备管理'
      if (this.$route.path === '/admin/products/computer') return '电脑设备管理'
      return '用户信息管理'
    }
  },
  watch: {
    '$route.path'() {
      this.syncActiveMenuByRoute()
    }
  },
  created() {
    this.syncActiveMenuByRoute()
  },
  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
    },
    handleMenuSelect(key) {
      const routePath = this.menuRouteMap[key]

      if (routePath && this.$route.path !== routePath) {
        this.$router.push(routePath)
      }
    },
    syncActiveMenuByRoute() {
      const activeMenuKey = Object.keys(this.menuRouteMap).find((key) => {
        return this.menuRouteMap[key] === this.$route.path
      })

      if (activeMenuKey) {
        this.activeMenuKey = activeMenuKey
      }
    },
    handleLogout() {
      clearAuthSession()
      this.$router.push('/admin-login')
    }
  }
}
</script>

<style scoped>
.admin-page {
  display: flex;
  min-height: 100vh;
  overflow: hidden;
  background: #f3f4f6;
}

.admin-sidebar {
  position: sticky;
  top: 0;
  flex: 0 0 232px;
  width: 232px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: #111827;
  transition: width 0.2s ease, flex-basis 0.2s ease;
}

.admin-sidebar.collapsed {
  flex-basis: 64px;
  width: 64px;
}

.admin-brand {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 12px 0 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: #fff;
  white-space: nowrap;
}

.brand-title {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  font-weight: 700;
}

.sidebar-toggle {
  width: 32px;
  height: 32px;
  padding: 0;
  color: #cbd5e1;
}

.sidebar-toggle:hover,
.logout-button:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.admin-menu {
  flex: 1;
  border-right: 0;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.logout-button {
  width: 100%;
  height: 38px;
  justify-content: flex-start;
  gap: 8px;
  padding: 0 12px;
  border-radius: 6px;
  color: #cbd5e1;
}

.admin-sidebar.collapsed .logout-button {
  justify-content: center;
  padding: 0;
}

.admin-main {
  flex: 1;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.admin-header {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 10px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.admin-header > div:first-child,
.admin-identity > div {
  display: grid;
  gap: 3px;
}

.admin-header span,
.admin-identity span {
  color: #6b7280;
  font-size: 12px;
}

.admin-header strong {
  color: #111827;
  font-size: 15px;
}

.admin-identity {
  display: flex;
  align-items: center;
  gap: 9px;
}

.admin-identity > .el-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
}

.admin-content {
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: 18px;
  box-sizing: border-box;
}

@media (max-width: 820px) {
  .admin-sidebar {
    flex-basis: 64px;
    width: 64px;
  }

  .admin-brand strong {
    display: none;
  }

  .admin-content {
    padding: 12px;
  }

  .admin-header {
    padding: 10px 12px;
  }

  .admin-header > div:first-child span {
    display: none;
  }
}
</style>

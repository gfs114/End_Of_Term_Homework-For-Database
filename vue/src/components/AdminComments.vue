<template>
  <main class="comments-page">
    <section class="comments-card">
      <div class="content-heading">
        <div>
          <h1>用户评论管理</h1>
          <p>{{ isSuperAdmin ? '查看产品评分与评论，对不合适的评论进行隐藏或删除。' : '查看产品评分与评论，对不合适的评论进行隐藏或显示。' }}</p>
        </div>
        <el-button icon="Refresh" :loading="loading" @click="loadComments">刷新</el-button>
      </div>

      <div class="filter-row">
        <el-input v-model.trim="keyword" prefix-icon="Search" placeholder="搜索用户、产品或评论内容" clearable />
        <el-select v-model="statusFilter" placeholder="全部状态" clearable @change="loadComments">
          <el-option label="显示中" :value="1" />
          <el-option label="已隐藏" :value="0" />
        </el-select>
      </div>

      <el-table v-loading="loading" :data="filteredComments" stripe>
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="productName" label="产品" min-width="180" show-overflow-tooltip />
        <el-table-column label="评分" width="150">
          <template #default="{ row }">
            <el-rate :model-value="row.rating" disabled />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评论内容" min-width="280" show-overflow-tooltip />
        <el-table-column label="评论时间" width="180">
          <template #default="{ row }">{{ dateText(row.commentTime) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '显示中' : '已隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link icon="View" @click="toggleStatus(row)">
              {{ row.status === 1 ? '隐藏' : '显示' }}
            </el-button>
            <el-button v-if="isSuperAdmin" type="danger" link icon="Delete" @click="deleteComment(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </main>
</template>

<script>
import http from '@/utils/http'
import { getAuthUser } from '@/utils/auth'

export default {
  name: 'AdminCommentsPage',
  data() {
    return {
      comments: [],
      loading: false,
      currentUser: getAuthUser() || {},
      keyword: '',
      statusFilter: ''
    }
  },
  computed: {
    isSuperAdmin() {
      return this.currentUser.role === '超级管理员'
    },
    filteredComments() {
      const keyword = this.keyword.toLowerCase()
      return this.comments.filter((comment) => {
        return !keyword ||
          comment.username.toLowerCase().includes(keyword) ||
          comment.productName.toLowerCase().includes(keyword) ||
          comment.content.toLowerCase().includes(keyword)
      })
    }
  },
  mounted() {
    this.loadComments()
  },
  methods: {
    getErrorMessage(error, fallback) {
      const data = error.response && error.response.data
      return (data && data.message) || fallback
    },
    async loadComments() {
      this.loading = true

      try {
        const params = this.statusFilter === '' ? {} : { status: this.statusFilter }
        const response = await http.get('/admin/comments', { params })
        this.comments = response.data.data || []
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '评论列表加载失败'))
      } finally {
        this.loading = false
      }
    },
    async toggleStatus(comment) {
      try {
        const status = comment.status === 1 ? 0 : 1
        const response = await http.patch(`/admin/comments/${comment.id}/status`, { status })
        comment.status = status
        this.$message.success(response.data.message)
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '评论状态修改失败'))
      }
    },
    deleteComment(comment) {
      this.$confirm('确认永久删除这条评论吗？', '删除确认', { type: 'warning' })
        .then(async () => {
          const response = await http.delete(`/admin/comments/${comment.id}`)
          this.$message.success(response.data.message)
          this.loadComments()
        })
        .catch((error) => {
          if (error !== 'cancel' && error !== 'close') {
            this.$message.error(this.getErrorMessage(error, '评论删除失败'))
          }
        })
    },
    dateText(value) {
      return value ? new Date(value).toLocaleString('zh-CN') : ''
    }
  }
}
</script>

<style scoped>
.comments-card {
  min-height: calc(100vh - 96px);
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}

.content-heading,
.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content-heading {
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid #eef0f3;
}

.content-heading h1 {
  margin: 0;
  font-size: 20px;
}

.content-heading p {
  margin: 7px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.filter-row {
  margin-bottom: 16px;
}

.filter-row .el-input {
  width: min(360px, 100%);
}

.filter-row .el-select {
  width: 150px;
}

@media (max-width: 720px) {
  .content-heading,
  .filter-row {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-row .el-input,
  .filter-row .el-select {
    width: 100%;
  }
}
</style>

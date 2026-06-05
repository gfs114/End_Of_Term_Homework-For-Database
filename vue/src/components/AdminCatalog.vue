<template>
  <main class="catalog-page">
    <section class="catalog-card">
      <div class="content-heading">
        <div>
          <h1>分类与品牌管理</h1>
        </div>
        <el-button type="primary" icon="Plus" @click="openDialog('create')">
          新增{{ activeTab === 'categories' ? '分类' : '品牌' }}
        </el-button>
      </div>

      <el-tabs v-model="activeTab" @tab-change="loadActiveData">
        <el-tab-pane label="产品分类" name="categories">
          <el-table v-loading="loading" :data="categories" stripe>
            <el-table-column prop="name" label="分类名称" min-width="160" />
            <el-table-column prop="description" label="分类描述" min-width="240" show-overflow-tooltip />
            <el-table-column prop="sortOrder" label="排序" width="90" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="changeStatus(row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" link icon="Edit" @click="openDialog('edit', row)">编辑</el-button>
                <el-button v-if="isSuperAdmin" type="danger" link icon="Delete" @click="deleteItem(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="产品品牌" name="brands">
          <el-table v-loading="loading" :data="brands" stripe>
            <el-table-column label="Logo" width="90">
              <template #default="{ row }">
                <div class="brand-logo-cell">
                  <el-icon><Picture /></el-icon>
                  <img v-if="row.logo" :src="assetUrl(row.logo)" :alt="row.name" @error="handleImageError">
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="品牌名称" min-width="150" />
            <el-table-column prop="country" label="国家/地区" width="130" />
            <el-table-column prop="website" label="官方网站" min-width="220" show-overflow-tooltip />
            <el-table-column prop="description" label="品牌介绍" min-width="220" show-overflow-tooltip />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="changeStatus(row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" link icon="Edit" @click="openDialog('edit', row)">编辑</el-button>
                <el-button v-if="isSuperAdmin" type="danger" link icon="Delete" @click="deleteItem(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </section>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="min(600px, 92vw)" :close-on-click-modal="false">
      <el-form ref="catalogForm" :model="form" :rules="rules" label-position="top">
        <el-form-item :label="activeTab === 'categories' ? '分类名称' : '品牌名称'" prop="name">
          <el-input v-model.trim="form.name" />
        </el-form-item>

        <template v-if="activeTab === 'categories'">
          <el-form-item label="分类描述">
            <el-input v-model.trim="form.description" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item label="排序号">
            <el-input-number v-model="form.sortOrder" :min="0" />
          </el-form-item>
        </template>

        <template v-else>
          <div class="form-grid">
            <el-form-item label="国家/地区">
              <el-input v-model.trim="form.country" />
            </el-form-item>
            <el-form-item label="品牌 Logo">
              <div class="brand-logo-upload">
                <div class="brand-logo-preview">
                  <el-icon><Picture /></el-icon>
                  <img v-if="logoPreview" :src="logoPreview" alt="品牌 Logo 预览" @error="handleImageError">
                </div>
                <div>
                  <el-upload
                    :auto-upload="false"
                    :show-file-list="false"
                    accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                    :on-change="handleLogoFileChange"
                  >
                    <el-button icon="Upload">上传图片</el-button>
                  </el-upload>
                  <span>{{ form.logoName || '图片将自动保存到 brand_icon 文件夹' }}</span>
                </div>
              </div>
            </el-form-item>
          </div>
          <el-form-item label="官方网站">
            <el-input v-model.trim="form.website" />
          </el-form-item>
          <el-form-item label="品牌介绍">
            <el-input v-model.trim="form.description" type="textarea" :rows="3" />
          </el-form-item>
        </template>

        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveItem">保存</el-button>
      </template>
    </el-dialog>
  </main>
</template>

<script>
import http from '@/utils/http'
import { getAuthUser } from '@/utils/auth'

function emptyForm() {
  return {
    id: null,
    name: '',
    description: '',
    sortOrder: 0,
    logo: '',
    logoDataUrl: '',
    logoName: '',
    country: '',
    website: '',
    status: 1
  }
}

export default {
  name: 'AdminCatalogPage',
  data() {
    return {
      activeTab: 'categories',
      categories: [],
      brands: [],
      loading: false,
      saving: false,
      currentUser: getAuthUser() || {},
      dialogVisible: false,
      dialogMode: 'create',
      form: emptyForm(),
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { max: 50, message: '名称不能超过 50 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    isSuperAdmin() {
      return this.currentUser.role === '超级管理员'
    },
    dialogTitle() {
      const action = this.dialogMode === 'create' ? '新增' : '编辑'
      return `${action}${this.activeTab === 'categories' ? '分类' : '品牌'}`
    },
    logoPreview() {
      if (this.form.logoDataUrl) return this.form.logoDataUrl
      if (this.form.logo) return this.assetUrl(this.form.logo)
      return ''
    }
  },
  mounted() {
    this.loadActiveData()
  },
  methods: {
    getErrorMessage(error, fallback) {
      const data = error.response && error.response.data
      return (data && data.message) || fallback
    },
    async loadActiveData() {
      this.loading = true

      try {
        const response = await http.get(`/admin/${this.activeTab}`)
        this[this.activeTab] = response.data.data || []
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '基础数据加载失败'))
      } finally {
        this.loading = false
      }
    },
    openDialog(mode, row) {
      this.dialogMode = mode
      this.form = mode === 'edit' ? { ...emptyForm(), ...row } : emptyForm()
      this.form.logoDataUrl = ''
      this.form.logoName = ''
      this.dialogVisible = true
    },
    saveItem() {
      this.$refs.catalogForm.validate(async (valid) => {
        if (!valid || this.saving) return
        this.saving = true

        try {
          const path = `/admin/${this.activeTab}`
          const response = this.dialogMode === 'create'
            ? await http.post(path, this.form)
            : await http.put(`${path}/${this.form.id}`, this.form)
          this.$message.success(response.data.message)
          this.dialogVisible = false
          this.loadActiveData()
        } catch (error) {
          this.$message.error(this.getErrorMessage(error, '保存失败'))
        } finally {
          this.saving = false
        }
      })
    },
    async changeStatus(row) {
      try {
        const response = await http.patch(`/admin/${this.activeTab}/${row.id}/status`, { status: row.status })
        this.$message.success(response.data.message)
      } catch (error) {
        row.status = row.status === 1 ? 0 : 1
        this.$message.error(this.getErrorMessage(error, '状态修改失败'))
      }
    },
    deleteItem(row) {
      this.$confirm(`确认直接删除“${row.name}”吗？关联产品及其图片、配置、评论、收藏会一起删除。`, '删除确认', { type: 'warning' })
        .then(async () => {
          const response = await http.delete(`/admin/${this.activeTab}/${row.id}`)
          this.$message.success(response.data.message)
          this.loadActiveData()
        })
        .catch((error) => {
          if (error !== 'cancel' && error !== 'close') {
            this.$message.error(this.getErrorMessage(error, '删除失败'))
          }
        })
    },
    handleLogoFileChange(uploadFile) {
      const file = uploadFile.raw

      if (!file) return
      if (file.size > 5 * 1024 * 1024) {
        this.$message.warning('品牌 Logo 图片不能超过 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        this.form.logoDataUrl = reader.result
        this.form.logoName = file.name
      }
      reader.readAsDataURL(file)
    },
    assetUrl(assetPath) {
      if (!assetPath) return ''
      if (/^https?:\/\//i.test(assetPath)) return assetPath

      return `http://localhost:3000/assets/${assetPath
        .split('/')
        .map((part) => encodeURIComponent(part))
        .join('/')}`
    },
    handleImageError(event) {
      event.target.style.display = 'none'
    }
  }
}
</script>

<style scoped>
.catalog-card {
  min-height: calc(100vh - 96px);
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}

.content-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 18px;
}

.brand-logo-cell,
.brand-logo-preview {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
  color: #9ca3af;
}

.brand-logo-cell {
  width: 46px;
  height: 46px;
}

.brand-logo-preview {
  flex: 0 0 72px;
  width: 72px;
  height: 72px;
}

.brand-logo-cell img,
.brand-logo-preview img {
  position: absolute;
  inset: 6px;
  width: calc(100% - 12px);
  height: calc(100% - 12px);
  object-fit: contain;
}

.brand-logo-upload {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo-upload > div:last-child {
  min-width: 0;
  display: grid;
  gap: 7px;
}

.brand-logo-upload span {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 720px) {
  .content-heading {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .brand-logo-upload {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

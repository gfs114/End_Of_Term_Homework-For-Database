<template>
  <main class="admin-products-page">
    <section class="admin-products-card">
      <div class="content-heading">
        <div>
          <h1>{{ categoryName }}设备信息</h1>
          <p>超级管理员和普通管理员均可新增、编辑、启禁和删除{{ categoryName }}设备。</p>
        </div>
        <div class="content-commands">
          <el-button icon="Refresh" :loading="loading" @click="loadPage">刷新</el-button>
          <el-button type="primary" icon="Plus" @click="openProductDialog('create')">新增{{ categoryName }}</el-button>
        </div>
      </div>

      <div class="summary-strip">
        <div>
          <span>{{ categoryName }}总数</span>
          <strong>{{ products.length }}</strong>
        </div>
        <div>
          <span>启用{{ categoryName }}</span>
          <strong>{{ enabledProductCount }}</strong>
        </div>
        <div>
          <span>禁用{{ categoryName }}</span>
          <strong>{{ disabledProductCount }}</strong>
        </div>
      </div>

      <div class="filter-row">
        <el-input
          v-model.trim="filters.keyword"
          prefix-icon="Search"
          placeholder="搜索设备名称或品牌"
          clearable
        />
        <el-select
          v-model="filters.brandIds"
          class="brand-select"
          placeholder="全部品牌"
          multiple
          collapse-tags
          collapse-tags-tooltip
          clearable
        >
          <el-option
            v-for="brand in availableBrands"
            :key="brand.id"
            :label="brand.name"
            :value="brand.id"
          />
        </el-select>
        <el-select v-model="filters.status" placeholder="全部状态" clearable>
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button icon="RefreshLeft" @click="resetFilters">重置</el-button>
      </div>

      <div class="table-tool">
        <el-table v-loading="loading" :data="pagedProducts" stripe>
          <el-table-column label="设备" min-width="220">
            <template #default="{ row }">
              <div class="device-cell">
                <div class="device-image">
                  <el-icon><Monitor /></el-icon>
                  <img
                    v-if="row.imageUrl"
                    :src="assetUrl(row.imageUrl)"
                    :alt="row.name"
                    @error="handleImageError"
                  >
                </div>
                <div>
                  <strong>{{ row.name }}</strong>
                  <span>{{ row.brandName }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="价格" width="120">
            <template #default="{ row }">
              {{ priceText(row.price) }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="设备参数" min-width="280" show-overflow-tooltip />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="170" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link icon="Edit" @click="openProductDialog('edit', row)">编辑</el-button>
              <el-button type="danger" link icon="Delete" @click="handleDeleteProduct(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-pagination
        v-if="filteredProducts.length > pageSize"
        v-model:current-page="currentPage"
        class="table-pagination"
        background
        layout="prev, pager, next"
        :page-size="pageSize"
        :total="filteredProducts.length"
      />
    </section>

    <el-dialog
      v-model="productDialogVisible"
      :title="dialogMode === 'create' ? `新增${categoryName}` : `编辑${categoryName}`"
      width="min(620px, 92vw)"
      :close-on-click-modal="false"
      @closed="resetProductDialog"
    >
      <el-form
        ref="productForm"
        :model="productForm"
        :rules="productRules"
        label-position="top"
        class="dialog-form"
      >
        <el-form-item label="设备名称" prop="name">
          <el-input v-model.trim="productForm.name" placeholder="请输入设备名称" />
        </el-form-item>

        <div class="form-grid">
          <el-form-item label="设备分类" prop="categoryId">
            <el-input :model-value="categoryName" disabled />
          </el-form-item>

          <el-form-item label="设备品牌" prop="brandId">
            <el-select v-model="productForm.brandId" placeholder="请选择品牌" filterable>
              <el-option
                v-for="brand in brands"
                :key="brand.id"
                :label="brand.name"
                :value="brand.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="设备价格" prop="price">
            <el-input-number v-model="productForm.price" :min="0" :precision="2" :step="100" />
          </el-form-item>

          <el-form-item label="设备状态" prop="status">
            <el-radio-group v-model="productForm.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <el-form-item label="设备参数" prop="description">
          <el-input
            v-model.trim="productForm.description"
            type="textarea"
            :rows="4"
            placeholder="例如：处理器：骁龙 8；电池容量：5000mAh"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="productDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveProduct">保存</el-button>
      </template>
    </el-dialog>
  </main>
</template>

<script>
import http from '@/utils/http'

function emptyProductForm(categoryId = null) {
  return {
    id: null,
    name: '',
    categoryId,
    brandId: null,
    price: 0,
    description: '',
    status: 1
  }
}

export default {
  name: 'AdminProductsPage',
  props: {
    categoryName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      products: [],
      categories: [],
      brands: [],
      loading: false,
      saving: false,
      productDialogVisible: false,
      dialogMode: 'create',
      currentPage: 1,
      pageSize: 15,
      filters: {
        keyword: '',
        brandIds: [],
        status: null
      },
      productForm: emptyProductForm(),
      productRules: {
        name: [
          { required: true, message: '请输入设备名称', trigger: 'blur' },
          { max: 100, message: '设备名称不能超过 100 个字符', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '请选择设备分类', trigger: 'change' }
        ],
        brandId: [
          { required: true, message: '请选择设备品牌', trigger: 'change' }
        ],
        price: [
          { required: true, message: '请输入设备价格', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    enabledProductCount() {
      return this.products.filter((product) => Number(product.status) === 1).length
    },
    disabledProductCount() {
      return this.products.filter((product) => Number(product.status) === 0).length
    },
    availableBrands() {
      const brandIds = new Set(this.products.map((product) => Number(product.brandId)))
      return this.brands.filter((brand) => brandIds.has(Number(brand.id)))
    },
    filteredProducts() {
      const keyword = this.filters.keyword.toLowerCase()

      return this.products.filter((product) => {
        const matchesKeyword = !keyword ||
          product.name.toLowerCase().includes(keyword) ||
          product.brandName.toLowerCase().includes(keyword)
        const matchesBrand = !this.filters.brandIds.length ||
          this.filters.brandIds.includes(Number(product.brandId))
        const matchesStatus = this.filters.status === null || this.filters.status === '' ||
          Number(product.status) === Number(this.filters.status)

        return matchesKeyword && matchesBrand && matchesStatus
      })
    },
    pagedProducts() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredProducts.slice(start, start + this.pageSize)
    }
  },
  watch: {
    categoryName() {
      this.productDialogVisible = false
      this.resetFilters()
      this.loadPage()
    },
    filters: {
      deep: true,
      handler() {
        this.currentPage = 1
      }
    }
  },
  mounted() {
    this.loadPage()
  },
  methods: {
    getErrorMessage(error, fallback) {
      const data = error.response && error.response.data
      return (data && data.message) || fallback
    },
    async loadPage() {
      this.loading = true

      try {
        const [categoryResponse, brandResponse] = await Promise.all([
          http.get('/product-categories'),
          http.get('/product-brands')
        ])

        this.categories = categoryResponse.data.data || []
        this.brands = brandResponse.data.data || []
        const category = this.categories.find((item) => item.name === this.categoryName)

        if (!category) {
          this.products = []
          this.$message.error(`未找到“${this.categoryName}”分类`)
          return
        }

        const productResponse = await http.get('/admin/products', {
          params: { categoryId: category.id }
        })
        this.products = productResponse.data.data || []
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, `${this.categoryName}数据加载失败`))
      } finally {
        this.loading = false
      }
    },
    resetFilters() {
      this.filters = {
        keyword: '',
        brandIds: [],
        status: null
      }
    },
    openProductDialog(mode, product) {
      this.dialogMode = mode
      const category = this.categories.find((item) => item.name === this.categoryName)
      this.productForm = mode === 'edit'
        ? {
            id: product.id,
            name: product.name,
            categoryId: product.categoryId,
            brandId: product.brandId,
            price: product.price,
            description: product.description,
            status: product.status
          }
        : emptyProductForm(category ? category.id : null)
      this.productDialogVisible = true
    },
    resetProductDialog() {
      const category = this.categories.find((item) => item.name === this.categoryName)
      this.productForm = emptyProductForm(category ? category.id : null)

      this.$nextTick(() => {
        if (this.$refs.productForm) {
          this.$refs.productForm.clearValidate()
        }
      })
    },
    handleSaveProduct() {
      this.$refs.productForm.validate(async (valid) => {
        if (!valid || this.saving) return

        this.saving = true

        try {
          const payload = {
            name: this.productForm.name,
            categoryId: this.productForm.categoryId,
            brandId: this.productForm.brandId,
            price: this.productForm.price,
            description: this.productForm.description,
            status: this.productForm.status
          }
          const response = this.dialogMode === 'create'
            ? await http.post('/admin/products', payload)
            : await http.put(`/admin/products/${this.productForm.id}`, payload)

          this.$message.success(response.data.message || '设备信息保存成功')
          this.productDialogVisible = false
          this.loadPage()
        } catch (error) {
          this.$message.error(this.getErrorMessage(error, '设备信息保存失败'))
        } finally {
          this.saving = false
        }
      })
    },
    async handleStatusChange(product) {
      try {
        const response = await http.patch(`/admin/products/${product.id}/status`, {
          status: product.status
        })
        this.$message.success(response.data.message || '设备状态修改成功')
      } catch (error) {
        product.status = product.status === 1 ? 0 : 1
        this.$message.error(this.getErrorMessage(error, '设备状态修改失败'))
      }
    },
    handleDeleteProduct(product) {
      this.$confirm(`确认删除设备“${product.name}”吗？`, '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const response = await http.delete(`/admin/products/${product.id}`)
          this.$message.success(response.data.message || '设备删除成功')
          this.loadPage()
        })
        .catch((error) => {
          if (error !== 'cancel' && error !== 'close') {
            this.$message.error(this.getErrorMessage(error, '设备删除失败'))
          }
        })
    },
    priceText(price) {
      return Number(price) > 0 ? `¥${Number(price).toLocaleString('zh-CN')}` : '价格待定'
    },
    assetUrl(assetPath) {
      if (!assetPath) return ''

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
.admin-products-page,
.admin-products-card {
  min-height: calc(100vh - 96px);
}

.admin-products-card {
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}

.content-heading,
.content-commands,
.filter-row,
.device-cell {
  display: flex;
  align-items: center;
}

.content-heading {
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid #eef0f3;
}

.content-heading h1 {
  margin: 0;
  color: #111827;
  font-size: 20px;
}

.content-heading p {
  margin: 7px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.content-commands,
.filter-row {
  gap: 10px;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
}

.summary-strip div {
  padding: 15px 18px;
  border-right: 1px solid #e5e7eb;
}

.summary-strip div:last-child {
  border-right: 0;
}

.summary-strip span,
.device-cell span {
  display: block;
  color: #6b7280;
  font-size: 12px;
}

.summary-strip span {
  margin-bottom: 7px;
}

.summary-strip strong {
  color: #111827;
  font-size: 22px;
}

.filter-row {
  margin-bottom: 18px;
}

.filter-row .el-input {
  width: min(320px, 100%);
}

.filter-row .el-select {
  width: 150px;
}

.filter-row .brand-select {
  width: 240px;
}

.table-tool {
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 6px;
}

.device-cell {
  gap: 10px;
}

.device-cell > div:last-child {
  min-width: 0;
}

.device-cell strong {
  display: block;
  overflow: hidden;
  color: #111827;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-image {
  position: relative;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  background: #f9fafb;
  color: #9ca3af;
}

.device-image img {
  position: absolute;
  inset: 3px;
  width: calc(100% - 6px);
  height: calc(100% - 6px);
  object-fit: contain;
}

.table-pagination {
  justify-content: center;
  margin-top: 20px;
}

.dialog-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 18px;
}

.dialog-form .el-select,
.dialog-form .el-input-number {
  width: 100%;
}

@media (max-width: 720px) {
  .admin-products-card {
    padding: 14px;
  }

  .content-heading,
  .filter-row {
    align-items: stretch;
    flex-direction: column;
  }

  .content-commands,
  .filter-row .el-input,
  .filter-row .el-select,
  .filter-row .brand-select {
    width: 100%;
  }

  .content-commands .el-button {
    flex: 1;
  }

  .summary-strip,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .summary-strip div {
    border-right: 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .summary-strip div:last-child {
    border-bottom: 0;
  }
}
</style>

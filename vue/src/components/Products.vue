<template>
  <main class="account-page products-page" :class="{ 'has-compare-tray': selectedProducts.length }">
    <section class="product-workspace">
      <div class="product-actions-bar">
        <div class="product-page-mark">
          <span>产品挑选</span>
        </div>
        <div class="product-actions">
          <el-button icon="Star" @click="$router.push('/favorites')">我的收藏</el-button>
          <el-button icon="User" @click="$router.push('/user')">个人中心</el-button>
          <el-button icon="SwitchButton" @click="handleLogout">退出</el-button>
        </div>
      </div>

      <div class="filter-tool">
        <div class="category-filter">
          <span>产品分类</span>
          <el-radio-group v-model="filters.categoryId" @change="handleFilterChange">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button
              v-for="category in categories"
              :key="category.id"
              :value="String(category.id)"
            >
              {{ category.name }}
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="filter-grid">
          <el-input
            v-model.trim="filters.keyword"
            prefix-icon="Search"
            placeholder="搜索产品名称、品牌或参数"
            clearable
            @keyup.enter="handleFilterChange"
            @clear="handleFilterChange"
          />

          <el-select
            v-model="filters.brandIds"
            placeholder="全部品牌"
            multiple
            collapse-tags
            collapse-tags-tooltip
            clearable
            @change="handleFilterChange"
          >
            <el-option
              v-for="brand in brands"
              :key="brand.id"
              :label="brand.name"
              :value="brand.id"
            />
          </el-select>

          <div class="price-range">
            <el-input-number
              v-model="filters.minPrice"
              :min="0"
              :step="500"
              :controls="false"
              placeholder="最低价"
            />
            <span>至</span>
            <el-input-number
              v-model="filters.maxPrice"
              :min="0"
              :step="500"
              :controls="false"
              placeholder="最高价"
            />
          </div>

          <el-select v-model="filters.sort" @change="handleFilterChange">
            <el-option label="热度优先" value="popular" />
            <el-option label="价格从低到高" value="priceAsc" />
            <el-option label="价格从高到低" value="priceDesc" />
            <el-option label="名称排序" value="name" />
          </el-select>

          <el-button type="primary" icon="Search" @click="handleFilterChange">筛选</el-button>
          <el-button icon="RefreshLeft" @click="resetFilters">重置</el-button>
          <el-button icon="Refresh" :loading="loading" @click="fetchProducts">刷新</el-button>
        </div>
      </div>

      <div class="result-heading">
        <span>已选择 {{ selectedProducts.length }} / {{ MAX_COMPARE }}</span>
      </div>

      <div v-loading="loading" class="product-grid">
        <article
          v-for="product in pagedProducts"
          :key="product.id"
          class="product-card"
          :class="{ selected: isSelected(product) }"
          role="link"
          tabindex="0"
          @click="openDetail(product)"
          @keyup.enter="openDetail(product)"
        >
          <div class="product-image">
            <el-icon :size="52"><Monitor /></el-icon>
            <img
              v-if="product.imageUrl"
              :src="assetUrl(product.imageUrl)"
              :alt="product.name"
              loading="lazy"
              @error="handleImageError"
            >
            <span>{{ product.categoryName }}</span>
          </div>

          <div class="product-card-body">
            <div class="product-brand">
              <span>{{ product.brandName }}</span>
              <el-tag v-if="isSelected(product)" type="success" size="small">已选择</el-tag>
            </div>
            <h3 :title="product.name">{{ product.name }}</h3>
            <div class="product-rating">
              <el-rate :model-value="product.rating" disabled allow-half />
              <span>{{ product.commentCount }} 条评论</span>
            </div>
            <ul>
              <li v-for="spec in visibleSpecs(product)" :key="spec">{{ spec }}</li>
            </ul>
            <div class="product-card-footer">
              <strong>{{ priceText(product.price) }}</strong>
              <div class="product-card-actions">
                <el-button circle :icon="product.isFavorite ? 'StarFilled' : 'Star'" title="收藏" @click.stop="toggleFavorite(product)" />
                <el-button circle icon="View" title="查看详情" @click.stop="openDetail(product)" />
                <el-button
                  circle
                  :type="isSelected(product) ? 'success' : 'primary'"
                  :icon="isSelected(product) ? 'Check' : 'Plus'"
                  title="加入对比"
                  @click.stop="toggleProduct(product)"
                />
              </div>
            </div>
          </div>
        </article>
      </div>

      <el-empty v-if="!loading && !products.length" description="没有找到符合条件的产品" />

      <el-pagination
        v-if="products.length > pageSize"
        v-model:current-page="currentPage"
        class="product-pagination"
        background
        layout="prev, pager, next"
        :page-size="pageSize"
        :total="products.length"
      />
    </section>

    <aside v-if="selectedProducts.length" class="compare-tray">
      <div class="compare-tray-inner">
        <div class="compare-summary">
          <strong>产品对比</strong>
          <span>已选择 {{ selectedProducts.length }} / {{ MAX_COMPARE }}</span>
        </div>
        <div class="compare-slots">
          <div v-for="product in selectedProducts" :key="product.id" class="compare-slot">
            <span :title="product.name">{{ product.name }}</span>
            <el-button circle text icon="Close" title="移出对比" @click="toggleProduct(product)" />
          </div>
          <div
            v-for="index in MAX_COMPARE - selectedProducts.length"
            :key="`empty-${index}`"
            class="compare-slot empty"
          >
            待选择
          </div>
        </div>
        <div class="compare-actions">
          <el-button text @click="clearComparison">清空</el-button>
          <el-button type="primary" icon="DataAnalysis" :loading="compareLoading" @click="openComparison">开始对比</el-button>
        </div>
      </div>
    </aside>

    <el-dialog
      v-model="compareVisible"
      title="产品参数对比"
      width="min(1180px, 96vw)"
      top="4vh"
      class="compare-dialog"
    >
      <div class="comparison-scroll">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>对比项目</th>
              <th v-for="product in selectedProducts" :key="product.id">
                <div class="comparison-product">
                  <div class="comparison-image">
                    <el-icon :size="38"><Monitor /></el-icon>
                    <img
                      v-if="product.imageUrl"
                      :src="assetUrl(product.imageUrl)"
                      :alt="product.name"
                      @error="handleImageError"
                    >
                  </div>
                  <strong>{{ product.name }}</strong>
                  <span>{{ product.brandName }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>价格</th>
              <td v-for="product in selectedProducts" :key="`price-${product.id}`">
                <strong class="comparison-price">{{ priceText(product.price) }}</strong>
              </td>
            </tr>
            <tr>
              <th>分类</th>
              <td v-for="product in selectedProducts" :key="`category-${product.id}`">
                {{ product.categoryName }}
              </td>
            </tr>
            <tr v-for="row in comparisonRows" :key="row.name">
              <th>{{ row.name }}</th>
              <td v-for="product in selectedProducts" :key="`${row.name}-${product.id}`">
                {{ row.values[product.id] || '未标注' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-dialog>

  </main>
</template>

<script>
import http from '@/utils/http'
import { clearAuthSession } from '@/utils/auth'

const MAX_COMPARE = 5
const COMPARE_STORAGE_KEY = 'selectedCompareProducts'

function compareProductSnapshot(product) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    description: product.description || '',
    viewCount: product.viewCount || 0,
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    brandId: product.brandId,
    brandName: product.brandName,
    brandLogo: product.brandLogo || '',
    imageUrl: product.imageUrl || '',
    status: product.status,
    rating: product.rating || 0,
    commentCount: product.commentCount || 0,
    isFavorite: Boolean(product.isFavorite),
    specs: product.specs || []
  }
}

function readStoredCompareProducts() {
  try {
    const products = JSON.parse(sessionStorage.getItem(COMPARE_STORAGE_KEY) || '[]')
    return Array.isArray(products) ? products.slice(0, MAX_COMPARE) : []
  } catch (error) {
    return []
  }
}

function writeStoredCompareProducts(products) {
  sessionStorage.setItem(
    COMPARE_STORAGE_KEY,
    JSON.stringify(products.slice(0, MAX_COMPARE).map((product) => compareProductSnapshot(product)))
  )
}

export default {
  name: 'ProductsPage',
  data() {
    return {
      MAX_COMPARE,
      categories: [],
      brands: [],
      products: [],
      selectedProducts: readStoredCompareProducts(),
      loading: false,
      compareLoading: false,
      compareVisible: false,
      currentPage: 1,
      pageSize: 12,
      filters: {
        keyword: '',
        categoryId: '',
        brandIds: [],
        minPrice: null,
        maxPrice: null,
        sort: 'popular'
      }
    }
  },
  computed: {
    pagedProducts() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.products.slice(start, start + this.pageSize)
    },
    comparisonRows() {
      const rows = new Map()

      this.selectedProducts.forEach((product) => {
        const specs = product.specs && product.specs.length
          ? product.specs
          : this.parseSpecs(product.description)

        specs.forEach((spec) => {
          if (!rows.has(spec.name)) {
            rows.set(spec.name, { name: spec.name, values: {} })
          }
          rows.get(spec.name).values[product.id] = spec.value
        })
      })

      return Array.from(rows.values())
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
        const [categoryResponse, brandResponse, productResponse] = await Promise.all([
          http.get('/product-categories'),
          http.get('/product-brands'),
          http.get('/products')
        ])

        this.categories = categoryResponse.data.data || []
        this.brands = brandResponse.data.data || []
        this.products = productResponse.data.data || []
        this.syncStoredComparison()
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '产品数据加载失败'))
      } finally {
        this.loading = false
      }
    },
    async fetchProducts() {
      this.loading = true

      try {
        const params = {}

        Object.entries(this.filters).forEach(([key, value]) => {
          if (key === 'brandIds') {
            if (value.length) {
              params.brandIds = value.join(',')
            }
            return
          }

          if (value !== '' && value !== null && value !== undefined) {
            params[key] = value
          }
        })

        const response = await http.get('/products', { params })
        this.products = response.data.data || []
        this.syncStoredComparison()
        this.currentPage = 1
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '产品列表加载失败'))
      } finally {
        this.loading = false
      }
    },
    handleFilterChange() {
      this.fetchProducts()
    },
    resetFilters() {
      this.filters = {
        keyword: '',
        categoryId: '',
        brandIds: [],
        minPrice: null,
        maxPrice: null,
        sort: 'popular'
      }
      this.fetchProducts()
    },
    isSelected(product) {
      return this.selectedProducts.some((item) => item.id === product.id)
    },
    syncStoredComparison() {
      const restoredProducts = this.selectedProducts
        .map((selectedProduct) => {
          const freshProduct = this.products.find((product) => Number(product.id) === Number(selectedProduct.id))
          return freshProduct ? { ...selectedProduct, ...freshProduct } : selectedProduct
        })
        .filter((product, index, products) => {
          return product && product.id && products.findIndex((item) => Number(item.id) === Number(product.id)) === index
        })
        .slice(0, MAX_COMPARE)

      this.selectedProducts = restoredProducts
      this.persistComparison()
    },
    persistComparison() {
      writeStoredCompareProducts(this.selectedProducts)
    },
    toggleProduct(product) {
      const index = this.selectedProducts.findIndex((item) => item.id === product.id)

      if (index >= 0) {
        this.selectedProducts.splice(index, 1)
        this.persistComparison()
        return
      }

      if (this.selectedProducts.length >= MAX_COMPARE) {
        this.$message.warning('最多选择 5 款产品进行对比')
        return
      }

      this.selectedProducts.push(product)
      this.persistComparison()
    },
    clearComparison() {
      this.selectedProducts = []
      this.compareVisible = false
      this.persistComparison()
    },
    async openComparison() {
      if (this.selectedProducts.length < 2) {
        this.$message.warning('请至少选择 2 款产品进行对比')
        return
      }

      this.compareLoading = true

      try {
        const response = await http.get('/products/compare', {
          params: { ids: this.selectedProducts.map((product) => product.id).join(',') }
        })
        this.selectedProducts = response.data.data || []
        this.persistComparison()
        this.compareVisible = true
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '产品对比信息加载失败'))
      } finally {
        this.compareLoading = false
      }
    },
    openDetail(product) {
      this.$router.push(`/products/${product.id}`)
    },
    async toggleFavorite(product) {
      try {
        const response = product.isFavorite
          ? await http.delete(`/favorites/${product.id}`)
          : await http.post(`/favorites/${product.id}`)
        product.isFavorite = !product.isFavorite
        this.handleFavoriteChange({ productId: product.id, isFavorite: product.isFavorite })
        this.$message.success(response.data.message)
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '收藏操作失败'))
      }
    },
    handleFavoriteChange(payload) {
      const product = this.products.find((item) => item.id === payload.productId)
      const selectedProduct = this.selectedProducts.find((item) => item.id === payload.productId)

      if (product) product.isFavorite = payload.isFavorite
      if (selectedProduct) selectedProduct.isFavorite = payload.isFavorite
      this.persistComparison()
    },
    parseSpecs(description) {
      if (!description) return []

      return description
        .split(/[；;]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
          const separator = item.search(/[：:]/)

          if (separator < 0) {
            return { name: '产品说明', value: item }
          }

          return {
            name: item.slice(0, separator).trim(),
            value: item.slice(separator + 1).trim()
          }
        })
    },
    visibleSpecs(product) {
      return this.parseSpecs(product.description)
        .slice(0, 3)
        .map((spec) => `${spec.name}：${spec.value}`)
    },
    priceText(price) {
      return Number(price) > 0
        ? `¥${Number(price).toLocaleString('zh-CN')}`
        : '价格待定'
    },
    assetUrl(assetPath) {
      if (!assetPath) return ''
      if (/^https?:\/\//i.test(assetPath)) return assetPath

      const encodedPath = assetPath
        .split('/')
        .map((part) => encodeURIComponent(part))
        .join('/')

      return `http://localhost:3000/assets/${encodedPath}`
    },
    handleImageError(event) {
      event.target.style.display = 'none'
    },
    handleLogout() {
      sessionStorage.removeItem(COMPARE_STORAGE_KEY)
      clearAuthSession()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.products-page {
  background: #eef3f6;
}

.product-topbar,
.product-workspace {
  width: min(1280px, 100%);
  margin-right: auto;
  margin-left: auto;
}

.product-workspace {
  padding-bottom: 28px;
}

.product-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid #d5e0e9;
  border-radius: 6px;
  background: #fff;
}

.product-page-mark {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.product-page-mark span {
  color: #142033;
  font-size: 16px;
  font-weight: 700;
}

.product-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.product-heading,
.result-heading,
.compare-tray-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.product-heading {
  margin-bottom: 20px;
}

.product-heading p {
  margin: 0 0 6px;
  color: #168d78;
  font-size: 12px;
  font-weight: 700;
}

.product-heading h2 {
  margin: 0;
  font-size: 25px;
}

.product-heading span {
  display: block;
  margin-top: 8px;
  color: #6b7b90;
  font-size: 14px;
}

.filter-tool {
  margin-bottom: 20px;
  padding: 18px;
  border: 1px solid #d5e0e9;
  border-radius: 6px;
  background: #fff;
}

.category-filter {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5ebf0;
}

.category-filter > span {
  flex: 0 0 auto;
  color: #526277;
  font-size: 13px;
  font-weight: 700;
}

.filter-grid {
  display: grid;
  grid-template-columns: minmax(220px, 1.7fr) minmax(150px, 0.9fr) minmax(280px, 1.4fr) minmax(150px, 0.9fr) auto auto;
  gap: 10px;
}

.filter-grid .el-select,
.filter-grid .el-input-number {
  width: 100%;
}

.price-range {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.price-range span {
  color: #8a98aa;
  font-size: 12px;
}

.result-heading {
  margin-bottom: 14px;
  color: #6b7b90;
  font-size: 13px;
}

.result-heading div {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.result-heading strong {
  color: #142033;
  font-size: 22px;
}

.product-grid {
  min-height: 320px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.product-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #d8e2ea;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.product-card:hover,
.product-card.selected,
.product-card:focus-visible {
  border-color: #168d78;
  box-shadow: 0 12px 28px rgba(26, 72, 88, 0.12);
  transform: translateY(-2px);
}

.product-card:focus-visible {
  outline: 2px solid #168d78;
  outline-offset: 2px;
}

.product-image {
  position: relative;
  height: 190px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #f6f8fa;
  color: #b5c1cd;
}

.product-image img {
  position: absolute;
  inset: 12px;
  width: calc(100% - 24px);
  height: calc(100% - 24px);
  object-fit: contain;
}

.product-image span {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  padding: 3px 7px;
  border: 1px solid #d8e2ea;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.92);
  color: #526277;
  font-size: 11px;
}

.product-card-body {
  padding: 15px;
}

.product-brand,
.product-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.product-brand {
  min-height: 24px;
  color: #168d78;
  font-size: 12px;
  font-weight: 700;
}

.product-card h3 {
  height: 44px;
  margin: 8px 0 10px;
  overflow: hidden;
  color: #142033;
  font-size: 16px;
  line-height: 1.4;
}

.product-rating,
.product-card-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.product-rating {
  min-height: 24px;
  margin-bottom: 8px;
  color: #8a98aa;
  font-size: 11px;
}

.product-rating :deep(.el-rate) {
  height: 20px;
}

.product-rating :deep(.el-rate__icon) {
  margin-right: 1px;
  font-size: 14px;
}

.product-card ul {
  height: 66px;
  margin: 0 0 14px;
  padding: 0;
  overflow: hidden;
  color: #6b7b90;
  font-size: 12px;
  line-height: 1.8;
  list-style: none;
}

.product-card li {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-card-footer {
  padding-top: 12px;
  border-top: 1px solid #e8edf1;
}

.product-card-footer strong,
.comparison-price {
  color: #d85040;
  font-size: 17px;
}

.product-card-actions {
  flex: 0 0 auto;
}

.product-card-actions .el-button {
  margin-left: 0;
}

.product-pagination {
  justify-content: center;
  margin-top: 24px;
}

.has-compare-tray {
  padding-bottom: 118px;
}

.compare-tray {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  padding: 12px 28px;
  border-top: 1px solid #cad8e3;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 -10px 30px rgba(32, 62, 88, 0.1);
}

.compare-tray-inner {
  width: min(1280px, 100%);
  margin: 0 auto;
}

.compare-summary {
  flex: 0 0 auto;
  display: grid;
  gap: 3px;
}

.compare-summary span {
  color: #718096;
  font-size: 11px;
}

.compare-slots {
  min-width: 0;
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, minmax(90px, 1fr));
  gap: 8px;
}

.compare-slot {
  min-width: 0;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 0 5px 0 10px;
  border: 1px solid #d7e1e9;
  border-radius: 4px;
  background: #f6f9fb;
  color: #34445a;
  font-size: 12px;
}

.compare-slot span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compare-slot.empty {
  justify-content: center;
  border-style: dashed;
  color: #a1aeba;
}

.compare-actions {
  flex: 0 0 auto;
  display: flex;
  gap: 6px;
}

.comparison-scroll {
  max-height: 74vh;
  overflow: auto;
  border: 1px solid #dce5ec;
  border-radius: 6px;
}

.comparison-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  table-layout: fixed;
}

.comparison-table th,
.comparison-table td {
  min-width: 160px;
  padding: 14px;
  border-right: 1px solid #e1e8ee;
  border-bottom: 1px solid #e1e8ee;
  color: #526277;
  font-size: 13px;
  text-align: left;
  vertical-align: top;
}

.comparison-table th:first-child {
  width: 130px;
  min-width: 130px;
  color: #142033;
  font-weight: 700;
}

.comparison-table thead th {
  background: #f5f8fa;
}

.comparison-product {
  display: grid;
  gap: 5px;
}

.comparison-product > span {
  color: #168d78;
  font-size: 11px;
}

.comparison-image {
  position: relative;
  width: 100%;
  height: 110px;
  display: grid;
  place-items: center;
  overflow: hidden;
  color: #b5c1cd;
}

.comparison-image img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@media (max-width: 1120px) {
  .filter-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .compare-summary {
    display: none;
  }
}

@media (max-width: 820px) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .compare-tray-inner {
    align-items: stretch;
    flex-direction: column;
  }

  .compare-slots {
    display: flex;
    overflow-x: auto;
  }

  .compare-slot {
    min-width: 150px;
  }

  .compare-slot.empty {
    display: none;
  }

  .compare-actions {
    justify-content: flex-end;
  }
}

@media (max-width: 620px) {
  .product-actions-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .product-actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .product-actions .el-button {
    margin-left: 0;
  }

  .product-heading,
  .category-filter,
  .result-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .category-filter {
    gap: 10px;
  }

  .filter-grid,
  .product-grid {
    grid-template-columns: 1fr;
  }

  .product-image {
    height: 220px;
  }

  .product-card h3,
  .product-card ul {
    height: auto;
  }

  .compare-tray {
    padding: 10px 18px;
  }
}
</style>

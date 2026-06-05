<template>
  <main class="account-page favorites-page">
    <header class="account-topbar">
      <div>
        <p>MY FAVORITES</p>
        <h1>我的收藏</h1>
      </div>
      <div class="account-actions">
        <el-button icon="ShoppingCart" @click="$router.push('/products')">产品挑选</el-button>
        <el-button icon="User" @click="$router.push('/user')">个人中心</el-button>
      </div>
    </header>

    <section class="workspace favorites-workspace">
      <div class="workspace-heading">
        <div>
          <p>收藏记录</p>
          <h2>感兴趣的数码产品</h2>
          <span>随时查看详情、取消收藏或加入配置对比。</span>
        </div>
        <el-button icon="Refresh" :loading="loading" @click="loadFavorites">刷新</el-button>
      </div>

      <div v-loading="loading" class="favorite-grid">
        <article
          v-for="product in favorites"
          :key="product.id"
          class="favorite-card"
          role="link"
          tabindex="0"
          @click="openDetail(product)"
          @keyup.enter="openDetail(product)"
        >
          <div class="favorite-image">
            <el-icon :size="50"><Monitor /></el-icon>
            <img v-if="product.imageUrl" :src="assetUrl(product.imageUrl)" :alt="product.name" @error="handleImageError">
          </div>
          <div>
            <span>{{ product.brandName }} · {{ product.categoryName }}</span>
            <h3>{{ product.name }}</h3>
            <strong>{{ priceText(product.price) }}</strong>
            <div class="favorite-actions">
              <el-button type="primary" plain icon="View" @click.stop="openDetail(product)">查看详情</el-button>
              <el-button type="danger" plain icon="StarFilled" @click.stop="removeFavorite(product)">取消收藏</el-button>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-if="!loading && !favorites.length" description="还没有收藏产品" />
    </section>

  </main>
</template>

<script>
import http from '@/utils/http'

export default {
  name: 'FavoritesPage',
  data() {
    return {
      favorites: [],
      loading: false
    }
  },
  mounted() {
    this.loadFavorites()
  },
  methods: {
    getErrorMessage(error, fallback) {
      const data = error.response && error.response.data
      return (data && data.message) || fallback
    },
    async loadFavorites() {
      this.loading = true

      try {
        const response = await http.get('/favorites')
        this.favorites = response.data.data || []
      } catch (error) {
        this.$message.error(this.getErrorMessage(error, '收藏列表加载失败'))
      } finally {
        this.loading = false
      }
    },
    openDetail(product) {
      this.$router.push(`/products/${product.id}`)
    },
    removeFavorite(product) {
      this.$confirm(`确认取消收藏“${product.name}”吗？`, '取消收藏')
        .then(async () => {
          const response = await http.delete(`/favorites/${product.id}`)
          this.$message.success(response.data.message)
          this.favorites = this.favorites.filter((item) => item.id !== product.id)
        })
        .catch((error) => {
          if (error !== 'cancel' && error !== 'close') {
            this.$message.error(this.getErrorMessage(error, '取消收藏失败'))
          }
        })
    },
    priceText(price) {
      return Number(price) > 0 ? `¥${Number(price).toLocaleString('zh-CN')}` : '价格待定'
    },
    assetUrl(assetPath) {
      if (/^https?:\/\//i.test(assetPath)) return assetPath
      return `http://localhost:3000/assets/${assetPath.split('/').map((part) => encodeURIComponent(part)).join('/')}`
    },
    handleImageError(event) {
      event.target.style.display = 'none'
    }
  }
}
</script>

<style scoped>
.favorites-workspace {
  width: min(1180px, 100%);
}

.favorite-grid {
  min-height: 240px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.favorite-card {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 16px;
  padding: 14px;
  border: 1px solid #dde6ee;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.favorite-card:hover,
.favorite-card:focus-visible {
  border-color: #168d78;
  box-shadow: 0 10px 24px rgba(26, 72, 88, 0.1);
  transform: translateY(-2px);
}

.favorite-card:focus-visible {
  outline: 2px solid #168d78;
  outline-offset: 2px;
}

.favorite-image {
  position: relative;
  height: 135px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 6px;
  background: #f5f8fa;
  color: #b5c1cd;
}

.favorite-image img {
  position: absolute;
  inset: 8px;
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  object-fit: contain;
}

.favorite-card span {
  color: #168d78;
  font-size: 12px;
}

.favorite-card h3 {
  min-height: 44px;
  margin: 9px 0;
  color: #142033;
  font-size: 16px;
}

.favorite-card strong {
  color: #d85040;
}

.favorite-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

@media (max-width: 820px) {
  .favorite-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .favorite-card {
    grid-template-columns: 1fr;
  }
}
</style>

const test = require('node:test')
const assert = require('node:assert/strict')

const { createApp } = require('../server')

function createProductDatabase() {
  const user = {
    user_id: 1,
    username: 'gin',
    password: '123456',
    phone: '15860827759',
    email: 'gin@example.com',
    gender: '男',
    status: 1,
    register_time: new Date('2026-06-03T00:00:00.000Z')
  }

  return {
    query(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params
        params = []
      }

      const statement = sql.replace(/\s+/g, ' ').trim()

      if (statement.includes('FROM users') && statement.includes('WHERE username = ? OR email = ?')) {
        callback(null, [user])
        return
      }

      if (statement.includes('FROM categories')) {
        callback(null, [
          { category_id: 1, category_name: '手机', description: '手机类数码产品' },
          { category_id: 2, category_name: '电脑', description: '电脑类数码产品' }
        ])
        return
      }

      if (statement.includes('FROM brands')) {
        callback(null, [
          { brand_id: 1, brand_name: '华为', logo: 'brand_icon/HUAWEI.png', country: '中国' }
        ])
        return
      }

      if (statement.includes('FROM products p')) {
        callback(null, [
          {
            product_id: 1,
            product_name: 'HUAWEI Mate 60',
            price: 4999,
            description: '处理器：麒麟9000S；电池容量：4750mAh',
            view_count: 12,
            category_id: 1,
            category_name: '手机',
            brand_id: 1,
            brand_name: '华为',
            brand_logo: 'brand_icon/HUAWEI.png',
            image_url: 'phone_image/Mate60.jpg'
          }
        ])
        return
      }

      callback(new Error(`Unexpected SQL in product test: ${statement}`))
    }
  }
}

async function withServer(app, callback) {
  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const address = server.address()

  try {
    await callback(`http://127.0.0.1:${address.port}`)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

async function request(baseUrl, route, options = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })

  return {
    response,
    body: await response.json()
  }
}

test('normal user can query product filters and enabled products', async () => {
  const app = createApp(createProductDatabase(), { jwtSecret: 'test-secret' })

  await withServer(app, async (baseUrl) => {
    const login = await request(baseUrl, '/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'gin', password: '123456' })
    })
    const headers = { Authorization: `Bearer ${login.body.data.token}` }

    const categories = await request(baseUrl, '/product-categories', { headers })
    const brands = await request(baseUrl, '/product-brands', { headers })
    const products = await request(baseUrl, '/products?categoryId=1&brandId=1&keyword=Mate', { headers })

    assert.equal(categories.response.status, 200)
    assert.equal(categories.body.data[0].name, '手机')
    assert.equal(brands.response.status, 200)
    assert.equal(brands.body.data[0].name, '华为')
    assert.equal(products.response.status, 200)
    assert.equal(products.body.data[0].name, 'HUAWEI Mate 60')
    assert.equal(products.body.data[0].imageUrl, 'phone_image/Mate60.jpg')
  })
})

test('product queries require login', async () => {
  const app = createApp(createProductDatabase(), { jwtSecret: 'test-secret' })

  await withServer(app, async (baseUrl) => {
    const products = await request(baseUrl, '/products')
    assert.equal(products.response.status, 401)
  })
})

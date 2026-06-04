const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const root = path.resolve(__dirname, '..')

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

test('normal user router exposes a protected product selection page', () => {
  const router = read('src/router/index.js')

  assert.match(router, /ProductsPage/)
  assert.match(router, /path:\s*['"]\/products['"][\s\S]*role:\s*['"]USER['"]/)
})

test('product selection loads database filters and products', () => {
  const page = read('src/components/Products.vue')

  assert.match(page, /http\.get\(['"]\/product-categories['"]\)/)
  assert.match(page, /http\.get\(['"]\/product-brands['"]\)/)
  assert.match(page, /http\.get\(['"]\/products['"]/)
})

test('product comparison accepts at most five products', () => {
  const page = read('src/components/Products.vue')

  assert.match(page, /MAX_COMPARE\s*=\s*5/)
  assert.match(page, /最多选择 5 款产品/)
  assert.match(page, /selectedProducts/)
})

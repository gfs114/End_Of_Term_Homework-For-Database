const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

test('server.js exports an application factory for route testing', () => {
  const serverPath = path.join(__dirname, '..', 'server.js')
  const source = fs.readFileSync(serverPath, 'utf8')

  assert.match(source, /function createApp\s*\(/)
  assert.match(source, /module\.exports\s*=\s*\{[^}]*createApp/s)
})

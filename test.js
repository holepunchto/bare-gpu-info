const test = require('brittle')
const GPUInfo = require('.')
const { constants } = GPUInfo

const driverKeys = [
  'vulkan',
  'opencl',
  'opengl',
  'webgpu',
  'metal',
  'direct3d11',
  'direct3d12',
  'cuda',
  'levelZero',
  'rocm'
]

test('drivers', (t) => {
  using info = new GPUInfo()

  const drivers = info.drivers()

  for (const key of driverKeys) {
    t.is(typeof drivers[key], 'boolean', key)
  }
})

test('length', (t) => {
  using info = new GPUInfo()

  t.ok(Number.isInteger(info.length))
  t.ok(info.length >= 0)
})

test('gpu', (t) => {
  using info = new GPUInfo()

  t.comment(`${info.length} GPU(s)`)

  for (let i = 0; i < info.length; i++) {
    const gpu = info.gpu(i)

    t.comment(gpu)

    for (const key of ['name', 'vendor', 'driverName', 'driverVersion']) {
      t.ok(gpu[key] === null || typeof gpu[key] === 'string', `${key} is a string or null`)
    }

    t.ok(Object.values(constants.gpuType).includes(gpu.type), 'known type')

    for (const key of ['vendorId', 'deviceId', 'subsystemId', 'memory']) {
      t.ok(
        gpu[key] === undefined || typeof gpu[key] === 'number',
        `${key} is a number or undefined`
      )
    }

    t.is(typeof gpu.revision, 'number')
    t.is(typeof gpu.unifiedMemory, 'boolean')

    for (const key of driverKeys) {
      t.is(typeof gpu.drivers[key], 'boolean', key)
    }
  }
})

test('gpus', (t) => {
  using info = new GPUInfo()

  const gpus = info.gpus()

  t.ok(Array.isArray(gpus))
  t.is(gpus.length, info.length)
})

test('sample', (t) => {
  using info = new GPUInfo()

  for (let i = 0; i < info.length; i++) {
    const usage = info.sample(i)

    t.comment(usage)

    for (const key of [
      'compute',
      'encode',
      'decode',
      'power',
      'temperature',
      'memoryUsed',
      'memoryTotal'
    ]) {
      t.ok(usage[key] === undefined || typeof usage[key] === 'number', key)
    }
  }
})

test('iterator', (t) => {
  using info = new GPUInfo()

  let n = 0

  for (const gpu of info) {
    t.ok(gpu.name === null || typeof gpu.name === 'string', 'name is a string or null')
    n++
  }

  t.is(n, info.length)
})

test('gpu index out of range', (t) => {
  using info = new GPUInfo()

  t.exception.all(() => info.gpu(info.length))
  t.exception.all(() => info.gpu(-1))
  t.exception.all(() => info.gpu(0.5))
  t.exception.all(() => info.gpu('0'))
})

test('sample index out of range', (t) => {
  using info = new GPUInfo()

  t.exception.all(() => info.sample(info.length))
  t.exception.all(() => info.sample(-1))
})

test('destroy is idempotent', (t) => {
  const info = new GPUInfo()

  info.destroy()
  info.destroy()

  t.pass()
})

test('use after destroy throws', (t) => {
  const info = new GPUInfo()

  info.destroy()

  t.exception(() => info.drivers())
  t.exception(() => info.length)
})

test('disposes with a using declaration', (t) => {
  let length

  {
    using info = new GPUInfo()

    length = info.length
  }

  t.ok(Number.isInteger(length), 'queried before disposal')
})

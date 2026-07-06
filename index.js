const binding = require('./binding')
const constants = require('./lib/constants')

module.exports = exports = class GPUInfo {
  constructor() {
    this._destroyed = false

    binding.init(this)
  }

  get length() {
    this._check()

    return binding.count(this)
  }

  drivers() {
    this._check()

    return binding.drivers(this)
  }

  gpu(index) {
    this._check()

    validateIndex(index, this.length)

    return normalizeGpu(binding.query(this, index))
  }

  gpus() {
    this._check()

    const result = []

    for (let i = 0, n = this.length; i < n; i++) {
      result.push(normalizeGpu(binding.query(this, i)))
    }

    return result
  }

  sample(index) {
    this._check()

    validateIndex(index, this.length)

    return normalizeUsage(binding.sample(this, index))
  }

  destroy() {
    if (this._destroyed) return

    this._destroyed = true

    binding.destroy(this)
  }

  [Symbol.dispose]() {
    this.destroy()
  }

  *[Symbol.iterator]() {
    this._check()

    for (let i = 0, n = this.length; i < n; i++) {
      yield normalizeGpu(binding.query(this, i))
    }
  }

  _check() {
    if (this._destroyed) {
      throw new Error('GPU information has been destroyed')
    }
  }
}

exports.GPUInfo = exports

exports.constants = constants

// The library reports an unknown string as empty; surface those as `null` so
// consumers can distinguish "unknown" from a genuine empty value.
function normalizeGpu(gpu) {
  for (const key of ['name', 'vendor', 'driverName', 'driverVersion']) {
    if (gpu[key] === '') gpu[key] = null
  }

  return gpu
}

// The library reports an unavailable metric as a negative value; surface those
// as `undefined` so consumers can distinguish "unsupported" from a genuine `0`.
function normalizeUsage(usage) {
  for (const key of ['compute', 'encode', 'decode', 'power', 'temperature']) {
    if (usage[key] < 0) usage[key] = undefined
  }

  return usage
}

function validateIndex(index, length) {
  if (!Number.isInteger(index)) {
    throw new TypeError(`Index must be an integer. Received type ${typeof index} (${index})`)
  }

  if (index < 0 || index >= length) {
    throw new RangeError(`Index ${index} out of range [0, ${length})`)
  }
}

# bare-gpu-info

<https://github.com/holepunchto/libgpuinfo> bindings for Bare. Enumerates the GPUs available on the system and reports static device information, detected graphics drivers, and runtime utilization.

```
npm i bare-gpu-info
```

## Usage

```js
const GPUInfo = require('bare-gpu-info')

const info = new GPUInfo()

console.log(info.drivers()) // { vulkan: true, metal: true, ... }

for (const gpu of info) {
  console.log(gpu.name, gpu.vendor, gpu.type)
}

const usage = info.sample(0)

console.log(usage.compute) // Fraction in [0, 1], or `undefined` if unavailable

info.destroy()
```

## API

#### `const info = new GPUInfo()`

Initialize a query context. The context enumerates the available devices and detects the supported drivers up front, and additionally retains the state needed to compute utilization as a delta between successive samples.

Call `info.destroy()` when done to release the context. The context is also released automatically when garbage collected.

#### `info.length`

The number of GPUs enumerated in the system.

#### `info.drivers()`

Get the graphics APIs for which a local driver was detected on the system, returned as an object of booleans:

```js
drivers = {
  vulkan: boolean, // Vulkan
  opencl: boolean, // OpenCL
  opengl: boolean, // OpenGL, including OpenGL ES via EGL
  webgpu: boolean, // WebGPU, via a native Dawn or wgpu implementation
  metal: boolean, // Apple Metal, only available on macOS
  direct3d11: boolean, // Direct3D 11, only available on Windows
  direct3d12: boolean, // Direct3D 12, only available on Windows
  cuda: boolean, // NVIDIA CUDA
  levelZero: boolean, // Intel oneAPI Level Zero
  rocm: boolean // AMD ROCm/HIP
}
```

#### `const gpu = info.gpu(index)`

Get static information about the GPU at `index`, where `index` is in the range `[0, info.length)`. The values are static for the lifetime of the process and describe the hardware rather than its current load. Throws a `RangeError` if `index` is out of range.

```js
gpu = {
  name: string | null, // Human-readable model name, `null` if unknown
  vendor: string | null, // Human-readable vendor name, `null` if unknown
  driverName: string | null, // Kernel driver bound to the device, e.g. 'amdgpu' (Linux only), `null` if unknown
  driverVersion: string | null, // Driver software version, `null` if unknown
  type: number, // The device category, as a value of `constants.gpuType`
  drivers: object, // The graphics APIs the device can be driven by, as in `info.drivers()`
  vendorId: number, // PCI vendor identifier, e.g. `0x10de` for NVIDIA, `0` if unknown
  deviceId: number, // PCI device identifier, `0` if unknown
  subsystemId: number, // PCI subsystem identifier, `0` if unknown
  revision: number, // PCI revision, `0` if unknown
  unifiedMemory: boolean, // Whether the device shares a unified memory space with the CPU
  memory: number // Total video memory in bytes, `0` if unknown
}
```

#### `const gpus = info.gpus()`

Get static information about all enumerated GPUs, returned as an array. Equivalent to calling `info.gpu(index)` for every `index`.

#### `const usage = info.sample(index)`

Sample the runtime utilization of the GPU at `index`, where `index` is in the range `[0, info.length)`. Throws a `RangeError` if `index` is out of range.

```js
usage = {
  compute: number | undefined, // Fraction of compute capacity in use, in [0, 1]
  encode: number | undefined, // Fraction of video encode capacity in use, in [0, 1]
  decode: number | undefined, // Fraction of video decode capacity in use, in [0, 1]
  memoryUsed: number, // Memory currently in use, in bytes
  memoryTotal: number, // Total memory available to the device, in bytes, `0` if unknown
  power: number | undefined, // Instantaneous power draw, in watts
  temperature: number | undefined // Device temperature, in degrees Celsius
}
```

Metrics that could not be determined on the current platform are reported as `undefined`.

#### `info.destroy()`

Destroy the query context. Safe to call more than once. Any subsequent use of the context throws.

The class also implements `Symbol.dispose`, so it can be scoped to a `using` declaration and destroyed automatically:

```js
using info = new GPUInfo()

console.log(info.drivers())
```

#### `for (const gpu of info) { ... }`

`GPUInfo` is iterable, yielding the static information for each enumerated GPU in turn.

#### `GPUInfo.constants`

```js
constants = {
  gpuType: { UNKNOWN, INTEGRATED, DEDICATED, VIRTUAL, EXTERNAL }
}
```

## License

Apache-2.0

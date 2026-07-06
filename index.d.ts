import constants from './lib/constants'

export interface Drivers {
  vulkan: boolean
  opencl: boolean
  opengl: boolean
  webgpu: boolean
  metal: boolean
  direct3d11: boolean
  direct3d12: boolean
  cuda: boolean
  levelZero: boolean
  rocm: boolean
}

export type GPUType = (typeof constants.gpuType)[keyof typeof constants.gpuType]

export interface GPU {
  name: string | null
  vendor: string | null
  driverName: string | null
  driverVersion: string | null
  type: GPUType
  drivers: Drivers
  vendorId: number
  deviceId: number
  subsystemId: number
  revision: number
  unifiedMemory: boolean
  memory: number
}

export interface Usage {
  compute: number | undefined
  encode: number | undefined
  decode: number | undefined
  memoryUsed: number
  memoryTotal: number
  power: number | undefined
  temperature: number | undefined
}

export class GPUInfo implements Iterable<GPU> {
  constructor()

  readonly length: number

  drivers(): Drivers

  gpu(index: number): GPU

  gpus(): GPU[]

  sample(index: number): Usage

  destroy(): void

  [Symbol.dispose](): void

  [Symbol.iterator](): Iterator<GPU>

  static readonly constants: typeof constants
}

export default GPUInfo

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const mockRef = vi.fn(() => ({}))
const mockChild = vi.fn(() => ({}))
const mockGet = vi.fn()

vi.mock('~/services/firebase/config', () => ({
  config: {},
}))

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}))

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(() => ({})),
  ref: (...args) => mockRef(...args),
  child: (...args) => mockChild(...args),
  get: (...args) => mockGet(...args),
  off: vi.fn(),
  onValue: vi.fn(),
  remove: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
}))

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  getDownloadURL: vi.fn(),
  getBlob: vi.fn(),
  deleteObject: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
}))

let getDataOnce

beforeAll(async () => {
  ({ getDataOnce } = await import('./api'))
})

describe('getDataOnce', () => {
  beforeEach(() => {
    mockRef.mockClear()
    mockChild.mockClear()
    mockGet.mockReset()
  })

  it('resolves the snapshot value when data exists', async () => {
    const value = { foo: 'bar' }
    mockGet.mockResolvedValue({
      exists: () => true,
      val: () => value,
    })

    await expect(getDataOnce('path/to/data')).resolves.toEqual(value)
    expect(mockRef).toHaveBeenCalled()
    expect(mockChild).toHaveBeenCalled()
  })

  it('returns false when the snapshot does not exist', async () => {
    mockGet.mockResolvedValue({
      exists: () => false,
    })

    await expect(getDataOnce('path/to/missing')).resolves.toBe(false)
  })

  it('rejects when firebase get throws an error', async () => {
    const error = new Error('boom')
    mockGet.mockRejectedValue(error)

    await expect(getDataOnce('path/to/error')).rejects.toThrow('boom')
  })
})

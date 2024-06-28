import { describe, expect, it } from 'bun:test'
import { convertStringToPtr } from '../src/utils'

describe('convertStringToPtr', () => {
  it('should convert a string to a null-terminated pointer', () => {
    const str = 'Hello, World!'
    const expected = Buffer.from('Hello, World!\x00')

    const result = convertStringToPtr(str)

    expect(result).toEqual(expected)
  })
})

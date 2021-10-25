import { ChainId } from '../enums/ChainId'
import { Token } from './Token'

describe('Token', () => {
  const ADDRESS_ONE = 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaae54pwdts6'
  const ADDRESS_ONE_TESTNET = 'cfxtest:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaevv9cffm0'
  const ADDRESS_TWO = 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaajuse7n5fu'

  describe('#constructor', () => {
    it('fails with invalid address', () => {
      expect(() => new Token(ChainId.TETHYS, '0xhello00000000000000000000000000000000002', 18).address).toThrow(
        '0xhello00000000000000000000000000000000002 is not a valid address'
      )
    })
    it('fails with negative decimals', () => {
      expect(() => new Token(ChainId.TETHYS, ADDRESS_ONE, -1).address).toThrow('DECIMALS')
    })
    it('fails with 256 decimals', () => {
      expect(() => new Token(ChainId.TETHYS, ADDRESS_ONE, 256).address).toThrow('DECIMALS')
    })
    it('fails with non-integer decimals', () => {
      expect(() => new Token(ChainId.TETHYS, ADDRESS_ONE, 1.5).address).toThrow('DECIMALS')
    })
  })

  describe('#equals', () => {
    it('fails if address differs', () => {
      expect(new Token(ChainId.TETHYS, ADDRESS_ONE, 18).equals(new Token(ChainId.TETHYS, ADDRESS_TWO, 18))).toBe(false)
    })

    it('false if chain id differs', () => {
      expect(
        new Token(ChainId.TETHYS, ADDRESS_ONE, 18).equals(new Token(ChainId.TESTNET, ADDRESS_ONE_TESTNET, 18))
      ).toBe(false)
    })

    it('true if only decimals differs', () => {
      expect(new Token(ChainId.TETHYS, ADDRESS_ONE, 9).equals(new Token(ChainId.TETHYS, ADDRESS_ONE, 18))).toBe(true)
    })

    it('true if address is the same', () => {
      expect(new Token(ChainId.TETHYS, ADDRESS_ONE, 18).equals(new Token(ChainId.TETHYS, ADDRESS_ONE, 18))).toBe(true)
    })

    it('true on reference equality', () => {
      const token = new Token(ChainId.TETHYS, ADDRESS_ONE, 18)
      expect(token.equals(token)).toBe(true)
    })

    it('true even if name/symbol/decimals differ', () => {
      const tokenA = new Token(ChainId.TETHYS, ADDRESS_ONE, 9, 'abc', 'def')
      const tokenB = new Token(ChainId.TETHYS, ADDRESS_ONE, 18, 'ghi', 'jkl')
      expect(tokenA.equals(tokenB)).toBe(true)
    })
  })
})

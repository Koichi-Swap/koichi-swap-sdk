import { ChainId } from '../enums/ChainId'
import { Conflux } from './Conflux'
import { Token } from './Token'

describe('Currency', () => {
  const ADDRESS_ZERO = 'cfx:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0sfbnjm2'
  const ADDRESS_ONE = 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaae54pwdts6'

  const t0 = new Token(ChainId.TETHYS, ADDRESS_ZERO, 18)
  const t1 = new Token(ChainId.TETHYS, ADDRESS_ONE, 18)

  describe('#equals', () => {
    it('ether on same chains is ether', () => {
      expect(Conflux.onChain(ChainId.TETHYS).equals(Conflux.onChain(ChainId.TETHYS)))
    })
    it('ether is not token0', () => {
      expect(Conflux.onChain(ChainId.TETHYS).equals(t0)).toStrictEqual(false)
    })
    it('token1 is not token0', () => {
      expect(t1.equals(t0)).toStrictEqual(false)
    })
    it('token0 is token0', () => {
      expect(t0.equals(t0)).toStrictEqual(true)
    })
    it('token0 is equal to another token0', () => {
      expect(t0.equals(new Token(ChainId.TETHYS, ADDRESS_ZERO, 18, 'symbol', 'name'))).toStrictEqual(true)
    })
  })
})

import { Token } from './Token'
import { NativeCurrency } from '../entities/NativeCurrency'
import { Currency } from '../entities/Currency'
import { ChainId } from '../enums'

describe('AbstractCurrency', () => {
  const ADDRESS_ONE = 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaae54pwdts6'

  describe('#serialize', () => {
    it('renders string of address for Token', () => {
      const token = new Token(ChainId.TETHYS, ADDRESS_ONE, 3)
      expect(token.serialize()).toEqual(ADDRESS_ONE)
    })

    it('renders string of address for NativeCurrency', () => {
      class MoonBeam extends NativeCurrency {
        constructor(chainId: number) {
          super(chainId, 18)
        }
        equals(other: Currency): boolean {
          return other.isNative && other.chainId === this.chainId
        }
        get wrapped(): Token {
          return new Token(ChainId.TETHYS, ADDRESS_ONE, 18)
        }
      }
      expect(new MoonBeam(ChainId.TETHYS).serialize()).toEqual(ADDRESS_ONE)
    })
  })
})

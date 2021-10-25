import { CurrencyAmount } from './CurrencyAmount'
import { Conflux } from './Conflux'
import { MaxUint256 } from '../constants'
import { Percent } from './Percent'
import { Token } from './Token'
import { NativeCurrency } from './NativeCurrency'
import { Currency } from './Currency'
import { ChainId } from '../enums'
import { BigNumber } from 'ethers'

describe('CurrencyAmount', () => {
  const ADDRESS_ONE = 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaae54pwdts6'

  describe('constructor', () => {
    it('works', () => {
      const token = new Token(ChainId.TETHYS, ADDRESS_ONE, 18)
      const amount = CurrencyAmount.fromRawAmount(token, 100)
      expect(amount.quotient).toEqual(BigNumber.from(100))
    })
  })

  describe('#quotient', () => {
    it('returns the amount after multiplication', () => {
      const token = new Token(ChainId.TETHYS, ADDRESS_ONE, 18)
      const amount = CurrencyAmount.fromRawAmount(token, 100).multiply(new Percent(15, 100))
      expect(amount.quotient).toEqual(BigNumber.from(15))
    })
  })

  describe('#ether', () => {
    it('produces ether amount', () => {
      const amount = CurrencyAmount.fromRawAmount(Conflux.onChain(ChainId.TETHYS), 100)
      expect(amount.quotient).toEqual(BigNumber.from(100))
      expect(amount.currency).toEqual(Conflux.onChain(ChainId.TETHYS))
    })
  })

  it('token amount can be max uint256', () => {
    const amount = CurrencyAmount.fromRawAmount(new Token(ChainId.TETHYS, ADDRESS_ONE, 18), MaxUint256)
    expect(amount.quotient).toEqual(MaxUint256)
  })
  it('token amount cannot exceed max uint256', () => {
    expect(() =>
      CurrencyAmount.fromRawAmount(new Token(ChainId.TETHYS, ADDRESS_ONE, 18), MaxUint256.add(BigNumber.from(1)))
    ).toThrow('AMOUNT')
  })
  it('token amount quotient cannot exceed max uint256', () => {
    expect(() =>
      CurrencyAmount.fromFractionalAmount(
        new Token(ChainId.TETHYS, ADDRESS_ONE, 18),
        MaxUint256.mul(BigNumber.from(2)).add(BigNumber.from(2)),
        BigNumber.from(2)
      )
    ).toThrow('AMOUNT')
  })
  it('token amount numerator can be gt. uint256 if denominator is gt. 1', () => {
    const amount = CurrencyAmount.fromFractionalAmount(
      new Token(ChainId.TETHYS, ADDRESS_ONE, 18),
      MaxUint256.add(BigNumber.from(2)),
      2
    )
    expect(amount.numerator).toEqual(BigNumber.from(2).add(MaxUint256))
  })

  describe('#toFixed', () => {
    it('throws for decimals > currency.decimals', () => {
      const token = new Token(ChainId.TETHYS, ADDRESS_ONE, 0)
      const amount = CurrencyAmount.fromRawAmount(token, 1000)
      expect(() => amount.toFixed(3)).toThrow('DECIMALS')
    })
    it('is correct for 0 decimals', () => {
      const token = new Token(ChainId.TETHYS, ADDRESS_ONE, 0)
      const amount = CurrencyAmount.fromRawAmount(token, 123456)
      expect(amount.toFixed(0)).toEqual('123456')
    })
    it('is correct for 18 decimals', () => {
      const token = new Token(ChainId.TETHYS, ADDRESS_ONE, 18)
      const amount = CurrencyAmount.fromRawAmount(token, 1e15)
      expect(amount.toFixed(9)).toEqual('0.001000000')
    })
  })

  describe('#toSignificant', () => {
    it('does not throw for sig figs > currency.decimals', () => {
      const token = new Token(ChainId.TETHYS, ADDRESS_ONE, 0)
      const amount = CurrencyAmount.fromRawAmount(token, 1000)
      expect(amount.toSignificant(3)).toEqual('1000')
    })
    it('is correct for 0 decimals', () => {
      const token = new Token(ChainId.TETHYS, ADDRESS_ONE, 0)
      const amount = CurrencyAmount.fromRawAmount(token, 123456)
      expect(amount.toSignificant(4)).toEqual('123400')
    })
    it('is correct for 18 decimals', () => {
      const token = new Token(ChainId.TETHYS, ADDRESS_ONE, 18)
      const amount = CurrencyAmount.fromRawAmount(token, 1e15)
      expect(amount.toSignificant(9)).toEqual('0.001')
    })
  })

  describe('#toExact', () => {
    it('does not throw for sig figs > currency.decimals', () => {
      const token = new Token(ChainId.TETHYS, ADDRESS_ONE, 0)
      const amount = CurrencyAmount.fromRawAmount(token, 1000)
      expect(amount.toExact()).toEqual('1000')
    })
    it('is correct for 0 decimals', () => {
      const token = new Token(ChainId.TETHYS, ADDRESS_ONE, 0)
      const amount = CurrencyAmount.fromRawAmount(token, 123456)
      expect(amount.toExact()).toEqual('123456')
    })
    it('is correct for 18 decimals', () => {
      const token = new Token(ChainId.TETHYS, ADDRESS_ONE, 18)
      const amount = CurrencyAmount.fromRawAmount(token, 123e13)
      expect(amount.toExact()).toEqual('0.00123')
    })
  })

  describe('#serialize', () => {
    it('renders string with address and amount for Token', () => {
      const token = new Token(ChainId.TETHYS, ADDRESS_ONE, 3, 'MOONBEAM')
      const amount = CurrencyAmount.fromRawAmount(token, 123456)
      expect(amount.serialize()).toEqual(`[${ADDRESS_ONE} - 123.456]`)
    })

    it('renders string with address and amount for NativeCurrency', () => {
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
      const amount = CurrencyAmount.fromRawAmount(new MoonBeam(ChainId.TETHYS), 4234)
      expect(amount.serialize()).toEqual(`[${ADDRESS_ONE} - 0.000000000000004234]`)
    })
  })
})

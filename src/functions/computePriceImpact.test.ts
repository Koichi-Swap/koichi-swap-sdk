import { CurrencyAmount, Conflux, Percent, Price, Token } from '../entities'
import { ChainId } from '../enums'
import { computePriceImpact } from './computePriceImpact'

describe('#computePriceImpact', () => {
  const ADDRESS_ZERO = 'cfx:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0sfbnjm2'
  const ADDRESS_ONE = 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaae54pwdts6'

  const t0 = new Token(ChainId.TETHYS, ADDRESS_ZERO, 18)
  const t1 = new Token(ChainId.TETHYS, ADDRESS_ONE, 18)

  it('is correct for zero', () => {
    expect(
      computePriceImpact(
        new Price(Conflux.onChain(ChainId.TETHYS), t0, 10, 100),
        CurrencyAmount.fromRawAmount(Conflux.onChain(ChainId.TETHYS), 10),
        CurrencyAmount.fromRawAmount(t0, 100)
      )
    ).toEqual(new Percent(0, 10000))
  })
  it('is correct for half output', () => {
    expect(
      computePriceImpact(
        new Price(t0, t1, 10, 100),
        CurrencyAmount.fromRawAmount(t0, 10),
        CurrencyAmount.fromRawAmount(t1, 50)
      )
    ).toEqual(new Percent(5000, 10000))
  })
  it('is negative for more output', () => {
    expect(
      computePriceImpact(
        new Price(t0, t1, 10, 100),
        CurrencyAmount.fromRawAmount(t0, 10),
        CurrencyAmount.fromRawAmount(t1, 200)
      )
    ).toEqual(new Percent(-10000, 10000))
  })
})

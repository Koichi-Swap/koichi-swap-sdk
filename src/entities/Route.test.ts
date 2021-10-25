import { CurrencyAmount, Conflux, Pair, Route, Token } from './index'

import { WCFX } from '../constants'
import { ChainId } from '../enums'

describe('Route', () => {
  const CONFLUX = Conflux.onChain(ChainId.TETHYS)
  const token0 = new Token(ChainId.TETHYS, 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaae54pwdts6', 18, 't0')
  const token1 = new Token(ChainId.TETHYS, 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaajuse7n5fu', 18, 't1')
  const lpToken = new Token(ChainId.TETHYS, 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaapsc52y15y', 18, 'lp')
  const wcfx = WCFX[ChainId.TETHYS]
  const pair_0_1 = new Pair(lpToken, CurrencyAmount.fromRawAmount(token0, '100'), CurrencyAmount.fromRawAmount(token1, '200'))
  const pair_0_wcfx = new Pair(lpToken, CurrencyAmount.fromRawAmount(token0, '100'), CurrencyAmount.fromRawAmount(wcfx, '100'))
  const pair_1_wcfx = new Pair(lpToken, CurrencyAmount.fromRawAmount(token1, '175'), CurrencyAmount.fromRawAmount(wcfx, '100'))

  it('constructs a path from the tokens', () => {
    const route = new Route([pair_0_1], token0, token1)
    expect(route.pairs).toEqual([pair_0_1])
    expect(route.path).toEqual([token0, token1])
    expect(route.input).toEqual(token0)
    expect(route.output).toEqual(token1)
    expect(route.chainId).toEqual(ChainId.TETHYS)
  })

  it('can have a token as both input and output', () => {
    const route = new Route([pair_0_wcfx, pair_0_1, pair_1_wcfx], wcfx, wcfx)
    expect(route.pairs).toEqual([pair_0_wcfx, pair_0_1, pair_1_wcfx])
    expect(route.input).toEqual(wcfx)
    expect(route.output).toEqual(wcfx)
  })

  it('supports CONFLUX input', () => {
    const route = new Route([pair_0_wcfx], CONFLUX, token0)
    expect(route.pairs).toEqual([pair_0_wcfx])
    expect(route.input).toEqual(CONFLUX)
    expect(route.output).toEqual(token0)
  })

  it('supports CONFLUX output', () => {
    const route = new Route([pair_0_wcfx], token0, CONFLUX)
    expect(route.pairs).toEqual([pair_0_wcfx])
    expect(route.input).toEqual(token0)
    expect(route.output).toEqual(CONFLUX)
  })
})

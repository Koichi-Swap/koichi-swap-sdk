import { CurrencyAmount, Conflux, Pair, Percent, Price, Route, Token, Trade } from '.'

import { ChainId, TradeType } from '../enums'
import { WCFX } from '../constants'
import { BigNumber } from 'ethers'

describe('Trade', () => {
  const CONFLUX = Conflux.onChain(ChainId.TETHYS)
  const token0 = new Token(ChainId.TETHYS, 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaae54pwdts6', 18, 't0')
  const token1 = new Token(ChainId.TETHYS, 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaajuse7n5fu', 18, 't1')
  const token2 = new Token(ChainId.TETHYS, 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaapsc52y15y', 18, 't2')
  const token3 = new Token(ChainId.TETHYS, 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj', 18, 't3')
  const lpToken = new Token(ChainId.TETHYS, 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaay2dnge0rp', 18, 'lp')

  const pair_0_1 = new Pair(
    lpToken,
    CurrencyAmount.fromRawAmount(token0, BigNumber.from(1000)),
    CurrencyAmount.fromRawAmount(token1, BigNumber.from(1000))
  )
  const pair_0_2 = new Pair(
    lpToken,
    CurrencyAmount.fromRawAmount(token0, BigNumber.from(1000)),
    CurrencyAmount.fromRawAmount(token2, BigNumber.from(1100))
  )
  const pair_0_3 = new Pair(
    lpToken,
    CurrencyAmount.fromRawAmount(token0, BigNumber.from(1000)),
    CurrencyAmount.fromRawAmount(token3, BigNumber.from(900))
  )
  const pair_1_2 = new Pair(
    lpToken,
    CurrencyAmount.fromRawAmount(token1, BigNumber.from(1200)),
    CurrencyAmount.fromRawAmount(token2, BigNumber.from(1000))
  )
  const pair_1_3 = new Pair(
    lpToken,
    CurrencyAmount.fromRawAmount(token1, BigNumber.from(1200)),
    CurrencyAmount.fromRawAmount(token3, BigNumber.from(1300))
  )

  const pair_weth_0 = new Pair(
    lpToken,
    CurrencyAmount.fromRawAmount(WCFX[ChainId.TETHYS], BigNumber.from(1000)),
    CurrencyAmount.fromRawAmount(token0, BigNumber.from(1000))
  )

  const empty_pair_0_1 = new Pair(
    lpToken,
    CurrencyAmount.fromRawAmount(token0, BigNumber.from(0)),
    CurrencyAmount.fromRawAmount(token1, BigNumber.from(0))
  )

  it('can be constructed with CONFLUX as input', () => {
    const trade = new Trade(
      new Route([pair_weth_0], CONFLUX, token0),
      CurrencyAmount.fromRawAmount(Conflux.onChain(ChainId.TETHYS), BigNumber.from(100)),
      TradeType.EXACT_INPUT
    )
    expect(trade.inputAmount.currency).toEqual(CONFLUX)
    expect(trade.outputAmount.currency).toEqual(token0)
  })

  it('can be constructed with CONFLUX as output for exact input', () => {
    const trade = new Trade(
      new Route([pair_weth_0], token0, CONFLUX),
      CurrencyAmount.fromRawAmount(token0, BigNumber.from(100)),
      TradeType.EXACT_INPUT
    )
    expect(trade.inputAmount.currency).toEqual(token0)
    expect(trade.outputAmount.currency).toEqual(CONFLUX)
  })

  describe('#bestTradeExactIn', () => {
    it('throws with empty pairs', () => {
      expect(() =>
        Trade.bestTradeExactIn([], CurrencyAmount.fromRawAmount(token0, BigNumber.from(100)), token2)
      ).toThrow('PAIRS')
    })
    it('throws with max hops of 0', () => {
      expect(() =>
        Trade.bestTradeExactIn([pair_0_2], CurrencyAmount.fromRawAmount(token0, BigNumber.from(100)), token2, {
          maxHops: 0,
        })
      ).toThrow('MAX_HOPS')
    })

    it('provides best route', () => {
      const result = Trade.bestTradeExactIn(
        [pair_0_1, pair_0_2, pair_1_2],
        CurrencyAmount.fromRawAmount(token0, BigNumber.from(100)),
        token2
      )
      expect(result).toHaveLength(2)
      expect(result[0].route.pairs).toHaveLength(1) // 0 -> 2 at 10:11
      expect(result[0].route.path).toEqual([token0, token2])
      expect(result[0].inputAmount).toEqual(CurrencyAmount.fromRawAmount(token0, BigNumber.from(100)))
      expect(result[0].outputAmount).toEqual(CurrencyAmount.fromRawAmount(token2, BigNumber.from(99)))
      expect(result[1].route.pairs).toHaveLength(2) // 0 -> 1 -> 2 at 12:12:10
      expect(result[1].route.path).toEqual([token0, token1, token2])
      expect(result[1].inputAmount).toEqual(CurrencyAmount.fromRawAmount(token0, BigNumber.from(100)))
      expect(result[1].outputAmount).toEqual(CurrencyAmount.fromRawAmount(token2, BigNumber.from(69)))
    })

    it('doesnt throw for zero liquidity pairs', () => {
      expect(
        Trade.bestTradeExactIn([empty_pair_0_1], CurrencyAmount.fromRawAmount(token0, BigNumber.from(100)), token1)
      ).toHaveLength(0)
    })

    it('respects maxHops', () => {
      const result = Trade.bestTradeExactIn(
        [pair_0_1, pair_0_2, pair_1_2],
        CurrencyAmount.fromRawAmount(token0, BigNumber.from(10)),
        token2,
        { maxHops: 1 }
      )
      expect(result).toHaveLength(1)
      expect(result[0].route.pairs).toHaveLength(1) // 0 -> 2 at 10:11
      expect(result[0].route.path).toEqual([token0, token2])
    })

    it('insufficient input for one pair', () => {
      const result = Trade.bestTradeExactIn(
        [pair_0_1, pair_0_2, pair_1_2],
        CurrencyAmount.fromRawAmount(token0, BigNumber.from(1)),
        token2
      )
      expect(result).toHaveLength(1)
      expect(result[0].route.pairs).toHaveLength(1) // 0 -> 2 at 10:11
      expect(result[0].route.path).toEqual([token0, token2])
      expect(result[0].outputAmount).toEqual(CurrencyAmount.fromRawAmount(token2, BigNumber.from(1)))
    })

    it('respects n', () => {
      const result = Trade.bestTradeExactIn(
        [pair_0_1, pair_0_2, pair_1_2],
        CurrencyAmount.fromRawAmount(token0, BigNumber.from(10)),
        token2,
        { maxNumResults: 1 }
      )

      expect(result).toHaveLength(1)
    })

    it('no path', () => {
      const result = Trade.bestTradeExactIn(
        [pair_0_1, pair_0_3, pair_1_3],
        CurrencyAmount.fromRawAmount(token0, BigNumber.from(10)),
        token2
      )
      expect(result).toHaveLength(0)
    })

    it('works for CONFLUX currency input', () => {
      const result = Trade.bestTradeExactIn(
        [pair_weth_0, pair_0_1, pair_0_3, pair_1_3],
        CurrencyAmount.fromRawAmount(Conflux.onChain(ChainId.TETHYS), BigNumber.from(100)),
        token3
      )
      expect(result).toHaveLength(2)
      expect(result[0].inputAmount.currency).toEqual(CONFLUX)
      expect(result[0].route.path).toEqual([WCFX[ChainId.TETHYS], token0, token1, token3])
      expect(result[0].outputAmount.currency).toEqual(token3)
      expect(result[1].inputAmount.currency).toEqual(CONFLUX)
      expect(result[1].route.path).toEqual([WCFX[ChainId.TETHYS], token0, token3])
      expect(result[1].outputAmount.currency).toEqual(token3)
    })
    it('works for CONFLUX currency output', () => {
      const result = Trade.bestTradeExactIn(
        [pair_weth_0, pair_0_1, pair_0_3, pair_1_3],
        CurrencyAmount.fromRawAmount(token3, BigNumber.from(100)),
        CONFLUX
      )
      expect(result).toHaveLength(2)
      expect(result[0].inputAmount.currency).toEqual(token3)
      expect(result[0].route.path).toEqual([token3, token0, WCFX[ChainId.TETHYS]])
      expect(result[0].outputAmount.currency).toEqual(CONFLUX)
      expect(result[1].inputAmount.currency).toEqual(token3)
      expect(result[1].route.path).toEqual([token3, token1, token0, WCFX[ChainId.TETHYS]])
      expect(result[1].outputAmount.currency).toEqual(CONFLUX)
    })
  })

  describe('#maximumAmountIn', () => {
    describe('tradeType = EXACT_INPUT', () => {
      const exactIn = new Trade(
        new Route([pair_0_1, pair_1_2], token0, token2),
        CurrencyAmount.fromRawAmount(token0, BigNumber.from(100)),
        TradeType.EXACT_INPUT
      )
      it('throws if less than 0', () => {
        expect(() => exactIn.maximumAmountIn(new Percent(BigNumber.from(-1), BigNumber.from(100)))).toThrow(
          'SLIPPAGE_TOLERANCE'
        )
      })
      it('returns exact if 0', () => {
        expect(exactIn.maximumAmountIn(new Percent(BigNumber.from(0), BigNumber.from(100)))).toEqual(
          exactIn.inputAmount
        )
      })
      it('returns exact if nonzero', () => {
        expect(exactIn.maximumAmountIn(new Percent(BigNumber.from(0), BigNumber.from(100)))).toEqual(
          CurrencyAmount.fromRawAmount(token0, BigNumber.from(100))
        )
        expect(exactIn.maximumAmountIn(new Percent(BigNumber.from(5), BigNumber.from(100)))).toEqual(
          CurrencyAmount.fromRawAmount(token0, BigNumber.from(100))
        )
        expect(exactIn.maximumAmountIn(new Percent(BigNumber.from(200), BigNumber.from(100)))).toEqual(
          CurrencyAmount.fromRawAmount(token0, BigNumber.from(100))
        )
      })
    })
  })

  describe('#minimumAmountOut', () => {
    describe('tradeType = EXACT_INPUT', () => {
      const exactIn = new Trade(
        new Route([pair_0_1, pair_1_2], token0, token2),
        CurrencyAmount.fromRawAmount(token0, BigNumber.from(100)),
        TradeType.EXACT_INPUT
      )
      it('throws if less than 0', () => {
        expect(() => exactIn.minimumAmountOut(new Percent(BigNumber.from(-1), BigNumber.from(100)))).toThrow(
          'SLIPPAGE_TOLERANCE'
        )
      })
      it('returns exact if 0', () => {
        expect(exactIn.minimumAmountOut(new Percent(BigNumber.from(0), BigNumber.from(100)))).toEqual(
          exactIn.outputAmount
        )
      })
      it('returns exact if nonzero', () => {
        expect(exactIn.minimumAmountOut(new Percent(BigNumber.from(0), BigNumber.from(100)))).toEqual(
          CurrencyAmount.fromRawAmount(token2, BigNumber.from(69))
        )
        expect(exactIn.minimumAmountOut(new Percent(BigNumber.from(5), BigNumber.from(100)))).toEqual(
          CurrencyAmount.fromRawAmount(token2, BigNumber.from(65))
        )
        expect(exactIn.minimumAmountOut(new Percent(BigNumber.from(200), BigNumber.from(100)))).toEqual(
          CurrencyAmount.fromRawAmount(token2, BigNumber.from(23))
        )
      })
    })
  })

  describe('#worstExecutionPrice', () => {
    describe('tradeType = EXACT_INPUT', () => {
      const exactIn = new Trade(
        new Route([pair_0_1, pair_1_2], token0, token2),
        CurrencyAmount.fromRawAmount(token0, 100),
        TradeType.EXACT_INPUT
      )
      it('throws if less than 0', () => {
        expect(() => exactIn.minimumAmountOut(new Percent(-1, 100))).toThrow('SLIPPAGE_TOLERANCE')
      })
      it('returns exact if 0', () => {
        expect(exactIn.worstExecutionPrice(new Percent(0, 100))).toEqual(exactIn.executionPrice)
      })
      it('returns exact if nonzero', () => {
        expect(exactIn.worstExecutionPrice(new Percent(0, 100))).toEqual(new Price(token0, token2, 100, 69))
        expect(exactIn.worstExecutionPrice(new Percent(5, 100))).toEqual(new Price(token0, token2, 100, 65))
        expect(exactIn.worstExecutionPrice(new Percent(200, 100))).toEqual(new Price(token0, token2, 100, 23))
      })
    })
  })
})

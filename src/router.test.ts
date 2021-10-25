import { CurrencyAmount, Conflux, Percent, Token } from './entities'
import { Pair, Route, Trade } from './entities'

import { Router } from './router'
import { WCFX } from './constants'
import invariant from 'tiny-invariant'
import { BigNumber } from 'ethers'
import { ChainId } from './enums'

function checkDeadline(deadline: string[] | string): void {
  expect(typeof deadline).toBe('string')
  invariant(typeof deadline === 'string')
  // less than 5 seconds on the deadline
  expect(new Date().getTime() / 1000 - parseInt(deadline)).toBeLessThanOrEqual(5)
}

describe('Router', () => {
  const CONFLUX = Conflux.onChain(ChainId.TETHYS)
  const token0 = new Token(ChainId.TETHYS, 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaae54pwdts6', 18, 't0')
  const token1 = new Token(ChainId.TETHYS, 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaajuse7n5fu', 18, 't1')
  const lpToken = new Token(ChainId.TETHYS, 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaapsc52y15y', 18, 't1')

  const pair_0_1 = new Pair(
    lpToken,
    CurrencyAmount.fromRawAmount(token0, BigNumber.from(1000)),
    CurrencyAmount.fromRawAmount(token1, BigNumber.from(1000))
  )

  const pair_weth_0 = new Pair(
    lpToken,
    CurrencyAmount.fromRawAmount(WCFX[ChainId.TETHYS], '1000'),
    CurrencyAmount.fromRawAmount(token0, '1000')
  )

  describe('#swapCallParameters', () => {
    describe('exact in', () => {
      it.only('ether to token1', () => {
        const result = Router.swapCallParameters(
          Trade.exactIn(
            new Route([pair_weth_0, pair_0_1], CONFLUX, token1),
            CurrencyAmount.fromRawAmount(Conflux.onChain(ChainId.TETHYS), BigNumber.from(100))
          ),
          {
            ttl: 50,
            recipient: 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj',
            allowedSlippage: new Percent('1', '100')
          },
          ChainId.TETHYS
        )
        expect(result.methodName).toEqual('swapExactETHForTokens')
        expect(result.args.slice(0, -1)).toEqual([
          '0x51',
          [WCFX[ChainId.TETHYS].address, token0.address, token1.address],
          'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj'
        ])
        expect(result.value).toEqual('0x64')
        checkDeadline(result.args[result.args.length - 1])
      })

      it('deadline specified', () => {
        const result = Router.swapCallParameters(
          Trade.exactIn(
            new Route([pair_weth_0, pair_0_1], CONFLUX, token1),
            CurrencyAmount.fromRawAmount(Conflux.onChain(1), BigNumber.from(100))
          ),
          {
            deadline: 50,
            recipient: 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj',
            allowedSlippage: new Percent('1', '100')
          },
          ChainId.TETHYS
        )
        expect(result.methodName).toEqual('swapExactETHForTokens')
        expect(result.args).toEqual([
          '0x51',
          [WCFX[ChainId.TETHYS].address, token0.address, token1.address],
          'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj',
          '0x32'
        ])
        expect(result.value).toEqual('0x64')
      })

      it('token1 to ether', () => {
        const result = Router.swapCallParameters(
          Trade.exactIn(
            new Route([pair_0_1, pair_weth_0], token1, CONFLUX),
            CurrencyAmount.fromRawAmount(token1, BigNumber.from(100))
          ),
          {
            ttl: 50,
            recipient: 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj',
            allowedSlippage: new Percent('1', '100')
          },
          ChainId.TETHYS
        )
        expect(result.methodName).toEqual('swapExactTokensForETH')
        expect(result.args.slice(0, -1)).toEqual([
          '0x64',
          '0x51',
          [token1.address, token0.address, WCFX[ChainId.TETHYS].address],
          'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj'
        ])
        expect(result.value).toEqual('0x0')
        checkDeadline(result.args[result.args.length - 1])
      })
      it('token0 to token1', () => {
        const result = Router.swapCallParameters(
          Trade.exactIn(new Route([pair_0_1], token0, token1), CurrencyAmount.fromRawAmount(token0, BigNumber.from(100))),
          {
            ttl: 50,
            recipient: 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj',
            allowedSlippage: new Percent('1', '100')
          },
          ChainId.TETHYS
        )
        expect(result.methodName).toEqual('swapExactTokensForTokens')
        expect(result.args.slice(0, -1)).toEqual([
          '0x64',
          '0x59',
          [token0.address, token1.address],
          'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj'
        ])
        expect(result.value).toEqual('0x0')
        checkDeadline(result.args[result.args.length - 1])
      })
    })
    describe('exact out', () => {
      it('ether to token1', () => {
        const result = Router.swapCallParameters(
          Trade.exactOut(
            new Route([pair_weth_0, pair_0_1], CONFLUX, token1),
            CurrencyAmount.fromRawAmount(token1, BigNumber.from(100))
          ),
          {
            ttl: 50,
            recipient: 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj',
            allowedSlippage: new Percent('1', '100')
          },
          ChainId.TETHYS
        )
        expect(result.methodName).toEqual('swapETHForExactTokens')
        expect(result.args.slice(0, -1)).toEqual([
          '0x64',
          [WCFX[ChainId.TETHYS].address, token0.address, token1.address],
          'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj'
        ])
        expect(result.value).toEqual('0x80')
        checkDeadline(result.args[result.args.length - 1])
      })
      it('token1 to ether', () => {
        const result = Router.swapCallParameters(
          Trade.exactOut(
            new Route([pair_0_1, pair_weth_0], token1, CONFLUX),
            CurrencyAmount.fromRawAmount(Conflux.onChain(1), BigNumber.from(100))
          ),
          {
            ttl: 50,
            recipient: 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj',
            allowedSlippage: new Percent('1', '100')
          },
          ChainId.TETHYS
        )
        expect(result.methodName).toEqual('swapTokensForExactETH')
        expect(result.args.slice(0, -1)).toEqual([
          '0x64',
          '0x80',
          [token1.address, token0.address, WCFX[ChainId.TETHYS].address],
          'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj'
        ])
        expect(result.value).toEqual('0x0')
        checkDeadline(result.args[result.args.length - 1])
      })
      it('token0 to token1', () => {
        const result = Router.swapCallParameters(
          Trade.exactOut(new Route([pair_0_1], token0, token1), CurrencyAmount.fromRawAmount(token1, BigNumber.from(100))),
          {
            ttl: 50,
            recipient: 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj',
            allowedSlippage: new Percent('1', '100')
          },
          ChainId.TETHYS
        )
        expect(result.methodName).toEqual('swapTokensForExactTokens')
        expect(result.args.slice(0, -1)).toEqual([
          '0x64',
          '0x71',
          [token0.address, token1.address],
          'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj'
        ])
        expect(result.value).toEqual('0x0')
        checkDeadline(result.args[result.args.length - 1])
      })
    })
    describe('supporting fee on transfer', () => {
      describe('exact in', () => {
        it('ether to token1', () => {
          const result = Router.swapCallParameters(
            Trade.exactIn(
              new Route([pair_weth_0, pair_0_1], CONFLUX, token1),
              CurrencyAmount.fromRawAmount(Conflux.onChain(1), BigNumber.from(100))
            ),
            {
              ttl: 50,
              recipient: 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj',
              allowedSlippage: new Percent('1', '100'),
              feeOnTransfer: true
            },
            ChainId.TETHYS
          )
          expect(result.methodName).toEqual('swapExactETHForTokensSupportingFeeOnTransferTokens')
          expect(result.args.slice(0, -1)).toEqual([
            '0x51',
            [WCFX[ChainId.TETHYS].address, token0.address, token1.address],
            'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj'
          ])
          expect(result.value).toEqual('0x64')
          checkDeadline(result.args[result.args.length - 1])
        })
        it('token1 to ether', () => {
          const result = Router.swapCallParameters(
            Trade.exactIn(
              new Route([pair_0_1, pair_weth_0], token1, CONFLUX),
              CurrencyAmount.fromRawAmount(token1, BigNumber.from(100))
            ),
            {
              ttl: 50,
              recipient: 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj',
              allowedSlippage: new Percent('1', '100'),
              feeOnTransfer: true
            },
            ChainId.TETHYS
          )
          expect(result.methodName).toEqual('swapExactTokensForETHSupportingFeeOnTransferTokens')
          expect(result.args.slice(0, -1)).toEqual([
            '0x64',
            '0x51',
            [token1.address, token0.address, WCFX[1].address],
            'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj'
          ])
          expect(result.value).toEqual('0x0')
          checkDeadline(result.args[result.args.length - 1])
        })
        it('token0 to token1', () => {
          const result = Router.swapCallParameters(
            Trade.exactIn(
              new Route([pair_0_1], token0, token1),
              CurrencyAmount.fromRawAmount(token0, BigNumber.from(100))
            ),
            {
              ttl: 50,
              recipient: 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj',
              allowedSlippage: new Percent('1', '100'),
              feeOnTransfer: true
            },
            ChainId.TETHYS
          )
          expect(result.methodName).toEqual('swapExactTokensForTokensSupportingFeeOnTransferTokens')
          expect(result.args.slice(0, -1)).toEqual([
            '0x64',
            '0x59',
            [token0.address, token1.address],
            'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj'
          ])
          expect(result.value).toEqual('0x0')
          checkDeadline(result.args[result.args.length - 1])
        })
      })
      describe('exact out', () => {
        it('ether to token1', () => {
          expect(() =>
            Router.swapCallParameters(
              Trade.exactOut(
                new Route([pair_weth_0, pair_0_1], CONFLUX, token1),
                CurrencyAmount.fromRawAmount(token1, BigNumber.from(100))
              ),
              {
                ttl: 50,
                recipient: 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj',
                allowedSlippage: new Percent('1', '100'),
                feeOnTransfer: true
              },
              ChainId.TETHYS
            )
          ).toThrow('EXACT_OUT_FOT')
        })
        it('token1 to ether', () => {
          expect(() =>
            Router.swapCallParameters(
              Trade.exactOut(
                new Route([pair_0_1, pair_weth_0], token1, CONFLUX),
                CurrencyAmount.fromRawAmount(Conflux.onChain(1), BigNumber.from(100))
              ),
              {
                ttl: 50,
                recipient: 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj',
                allowedSlippage: new Percent('1', '100'),
                feeOnTransfer: true
              },
              ChainId.TETHYS
            )
          ).toThrow('EXACT_OUT_FOT')
        })
        it('token0 to token1', () => {
          expect(() =>
            Router.swapCallParameters(
              Trade.exactOut(
                new Route([pair_0_1], token0, token1),
                CurrencyAmount.fromRawAmount(token1, BigNumber.from(100))
              ),
              {
                ttl: 50,
                recipient: 'cfx:acaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaugtyd54xj',
                allowedSlippage: new Percent('1', '100'),
                feeOnTransfer: true
              },
              ChainId.TETHYS
            )
          ).toThrow('EXACT_OUT_FOT')
        })
      })
    })
  })
})

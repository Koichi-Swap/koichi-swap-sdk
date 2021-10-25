import { Five, MINIMUM_LIQUIDITY, Zero, _1000, _997 } from '../constants'
import { InsufficientInputAmountError, InsufficientReservesError } from '../errors'

import { BigintIsh } from '../types'
import { CurrencyAmount } from './CurrencyAmount'
import { Price } from './Price'
import { Token } from './Token'
import invariant from 'tiny-invariant'
import { sqrt } from '../functions/sqrt'
import { BigNumber } from 'ethers'

export class Pair {
  public readonly liquidityToken: Token
  private readonly tokenAmounts: [CurrencyAmount<Token>, CurrencyAmount<Token>]

  public constructor(
    liquidityToken: Token,
    currencyAmountA: CurrencyAmount<Token>,
    currencyAmountB: CurrencyAmount<Token>
  ) {
    const currencyAmounts = currencyAmountA.currency.sortsBefore(currencyAmountB.currency) // does safety checks
      ? [currencyAmountA, currencyAmountB]
      : [currencyAmountB, currencyAmountA]
    this.liquidityToken = liquidityToken
    this.tokenAmounts = currencyAmounts as [CurrencyAmount<Token>, CurrencyAmount<Token>]
  }

  /**
   * Returns true if the token is either token0 or token1
   * @param token to check
   */
  public involvesToken(token: Token): boolean {
    return token.equals(this.token0) || token.equals(this.token1)
  }

  /**
   * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
   */
  public get token0Price(): Price<Token, Token> {
    const result = this.tokenAmounts[1].divide(this.tokenAmounts[0])
    return new Price(this.token0, this.token1, result.denominator, result.numerator)
  }

  /**
   * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
   */
  public get token1Price(): Price<Token, Token> {
    const result = this.tokenAmounts[0].divide(this.tokenAmounts[1])
    return new Price(this.token1, this.token0, result.denominator, result.numerator)
  }

  /**
   * Return the price of the given token in terms of the other token in the pair.
   * @param token token to return price of
   */
  public priceOf(token: Token): Price<Token, Token> {
    invariant(this.involvesToken(token), 'TOKEN')
    return token.equals(this.token0) ? this.token0Price : this.token1Price
  }

  /**
   * Returns the chain ID of the tokens in the pair.
   */
  public get chainId(): number {
    return this.token0.chainId
  }

  public get token0(): Token {
    return this.tokenAmounts[0].currency
  }

  public get token1(): Token {
    return this.tokenAmounts[1].currency
  }

  public get reserve0(): CurrencyAmount<Token> {
    return this.tokenAmounts[0]
  }

  public get reserve1(): CurrencyAmount<Token> {
    return this.tokenAmounts[1]
  }

  public reserveOf(token: Token): CurrencyAmount<Token> {
    invariant(this.involvesToken(token), 'TOKEN')
    return token.equals(this.token0) ? this.reserve0 : this.reserve1
  }

  public getOutputAmount(inputAmount: CurrencyAmount<Token>): [CurrencyAmount<Token>, Pair] {
    invariant(this.involvesToken(inputAmount.currency), 'TOKEN')
    if (this.reserve0.quotient.eq(Zero) || this.reserve1.quotient.eq(Zero)) {
      throw new InsufficientReservesError()
    }
    const inputReserve = this.reserveOf(inputAmount.currency)
    const outputReserve = this.reserveOf(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0)
    const inputAmountWithFee = inputAmount.quotient.mul(_997)
    const numerator = inputAmountWithFee.mul(outputReserve.quotient)
    const denominator = inputReserve.quotient.mul(_1000).add(inputAmountWithFee)
    const outputAmount = CurrencyAmount.fromRawAmount(
      inputAmount.currency.equals(this.token0) ? this.token1 : this.token0,
      numerator.div(denominator)
    )
    if (outputAmount.quotient.eq(Zero)) {
      throw new InsufficientInputAmountError()
    }
    return [
      outputAmount,
      new Pair(this.liquidityToken, inputReserve.add(inputAmount), outputReserve.subtract(outputAmount)),
    ]
  }

  public getLiquidityMinted(
    totalSupply: CurrencyAmount<Token>,
    tokenAmountA: CurrencyAmount<Token>,
    tokenAmountB: CurrencyAmount<Token>
  ): CurrencyAmount<Token> {
    invariant(totalSupply.currency.equals(this.liquidityToken), 'LIQUIDITY')
    const tokenAmounts = tokenAmountA.currency.sortsBefore(tokenAmountB.currency) // does safety checks
      ? [tokenAmountA, tokenAmountB]
      : [tokenAmountB, tokenAmountA]
    invariant(tokenAmounts[0].currency.equals(this.token0) && tokenAmounts[1].currency.equals(this.token1), 'TOKEN')

    let liquidity: BigNumber
    if (totalSupply.quotient.eq(Zero)) {
      liquidity = sqrt(tokenAmounts[0].quotient.mul(tokenAmounts[1].quotient)).sub(MINIMUM_LIQUIDITY)
    } else {
      const amount0 = tokenAmounts[0].quotient.mul(totalSupply.quotient).div(this.reserve0.quotient)
      const amount1 = tokenAmounts[1].quotient.mul(totalSupply.quotient).div(this.reserve1.quotient)
      liquidity = amount0.lt(amount1) ? amount0 : amount1
    }
    if (!liquidity.gt(Zero)) {
      throw new InsufficientInputAmountError()
    }
    return CurrencyAmount.fromRawAmount(this.liquidityToken, liquidity)
  }

  public getLiquidityValue(
    token: Token,
    totalSupply: CurrencyAmount<Token>,
    liquidity: CurrencyAmount<Token>,
    feeOn: boolean = false,
    kLast?: BigintIsh
  ): CurrencyAmount<Token> {
    invariant(this.involvesToken(token), 'TOKEN')
    invariant(totalSupply.currency.equals(this.liquidityToken), 'TOTAL_SUPPLY')
    invariant(liquidity.currency.equals(this.liquidityToken), 'LIQUIDITY')
    invariant(liquidity.quotient.lte(totalSupply.quotient), 'LIQUIDITY')

    let totalSupplyAdjusted: CurrencyAmount<Token>
    if (!feeOn) {
      totalSupplyAdjusted = totalSupply
    } else {
      invariant(!!kLast, 'K_LAST')
      const kLastParsed = BigNumber.from(kLast)
      if (!kLastParsed.eq(Zero)) {
        const rootK = sqrt(this.reserve0.quotient.mul(this.reserve1.quotient))
        const rootKLast = sqrt(kLastParsed)
        if (rootK.gt(rootKLast)) {
          const numerator = totalSupply.quotient.mul(rootK.sub(rootKLast))
          const denominator = rootK.mul(Five).add(rootKLast)
          const feeLiquidity = numerator.div(denominator)
          totalSupplyAdjusted = totalSupply.add(CurrencyAmount.fromRawAmount(this.liquidityToken, feeLiquidity))
        } else {
          totalSupplyAdjusted = totalSupply
        }
      } else {
        totalSupplyAdjusted = totalSupply
      }
    }

    return CurrencyAmount.fromRawAmount(
      token,
      liquidity.quotient.mul(this.reserveOf(token).quotient).div(totalSupplyAdjusted.quotient)
    )
  }
}

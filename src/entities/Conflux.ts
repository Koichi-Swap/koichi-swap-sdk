import { Currency } from './Currency'
import { NativeCurrency } from './NativeCurrency'
import { Token } from './Token'
import { WCFX } from '../constants/tokens'
import invariant from 'tiny-invariant'

/**
 * Ether is the main usage of a 'native' currency, i.e. for Ethereum mainnet and all testnets
 */
export class Conflux extends NativeCurrency {
  protected constructor(chainId: number) {
    super(chainId, 18, 'CFX', 'Conflux')
  }

  public get wrapped(): Token {
    const wcfx = WCFX[this.chainId]
    invariant(!!wcfx, 'WRAPPED')
    return wcfx
  }

  private static _etherCache: { [chainId: number]: Conflux } = {}

  public static onChain(chainId: number): Conflux {
    return this._etherCache[chainId] ?? (this._etherCache[chainId] = new Conflux(chainId))
  }

  public equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId
  }
}

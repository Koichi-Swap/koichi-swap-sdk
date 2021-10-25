import { USDT_ADDRESS, WCFX_ADDRESS } from './addresses'

import { ChainId } from '../enums'
import { Token } from '../entities/Token'
import { TokenMap } from '../types/TokenMap'

export const USDT: TokenMap = {
  [ChainId.TESTNET]: new Token(ChainId.TESTNET, USDT_ADDRESS[ChainId.TESTNET], 18, 'cUSDT', 'conflux USDT'),
  [ChainId.TETHYS]: new Token(ChainId.TETHYS, USDT_ADDRESS[ChainId.TETHYS], 18, 'cUSDT', 'conflux USDT'),
}

export const WCFX: TokenMap = {
  [ChainId.TESTNET]: new Token(ChainId.TESTNET, WCFX_ADDRESS[ChainId.TESTNET], 18, 'WCFX', 'Wrapped Conflux'),
  [ChainId.TETHYS]: new Token(ChainId.TETHYS, WCFX_ADDRESS[ChainId.TETHYS], 18, 'WCFX', 'Wrapped Conflux'),
}

export const WNATIVE: TokenMap = {
  [ChainId.TESTNET]: WCFX[ChainId.TESTNET],
  [ChainId.TETHYS]: WCFX[ChainId.TETHYS],
}

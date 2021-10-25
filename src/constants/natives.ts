import { Conflux } from '../entities/Conflux'

import { ChainId } from '../enums'

export const NATIVE = {
  [ChainId.TESTNET]: Conflux.onChain(ChainId.TESTNET),
  [ChainId.TETHYS]: Conflux.onChain(ChainId.TETHYS),
}

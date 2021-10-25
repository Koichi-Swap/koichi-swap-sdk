import { AddressMap } from '../types'
import { ChainId } from '../enums'

export const USDT_ADDRESS: AddressMap = {
  [ChainId.TESTNET]: 'cfxtest:acepe88unk7fvs18436178up33hb4zkuf62a9dk1gv',
  [ChainId.TETHYS]: 'cfx:acf2rcsh8payyxpg6xj7b0ztswwh81ute60tsw35j7',
}

export const CONSTANT_PRODUCT_FACTORY_ADDRESS: AddressMap = {
  [ChainId.TESTNET]: 'cfxtest:achdcx8duddhped58v1x8rd46y6wr7bjce0jsnnjn7',
  [ChainId.TETHYS]: '',
}

export const ROUTER_ADDRESS: AddressMap = {
  [ChainId.TESTNET]: 'cfxtest:acfnwua5hph4ne4j0an9anc5kp1fnuzgku9g2p9kpc',
  [ChainId.TETHYS]: '',
}

export const TIMELOCK_ADDRESS: AddressMap = {
  [ChainId.TETHYS]: '',
}

export const WCFX_ADDRESS: AddressMap = {
  [ChainId.TESTNET]: 'cfxtest:achs3nehae0j6ksvy1bhrffsh1rtfrw1f6w1kzv46t',
  [ChainId.TETHYS]: 'cfx:acg158kvr8zanb1bs048ryb6rtrhr283ma70vz70tx',
}

export const MULTICALL_ADDRESS: AddressMap = {
  [ChainId.TESTNET]: 'cfxtest:ace9s86me9axdjvhcaet0ujmx7uv8mjzcah7usdk8x',
  [ChainId.TETHYS]: '',
}

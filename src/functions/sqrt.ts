import { BigNumber } from 'ethers'

import { One, SolidityType, Zero } from '../constants'
import { validateSolidityTypeInstance } from './validateSolidityTypeInstance'

const _2_128 = BigNumber.from('0x100000000000000000000000000000000')
const _2_64 = BigNumber.from('0x10000000000000000')
const _2_32 = BigNumber.from('0x100000000')
const _2_16 = BigNumber.from('0x10000')
const _2_8 = BigNumber.from('0x100')
const _2_4 = BigNumber.from('0x10')

// mock the on-chain sqrt function
export function sqrt(x: BigNumber): BigNumber {
  validateSolidityTypeInstance(x, SolidityType.uint256)
  if (x.eq(Zero)) {
    return Zero
  }
  let xx: BigNumber = x
  let r: BigNumber = One
  if (xx.gte(_2_128)) {
    xx = xx.shr(128)
    r = r.shl(64)
  }
  if (xx.gte(_2_64)) {
    xx = xx.shr(64)
    r = r.shl(32)
  }
  if (xx.gte(_2_32)) {
    xx = xx.shr(32)
    r = r.shl(16)
  }
  if (xx.gte(_2_16)) {
    xx = xx.shr(16)
    r = r.shl(8)
  }

  if (xx.gte(_2_8)) {
    xx = xx.shr(8)
    r = r.shl(4)
  }
  if (xx.gte(_2_4)) {
    xx = xx.shr(4)
    r = r.shl(2)
  }
  if (xx.gte(0x8)) {
    r = r.shl(1)
  }
  r = r.add(x.div(r)).shr(1)
  r = r.add(x.div(r)).shr(1)
  r = r.add(x.div(r)).shr(1)
  r = r.add(x.div(r)).shr(1)
  r = r.add(x.div(r)).shr(1)
  r = r.add(x.div(r)).shr(1)
  r = r.add(x.div(r)).shr(1) // Seven iterations should be enough
  const r1 = x.div(r)
  return r.lt(r1) ? r : r1
}

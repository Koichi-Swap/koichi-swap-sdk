import { SOLIDITY_TYPE_MAXIMA, SolidityType, Zero } from '../constants'

import invariant from 'tiny-invariant'
import { BigNumber } from 'ethers'

export function validateSolidityTypeInstance(value: BigNumber, solidityType: SolidityType): void {
  invariant(value.gte(Zero), `${value} is not a ${solidityType}.`)
  invariant(value.lte(SOLIDITY_TYPE_MAXIMA[solidityType]), `${value} is not a ${solidityType}.`)
}

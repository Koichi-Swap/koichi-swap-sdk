import { BigNumber } from 'ethers'

export * from './addresses'
export * from './natives'
export * from './numbers'
export * from './tokens'

export const MINIMUM_LIQUIDITY = BigNumber.from(1000)

export enum SolidityType {
  uint8 = 'uint8',
  uint256 = 'uint256',
}

export const SOLIDITY_TYPE_MAXIMA = {
  [SolidityType.uint8]: BigNumber.from('0xff'),
  [SolidityType.uint256]: BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
}
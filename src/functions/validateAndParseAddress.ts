import { format } from 'js-conflux-sdk'
import invariant from 'tiny-invariant'
import warning from 'tiny-warning'

import { ChainId } from '../enums/ChainId'


// warns if addresses are not checksummed
export function validateAndParseAddress(address: string, chainId: ChainId): string {
    try {
      const checksummedAddress = format.address(address, chainId)
      warning(address === checksummedAddress, `${address} is not checksummed.`)
      return checksummedAddress
    } catch (error) {
      invariant(false, `${address} is not a valid address.`)
    }
  }

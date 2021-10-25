import { BigNumber } from 'ethers'

import { MaxUint256, Two } from '../constants'
import { sqrt } from './sqrt'

describe('#sqrt', () => {
  it('correct for 0-1000', () => {
    for (let i = 0; i < 1000; i++) {
      expect(sqrt(BigNumber.from(i))).toEqual(BigNumber.from(Math.floor(Math.sqrt(i))))
    }
  })

  it('correct for all even powers of 2', async () => {
    for (let i = 0; i < 127; i++) {
      const root = Two.pow(i)
      const rootSquared = root.pow(2)

      expect(sqrt(rootSquared)).toEqual(root)
    }
  })

  it('correct for MaxUint256', () => {
    expect(sqrt(MaxUint256)).toEqual(BigNumber.from('340282366920938463463374607431768211455'))
  })
})

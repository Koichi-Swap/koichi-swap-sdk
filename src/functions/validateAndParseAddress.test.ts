import { ChainId } from '../enums'
import { validateAndParseAddress } from './validateAndParseAddress'

describe('#validateAndParseAddress', () => {
  it('returns same address if already checksummed', () => {
    expect(validateAndParseAddress('cfx:aajj1b1gm7k51mhzm80czcx31kwxrm2f6jxvy30mvk', ChainId.TETHYS)).toEqual(
      'cfx:aajj1b1gm7k51mhzm80czcx31kwxrm2f6jxvy30mvk'
    )

    expect(validateAndParseAddress('cfxtest:aajj1b1gm7k51mhzm80czcx31kwxrm2f6j34hkuazd', ChainId.TESTNET)).toEqual(
      'cfxtest:aajj1b1gm7k51mhzm80czcx31kwxrm2f6j34hkuazd'
    )
  })
})

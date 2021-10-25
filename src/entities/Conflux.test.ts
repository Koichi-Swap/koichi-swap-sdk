import { Conflux } from './Conflux'

describe('Conflux', () => {
  it('static constructor uses cache', () => {
    expect(Conflux.onChain(1) === Conflux.onChain(1)).toEqual(true)
  })
  it('caches once per chain ID', () => {
    expect(Conflux.onChain(1) !== Conflux.onChain(2)).toEqual(true)
  })
  it('#equals returns false for diff chains', () => {
    expect(Conflux.onChain(1).equals(Conflux.onChain(2))).toEqual(false)
  })
  it('#equals returns true for same chains', () => {
    expect(Conflux.onChain(1).equals(Conflux.onChain(1))).toEqual(true)
  })
})

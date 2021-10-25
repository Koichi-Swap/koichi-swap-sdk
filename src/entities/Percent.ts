import { BigintIsh } from '../types'
import { Fraction } from './Fraction'
import { Rounding } from '../enums'
import { _100 } from '../constants'

/**
 * Converts a fraction to a percent
 * @param fraction the fraction to convert
 */
function toPercent(fraction: Fraction): Percent {
  return new Percent(fraction.numerator, fraction.denominator)
}

export class Percent extends Fraction {
  /**
   * This boolean prevents a fraction from being interpreted as a Percent
   */
  public readonly isPercent: true = true

  add(other: Fraction | BigintIsh): Percent {
    return toPercent(super.add(other))
  }

  subtract(other: Fraction | BigintIsh): Percent {
    return toPercent(super.subtract(other))
  }

  multiply(other: Fraction | BigintIsh): Percent {
    return toPercent(super.multiply(other))
  }

  divide(other: Fraction | BigintIsh): Percent {
    return toPercent(super.divide(other))
  }

  public toSignificant(significantDigits: number = 5, format?: object, rounding?: Rounding): string {
    return super.multiply(_100).toSignificant(significantDigits, format, rounding)
  }

  public toFixed(decimalPlaces: number = 2, format?: object, rounding?: Rounding): string {
    return super.multiply(_100).toFixed(decimalPlaces, format, rounding)
  }
}

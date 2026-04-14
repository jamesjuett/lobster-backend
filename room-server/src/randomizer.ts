/**
 * Randomizer utility class.
 * Inlined from @repo/random for standalone deployment.
 */

import seedrandom from "seedrandom";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export class Randomizer {

  private rng: seedrandom.PRNG;

  private constructor(seed: string | undefined) {
    this.rng = seedrandom(seed);
  }

  public static create_from_seed(seed: string): Randomizer {
    return new Randomizer(seed);
  }

  public static create_autoseeded(): Randomizer {
    return new Randomizer(undefined);
  }

  /**
   * @returns A random floating point number between 0 (inclusive) and 1 (exclusive).
   */
  public float(): number {
    return this.rng();
  }

  /**
   * @returns A random integer between -2^31 (inclusive) and 2^31 (exclusive).
   */
  public signed_int(): number {
    return this.rng.int32();
  }

  /**
   * @returns A random positive integer between 0 (inclusive) and 2^31 (exclusive).
   */
  public nonnegative_int(): number {
    return this.rng.int32() & 0x7FFFFFFF;
  }

  /**
   * @deprecated Use `nonnegative_int()` instead.
   */
  public unsigned_int(): number {
    return this.nonnegative_int();
  }

  /**
   * @returns A random integer between 0 (inclusive) and n (exclusive).
   */
  public range(n: number): number;
  /**
   * @returns A random integer between lower (inclusive) and upper (exclusive).
   */
  public range(lower: number, upper: number): number;

  public range(arg1: number, arg2?: number): number {
    if (arg2 === undefined) {
      return this.range_impl(arg1);
    } else {
      assert(arg2 > arg1, "Upper bound must be greater than lower bound.");
      return arg1 + this.range_impl(arg2 - arg1);
    }
  }

  private range_impl(n: number): number {
    assert(n > 0, "Upper bound must be positive.");

    const orig_upper = 0x80000000; // 2^31
    const accept_upper = orig_upper - (orig_upper % n);

    let sample: number;
    do {
      sample = this.unsigned_int();
    } while (sample >= accept_upper);

    return sample % n;
  }

  /**
   * @requires `choices` is non-empty.
   * @returns One of the elements of `choices`, selected randomly.
   */
  public choose_one<T>(choices: readonly T[]): T {
    assert(choices.length > 0, "Cannot choose one from an empty array.");
    return this.choose_n(choices, 1)[0]!;
  }

  /**
   * @requires 0 <= `n` and `n` <= `choices.length`.
   * @returns An array of `n` elements from `choices`, selected randomly (without replacement).
   */
  public choose_n<T>(choices: readonly T[], n: number): T[] {
    assert(0 <= n, "Number to randomly choose must be non-negative.");
    assert(n <= choices.length, "Number to randomly choose is larger than number of choices.");

    const copy = choices.slice();
    this.partial_fisher_yates_shuffle(copy, n);
    return copy.slice(0, n);
  }

  /**
   * @requires 0 <= `n`. If n > 0, `choices` must be non-empty.
   * @returns An array of `n` elements from `choices`, selected randomly (with replacement).
   */
  public choose_n_with_replacement<T>(choices: readonly T[], n: number): T[] {
    assert(0 <= n, "Number to randomly choose must be non-negative.");
    assert(n === 0 || choices.length > 0, "Cannot choose from an empty array.");
    const result: T[] = new Array(n);
    for (let i = 0; i < n; ++i) {
      result[i] = choices[this.range(choices.length)]!;
    }
    return result;
  }

  /**
   * Shuffles the given array, modifying it in-place.
   */
  public shuffle<T>(arr: T[]): void {
    this.partial_fisher_yates_shuffle(arr);
  }

  /**
   * Returns a shuffled copy of the given array.
   */
  public shuffled_copy<T>(arr: T[]): T[] {
    const copy = arr.slice();
    this.partial_fisher_yates_shuffle(copy);
    return copy;
  }

  private partial_fisher_yates_shuffle<T>(arr: T[], n: number = arr.length) {
    assert(0 <= n, "Number of elements to shuffle must be non-negative.");
    assert(n <= arr.length, "Number of elements to shuffle must be <= length of the array.");
    for (let i = 0; i < n; ++i) {
      const next = this.range(i, arr.length);
      [arr[i], arr[next]] = [arr[next]!, arr[i]!];
    }
  }
}

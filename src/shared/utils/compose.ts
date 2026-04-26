/**
 * Functional compose — right to left.
 */
export function compose<T>(...fns: Array<(x: T) => T>): (x: T) => T {
  return (x: T) => fns.reduceRight((v, f) => f(v), x);
}

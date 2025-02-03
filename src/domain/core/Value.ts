export interface Value<T> {
  equals(other: Value<T>): boolean;
  value: T;
}

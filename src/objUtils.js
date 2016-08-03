/* @flow */

type InputObject<T> = { [key: string]: T };

export function entries<T> (obj: InputObject<T>): Array<[string, T]> {
  const output = [];
  for (let key of Object.keys(obj)) {
    output.push([key, obj[key]]);
  }
  return output;
}

type ReduceCallback<T, U> = (previousValue: U, value: T, key: string) => U;

export function reduce<T, U> (obj: InputObject<T>): (callback: ReduceCallback<T, U>, initialValue: U) => U {
  return function (callback: ReduceCallback<T, U>, initialValue: U): U {
    return entries(obj).reduce((output: U, [key, value]: [string, T]): U =>
      callback(output, value, key), initialValue);
  };
}

type MapCallback<T, U> = (value: T) => U

export function map<T, U> (obj: InputObject<T>) {
  return function<U> (callback: MapCallback<T, U>): InputObject<U> {
    return reduce(obj)((output: InputObject<U>, value: T, key: string) => {
      output[key] = callback(value);
      return output;
    }, {});
  };
}

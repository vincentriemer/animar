export function entries(obj) {
  const output = [];
  for (let key of Object.keys(obj)) {
    output.push([key, obj[key]]);
  }
  return output;
}

export function reduce(obj) {
  return (callback, previousValue) => entries(obj)
    .reduce((output, [key, value]) => callback(output, value, key), previousValue);
}

export function map(obj) {
  return (callback) => {
    return reduce(obj)((output, value, key) => {
      output[key] = callback(value);
      return output;
    }, {});
  };
}

/**
 * Transforms two arrays into one array of nested pairs
 * @param {Array} x first array
 * @param {Array} y second array
 * @returns {Array} Transformed array, zipped version of the arguments
 * @example zip(['a', 'b'], ['c', 'd']) // returns [['a', 'c'], ['b', 'd']]
 */
const zip = (x, y) =>
  Array.from(Array(Math.max(x.length, y.length)), (_, i) => [x[i], y[i]]);

module.exports = zip;

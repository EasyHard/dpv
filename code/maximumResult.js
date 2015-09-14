/**
 * Given a list of positive integer, find a formulation that has maximum result, with + and *.
 * Example:
 * with list 3 1 3, the maximum result is 3*1*3
 * with list 1 3 1, the maximum result is 1+3+1
 **/

var a = [1, 3, 4, 8, 8, 1, 1, 3, 9, 1, 2];

memofunction s(i, j) {
  if (j < i) return 0;
  if (j === i) return a[i];
  return s(i, j-1) * a[j];
}

memofunction f(i, j) {
  if (i === a.length && j === i) return 0;
  if (j >= a.length) return -1000000;
  return Math.max(f(j+1, j+1) + s(i, j), f(i, j+1));
}


f(0, 0);

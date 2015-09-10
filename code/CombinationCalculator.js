/**
 * Calculate the combination number C(n, m), (pick m elements from n)
 **/

memofunction c(n, m) {
  if (n <  0) return 0;
  if (m === 0) return 1;
  if (m < 0) return 0;
  if (n === m) return 1;
  if (n < m) return 0;
  return c(n-1, m-1) + c(n-1, m);
}

c(40, 18);

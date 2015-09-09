var n = 10, m = 20;

memofunction f(i, j) {
  if (i === n) return 1;
  if (j === m) return 1;
  return f(i+1, j) + f(i, j+1);
}

f(0, 0);

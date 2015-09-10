/**
 * 0-1 knapscak problem.
 * Given weights and values of n items,
 * put these items in a knapsack of
 * capacity W to get the maximum total
 * value in the knapsack.
 **/
var items = [
  {w: 2, v: 10},
  {w: 24, v: 1},
  {w: 4, v: 3},
  {w: 1, v: 20},
  {w: 6, v: 1},
  {w: 10, v: 10},
  {w: 12, v: 11},
  {w: 18, v: 77},
  {w: 28, v: 33},
  {w: 32, v: 43},
  {w: 42, v: 52},
  {w: 3, v: 2},
];

memofunction f(k, w) {
  if (k === items.length) return 0;
  if (w === 0) return 0;
  var ans = f(k + 1, w);
  if (w >= items[k].w)
    ans = Math.max(ans, f(k + 1, w - items[k].w) + items[k].v);
  return ans;
}

f(0, 50);

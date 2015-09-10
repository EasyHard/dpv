/**
 * Find the minimum step to edit word2 into word1.
 * Action of editing could be
 * 1. Insert a character
 * 2. Delete a character
 * 3. Replace a character
 **/

var word1 = " *  if (i < n && j < m) result = Math.min(result, 1)";
var word2 = "  if (i < n && j < m && word1[i] === word2[j]) result = 1;";
var n = word1.length;
var m = word2.length;
memofunction f(i, j) {
  if (i === n && m === j) return 0;
  var result = 1000000; // a very large number
  if (j < m) result = Math.min(result, f(i, j+1) + 1);
  if (i < n) result = Math.min(result, f(i+1, j) + 1);
  if (i < n && j < m) result = Math.min(result, f(i+1, j+1) + 1);
  if (i < n && j < m && word1[i] === word2[j]) result = Math.min(result, f(i+1, j+1));
  return result;
}

f(0, 0);

var Data = Data || {}; Data.files = [{"content":"var maxr = 5;\nvar maxc = 5;\nvar height = [\n    [1, 2, 3, 4, 5],\n    [16, 17, 18, 19, 6],\n    [15, 24, 25, 20, 7],\n    [14, 23, 22, 21, 8],\n    [13, 12, 11, 10, 9]\n];\nvar d = [\n    {r: 1, c: 0},\n    {r: -1, c: 0},\n    {r: 0, c: 1},\n    {r: 0, c: -1}\n];\n\nmemofunction l(row, col) {\n    var answer = 1;\n    var currHeight = height[row][col];\n    for (var i = 0; i < 4; i++) {\n        var nr = d[i].r + row;\n        var nc = d[i].c + col;\n        if (nr < 0 || nc < 0 || nr >= maxr || nc >= maxc) {\n            continue;\n        }\n        if (height[nr][nc] < currHeight) {\n            answer = answer >= l(nr, nc) + 1 ? answer : l(nr, nc) + 1;\n        }\n    }\n    return answer;\n}\n\nl(2, 2);","title":"1088.js"},{"content":"/**\n * Calculate the combination number C(n, m), (pick m elements from n)\n **/\n\nmemofunction c(n, m) {\n  if (n <  0) return 0;\n  if (m === 0) return 1;\n  if (m < 0) return 0;\n  if (n === m) return 1;\n  if (n < m) return 0;\n  return c(n-1, m-1) + c(n-1, m);\n}\n\nc(40, 18);\n","title":"CombinationCalculator.js"},{"content":"/**\n * Find the minimum step to edit word2 into word1.\n * Action of editing could be\n * 1. Insert a character\n * 2. Delete a character\n * 3. Replace a character\n **/\n\nvar word1 = \" *  if (i < n && j < m) result = Math.min(result, f(i+1, j+1) + 1);\";\nvar word2 = \"  if (i < n && j < m && word1[i] === word2[j]) result = Math.min(result, f(i+1, j+1));\";\nvar n = word1.length;\nvar m = word2.length;\nmemofunction f(i, j) {\n  var result = 1000000; // a very large number\n  if (j < m) result = Math.min(result, f(i, j+1) + 1);\n  if (i < n) result = Math.min(result, f(i+1, j) + 1);\n  if (i < n && j < m) result = Math.min(result, f(i+1, j+1) + 1);\n  if (i < n && j < m && word1[i] === word2[j]) result = Math.min(result, f(i+1, j+1));\n  return result;\n}\n\nf(0, 0);\n","title":"EditDistance.js"},{"content":"var n = 10, m = 20;\n\nmemofunction f(i, j) {\n  if (i === n) return 1;\n  if (j === m) return 1;\n  return f(i+1, j) + f(i, j+1);\n}\n\nf(0, 0);\n","title":"counting.js"},{"content":"memofunction fib(n) {\n    if (n === 0)\n        return 0;\n    if (n === 1)\n        return 1;\n    return fib(n-1) + fib(n-2);\n}\n\nfib(20);","title":"fib.js"}];

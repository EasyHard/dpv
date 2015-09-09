var maxr = 5;
var maxc = 5;
var height = [
    [1, 2, 3, 4, 5],
    [16, 17, 18, 19, 6],
    [15, 24, 25, 20, 7],
    [14, 23, 22, 21, 8],
    [13, 12, 11, 10, 9]
];
var d = [
    {r: 1, c: 0},
    {r: -1, c: 0},
    {r: 0, c: 1},
    {r: 0, c: -1}
];

memofunction l(row, col) {
    var answer = 1;
    var currHeight = height[row][col];
    for (var i = 0; i < 4; i++) {
        var nr = d[i].r + row;
        var nc = d[i].c + col;
        if (nr < 0 || nc < 0 || nr >= maxr || nc >= maxc) {
            continue;
        }
        if (height[nr][nc] < currHeight) {
            answer = answer >= l(nr, nc) + 1 ? answer : l(nr, nc) + 1;
        }
    }
    return answer;
}

l(2, 2);
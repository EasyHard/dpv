// dependency analysis via trace of stack
function dependencyAnalysis(interpreter) {
    var dependency = {};
    var stack = [];
    interpreter.memostack.forEach(function (item) {
        if (item.func) {
            dependency[item.func] = dependency[item.func] || {};
        }
        if (item.func && item.args) {
            dependency[item.func][item.args] = dependency[item.func][item.args] || [];
        }
        if (item.op === 'pop') {
            stack.shift();
            return;
        }
        // item.op === 'push'
        if (stack.length) {
            var topfunc = stack[0].func;
            var topargs = stack[0].args;

            var topDependency = dependency[topfunc][topargs];
            // add dependency if it is new
            if (!_.some(topDependency,
                        _.isEqual.bind(undefined, _.omit(item, 'op')))) {
                topDependency.push(_.omit(item, 'op'));
            }
        }
        stack.unshift(item);
    });
    return dependency;
}

function globalDepAnalysis(dep, func, args) {
    var result = [];
    // data structure for DFS
    var stack = [];
    var visited = {};
    // first node
    stack.unshift({
        func: func,
        args: args,
        idx: 0,
        depth: 0
    });
    while (stack.length !== 0) {
        var top = stack[0];
        // first time visit this node
        if (top.idx === 0) {
            visited[top.func] = visited[top.func] || {};
            visited[top.func][top.args] = true;
            result.unshift({
                func: top.func,
                args: top.args,
                depth: top.depth
            });
        }
        var next = dep[top.func][top.args][top.idx];
        if (next === undefined) {
            // no child to search
            stack.shift();
        } else {
            if (visited[next.func] && visited[next.func][next.args]) {
                // do nothing when child has been visited
            } else {
                stack.unshift({
                    func: next.func,
                    args: next.args,
                    idx: 0,
                    depth: top.depth + 1
                });
            }
            // search another child next time.
            top.idx = top.idx + 1;
        }
    }
    return result.reverse();
}
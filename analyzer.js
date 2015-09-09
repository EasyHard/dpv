function StackAnalyzer (interpreter) {
  this.memostack = interpreter.memostack;
  this.interpreter = interpreter;
  this.initData();
  this.startPoints = [];
  this.stackAnalyze();
  this.bfsFrom(this.startPoints);
  this.findArgumentRange();
}

StackAnalyzer.prototype.isBoundary = function (item) {
  return item.deps.length === 0;
};

StackAnalyzer.prototype.bfsFrom = function (startPoints) {
  var queue = [];
  var inq = {};
  function has(item) {
    return inq[item.func] && inq[item.func][item.args];
  }
  function add(item) {
    inq[item.func] = inq[item.func] || {};
    inq[item.func][item.args] = true;
  }
  startPoints.forEach(function (item) {
    item.depth = 0;
    queue.push(item);
    add(item);
  }.bind(this));
  while (queue.length) {
    var curr = queue.shift();
    curr.deps.forEach(function (dep) {
      if (!has(dep)) {
        queue.push(dep);
        dep.depth = curr.depth + 1;
        dep.p.push(curr);
        add(dep);
      }
    });
  }
};

StackAnalyzer.prototype.initData = function () {
  this.data = {};
  for (var funcname in this.interpreter.memo) {
    if (!this.interpreter.memo.hasOwnProperty(funcname)) continue;
    var funcmemo = this.interpreter.memo[funcname];
    for (var args in funcmemo) {
      if (!funcmemo.hasOwnProperty(args)) continue;
      this.data[funcname] = this.data[funcname] || {};
      this.data[funcname][args] = {
        value: funcmemo[args].data,
        deps: [],
        p: [],
        args: args,
        func: funcname
      };
    }
  }
};

StackAnalyzer.prototype.findArgumentRange = function () {
  var range = [];
  this.memostack.forEach(function (item) {
    if (item.args && item.func) {
      var args = item.args;
      var funcname = item.func;
      range[funcname] = range[funcname] || [];
      for (var key in args) {
        range[funcname][key] = range[funcname][key] || { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER};
        range[funcname][key].max = Math.max(range[funcname][key].max, args[key]);
        range[funcname][key].min = Math.min(range[funcname][key].min, args[key]);
      }
    }
  });
  this.range = range;
};

// dependency analysis via trace of stack.
// also mark start points.
StackAnalyzer.prototype.stackAnalyze = function () {
  var stack = [];

  this.memostack.forEach(function (item) {
    if (item.op === 'pop') {
      stack.shift();
      return;
    }
    // item.op === 'push'
    if (stack.length) {
      var topfunc = stack[0].func;
      var topargs = stack[0].args;

      var topDependency = this.data[topfunc][topargs].deps;
      // add dependency if it is new
      var duplicate = topDependency.filter(function (dep) {
        return dep.func === item.func && dep.args === item.args;
      });
      if (duplicate.length === 0) {
        topDependency.push(this.data[item.func][item.args]);
      }
    } else {
      // first element in the stack.
      this.startPoints.push(this.data[item.func][item.args]);
    }
    stack.unshift(item);
  }.bind(this));
};

function StackAnalyzer (interpreter) {
  this.memostack = interpreter.memostack;
  this.interpreter = interpreter;
  this.initData();
  this.startPoints = [];
  this.stackAnalyze();
  this.bfs(this.startPoints, 'deps', 'depth', 'p');
  this.findArgumentRange();
  this.findRdep();
  this.topoFromBoundary();
}

function ItemSet() {
  this.set = {};
  this.has = function (item) {
    return this.set[item.func] && this.set[item.func][item.args];
  };
  this.add = function (item) {
    this.set[item.func] = this.set[item.func] || {};
    this.set[item.func][item.args] = true;
  };
}

StackAnalyzer.prototype.topoFromBoundary = function () {
  var starts = [];
  for (var func in this.data) {
    for (var args in this.data[func]) {
      var item = this.data[func][args];
      if (this.isBoundary(item))
        starts.push(item);
      item.Nunsolved = item.deps.length;
    }
  }
  var queue = [];
  starts.forEach(function (item) {
    queue.push(item);
  });
  while (queue.length) {
    var curr = queue.shift();
    curr.topoDepth = 0;
    curr.deps.forEach(function (dep) {
      curr.topoDepth = Math.max(curr.topoDepth, dep.topoDepth + 1);
    });
    delete curr.Nunsolved;
    curr.rdeps.forEach(function (rdep) {
      rdep.Nunsolved -= 1;
      if (rdep.Nunsolved === 0) {
        queue.push(rdep);
      }
    });
  }
};

StackAnalyzer.prototype.findRdep = function () {
  for (var func in this.data) {
    for (var args in this.data[func]) {
      var item = this.data[func][args];
      item.deps.forEach(function (dep) {
        dep.rdeps.push(item);
      });
    }
  }
};

StackAnalyzer.prototype.isBoundary = function (item) {
  return item.deps.length === 0;
};

StackAnalyzer.prototype.bfs = function (startPoints, edgeField, depthField, parentField) {
  var queue = [];
  var inq = new ItemSet();
  startPoints.forEach(function (item) {
    item[depthField] = 0;
    queue.push(item);
    inq.add(item);
  }.bind(this));
  while (queue.length) {
    var curr = queue.shift();
    curr[edgeField].forEach(function (dep) {
      if (!inq.has(dep)) {
        queue.push(dep);
        dep[depthField] = curr[depthField] + 1;
        dep[parentField].push(curr);
        inq.add(dep);
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
        rdeps: [],
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
  var programOrder = 0;
  this.memostack.forEach(function (item) {
    if (item.op === 'pop') {
      var topfunc = stack[0].func;
      var topargs = stack[0].args;
      this.data[topfunc][topargs].programOrder = programOrder;
      programOrder += 1;
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

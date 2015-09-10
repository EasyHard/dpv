function Animator(analyzer, funcs, options) {
    this.analyzer = analyzer;
    this.funcs = funcs;
    options = options || {};
    options.duration = options.duration || 10000;
    this.options = options;
}

function depthAnimator(depthField) {
  function AnimatorClass(analyzer, funcs, options) {
    Animator.apply(this, arguments);
  }
  AnimatorClass.prototype = new Animator();
  AnimatorClass.prototype.start = function () {
    var maxDepth = Number.MIN_SAFE_INTEGER;
    for (var func in this.analyzer.data) {
        for (var args in this.analyzer.data[func]) {
            var d = this.analyzer.data[func][args];
            if (d) maxDepth = Math.max(maxDepth, d[depthField]);
        }
    }
    var speed = this.options.duration / maxDepth;
    for (var func in this.funcs) {
        var svg = this.funcs[func].svg;
        svg.selectAll("rect").transition()
        .delay(function (d) { if (d) return d[depthField] * speed})
        .duration(speed*3)
        .style("fill", function (d) { if (d) return d3.rgb(255 - 160/maxDepth*d[depthField], 255, 160/maxDepth*d[depthField]);})
        .style("z-index", function (d) {return d ? 1 : -Number.MAX_SAFE_INTEGER;})
        .style("fill-opacity", function (d) {if (d) return 100; else return 0;});
    }
  };
  return AnimatorClass;
}


var BFSAnimator = depthAnimator('depth');
var TopoAnimator = depthAnimator('topoDepth');

var animators = {
  "topo": {
    constr: TopoAnimator,
    comment: "Topo animator travels the dependency graph level by level in a topography manner. It shows how the problem is solved with infinity parallelism."
  },
  "bfs": {
    constr: BFSAnimator,
    comment: "BFS animator travels the dependency grpah in by BFS from start points. It show how the problem is solved using Non-deterministic Turing machine."
  },
  "program order": {
    constr: depthAnimator("programOrder"),
    comment: "Program order animator shows the order of problems are solved in the actual process of the program."
  }
};

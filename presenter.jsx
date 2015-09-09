var Components = Components || {};

function Animator(analyzer, funcs, options) {
    this.analyzer = analyzer;
    this.funcs = funcs;
    options = options || {};
    options.duration = options.duration || 10000;
    this.options = options;
}

function BFSAnimator(analyzer, funcs, options) {
    Animator.apply(this, arguments);
    // this.analyzer = analyzer;
    // this.funcs = funcs;
    // options = options || {};
    // options.duration = options.duration || 10000;
    // this.options = options;
};


BFSAnimator.prototype.start = function () {
    // bfs from start coloring
    var maxDepth = Number.MIN_SAFE_INTEGER;
    for (var func in this.analyzer.data) {
        for (var args in this.analyzer.data[func]) {
            var d = this.analyzer.data[func][args];
            if (d) maxDepth = Math.max(maxDepth, d.depth);
        }
    }
    var speed = this.options.duration / maxDepth;
    for (var func in this.funcs) {
        var svg = this.funcs[func].svg;
        svg.selectAll("rect").transition()
        .delay(function (d) { if (d) return d.depth * speed})
        .duration(speed*3)
        .style("fill", function (d) { if (d) return d3.rgb(255 - 160/maxDepth*d.depth, 255, 160/maxDepth*d.depth);})
        .style("fill-opacity", 100);
    }
};

function TopoAnimator() {
    Animator.apply(this, arguments);
}

TopoAnimator.prototype = new Animator();
TopoAnimator.prototype.start = function () {
    var maxDepth = Number.MIN_SAFE_INTEGER;
    for (var func in this.analyzer.data) {
        for (var args in this.analyzer.data[func]) {
            var d = this.analyzer.data[func][args];
            if (d) maxDepth = Math.max(maxDepth, d.topoDepth);
        }
    }
    var speed = this.options.duration / maxDepth;
    for (var func in this.funcs) {
        var svg = this.funcs[func].svg;
        svg.selectAll("rect").transition()
        .delay(function (d) { if (d) return d.topoDepth * speed})
        .duration(speed*3)
        .style("fill", function (d) { if (d) return d3.rgb(255 - 160/maxDepth*d.topoDepth, 255, 160/maxDepth*d.topoDepth);})
        .style("fill-opacity", 100);
    }
}

Components.Presenter = React.createClass({
    getDefaultProps: function() {
        return {
            svgdiv: "presenter-svg",
            widthForSVG: 600,
            heightForSVG: 600,
            maxZ: 30
        };
    },
    componentDidMount: function () {
        this.analyzer = this.props.analyzer;

        d3.select("#"+this.props.svgdiv).selectAll("svg").remove();
        this.funcs = {};
        for (var func in this.analyzer.range) {
            var ch = this.props.maxZ;
            var cw = this.props.maxZ;

            var svg = d3.select("#"+this.props.svgdiv).append("svg");
            var range = this.analyzer.range[func];
            var nd = range.length;
            if (nd > 2) return;
            var nCol = range[nd - 1].max - range[nd - 1].min + 1, nRow;
            if (nd !== 1) {
                nRow = range[nd-2].max - range[nd-2].min + 1;
            } else {
                nRow = 1;
            }
            var h = this.props.heightForSVG;
            var w = this.props.widthForSVG;
            var ch = Math.floor(Math.min(h / nRow, ch));
            var cw = Math.floor(Math.min(w / nCol, cw));
            console.log('nRow', nRow, 'nCol', nCol);
            svg.attr("width", w).attr("height", h);
            var self = this;
            var data = d3.range(nRow * nCol);
            data = data.map(function (d) {
                var r = Math.floor(d / nCol);
                var c = d % nCol;
                var args;
                if (nd === 1) args = [c];
                else args = [r, c];
                if (this.analyzer.data[func][args]) {
                    this.analyzer.data[func][args].r = r;
                    this.analyzer.data[func][args].c = c;
                    return this.analyzer.data[func][args];
                } else {
                    console.log('nodata', func, args);
                    return null;
                }
            }.bind(this));
            svg.selectAll("rect").data(data).enter().append("rect")
            .classed("rect-boundry", function (d) {
                if (!d) return false;
                return d.deps.length === 0;
            })
            .attr("width", cw).attr("height", ch).style("fill", d3.rgb(255, 255, 255)).style("fill-opacity", 0)
            .attr("transform", function translate(d) {
                if (d)
                    return "translate(" + d.c * cw + "," + d.r * ch + ")";
            })
            .on("mouseout", function (d) {
                d3.select("#"+self.props.svgdiv).selectAll("svg").selectAll("rect").classed("rect-selected", false);
            })
            .on("mouseover", function (d) {
                d3.select("#"+self.props.svgdiv).selectAll("svg").selectAll("rect").classed("rect-selected",
                    function (od) {
                        if (!od) return false;
                        var isdep = false;
                        d.deps.forEach(function (dep) {
                            isdep = isdep || dep.func === od.func && dep.args === od.args;
                        });
                        return isdep || od.func === d.func && od.args === d.args;
                    });
            });
            this.funcs[func] = {
                h: h,
                w: w,
                ch: ch,
                cw: cw,
                nRow: nRow,
                nCol: nCol,
                svg: svg,
                data: data
            };
        }
        // init animators
        this.animator = new TopoAnimator(this.analyzer, this.funcs);
        this.animator.start();

    },
    render: function () {
        return (
            <div id={this.props.svgdiv}> </div>
        )
    }

});
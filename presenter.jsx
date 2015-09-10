var Components = Components || {};


Components.Presenter = React.createClass({
    getDefaultProps: function() {
        return {
            svgdiv: "presenter-svg",
            widthForSVG: 600,
            heightForSVG: 600,
            maxZ: 28,
            name: "pp",
        };
    },
    componentDidMount: function () {
        console.log(this.props.animator);
        this.analyzer = this.props.analyzer;

        d3.select("#"+this.props.svgdiv).selectAll("*").remove();
        this.funcs = {};
        for (var func in this.analyzer.range) {
            var ch = this.props.maxZ;
            var cw = this.props.maxZ;
            $("#"+this.props.svgdiv).append($("<h4>").addClass("memofunction-title").text("memofunction " + func + " :"));
            var svg = d3.select("#"+this.props.svgdiv).append("div").append("svg");
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
            h = ch*nRow;
            w = cw * nCol;
            console.log('nRow', nRow, 'nCol', nCol);
            svg.attr("width", w).attr("height", h);
            var self = this;
            var data = d3.range(nRow * nCol);
            data = data.map(function (d) {
                var r = Math.floor(d / nCol);
                var c = d % nCol;
                var args;
                if (nd === 1) args = [c + range[nd-1].min];
                else args = [r + range[nd-2].min, c + range[nd-1].min];
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
            .attr("width", cw).attr("height", ch).style("fill", d3.rgb(255, 255, 255)).style("fill-opacity", function (d) {
                if (!d) return 0;
                else return 100;
            })
            .attr("transform", function translate(d) {
                if (d)
                    return "translate(" + d.c * cw + "," + d.r * ch + ")";
                else return "translate(" + nCol * cw + "," + nRow * ch + ")";
            })
            .on("mouseout", function (d) {
                d3.select("#"+self.props.svgdiv).selectAll("svg").selectAll("rect").classed("rect-selected", false);
            })
            .on("mouseover", function (d) {
                if (!d) return;
                d3.select("#"+self.props.svgdiv).selectAll("svg").selectAll("rect").classed("rect-selected",
                    function (od) {
                        if (!od) return false;
                        var isdep = false;
                        d.deps.forEach(function (dep) {
                            isdep = isdep || dep.func === od.func && dep.args === od.args;
                        });
                        return isdep || od.func === d.func && od.args === d.args;
                    });
                $(self.props.name+"-json").empty();
                var show = {};
                function funcall(item) {
                    var a;
                    if (item.args instanceof Array) {
                        a = JSON.stringify(item.args).replace(/^\[/, '(').replace(/\]$/, '');
                    } else {
                        a = '( ' + item.args + ' )';
                    }
                    return item.func + a;
                }
                show.deps = d.deps.map(funcall);
                show.rdeps = d.rdeps.map(funcall);
                show.value = d.value;
                show.self = funcall(d);
                show.depth = d.topoDepth;
                $("#"+self.props.name+"-json").append($("<pre>")).text(JSON.stringify(show, null, 4));
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
        this.animator = new this.props.animator.constr(this.analyzer, this.funcs);
        this.animator.start();

    },
    render: function () {
        return (
            <div>
            <div><h4> Animator explaination: </h4>
            <p>{this.props.animator.comment}</p>
            <div><spanning><svg width="30px" height="30px">
            <rect width="30px" height="30px" className="rect-boundry rect-boundry-example" style={{fill:"white"}} />
            </svg> Boundary </spanning>

            <spanning><svg width="30px" height="30px">
            <rect width="30px" height="30px" className="rect-first" />
            </svg> First Element </spanning>

            <spanning><svg width="30px" height="30px">
            <rect width="30px" height="30px" className="rect-last" />
            </svg> Last Element </spanning>

            </div>
            </div>
            <div id={this.props.svgdiv}> </div>
            <pre>
            <code id={this.props.name + "-json"}> </code>
            </pre>
            </div>
        )
    }

});
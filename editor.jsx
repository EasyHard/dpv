var Components = Components || {};

Components.Editor = React.createClass({
    getDefaultProps: function() {
        return {
            theme: "ace/theme/chrome",
            waitForChange: 2000,
            name: "editor",
            defaultFile: "fib.js",
        };
    },
    componentDidMount: function () {
        this.editor = ace.edit(this.props.name);
        this.editor.setTheme(this.props.theme);
        this.editor.getSession().setMode("ace/mode/javascript");
        this.editor.getSession().on("change", this.onTextChange);
        this.openFile(this.props.defaultFile);
        this.waitForChange = Number(this.props.waitForChange);
        this.interpreterTimer = null;
        if (window.Worker) {
            this.worker = new Worker('/interpreterWorker.js');
            this.worker.onmessage = this.handleMessage;
        }
    },
    handleMessage: function (e) {
        console.log('onmesssage back');
        if (e.data.err) {
            console.log('worker error:', e.data.err);
        } else {
            this.analyzer = e.data.analyzer;

            var z = 30;
            d3.select("#svg-container").selectAll("svg").remove();
            for (var func in this.analyzer.range) {
                var svg = d3.select("#svg-container").append("svg");
                var range = this.analyzer.range[func];
                var nd = range.length;
                if (nd > 2) return;
                var nCol = range[nd - 1].max - range[nd - 1].min + 1, nRow;
                if (nd !== 1) {
                    nRow = range[nd-2].max - range[nd-2].min + 1;
                } else {
                    nRow = 1;
                }
                var h = z * nRow;
                var w = z * nCol;
                console.log('nRow', nRow, 'nCol', nCol);
                svg
                .attr("width", w)
                .attr("height", h);
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
                .attr("width", z).attr("height", z).style("fill", d3.rgb(255, 255, 255)).style("fill-opacity", 0)
                .attr("transform", function translate(d) {
                    if (d)
                        return "translate(" + d.c * z + "," + d.r * z + ")";
                });

                // bfs from start coloring
                var maxDepth = Number.MIN_SAFE_INTEGER;
                data.forEach(function (d) {
                    if (d) maxDepth = Math.max(maxDepth, d.depth);
                });
                var speed = 200;
                svg.selectAll("rect").transition()
                .delay(function (d) { if (d) return d.depth * 1000})
                .duration(5000)
                .style("fill", function (d) { if (d) return d3.rgb(255, 255, (160)/maxDepth*d.depth);})
                .style("fill-opacity", 100);
            }
        }
    },
    render: function () {
        return (
            <div>
            <Components.FileList onClick={this.openFile} > </Components.FileList>
            <div id={this.props.name} />
            </div>
        );
    },
    openFile: function (fileTitle) {
        var data = null;
        Data.files.forEach(function (file) {
            if (file.title === fileTitle) {
                data = file;
            }
        });
        if (data) {
            this.editor.setValue(data.content);
        } else {
            // TODO: handle error
        }
    },
    onTextChange: function (e) {
        console.log('changed');
        if (this.interpreterTimer) {
            clearTimeout(this.interpreterTimer);
        }
        this.interpreterTimer = setTimeout(this.issueInterpreter, this.waitForChange);
    },
    issueInterpreter: function () {
        this.interpreterTimer = null;
        this.worker.postMessage(this.editor.getValue());
    },
});

React.render(<Components.Editor defaultFile="counting.js" name="editor" />, document.getElementById('editor-wrap'))
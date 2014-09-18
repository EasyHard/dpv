var editor = ace.edit('code');
editor.setTheme("ace/theme/chrome");
editor.getSession().setMode("ace/mode/javascript");


function createTable(ele, row, col) {
    var tbl = document.createElement('table');
    tbl.style.border = "1px solid black";
    for (var i = 0; i < row; i++) {
        var tr = tbl.insertRow();
        tr.className = "row" + (row-1-i);
        for (var j = 0; j < col; j++) {
            var td = tr.insertCell();
            td.style.height = "32px";
            td.style.width = "32px";
            td.style.border = "1px solid grey";
            td.className= "col" + (col-1-j);
        }
    }
    ele.appendChild(tbl);
}

function getCell(ele, row, col) {
    return ele.querySelector('.row'+row).querySelector('.col'+col);
}
var result = document.querySelector('#result');
createTable(result, 1, 31);

var interpreter = new Interpreter(editor.getValue());
interpreter.run();
var dependency = dependencyAnalysis(interpreter);
function initBorder(ele, fdep) {
    for (var arg in fdep) {
        var deps = fdep[arg];
        if (deps.length === 0) {
            if (arg.search(',') === -1) {
                arg = '0,' + arg;
            }
            arg = arg.split(',');
            var cell = getCell(ele, arg[0], arg[1]);
            cell.className += " memo-border";
        }
    }
}

function getPositionFromArgs(args) {
    if (args.length === 1) {
        return {
            row: 0,
            col: Number(args[0])
        };
    } else {
        return {
            row: Number(args[0]),
            col: Number(args[1])
        };
    }

};

initBorder(result, dependency.fib);
var r = globalDepAnalysis(dependency, 'fib', [20]);

function globalDepColor(ele, gdep) {
    var maxDepth = _.max(gdep, function (dep) {
        return dep.depth;
    }).depth;
    function levelColorGenerator(maxLevel, top, bot) {
        return function(level) {
            var data = ['r', 'g', 'b'];
            var r = {};
            data.forEach(function (d) {
                r[d] = bot[d] + (top[d] - bot[d]) / maxLevel * level;
                r[d] = Math.round(r[d]);
            });
            return r;
        };
    }
    var top = {r:255, g:255, b:200};
    var bot = {r:255, g:255, b: 0};
    var getColor = levelColorGenerator(maxDepth, top, bot);
    function rgbToHex(color) {
        return "#" + ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1);
    }
    gdep.forEach(function (item) {
        var func = item.func;
        var args = item.args;
        var pos = getPositionFromArgs(args);
        var cell = getCell(ele, pos.row, pos.col);
        var color = getColor(item.depth);
        cell.style.background = rgbToHex(color);
    });
}
globalDepColor(result, r);
console.log(r);
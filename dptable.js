function DPTable(ele, interpreter) {
    var that = this;
    this.ele = ele;
    this.interpreter = interpreter;
    this.dependency = dependencyAnalysis(interpreter);
    _.each(interpreter.memo, function (funcmemo, func) {
        that.createTable(func, funcmemo);
    });
    this.fillData();
    this.initBorder();
    // animate speed by ms
    this.speed = 500;
    var animateButton = document.createElement('button');
    animateButton.innerHTML = 'Animate';
    var nextButton = document.createElement('button');
    nextButton.innerHTML = 'Next';
    this.ele.appendChild(animateButton);
    this.ele.appendChild(nextButton);
    $(animateButton).click(this.animate.bind(this));
    $(nextButton).click(this.next.bind(this));
    this.animate();
 }

DPTable.prototype.animate = function () {
    // cleanup
    var animateClasses = ['animate-'];
    $(this.ele).find('td').removeClass(function () {
        var classes = $(this).attr('class') || '';
        return _.filter(classes.split(' '), function (aclass) {
            return aclass.match(/^animate-/);
        }).join(' ');
    });
    this.animating = true;
    this.animateStack = [{
        func: this.interpreter.memostack[0].func,
        args: this.interpreter.memostack[0].args,
        state: 'enter'
    }];
    $(this.ele).find('td').addClass('animate-unsolved');
    this.next();
};

DPTable.prototype.callnext = function () {
    setTimeout(this.next.bind(this, arguments), this.speed);
};

function isSameMemoitem(a, b) {
    return a.func === b.func && a.args === b.args;
}

DPTable.prototype.setSolvingTop = function (memoitem) {
    $(this.ele).find('td').removeClass('animate-solving-top');
    $(this.ele).find('td').removeClass('animate-depending');
    $(this.getCell(memoitem)).removeClass('animate-solving').addClass('animate-solving-top')
        .addClass('animate-solving');
    if (!$(this.getCell(memoitem)).hasClass('animate-solved')) {
        var dep = this.dependency[memoitem.func][memoitem.args];
        for (var i in dep) {
            $(this.getCell(dep[i])).addClass('animate-depending');
        }
    }
};

DPTable.prototype.next = function () {
    if (!this.animating) {
        return;
    }
    var curr = this.animateStack[0];
    if (curr === undefined) {
        // finished
        this.animating = false;
        return;
    }
    $(this.ele).find('.animate-done').removeClass('animate-solving animate-done');
    this.setSolvingTop(curr);
    if (curr.state === 'enter') {
        // setup next frame
        if ($(this.getCell(curr)).hasClass('animate-solved')) {
            $(this.getCell(curr)).addClass('animate-done');
            this.animateStack.shift();
        } else {
            curr.state = 'solving';
            curr.subidx = 0;
        }
    }
    if (curr.state === 'solving') {
        if (curr.subidx >= this.dependency[curr.func][curr.args].length) {
            $(this.getCell(curr)).addClass('animate-solved').addClass('animate-done')
                .removeClass('animate-unsolved');
            this.animateStack.shift();
        } else {
            var nextitem = this.dependency[curr.func][curr.args][curr.subidx];
            curr.subidx = curr.subidx + 1;
            this.animateStack.unshift({
                func: nextitem.func,
                args: nextitem.args,
                state: 'enter'
            });
        }
    }
    this.callnext();
};

DPTable.prototype.createTable = function (func, funcmemo) {
    // create table
    var row, col;
    row = Number(_.max(_.keys(funcmemo), function (args) {
        return Number(args.split(',')[0]);
    }).split(',')[0]);
    var multipleRow = _.keys(funcmemo)[0].split(',').length > 1;
    if (multipleRow) {
        col = Number(_.max(_.keys(funcmemo), function (args) {
            return Number(args.split(',')[1]);
        }).split(',')[1]);
    } else {
        col = row;
        row = 0;
    }
    var tbl = document.createElement('table');
    tbl.style.border = "1px solid black";
    for (var i = 0; i <= row; i++) {
        var tr = tbl.insertRow();
        var currRow = (row-i);
        tr.className = "row" + currRow;
        for (var j = 0; j <= col; j++) {
            var td = tr.insertCell();
            var currCol = col - j;
            td.style.border = "1px solid grey";
            td.style.height = "32px";
            td.className = "col" + currCol;
            td.className += " func-" + func;
            var args;
            if (multipleRow) {
                args = '' + currRow + ',' + currCol;
            } else {
                args = '' + currCol;
            }
            td.className += " args-" + args;
            $(td).click({
                func: func,
                args: args
            }, this.clickcell.bind(this));
        }
    }
    this.ele.appendChild(tbl);
    return tbl;
};

DPTable.prototype.clickcell = function (event) {
    var memoitem = event.data;
    // clean up
    $(this.ele).find('td').css('background', '');
    var gd = globalDepAnalysis(this.dependency,
                               memoitem.func,
                               _.map(memoitem.args.split(','), function (arg) {
                                   return Number(arg);
                               }));
    this.depthColor(gd);
};

DPTable.prototype.depthColor = function(gdep) {
    var that = this;
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
        var cell = that.getCell(item);
        var color = getColor(item.depth);
        cell.style.background = rgbToHex(color);
    });
};

DPTable.prototype.getCell = function (memoitem) {
    if (memoitem.args.constructor === Array) {
        memoitem.args = memoitem.args.join(',');
    }
    var selector = '.func-' + memoitem.func + '.args-' + memoitem.args.replace(',', '\\,');
    return this.ele.querySelector(selector);
};

DPTable.prototype.fillData = function () {
    var that = this;
    var memo = this.interpreter.memo;
    _.each(memo, function (funcmemo, func) {
        _.each(funcmemo, function (value, args) {
            var td = that.getCell({
                func: func,
                args: args
            });
            td.innerHTML = value;
        });

    });
};

DPTable.prototype.initBorder = function() {
    var that = this;
    _.each(this.dependency, function (fdep, func) {
        _.each(fdep, function (deps, args) {
            if (deps.length === 0) {
                var cell = that.getCell({
                    func: func,
                    args: args
                });
                cell.className += " memo-border";
            }
        });
    });
};
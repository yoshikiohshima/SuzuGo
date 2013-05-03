module('users.ohshima.suzugo.SuzuGoPlayer').requires().toRun(function() {

Object.subclass('users.ohshima.suzugo.SuzuGoPlayer.DameCounter',
'initializing', {
    initialize: function($super, aBoard) {
        this.board = aBoard;
        this.checkBoard = new Int8Array(this.board.size());
        this.stack = [];
        this.sp = -1;
        this.dameMap = new Int16Array(this.board.size());
        this.stonesMap = new Int16Array(this.board.size());
        this.isFresh = false;
        this.group = new Int16Array(this.board.size());
        this.groupP = -1;
        this.resetStats();
        this.reset();
    },
    reset: function() {
        for (var i = 0; i < this.stonesMap.length; i++) {
            this.stonesMap[i] = -1;
        }
        for (i = 0; i < this.dameMap.length; i++) {
            this.dameMap[i] = -1;
        }
    },
    resetStats: function() {
        this.stats = [0, 0];
    }
},
'accessing', {
    dameAt: function(pos) {
        if (this.board.isOob(this.board, pos)) {
            return 0;
        }
        if (this.dameMap[pos] === -1) {
            this.stats[1]++;
            this.countDameAt(pos);
        } else {
            this.stats[0]++;
        }
        return this.dameMap[pos];
    },
    stonesAt: function(pos) {
        if (this.board.isOob(this.board, pos)) {
            return 0;
        }
        if (this.dameMap[pos] === -1) {
            this.stats[1]++;
            this.countDameAt(pos);
        } else {
            this.stats[0]++;
        }
        return this.stonesMap[pos];
    }
},
'computation', {
    countDameOf: function(side) {
        var func = function(p) {
            if (this.checkBoard[p] === 0) {
                if (this.board.at(p) === 0) {
                    this.checkBoard[p] = 1;
                    this.dame++;
                } else {
                    this.stack[++this.sp] = p;
                }
            }
        };
        while (this.sp >= 0) {
            var pos = this.stack[this.sp--];
            if (this.board.at(pos) === side && this.checkBoard[pos] === 0) {
                this.checkBoard[pos] = 1;
                this.group[++this.groupP] = pos;
                this.stones++;
                this.board.fourNeighborsDo(this.board, pos, func.bind(this));
            }
        }
    },

    countDameAt: function(pos) {
        var side = this.board.at(pos);
        if (side === 1 || side === 2) {
            this.dame = 0;
            this.stones = 0;
            this.sp = -1;
            this.groupP = -1;
            this.stack[++this.sp] = pos;
            for (var i = 0; i < this.checkBoard.length; i++) {
                 this.checkBoard[i] = 0;
            }
            this.countDameOf(side);
            for (i = 0; i <= this.groupP; i++) {
                var p = this.group[i];
                this.dameMap[p] = this.dame;
                this.stonesMap[p] = this.stones;
            }
        }
    },
    lastGroupDo: function(aFunction) {
        for (var i = 0; i <= this.groupP; i++) {
            var p = this.group[i];
            aFunction(p);
        }
    }
},
'debugging', {
    printDameMap: function() {
        return this.printMap(this.dameMap);
    },
    printStonesMap: function() {
        return this.printMap(this.stonesMap);
    },
    printMap: function(b) {
        var strm = new StringBuffer();
        strm.nextPutAll("\n");
        for (var y = 0; y < this.board.boardSize; y++) {
            for (var x = 0; x < this.board.boardSize; x++) {
                var v = b[this.board.getPos(x, y)];
                strm.nextPutAll(" ");
                strm.nextPutAll(v.toString());
            }
            strm.nextPutAll("\n");
        }
        return strm.contents();
    }
});

Object.subclass('users.ohshima.suzugo.SuzuGoPlayer.GoBoard',
'initializing', {
    initialize: function($super, aSize) {
        this.boardSize = aSize;
        this.stride = aSize + 2;
        this.board = new Int8Array(this.stride * this.stride);
        this.resetOob(this);
        this.dameCounter = new users.ohshima.suzugo.SuzuGoPlayer.DameCounter(this);
        this.captures = [undefined, 0, 0];
        this.turn = 0;
        this.ko = 0;
        this.prevMove = 0;
        this.resetInfo()
    },
    resetInfo: function() {
        this.info = {spaces: 0, safeStones: 0, capturable: 0, oob: 0};
    },
    shuffledIndices: function(rStart, rEnd) {
        var s1 = this.shuffled1 = Array.range(rStart, rEnd)
        for (var i = s1.length - 1; i >= 1; i--) {
            var other = Math.floor(Math.random() * i)
            var tmp = s1[other]
            s1[other] = s1[i]
            s1[i] = tmp
        }
        return s1
    },
    resetShuffledIndices: function() {
        this.shuffledx = this.shuffledIndices(0, this.boardSize -1)
        this.shuffledy = this.shuffledIndices(0, this.boardSize -1)
    },
    reset: function() {
        for (var i = 0; i < this.board.length; i++) {
            this.board[i] = 0;
        }
        this.resetOob()
        if (this.dameCounter) {
            this.dameCounter.reset();
        }
    },
    copyFrom: function(other) {
        for (var i = 0; i < this.board.length; i++) {
            this.board[i] = other.board[i]
        }
        this.dameCounter.reset()
        this.captures[1] = this.captures[2] = 0
        this.turn = other.turn
        this.ko = other.ko
        this.prevMove = other.prevMove
        this.done = other.done
    },
},
'accessing', {
    at: function(ind) {
        return this.board[ind];
    },
    atPut: function(ind, obj) {
        this.board[ind] = obj;
    },
    nextTurn: function() {
        this.turn === 0 ? (this.turn = 1) : (this.turn = this.opponentOf(this.turn));
        return this.turn;
    },
    size: function() {
        return this.board.length;
    },
    getPos: function(x, y) {
        return (y + 1) * this.stride + x + 1;
    },
    opponentOf: function(color) {
        return 3 - color;
    }
},
'enumaration', {
    allPointsDo: function(func) {
        if (!this.shuffledx) {
            this.resetShuffledIndices()
        }
        for (var y = 0; y < this.boardSize; y++) {
            for (var x = 0; x < this.boardSize; x++) {
                func(this.getPos(this.shuffledx[x], this.shuffledy[y]));
            }
        }
    },        
    allEmptyPointsDo: function(func) {
        this.allPointsDo(function(pos) {
            if (this.at(pos) === 0) {
                func(pos)
            }
        }.bind(this))
    },
},
'playing', {
    play: function(ind, side) {
        if (ind === null) {
            this.done = true;
            return;
        }
        if (ind === 0) {
            this.ko = 0;
            if (this.prevMove === 0) {
                this.done = true;
            }
            this.prevMove = ind;
            return;
        }
        var maybeKo = 0;
        var opponent = this.opponentOf(side);
        this.dameCounter.reset()
        var totalCapture = 0;
        this.fourNeighborsDo(this, ind, function(p) {
            var c = this.at(p);
            var dame = this.dameCounter.dameAt(p);
            if (dame === 1 && c === opponent) {
                maybeKo = p;
                // the following is optimization; doing  reset() and doing dameAt() above
                // will do the full search so the group array in dameCounter holds
                // the stones affected.
                this.dameCounter.lastGroupDo(function(sPos) {
                    totalCapture++;
                    this.captures[side]++;
                    this.atPut(sPos, 0);
                }.bind(this));
            }
        }.bind(this));
        this.atPut(ind, side);
        this.dameCounter.reset();
        this.prevMove = ind;

        this.dameCounter.countDameAt(ind);
        if (this.dameCounter.stonesAt(ind) === 1
                && this.dameCounter.dameAt(ind) === 1
                && totalCapture === 1) {
            this.ko = maybeKo;
        } else {
            this.ko = 0;
        }
    },
    checkMove: function(pos, side) {
        if (this.at(pos) !== 0) {
            return false;
        }
        if (this.ko === pos) {
            return false;
        }
        var opponent = this.opponentOf(side);
        this.lookAround(pos, side);
        if (this.info.capturable === 0 && this.info.spaces === 0 && this.info.safeStones === 0) {
            return false;
        }
        if (this.info.oob + this.info.safeStones === 4) {
            return false;
        }
        return true;
    },
    lookAround: function(pos, side) {
        var opponent = this.opponentOf(side);
        this.resetInfo();
        var fourNeighbors = this.info;
        this.fourNeighborsDo(this, pos, function(p) {
            var c = this.at(p);
            if (c === 0) {
                fourNeighbors.spaces++;
            } else if (c === 3) {
                fourNeighbors.oob++;
            } else {
                var dame = this.dameCounter.dameAt(p);
                if (c === opponent && dame === 1) {
                    fourNeighbors.capturable += this.dameCounter.stonesAt(p);
                }
                if (c === side && this.dameCounter.dameAt(p) >= 2) {
                    fourNeighbors.safeStones++;
                }
            }
        }.bind(this));
        return fourNeighbors;
    },
    playout: function(aBoard, side, candidates) {
        var limit = aBoard.boardSize * aBoard.boardSize + 100;
        this.turn = this.opponentOf(side);
        for (var i = 0; i < limit; i++) {
            var nextSide = this.nextTurn();
            var pos = this.nextRandomMove(aBoard, nextSide, candidates);
            aBoard.play(pos, nextSide);
            if (aBoard.done) {
                return;
            }
        }
    },
    possibleMoves: function(aBoard, side, candidates) {
        candidates.length = 0;
        aBoard.allEmptyPointsDo(function(pos) {
            if (aBoard.checkMove(pos, side)) {
                candidates.push(pos);
            }
        });
        return candidates;
    },
    nextRandomMove: function(aBoard, side, candidates) {
        this.possibleMoves(aBoard, side, candidates);
        if (candidates.length === 0) {
            return 0;
        }
        var rand = Math.floor(Math.random() * candidates.length);
        return candidates[rand];
        //return this.findAMoveInPlayout(side, aBoard, candidates);
    },
    selectBestMove: function(aBoard, side, mSecs) {
        var playBoard = new this.constructor(this.boardSize);
        var points = [];
        var playoutStart = Date.now();
        var playouts = 0;
        var i;
        this.resetShuffledIndices()
        aBoard.allEmptyPointsDo(function(p) {
            if (aBoard.checkMove(p, side)) {
                points.push(p);
            }
        });
        var scores = new Array(points.length);
        for (i = 0; i < points.length; i++) {
            scores[i] = 0;
        }
        var repeatC = 0;
        var candidates = [];
        var more = true;
        while (more) {
            repeatC++;
            for (var t = 0; t < 1; t++) {
                for (ii = 0; ii < points.length; ii++) {
                    var pos = points[ii];
                    playBoard.copyFrom(aBoard);
                    playBoard.play(pos, side);
                    playBoard.playout(playBoard, this.opponentOf(side), candidates);
                    playouts++;
                    //console.log(playBoard.toString())
                    var win = playBoard.countScore(side, 6.5);
                    scores[ii] += win;
                }
            }
            more = (Date.now() - playoutStart) < mSecs;
        }
        console.log("rep: " + repeatC + "scores: " + scores);
        var best = 0;
        var bestScore = -100;
        for (i = 0; i < points.length; i++) {
            if (scores[i] > bestScore) {
                bestScore = scores[i];
                best = points[i];
            }
        }
        return [best, playouts, playBoard.dameCounter.stats];
    },
    countScore: function(side, komi) {
        var score = 0;
        var kinds = [0, 0];
        var n = [0, 0];
        this.allPointsDo(function(pos) {
            var c = this.at(pos);
            if (c !== 0) {
                kinds[c-1]++;
            }
            if (c === 0) {
                n[0] = n[1] = 0;
                this.fourNeighborsDo(this, pos, function(p) {
                    var c = this.at(p);
                    if (c !== 0) {
                        n[c-1]++;
                    }
                }.bind(this));
                if (n[0] > 0 && n[1] === 0) {
                    score++;
                }
                if (n[1] > 0 && n[0] === 0) {
                    score--;
                }
            }
        }.bind(this));
        //return [score, kinds[0], kinds[1]]
        score = score + kinds[0] - kinds[1] - komi;
        return side === 2 ? (score < 0 ? 1 : -1) : (score > 0 ? 1 : -1);
    },
    fourNeighborsDo: function(aBoard, pos, aFunc) {
        aFunc(pos - this.stride);
        aFunc(pos + this.stride);
        aFunc(pos - 1);
        aFunc(pos + 1);
    },

    isOob: function(aBoard, pos) {
        return aBoard.at(pos) === 3;
    },

    resetOob: function(aBoard) {
        var s = aBoard.stride;
        for (var i = 0; i < s - 1; i++) {
            aBoard.atPut(i, 3);
            aBoard.atPut(aBoard.size()-i-1, 3);
            aBoard.atPut(i * s + s - 1, 3);
            aBoard.atPut(i * s + s, 3);
        }
    }
},
'printing', {
    boxDrawingFor: function(x, y, size) {
        if (x === 0 && y === 0) {
            return '┌';
        }
        if (x === size - 1 && y === 0) {
            return '┐';
        }
        if (x === 0 && y === size - 1) {
            return '└';
        }
        if (x === size -1 && y === size - 1) {
            return '┘';
        }
        if (x === 0) {
            return '├';
        }
        if (y === 0) {
            return '┬';
        }
        if (x === size - 1) {
            return '┤';
        }
        if (y === size - 1) {
            return '┴' ;  
        }
        return '┼';
    },
    toString: function() {
        var strm = new StringBuffer();
        strm.nextPutAll("\n");
        for (var y = 0; y < this.boardSize; y++) {
            for (var x = 0; x < this.boardSize; x++) {
                var v = this.at(this.getPos(x, y));
                var str = v === 1 ?
                    "●" : (v === 2 ? "○" : this.boxDrawingFor(x, y, this.boardSize));
                strm.nextPutAll(str);
            }
            strm.nextPutAll("\n");
        }
        return strm.contents();
    }
});

}); // end of module
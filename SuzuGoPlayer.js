module('users.ohshima.suzugo.SuzuGoPlayer').requires().toRun(function() {

Object.subclass('users.ohshima.suzugo.SuzuGoPlayer.DameCounter',
'initializing', {
    initialize: function($super, aBoard) {
        this.board = aBoard;
        this.checkBoard = new Int8Array(this.board.size());
        this.stack = new Int16Array(this.board.size());
        this.sp = -1;
        this.dameMap = new Int16Array(this.board.size());
        this.stonesMap = new Int16Array(this.board.size());
        this.isValid = false;
        this.group = new Int16Array(this.board.size());
        this.groupP = -1;
        this.resetStats();
        this.reset();
    },
    reset: function() {
        this.isValid = false;
    },
    resetStats: function() {
        this.stats = [0, 0];
    }
},
'accessing', {
    dameAt: function(pos) {
        if (this.board.isOob(pos)) {
            return 0;
        }
        if (!this.isValid || this.dameMap[pos] === -1) {
            this.stats[1]++;
            this.countDameAt(pos);
        } else {
            this.stats[0]++;
        }
        return this.dameMap[pos];
    },
    stonesAt: function(pos) {
        if (this.board.isOob(pos)) {
            return 0;
        }
        if (!this.isValid || this.dameMap[pos] === -1) {
            this.stats[1]++;
            this.countDameAt(pos);
        } else {
            this.stats[0]++;
        }
        return this.stonesMap[pos];
    }
},
'computation', {
    coundDameFunc: function(p) {
        if (this.checkBoard[p] === 0) {
            if (this.board.at(p) === 0) {
                this.checkBoard[p] = 1;
                this.dame++;
            } else {
                this.stack[++this.sp] = p;
            }
        }
    },  
    countDameOf: function(side) {
        while (this.sp >= 0) {
            var pos = this.stack[this.sp--];
            if (this.board.at(pos) === side && this.checkBoard[pos] === 0) {
                this.checkBoard[pos] = 1;
                this.group[++this.groupP] = pos;
                this.stones++;
                this.board.fourNeighborsDo(pos, this.coundDameFunc.bind(this));
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
                this.stonesMap[i] = -1;
                this.dameMap[i] = -1;
            }
            this.isValid = true;
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
        this.resetOob();
        this.dameCounter = new users.ohshima.suzugo.SuzuGoPlayer.DameCounter(this);
        this.captures = [undefined, 0, 0];
        this.turn = 0;
        this.ko = 0;
        this.prevMove = 0;
        this.resetInfo();
    },
    resetInfo: function() {
        return this.info = {spaces: 0, safeStones: 0, capturable: 0, oob: 0};
    },
    shuffledIndices: function(rStart, rEnd) {
        var s1 = this.shuffled1 = Array.range(rStart, rEnd);
        for (var i = s1.length - 1; i >= 1; i--) {
            var other = Math.floor(Math.random() * i);
            var tmp = s1[other];
            s1[other] = s1[i];
            s1[i] = tmp;
        }
        return s1;
    },
    resetShuffledIndices: function() {
        this.shuffledx = this.shuffledIndices(0, this.boardSize -1);
        this.shuffledy = this.shuffledIndices(0, this.boardSize -1);
    },
    copyFrom: function(other) {
        for (var i = 0; i < this.board.length; i++) {
            this.board[i] = other.board[i];
        }
        this.dameCounter.reset();
        this.captures[1] = this.captures[2] = 0;
        this.turn = other.turn;
        this.ko = other.ko;
        this.prevMove = other.prevMove;
        this.done = other.done;
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
            this.resetShuffledIndices();
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
                func(pos);
            }
        }.bind(this));
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
        this.dameCounter.reset();
        var totalCapture = 0;
        this.fourNeighborsDo(ind, function(p) {
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
        var fourNeighbors = this.resetInfo();
        this.fourNeighborsDo(pos, function(p) {
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
    playout: function(side, candidates) {
        var limit = this.boardSize * this.boardSize + 100;
        this.turn = this.opponentOf(side);
        for (var i = 0; i < limit; i++) {
            var nextSide = this.nextTurn();
            var pos = this.nextRandomMove(nextSide, candidates);
            this.play(pos, nextSide);
            if (this.done) {
                return;
            }
        }
    },
    possibleMoves: function(side, candidates) {
        candidates.length = 0;
        this.allEmptyPointsDo(function(pos) {
                candidates.push(pos);
        }.bind(this));
        return candidates;
    },
    nextRandomMove: function(side, candidates) {
        this.possibleMoves(side, candidates);
        if (candidates.length === 0) {
            return 0;
        }
        var rand = Math.floor(Math.random() * candidates.length);
        return this.findAMoveInPlayout(side, candidates);
    },
    findAMoveInPlayout: function(side, candidates) {
        while (true) {
            if (candidates.length === 0) {
                return 0;
            }
            var rand = Math.floor(Math.random() * candidates.length);
            var pos = candidates[rand];
            var result = this.checkMove(pos, side);
            if (result) {
                 return pos;
            }
            var last = candidates.pop();
            if (rand < candidates.length - 1) {
                candidates[rand] = last;
            }
        }
    },
    selectBestMove: function(side, mSecs) {
        var playBoard = new this.constructor(this.boardSize);
        var points = [];
        var playoutStart = Date.now();
        var playouts = 0;
        var i;
        this.resetShuffledIndices();
        this.allEmptyPointsDo(function(p) {
            if (this.checkMove(p, side)) {
                points.push(p);
            }
        }.bind(this));
        var scores = new Int32Array(points.length);
        for (i = 0; i < points.length; i++) {
            scores[i] = 0;
        }
        var repeatC = 0;
        var candidates = [];
        var more = true;
        while (more) {
            repeatC++;
            for (var t = 0; t < 1; t++) {
                for (i = 0; i < points.length; i++) {
                    var pos = points[i];
                    playBoard.copyFrom(this);
                    playBoard.play(pos, side);
                    playBoard.playout(this.opponentOf(side), candidates);
                    playouts++;
                    //console.log(playBoard.toString())
                    var win = playBoard.countScore(side, 6.5);
                    scores[i] += win;
                }
            }
            more = (Date.now() - playoutStart) < mSecs;
        }
        console.log("rep: " + repeatC + " scores: " + scores);
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
                this.fourNeighborsDo(pos, function(p) {
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
        return side === 2 ? (score < 0 ? 1 : 0) : (score > 0 ? 1 : 0);
    },
    fourNeighborsDo: function(pos, aFunc) {
        aFunc(pos - this.stride);
        aFunc(pos + this.stride);
        aFunc(pos - 1);
        aFunc(pos + 1);
    },

    isOob: function(pos) {
        return this.at(pos) === 3;
    },

    resetOob: function() {
        var s = this.stride;
        for (var i = 0; i < s - 1; i++) {
            this.atPut(i, 3);
            this.atPut(this.size()-i-1, 3);
            this.atPut(i * s + s - 1, 3);
            this.atPut(i * s + s, 3);
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
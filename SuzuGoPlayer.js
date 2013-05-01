module('users.ohshima.suzugo.SuzuGoPlayer').requires().toRun(function() {

Object.subclass('users.ohshima.suzugo.SuzuGoPlayer.DameCounter',
'initializing', {
    initialize: function($super, aBoard) {
        this.board = aBoard
        this.checkBoard = new Int8Array(this.board.size())
        this.stack = []
        this.sp = -1
        this.dameMap = new Int16Array(this.board.size())
        this.stonesMap = new Int16Array(this.board.size())
        this.isFresh = false
        this.group = new Int16Array(this.board.size())
        this.groupP = -1
        this.reset()
    },
    reset: function() {
        for (var i = 0; i < this.stonesMap.length; i++) {
            this.stonesMap[i] = -1
        }
        for (i = 0; i < this.dameMap.length; i++) {
            this.dameMap[i] = -1
        }
    }
},
'accessing', {
    dameAt: function(pos) {
        if (this.board.isOob(this.board, pos)) {
            return 0
        }
        if (this.dameMap[pos] == -1) {
            this.countDameAt(pos)
        }
        return this.dameMap[pos]
    },
    stonesAt: function(pos) {
        if (this.board.isOob(this.board, pos)) {
            return 0
        }
        if (this.dameMap[pos] == -1) {
            this.countDameAt(pos)
        }
        return this.stonesMap[pos]
    }
},
'computation', {
    countDameOf: function(side) {
        debugger;
        var func = function(p) {
            if (this.checkBoard[p] === 0) {
                if (this.board.at(p) === 0) {
                    this.checkBoard[p] = 1
                    this.dame++
                } else {
                    this.stack[++this.sp] = p
                }
            }
        }
        while (this.sp >= 0) {
            var pos = this.stack[this.sp--]
            if (this.board.at(pos) == side && this.checkBoard[pos] === 0) {
                this.checkBoard[pos] = 1
                this.group[++this.groupP] = pos
                this.stones++
                this.board.fourNeighborsDo(this.board, pos, func.bind(this))
            }
        }
    },

    countDameAt: function(pos) {
        var side = this.board.at(pos)
        if (side == 1 || side == 2) {
            this.dame = 0
            this.stones = 0
            this.sp = -1
            this.groupP = -1
            this.stack[++this.sp] = pos
            for (var i = 0; i < this.checkBoard.length; i++) {
                 this.checkBoard[i] = 0
            }
            this.countDameOf(side)
            for (i = 0; i <= this.groupP; i++) {
                var p = this.group[i]
                this.dameMap[p] = this.dame
                this.stonesMap[p] = this.stones
            }
        }
    },
    lastGroupDo: function(aFunction) {
        for (var i = 0; i <= this.groupP; i++) {
            var p = this.group[i]
            aFunction(p)
        }
    }
},
'debugging', {
    printDameMap: function() {
        return this.printMap(this.dameMap)
    },
    printStonesMap: function() {
        return this.printMap(this.stonesMap)
    },
    printMap: function(b) {
        var strm = new StringBuffer()
        strm.nextPutAll("\n")
        for (var y = 0; y < this.board.boardSize; y++) {
            for (var x = 0; x < this.board.boardSize; x++) {
                var v = b[this.board.getPos(x, y)]
                strm.nextPutAll(" ")
                strm.nextPutAll(v.toString())
            }
            strm.nextPutAll("\n")
        }
        return strm.contents()
    }
})

Object.subclass('users.ohshima.suzugo.SuzuGoPlayer.GoBoard',
'initializing', {
    initialize: function($super, aSize) {
        this.boardSize = aSize
        this.stride = aSize + 2
        this.board = new Int8Array(this.stride * this.stride)
        this.resetOob(this)
        this.dameCounter = new users.ohshima.suzugo.SuzuGoPlayer.DameCounter(this)
        this.captures = [undefined, 0, 0]
        this.turn = 0
        this.candidates = []
    },

    reset: function() {
        for (var i = 0; i < this.board.length; i++) {
            this.board[i] = 0
        }
        if (this.dameCounter) {
            this.dameCounter.reset()
        }
    }
},
'accessing', {
    at: function(ind) {
        return this.board[ind]
    },
    atPut: function(ind, obj) {
        this.board[ind] = obj
    },
    play: function(ind, side) {
        this.atPut(ind, side)
        if (this.dameCounter) {
            this.dameCounter.reset()
        }
        var func = function(p) {
            if (this.at(p) == this.opponentOf(side) && this.dameCounter.dameAt(p) === 0) {
                this.dameCounter.lastGroupDo(function(sPos) {
                    this.captures[side]++
                    this.atPut(sPos, 0)
                }.bind(this))
            }
        }.bind(this)
        this.fourNeighborsDo(this, ind, func)
    },
    size: function() {
        return this.board.length
    },
    getPos: function(x, y) {
        return (y + 1) * this.stride + x + 1
    },
    opponentOf: function(color) {
        return 3 - color
    },
    fourNeighborsDo: function(aBoard, pos, aFunc) {
        aFunc(pos - this.stride)
        aFunc(pos + this.stride)
        aFunc(pos - 1)
        aFunc(pos + 1)
    },

    isOob: function(aBoard, pos) {
        return aBoard.at(pos) == 3
    },

    resetOob: function(aBoard) {
        var s = aBoard.stride
        for (var i = 0; i < s - 1; i++) {
            aBoard.atPut(i, 3)
            aBoard.atPut(aBoard.size()-i-1, 3)
            aBoard.atPut(i * s + s - 1, 3)
            aBoard.atPut(i * s + s, 3)
        }
    }
},
'printing', {
    boxDrawingFor: function(x, y, size) {
        if (x === 0 && y === 0) {
            return '┌'
        }
        if (x == size - 1 && y === 0) {
            return '┐'
        }
        if (x === 0 && y == size - 1) {
            return '└'
        }
        if (x == size -1 && y == size - 1) {
            return '┘'
        }
        if (x === 0) {
            return '├'
        }
        if (y === 0) {
            return '┬'
        }
        if (x == size - 1) {
            return '┤'
        }
        if (y == size - 1) {
            return '┴'   
        }
        return '┼'
    },
    toString: function() {
        var strm = new StringBuffer()
        strm.nextPutAll("\n")
        for (var y = 0; y < this.boardSize; y++) {
            for (var x = 0; x < this.boardSize; x++) {
                var v = this.at(this.getPos(x, y))
                var str = v == 1 ?
                    "●" : (v == 2 ? "○" : this.boxDrawingFor(x, y, this.boardSize))
                strm.nextPutAll(str)
            }
            strm.nextPutAll("\n")
        }
        return strm.contents()
    }
})

}) // end of module
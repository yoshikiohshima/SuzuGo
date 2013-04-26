module('users.ohshima.suzugo.SuzuGoPlayer').requires().toRun(function() {

Object.subclass('users.ohshima.suzugo.SuzuGoPlayer.DameCounter',
'initializing', {
    initialize: function($super, aBoard) {
        this.board = aBoard
        this.checkBoard = new Int8Array(this.board.size())
        this.stack = []
        this.sp = -1
        this.dameMap = new Int8Array(this.board.size())
        this.stoneMap = new Int8Array(this.board.size())
        this.isFresh = false
        this.group = new Int8Array(this.board.size())
        this.groupP = -1
    },
    reset: function() {
        for (var i = 0; i < this.stoneMap.length; i++) {
            this.stoneMap[i] = 255
        }
        for (i = 0; i < this.dameMap.length; i++) {
            this.dameMap[i] = 255
        }
    }
},
'accessing', {
    dameAt: function(pos) {
        if (isOob(this.board, pos)) {
            return 0
        }
        if (this.dameMap[pos] == 255) {
            this.countDameAt(pos)
        }
        return this.dameMap[pos]
    },
    stonesAt: function(pos) {
        if (isOob(aBoard, pos)) {
            return 0
        }
        if (this.dameMap[pos] == 255) {
            this.countDameAt(pos)
        }
        return this.stoneMap[pos]
    }
},
'computation', {
    countDameOf: function(side) {
        var func = function(p) {
            if (this.checkBoard[p] === 0) {
                if (this.board[p] === 0) {
                    this.checkBoard[p] = 1
                    this.dame++
                } else {
                    this.stack[++sp] = p
                }
            }
        }
        while (sp >= 0) {
            var pos = stack[sp--]
            if (this.board[pos] == side && this.checkBoard[pos] === 0) {
                this.checkBoard[pos] = 1
                this.group[++groupP] = pos
                this.stones++
                this.fourNeighborsDo(this.board, pos, func.bind(this))
            }
        }
    },

    countDameAt: function(pos) {
        var side = this.board[pos]
        if (side == 1 || side == 2) {
            this.dame = 0
            this.stones = 0
            this.sp = -1
            this.groupP = -1
            for (var i = 0; i < this.checkBoard.length; i++) {
                 this.checkBoard[i] = 255
            }
            this.countDameOf(side)
            for (i = 0; i <= groupP; i++) {
                var p = group[i]
                this.dameMap[p] = this.dame
                this.stonesMap[p] = this.stones
            }
        }
    }
})

Object.subclass('users.ohshima.suzugo.SuzuGoPlayer.GoBoard',
'initializing', {
    initialize: function($super, aSize) {
        this.boardSize = aSize
        this.stride = aSize + 2
        this.board = new Int8Array(this.stride * this.stride)
        this.dameCounter = new DameCounter(this)

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
    size: function() {
        return this.board.length
    },
    getPos: function(x, y) {
        return (y + 1) * stride + x + 1
    },
    fourNeighborsDo: function(aBoard, pos, aFunc) {
        aFunc(aBoard, pos - stride)
        aFunc(aBoard, pos + stride)
        aFunc(aBoard, pos - 1)
        aFunc(aBoard, pos + 1)
    },

    isOob: function(aBoard, pos) {
        return aBoard.at(pos) == 3
    },

    resetOob: function(aBoard, stride) {
        var s = this.stride
        for (var i = 0; i < s - 1; i++) {
            aBoard.atPut(i, 3)
            aBoard.atPut(aBoard.size()-i-1, 3)
            aBoard.atPut(i * s + s - 1, 3)
            aBoard.atPut(i * s + s, 3)
        }
    }


})

}) // end of module
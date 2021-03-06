module('users.ohshima.suzugo.SuzuGo').requires('lively.morphic').toRun(function() {

lively.morphic.Morph.subclass('users.ohshima.suzugo.SuzuGo.SuzuGoPiece',
'initialization', {
    initialize: function($super, ext, pos) {
        $super();
        var b = ext.scaleBy(-0.5).extent(ext);
        var s = new lively.morphic.Shapes.Ellipse(b);
        this.setShape(s);
        this.setBounds(b);
        this.pos = pos;
    }
},
'looks', {
    setType: function(aSide) {
        this.setFill([Color.black, Color.white][aSide-1] || Color.transparent);
    }
});

lively.morphic.Image.subclass('users.ohshima.suzugo.SuzuGo.SuzuGoBoard',
'initializing', {
    initialize: function($super) {
        $super(pt(0, 0).extent(pt(100, 100)), undefined, true);
    },
    setBoard: function(aBoard) {
        this.board = aBoard;
        var aSize = aBoard.boardSize;
        var file = aSize === 9
                    ? 'Goban_9x9_vide.png'
                    : (aSize === 13
                        ? 'Goban_13x13_vide.png' : 'Goban_19x19_vide.png');
        var ext = aSize === 9
                    ? pt(429, 429)
                    : (aSize === 13
                        ? pt(441, 441) : pt(453, 453));
        this.boardSize = aSize === 9 ? 9 : (aSize === 13 ? 13 : 19);
        this.setExtent(ext);
        this.setImageURL('http://localhost:9001/users/ohshima/suzugo/' + file);
        this.initPieces();
        this.initMoveMarkers();
    },
    initBoard: function(aSize) {
        this.setBoard(new users.ohshima.suzugo.SuzuGoPlayer.GoBoard(aSize));
    },
    initMoveMarkers: function() {
        var sample = this.pieces[this.board.getPos(0, 0)];
        this.lastMoveMarker = lively.morphic.Morph.makeCircle(pt(0, 0), sample.bounds().extent().x*0.2, 0, Color.black, Color.gray);
        this.koMarker = lively.morphic.Morph.makeCircle(pt(0, 0), sample.bounds().extent().x*0.2, 0, Color.black, Color.red);
    },
    initPieces: function() {
        this.removeAllMorphs();
        var dict = {9: {margin: 10, steps: 51, size: 48},
                    13: {margin: 10, steps: 35, size: 34}}[this.boardSize] || {margin: 10, steps: 24, size: 22};

        this.pieces = [];
        for (var y = 0; y < this.boardSize; y++) {
            for (var x = 0; x < this.boardSize; x++) {
                var piece = new users.ohshima.suzugo.SuzuGo.SuzuGoPiece(pt(dict.size, dict.size), (y+1)*(this.boardSize+2)+x+1);
                piece.disableGrabbing()
                this.addMorph(piece);
                piece.setPosition(pt(dict.steps * x + dict.margin, dict.steps * y + dict.margin));
                piece.setType(0);
                this.pieces[(y+1)*(this.boardSize+2)+x+1] = piece;
            }
        }
    },
    updatePieces: function(aBoard) {
        this.pieces.forEach(function(piece) {
            piece.setType(aBoard.at(piece.pos));
        });
    }
},
'callbacks', {
    response: function(response) {
        if (response.data.constructor === ArrayBuffer) {
            that.master.result = new Int8Array(response.data);
            return;
        }
        if (response.data.response == "playOutCount") {
            this.master.playOutCount += response.data.value;
            this.master.mayKeepWorker(this.index);
        }
    },
    error: function(error) {
        console.log(err.message.toString());
    }
},
'SGF playback', {
    setPlaybackFor: function(sgf) {
        this.sgf = sgf;
        this.initBoard(sgf.getProperty('SZ'));
        this.current = null;
    },
    playback: function(sgf) {
        this.setPlaybackFor(sgf);
        this.startStepping(1000, 'playbackNext');
    },
    playbackNext: function() {
        var move = this.sgf.findNextMove(this.current);
        if (move) {
            var side = move[1] == "B" ? 1 : 2;
            var pos = this.board.getPos(move[2][0], move[2][1]);
            this.board.play(pos, side);
            this.updatePieces(this.board);
            this.current = move;
            this.showLastMove(pos);
            this.showKo(this.board.ko);
        } else {
            this.stopStepping();
        }
    },
    playNext: function() {
        var turn = this.board.nextTurn();
        var move = this.board.selectBestMove(turn, 5000);
        this.board.play(move[0], turn);
        this.updatePieces(this.board);
        this.showLastMove(move[0]);
        this.showKo(this.board.ko) ;       
    },
    play: function() {
        this.startStepping(1000, 'playNext');
    },

    showLastMove: function(pos) {
        if (pos !== 0) {
            this.addMorphFront(this.lastMoveMarker);
            this.lastMoveMarker.setPosition(this.pieces[pos].getPosition());
        } else {
            this.lastMoveMarker.remove();
        }
    },
    showKo: function(pos) {
        if (pos !== 0) {
            this.addMorphFront(this.koMarker);
            this.koMarker.setPosition(this.pieces[pos].getPosition());
        } else {
            this.koMarker.remove();
        }
    }

},
'workers', {
    initWorkers: function(count) {
        var that = this;
        this.count = count;
//        if (this.workers) {
//            for (var i = 0; i < this.workers.length; i++)
//            this.workers[i].terminate()
//        }
        this.workers = [];
        for (i = 0; i < count; i++) {
            var worker = new Worker("PlayerWorker.js?time="+ Date.now());
            this.workers.push(worker);
            worker.state = "dormant";
            worker.index = i;
            worker.master = that;
            worker.onmessage = that.response;
            worker.onerror = that.error;
        }
    },

    sendBuffer: function(ind) {
        var buf = new ArrayBuffer((9+2) * (9+2));
        this.workers[ind].postMessage(buf, [buf]);
    },

    startWorker: function(ind) {
        this.workers[ind].postMessage({command: "start"});
        this.workers[ind].state = "busy";
    },

    keepWorker: function(ind) {
        this.workers[ind].postMessage({command: "keep"});
    },

    stopWorker: function(ind) {
        this.workers[ind].postMessage({command: "stop"});
        this.workers[ind].state = "dormant";
    }
},
'driver', {
    resetPlayOutCount: function() {
        this.playOutCount = 0;
    },
    runWorkers: function(ms) {
        this.startTime = Date.now();
        this.duration = ms;
        for (var i = 0; i < this.count; i++) {
            this.sendBuffer(i);
            this.startWorker(i);
        }
    },
    mayKeepWorker: function(ind) {
        var now = Date.now();
        if (now - this.startTime < this.duration) {
            this.keepWorker(ind);
        } else {
            this.stopWorker(ind);
            if (this.workers.select(function(elem) {return elem.state == "busy"}).length === 0) {
                this.done();
            }
        }
    },
    done: function() {
        console.log("threads: " + this.count + ", " + "count: " + this.playOutCount / 1000000);
    }
});
})// end of module

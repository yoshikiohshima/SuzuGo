module('users.ohshima.suzugo.SuzuGoTests').requires('lively.TestFramework', 'users.ohshima.suzugo.SuzuGoPlayer').toRun(function() {
TestCase.subclass('users.ohshima.suzugo.SuzuGoTests.BoardTests', {
    setUp: function($super) {
        $super()
    },

    testResetOob: function() {
        var board = new users.ohshima.suzugo.SuzuGoPlayer.GoBoard(9)
        board.resetOob(board)
        this.assertEquals(board.at(0), 3)
        this.assertEquals(board.at(1), 3)
        this.assertEquals(board.at(10), 3)
        this.assertEquals(board.at(11), 3)
        this.assertEquals(board.at(12), 0)
    },
    testCountDame: function() {
        var morph = new users.ohshima.suzugo.SuzuGo.SuzuGoBoard()
        var tree = new users.ohshima.suzugo.SGF.Reader().example1()
        var sgf = new users.ohshima.suzugo.SGF.Data(tree[0])
        morph.setPlaybackFor(sgf)
        var board = morph.board
        for (var i = 0; i < 128; i++) {
            morph.playbackNext()
        }
        // morph.board should look like at this point:
        // ┌┬┬┬┬┬┬┬┬○○●┬○●┬┬┬┐
        // ├┼┼┼●┼┼┼●○┼○┼○●○┼┼┤
        // ├┼┼┼●○○●┼●○○○●┼●┼┼┤
        // ├○○○○●○●┼●○●┼●┼●┼┼┤
        // ├●●┼┼●○┼●○●●┼┼┼┼●┼┤
        // ├●○●┼●○○●○○●┼●┼┼┼┼┤
        // ├○○○┼○●●┼○●○○┼┼┼○┼┤
        // ├●○○┼┼┼┼┼○●┼┼┼┼┼┼┼┤
        // ├●●○┼┼┼┼┼○●┼┼┼┼┼┼○┤
        // ├●○┼┼┼┼┼┼┼┼┼┼┼○┼○●┤
        // ├○○┼┼┼┼┼┼┼┼┼┼┼┼┼○●┤
        // ├┼┼┼┼┼┼┼┼┼┼┼┼┼●○●○┤
        // ├┼●┼┼┼┼┼┼┼┼○┼┼○○●●┤
        // ├┼┼●●○┼┼○○┼┼┼┼┼┼○●┤
        // ├┼┼○●○┼┼┼●┼●┼┼┼┼┼┼┤
        // ├┼●●○○●┼┼●┼┼┼○○┼●┼┤
        // ├┼●○┼┼┼┼┼┼┼○●○●●┼┼┤
        // ├┼┼●○┼┼┼┼┼┼┼●●┼┼┼┼┤
        // └┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┘

        // There are four liberties around the white group of three at right
        this.assertEquals(board.dameCounter.dameAt(morph.board.getPos(15, 11)), 4)
        this.assertEquals(board.dameCounter.dameAt(morph.board.getPos(15, 12)), 4)

        // There are three stones in the group
        this.assertEquals(board.dameCounter.stonesAt(morph.board.getPos(15, 11)), 3)
        this.assertEquals(board.dameCounter.stonesAt(morph.board.getPos(15, 12)), 3)

         // There are three connected stones
        this.assertEquals(board.dameCounter.stonesAt(morph.board.getPos(9, 0)), 3)
        this.assertEquals(board.dameCounter.stonesAt(morph.board.getPos(10, 0)), 3)

        // They have two liberties
        this.assertEquals(board.dameCounter.dameAt(morph.board.getPos(9, 0)), 2)
        this.assertEquals(board.dameCounter.dameAt(morph.board.getPos(10, 0)), 2)  
    },
    testCheckMoves: function() {
        var morph = new users.ohshima.suzugo.SuzuGo.SuzuGoBoard()
        var tree = new users.ohshima.suzugo.SGF.Reader().example9()
        var sgf = new users.ohshima.suzugo.SGF.Data(tree[0])
        morph.setPlaybackFor(sgf)
        var board = morph.board
        for (var i = 0; i < 33; i++) {
            morph.playbackNext()
        }
        // morph.board should look like at this point:
        // ┌┬┬┬┬┬┬┬┐
        // ├┼┼○●○┼●┤
        // ├┼┼○●○○┼┤
        // ├┼┼●●○┼○┤
        // ├●○●●●○●┤
        // ├●●○○●┼●┤
        // ├○○┼○○●┼┤
        // ├┼┼┼○●┼┼┤
        // └┴┴┴┴┴┴┴┘

        // Black cannot play in the white eye
        this.assert(!board.checkMove(morph.board.getPos(6, 3), 1))
        // White can play in the white eye but for playout, it should not do that
        this.assert(!board.checkMove(morph.board.getPos(6, 3), 2))
        
        var info = board.lookAround(morph.board.getPos(6, 3), 2)
        this.assertEquals(info.spaces, 0); // no empty space around it
        this.assertEquals(info.safeStones, 4); // all stones around it is not in atari
        this.assertEquals(info.capturable, 0); // There is no opponent stones
        this.assertEquals(info.oob, 0);        // There is no wall
        
        // If black plays here
        info = board.lookAround(morph.board.getPos(2, 3), 1);
        this.assertEquals(info.spaces, 2); // 2 spaces around it
        this.assertEquals(info.safeStones, 1); // One black group touching this point
        this.assertEquals(info.capturable, 1); // There is one stone in atari
        this.assertEquals(info.oob, 0);        // There is no wall

        // If white plays here
        info = board.lookAround(morph.board.getPos(8, 4), 2);
        this.assertEquals(info.spaces, 2); // 2 spaces around it
        this.assertEquals(info.safeStones, 0); // One black group touching this point
        this.assertEquals(info.capturable, 0); // There is one stone in atari
        this.assertEquals(info.oob, 1);        // There is no wall

        // For an empty corner
        info = board.lookAround(morph.board.getPos(0, 0), 2);
        this.assertEquals(info.spaces, 2); // 2 spaces around it
        this.assertEquals(info.safeStones, 0); // One black group touching this point
        this.assertEquals(info.capturable, 0); // There is one stone in atari
        this.assertEquals(info.oob, 2);        // There is no wall
    },
    testPossibleMoves: function() {
        var morph = new users.ohshima.suzugo.SuzuGo.SuzuGoBoard()
        var tree = new users.ohshima.suzugo.SGF.Reader().example9()
        var sgf = new users.ohshima.suzugo.SGF.Data(tree[0])
        morph.setPlaybackFor(sgf)
        var board = morph.board
        for (var i = 0; i < 33; i++) {
            morph.playbackNext()
        }
        // morph.board should look like at this point:
        // ┌┬┬┬┬┬┬┬┐
        // ├┼┼○●○┼●┤
        // ├┼┼○●○○┼┤
        // ├┼┼●●○┼○┤
        // ├●○●●●○●┤
        // ├●●○○●┼●┤
        // ├○○┼○○●┼┤
        // ├┼┼┼○●┼┼┤
        // └┴┴┴┴┴┴┴┘
        var candidates = board.possibleMoves(board, 1)
        this.assertEquals(candidates.length, 48)
        
        for (i = 0; i < 1000; i++) {
            var move = board.findAMoveInPlayout(1, board, candidates)
            this.assert(candidates.indexOf(move) >= 0) 
        }
    }
})

}) // end of module

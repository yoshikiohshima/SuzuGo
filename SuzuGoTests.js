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
        // White can play in the white eye
        this.assertEquals(board.dameCounter.dameAt(morph.board.getPos(15, 12)), 4)
    }

})

}) // end of module

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
    }
})

}) // end of module

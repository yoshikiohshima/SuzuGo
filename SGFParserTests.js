module('users.ohshima.suzugo.SGFParserTests').requires('lively.TestFramework').toRun(function() {

TestCase.subclass('users.ohshima.suzugo.SGFParserTests.Tests',
'tests', {
    testSimple: function() {
        this.assertEquals(SGFParser.matchAll("d", "cRange", ["a", "z"]), "d")
        this.assertEquals(SGFParser.matchAll("B", "color"), "B")

        this.assertEquals(SGFParser.matchAll("JA", "move")[0], 9)
        this.assertEquals(SGFParser.matchAll("64", "number"), 64)

        this.assertEquals(SGFParser.matchAll("\\\\", "escapedChar").length, 1)
        this.assertEquals(SGFParser.matchAll("\\\n", "escapedChar"), "")
        this.assertEquals(SGFParser.matchAll("\n", "convertSpace"), " ")
        this.assertEquals(SGFParser.matchAll("\n", "convertSpaceNoNewLine"), "\n")

        this.assertEquals(SGFParser.matchAll("ra:bc", "pointOrComposedPoint").toString(), "[composed, [17, 0], [1, 2]]")
        this.assertEquals(SGFParser.matchAll("abc\\\ndef", "text"), "abcdef")


        this.assertEquals(SGFParser.matchAll("SZ[19]", "property").toString(), "[prop, SZ, 19]")
        this.assertEquals(SGFParser.matchAll("PB[Ohshima Yoshiki]", "property").toString(), "[prop, PB, Ohshima Yoshiki]")
        this.assertEquals(SGFParser.matchAll(";PB[Ohshima Yoshiki]PW[Iyama Yuta]", "node").toString(), "[node, [prop, PB, Ohshima Yoshiki], [prop, PW, Iyama Yuta]]")
        this.assertEquals(SGFParser.matchAll(";B[pd];W[dd];B[qp]", "sequence").toString(), "[[node, [prop, B, [15, 3]]], [node, [prop, W, [3, 3]]], [node, [prop, B, [16, 15]]]]")

    }
})
}) // end of module

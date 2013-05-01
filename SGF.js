module('users.ohshima.suzugo.SGF').requires('users.ohshima.suzugo.SGFReader').toRun(function() {

(function() {
    var properties = [
'B   ,Black          ,move            ,move',
'BL  ,Black time left,move            ,real',
'BM  ,Bad move       ,move            ,double',
'DO  ,Doubtful       ,move            ,none',
'IT  ,Interesting    ,move            ,none',
'KO  ,Ko             ,move            ,none',
'MN  ,set MoveNumber ,move            ,number',
'OB  ,OtStones Black ,move            ,number',
'OW  ,OtStones White ,move            ,number',
'TE  ,Tesuji         ,move            ,double',
'W   ,White          ,move            ,move',
'WL  ,White time left,move            ,real',
'AB  ,Add Black      ,setup           ,list of stone',
'AE  ,Add Empty      ,setup           ,list of point',
'AW  ,Add White      ,setup           ,list of stone',
'PL  ,Player to play ,setup           ,color',
'*AR ,Arrow          ,-               ,list of composed point ":" point',
'C   ,Comment        ,-               ,text',
'CR  ,Circle         ,-               ,list of point',
'*DD ,Dim points     ,- (inherit)     ,elist of point',
'DM  ,Even position  ,-               ,double',
'!FG ,Figure         ,-               ,none | composed number ":" simpletext',
'GB  ,Good for Black ,-               ,double',
'GW  ,Good for White ,-               ,double',
'HO  ,Hotspot        ,-               ,double',
'!LB ,Label          ,-               ,list of composed point ":" simpletext',
'*LN ,Line           ,-               ,list of composed point ":" point',
'MA  ,Mark           ,-               ,list of point',
'N   ,Nodename       ,-               ,simpletext',
'*PM ,Print move mode,- (inherit)     ,number',
'SL  ,Selected       ,-               ,list of point',
'*SQ ,Square         ,-               ,list of point',
'TR  ,Triangle       ,-               ,list of point',
'UC  ,Unclear pos    ,-               ,double',
'V   ,Value          ,-               ,real',
'*VW ,View           ,- (inherit)     ,elist of point',
'*AP ,Application    ,root            ,composed simpletext ":" number',
'*CA ,Charset        ,root            ,simpletext',
'FF  ,Fileformat     ,root            ,number (range: 1-4)',
'GM  ,Game           ,root            ,number (range: 1-5:7-17)',
'*ST ,Style          ,root            ,number (range: 0-3)',
'!SZ ,Size           ,root            ,(number | composed number ":" number)',
'AN  ,Annotation     ,game-info       ,simpletext',
'BR  ,Black rank     ,game-info       ,simpletext',
'BT  ,Black team     ,game-info       ,simpletext',
'CP  ,Copyright      ,game-info       ,simpletext',
'!DT ,Date           ,game-info       ,simpletext',
'EV  ,Event          ,game-info       ,simpletext',
'GC  ,Game comment   ,game-info       ,text',
'GN  ,Game name      ,game-info       ,simpletext',
'ON  ,Opening        ,game-info       ,simpletext',
'*OT ,Overtime       ,game-info       ,simpletext',
'PB  ,Player Black   ,game-info       ,simpletext',
'PC  ,Place          ,game-info       ,simpletext',
'PW  ,Player White   ,game-info       ,simpletext',
'!RE ,Result         ,game-info       ,simpletext',
'RO  ,Round          ,game-info       ,simpletext',
'!RU ,Rules          ,game-info       ,simpletext',
'SO  ,Source         ,game-info       ,simpletext',
'TM  ,Timelimit      ,game-info       ,real',
'US  ,User           ,game-info       ,simpletext',
'WR  ,White rank     ,game-info       ,simpletext',
'WT  ,White team     ,game-info       ,simpletext',
'TB  ,Territory Black, -              , elist of point',
'TW  ,Territory White, -              , elist of point',
'HA  ,Handicap       ,game-info       ,number',
'KM  ,Komi           ,game-info       ,real']
    var types = {}
    properties.forEach(function(line) {
        var sp = line.split(",")
        types[sp[0].trim().replace(/[^A-Z]/g, '')] = sp[3].trim()
    })
    SGFParser.types = types
})()

Object.subclass('users.ohshima.suzugo.SGF.Reader',
'reader', {
    read: function(aString) {
        return SGFParser.matchAll(aString, "collection")
    }
},
'examples', {
    exampleSGF: [
"(;",
"EV[37th Kisei challenger decision match]",
"KM[6.5]",
"FF[3]",
"SZ[19]",
"GM[1]",
"PW[Iyama Yuta]",
"WR[Honinbo]",
"DT[2012-11-08]",
"BR[9d]",
"RE[W+0.5]",
"PB[Takao Shinji]",
";B[pd];W[dd];B[qp];W[dq];B[oq];W[ck];B[nc];W[qj];B[ql];W[qg];B[qe]",
";W[oj];B[gp];W[do];B[jp];W[fc];B[ol];W[lq];B[lo];W[nq];B[nr];W[op]",
";B[mq];W[np];B[mr];W[qn];B[pq];W[rl];B[rk];W[qk];B[rm];W[pl];B[qm]",
";W[pm];B[rj];W[ri];B[rn];W[om];B[jd];W[lm];B[be];W[bd];B[ce];W[cd]",
";B[ci];W[dg];B[cg];W[ch];B[bh];W[dh];B[bj];W[lc];B[ld];W[kd];B[ke]",
";W[kc];B[le];W[di];B[jc];W[cj];B[bi];W[bk];B[df];W[bg];B[bf];W[cf]",
";B[cq];W[cg];B[dp];W[ep];B[cp];W[er];B[eo];W[fo];B[en];W[fp];B[dr]",
";W[fn];B[dn];W[jb];B[ib];W[lb];B[ie];W[nb];B[ob];W[mc];B[nd];W[pb]",
";B[oa];W[na];B[pc];W[ja];B[cm];W[jn];B[jo];W[in];B[ki];W[jf];B[kg]",
";W[je];B[hd];W[jg];B[fd];W[gc];B[hc];W[kf];B[lf];W[lg];B[kh];W[mg]",
";B[nf];W[hf];B[if];W[jh];B[hg];W[ji];B[la];W[ka];B[ec];W[ed];B[eb]",
";W[gd];B[fe];W[ge];B[ff];W[gf];B[gg];W[fg];B[fh];W[eg];B[gb];W[ef]",
";B[fb];W[ee];B[jj];W[kj];B[lj];W[kk];B[li];W[ij];B[ng];W[lk];B[ni]",
";W[nj];B[mj];W[iq];B[jq];W[jr];B[kr];W[mk];B[ph];W[sl];B[pn];W[ro]",
";B[qo];W[sn];B[ig];W[an];B[on];W[nm];B[mn];W[ip];B[eq];W[fq];B[ir]",
";W[hr];B[js];W[rf];B[cb];W[sm];B[qn];W[rd];B[re];W[se];B[rc];W[em]",
";B[io];W[ho];B[gj];W[gk];B[bc];W[ad];B[bn];W[hj];B[ii];W[jk];B[fj]",
";W[sc];B[rb];W[dq];B[ih];W[jj];B[eq];W[id];B[ic];W[dq];B[mm];W[cr]",
";B[eq];W[hi];B[gi];W[dq];B[ia];W[ma];B[eq];W[hh];B[gh];W[dq];B[gr]",
";W[bo];B[co];W[bm];B[eq];W[cn];B[br];W[gq];B[bn];W[dq];B[cs];W[hs]",
";B[qf];W[pg];B[oh];W[rh];B[bl];W[cn];B[hp];W[hq];B[bn];W[md];B[me]",
";W[cn];B[hn];W[dm];B[bn];W[mh];B[am];W[nh];B[go];W[ak];B[og];W[gn]",
";B[ho];W[hm];B[oi];W[mi];B[cl];W[fk];B[rp];W[sj];B[so];W[sk];B[nl]",
";W[pk];B[km];W[kn];B[ln];W[pf];B[sb];W[ml];B[sd];W[oe];B[ne];W[sc]",
";B[ko];W[jm];B[sd];W[nn];B[no];W[sc];B[ll];W[kl];B[sd];W[sf];B[el]",
";W[dl];B[dk];W[fm];B[ej];W[dj];B[ek];W[lm];B[es];W[fs];B[fl];W[gl]",
";B[eq];W[ds];B[pe];W[of];B[es];W[dq];B[qh];W[eq];B[qd];W[ds];B[rg]",
";W[sg];B[es];W[is];B[jr];W[ds];B[od];W[rg];B[es];W[al];B[ao];W[ds]",
";B[cr];W[dc];B[db];W[ac];B[ab];W[cc];B[bb];W[ei];B[he];W[es])"].join("\n"),

    example1: function() {
        return SGFParser.matchAll(this.exampleSGF, "collection")
    }
});

Object.subclass('users.ohshima.suzugo.SGF.Data',
'initialization', {
    initialize: function($super, aTree) {
        this.moveProperties = {B: 1, KO: 1, MN: 1, W: 1}
        this.gameInfoProperties = {AN: 1, BR: 1, BT: 1, CP: 1, DT: 1, EV: 1,
                GN: 1, GC: 1, ON: 1, OT: 1, PB: 1, PC: 1, PW: 1, RE: 1, RO: 1,
                RU: 1, SO: 1, TM: 1, US: 1, WR: 1, WT: 1}
        this.setupProperties = {AB: 1, AE: 1, AW: 1, PL: 1}
        this.nodeAnnotationProperties = {C: 1, DM: 1, GB: 1, GW: 1, HO: 1,
            N: 1, UC: 1, V: 1}
        this.moveAnnotationProperties = {BM: 1, DO: 1, IT: 1, TE: 1}
        this.markupProperties = {AR: 1, CR: 1, DD: 1, LB: 1, LN: 1, MA: 1,
            SL: 1, SQ: 1, TR: 1}
        this.timingProperties = {BL: 1, OB: 1, OW: 1, WL: 1}
        this.rootProperties = {AP: 1, CA: 1, FF: 1, GM: 1, ST: 1, SZ: 1}
        this.miscellaneousProperties = {FG: 1, PM: 1, VW: 1}

        this.tree = aTree
        this.rootProp = {};
        ([].concat(aTree[1])).splice(1).forEach(function(ary) {
            this.rootProp[ary[1]] = ary[2]}, this)
    },
},
'accessing', {
    getProperty: function(prop) {
        return this.rootProp[prop]
    }
},
'playing', {
    isMoveProperty: function(prop) {
        return prop[0] == "prop" && (prop[1] in this.moveProperties)
    },
    findNextMoveInner: function(aTree, element) {
        if ((this.foundLast || element === null) && this.isMoveProperty(aTree)) {
            throw {type: "found", value: aTree}
        }
        if (aTree === element) {
            this.foundLast = true
        }
        if (aTree.constructor === Array) {
            aTree.forEach(function(tt) {
                this.findNextMoveInner(tt, element)
            }, this)
        }
    },
    findNextMove: function(element) {
        this.foundLast = false
        try {
            this.findNextMoveInner(this.tree, element)
        } catch(c) {
            if (c.type == "found") {
                return c.value
            }
        }
    return null
    }
})

}) // end of module

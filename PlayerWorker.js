worker = (function() {
    var SIZE = 9
    var quantum = 250
    var currentWork = null
    var workStartTime = 0
    var now = quantum
    var playOutCount = 0

    var setWork = function(buffer) {
        currentWork = new Int8Array(buffer)
    }

    var start = function() {
        if (currentWork === null) {
            return;
        }
        work()
    }

    var work = function() {
        workStartTime = Date.now()
        now = workStartTime
        playOutCount = 0
        while (now - workStartTime < quantum) {
            aFewPlayOuts()
            now = Date.now()
        }
        postMessage({response: "playOutCount", value: playOutCount})
    }

    var done = function() {
        var doneWork = currentWork
        currentWork = null
        workStartTime = 0
        now = quantum
        postMessage(doneWork.buffer, [doneWork.buffer])
    }

    var resetBoard = function() {
        for (var i = 0; i < currentWork.length; i++) {
            currentWork[i] = 0
        }
    }

    var aFewPlayOuts = function () {
        for (var loop = 0; loop < 10000; loop++) {
            playOut()
        }
    }

    var playOut = function() {
        playOutCount++
        var move = Math.floor((Math.random() * currentWork.length))
        currentWork[move] = 1
    }

    return {setWork: setWork, start: start, done: done, work: work}
    })()

onmessage = function (req) {
    if (req.data.constructor == ArrayBuffer) {
        worker.setWork(req.data)
        return;
    }
    if (req.data.command == "start") {
        worker.start()
    }
    if (req.data.command == "keep") {
        worker.work()
    }
    if (req.data.command == "stop") {
        worker.done()
    }
}

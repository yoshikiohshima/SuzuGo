module('users.ohshima.suzugo.SuzuGo').requires('lively.morphic').toRun(function() {
lively.morphic.Morph.subclass('users.ohshima.suzugo.SuzuGo.SuzuGoBoard',
'properties', {
},
'initializing', {
    initialize: function($super) {
        $super()
        this.setBounds(pt(0, 0).extent(pt(100, 100)))
        this.setFill(Color.yellow)
    }
    
},
'callbacks', {
    response: function(response) {
        if (response.data.constructor == ArrayBuffer) {
            that.master.result = new Int8Array(response.data)
            return;
        }
        if (response.data.response == "playOutCount") {
            this.master.playOutCount += response.data.value
            this.master.mayKeepWorker(this.index)
        }
    },
    error: function(error) {
        var that = this
        console.log(err.message.toString())
    }
},
'workers', {
    initWorkers: function(count) {
        var that = this
        this.count = count
//        if (this.workers) {
//            for (var i = 0; i < this.workers.length; i++)
//            this.workers[i].terminate()
//        }
        this.workers = []
        for (i = 0; i < count; i++) {
            var worker = new Worker("PlayerWorker.js?time="+ Date.now())
            this.workers.push(worker)
            worker.state = "dormant"
            worker.index = i
            worker.master = that
            worker.onmessage = that.response
            worker.onerror = that.error
        }
    },

    sendBuffer: function(ind) {
        var buf = new ArrayBuffer((9+2) * (9+2))
        this.workers[ind].postMessage(buf, [buf])
    },

    startWorker: function(ind) {
        this.workers[ind].postMessage({command: "start"})
        this.workers[ind].state = "busy"
    },

    keepWorker: function(ind) {
        this.workers[ind].postMessage({command: "keep"})
    },

    stopWorker: function(ind) {
        this.workers[ind].postMessage({command: "stop"})
        this.workers[ind].state = "dormant"
    }
},
'driver', {
    resetPlayOutCount: function() {
        this.playOutCount = 0
    },
    runWorkers: function(ms) {
        this.startTime = Date.now()
        this.duration = ms
        for (var i = 0; i < this.count; i++) {
            this.sendBuffer(i)
            this.startWorker(i)
        }
    },
    mayKeepWorker: function(ind) {
        var now = Date.now()
        if (now - this.startTime < this.duration) {
            this.keepWorker(ind)
        } else {
            this.stopWorker(ind)
            if (this.workers.select(function(elem) {return elem.state == "busy"}).length === 0) {
                this.done()
            }
        }
    },
    done: function() {
        console.log("threads: " + this.count + ", " + "count: " + this.playOutCount / 1000000)
    }
});
})// end of module

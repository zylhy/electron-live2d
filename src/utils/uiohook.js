const { uIOhook } = require('uiohook-napi')
// 监听全局鼠标事件，并执行javascript脚本

// 定义一个类
export default  class InputMonitor {
    keydownCallback = null
    keyupCallback = null
    mousemoveCallback = null
    constructor(option) {
        this.keydownCallback = option.keydownCallback
        this.keyupCallback = option.keyupCallback
        this.mousemoveCallback = option.mousemoveCallback
        this.start()
    }
    //   监听键盘事件
    listenerKeyboardEvent() {
        uIOhook.on('keydown', (e) => {
            this.keydownCallback&&this.keydownCallback(e)
        })

        uIOhook.on('keyup', (e) => {
            // 抬起
            this.keyupCallback&&this.keyupCallback(e)

        })
    }

    //   监听鼠标移动，主要用于live2d 的跟随
    listenerMouseEvent() {
        uIOhook.on('mousemove', (e) => {
            console.log(e, 'mouse')
            this.mousemoveCallback&&this.mousemoveCallback(e)
        })
    }
    start() {
        this.listenerKeyboardEvent()
        this.listenerMouseEvent()
        uIOhook.start()
    }
    close() {
        uIOhook.stop()
    }
}


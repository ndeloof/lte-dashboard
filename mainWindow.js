const {BrowserWindow, Tray} = require('electron')

// BrowserWindow instance
exports.window

exports.tray

exports.createWindow = () => {
    this.window = new BrowserWindow({
        width: 1000, height: 800,
        webPreferences: { nodeIntegration: true }
    })

    this.tray = new Tray('trayTemplate@2x.png')
    this.tray.setToolTip('LTE dashboard')
    this.tray.on('click', e => {
        this.window.show()
    })
      
    this.window.loadFile('./index.html')

    this.window.on('closed',  () => {
        this.indow = null
    })
}
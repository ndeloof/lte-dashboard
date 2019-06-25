// Modules
const {app, ipcMain} = require('electron')
const mainWindow = require('./mainWindow')

const sha256 = require('js-sha256').sha256
const Base64 = require('js-base64').Base64
const axios = require('axios')
const parser = require('fast-xml-parser')
const fs = require('fs')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let connectWindow

let cookie

let configuration = {
  url: 'http://192.168.8.1',
  login: 'admin',
  password: ''
}

let scheduled

const http = axios.create({
  timeout: 10000,
  transformRequest: [function (data, headers) {
    headers.Accept = "application/xml"
    if (cookie) {
      headers.Cookie = cookie
    }
    return data
  }],
})


// Load persisted router configuration
function loadConfiguration() {
  const cfg = app.getPath('appData')+'/lte-dashboard/config.json'
  try {
    configuration = JSON.parse(fs.readFileSync(cfg))
  } catch(error) {
    console.log(error)
  }
}

// Show configuration modal to get user fix the configuration
function configure() {
  connectWindow = new BrowserWindow({
    width: 600, height: 300,
    webPreferences: { nodeIntegration: true },
    parent: mainWindow,
    modal: true,
  })

  connectWindow.configuration = configuration

  connectWindow.loadFile('connect.html')
  mainWindow.window.show()

  ipcMain.once('connection-details', (event, data) => {
    configuration = data
    const cfg = app.getPath('appData')+'/lte-dashboard/config.json'
    fs.writeFileSync(cfg, JSON.stringify(configuration))
    console.log(configuration)
    connectWindow.destroy()
    collectMetrics()
  })
}

// Collect router metrics
function collectMetrics() {
  http.get(configuration.url+'/api/net/net-mode').then( (response) => {
    const xml = response.data
    var data = parser.parse(xml)
    console.log(data)
    mainWindow.window.webContents.send('net-mode', data.response)
  })
  http.get(configuration.url+'/api/device/signal').then( (response) => {
    const xml = response.data
    var data = parser.parse(xml)
    if (data.error) {
      console.log(data.error.code)
      login()
    } else {
      console.log(data)
      mainWindow.window.webContents.send('metrics', {
        rsrq : parseInt(data.response.rsrq),
        rsrp : parseInt(data.response.rsrp),
        rssi : parseInt(data.response.rssi),
        sinr : parseInt(data.response.sinr),
        earfcn : data.response.earfcn
      })
      // re-schedule
      scheduled = setTimeout(collectMetrics, 3000)
    }
  })
  .catch(function (error) {
    // handle error
    console.log(error)
    configure()
  })
}


function login() {
  http.get(configuration.url+'/api/webserver/SesTokInfo')
    .then(function (response) {
      const xml = response.data
      var data = parser.parse(xml)
      const token = data.response.TokInfo
      const sessionId = data.response.SesInfo
      cookie = 'SessionId='+sessionId

      const hash = Base64.encode(sha256(configuration.login+Base64.encode(sha256(configuration.password))+token))
      const request = {
        "request": {
          "Username":"admin",
          "Password": hash,
          "password_type": 4
        }
      }
      const login = new parser.j2xParser({}).parse(request)
      http({method: 'post',
            url: configuration.url+'/api/user/login',
            headers: {'__RequestVerificationToken' : token},
            data: login
      }).then(function(response) {
        const setCookie = response.headers['set-cookie']
        // Cookie get replaced after a successful authentication
        if (setCookie) {
          cookie = setCookie
        }        

        const xml = response.data
        var data = parser.parse(xml)
        if (data.error) {
          configure()
        } else {
          collectMetrics()
        }
      })
    })
}

// Electron `app` is ready
app.once('ready', () => {
  mainWindow.createWindow()
  loadConfiguration()
  collectMetrics()
})

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  tray.destroy()
  if (scheduled) {
    cancelTimeout(scheduled)
  }
  if (process.platform !== 'darwin') app.quit()  
})


// Modules
const {app, BrowserWindow} = require('electron')

const sha256 = require('js-sha256').sha256
const Base64 = require('js-base64').Base64;
const axios = require('axios');
const parser = require('fast-xml-parser');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

let cookie

const password = process.env.PASSWORD;

const http = axios.create({
  baseURL: 'http://192.168.1.1/api/',
  timeout: 10000,
  transformRequest: [function (data, headers) {
    headers.Accept = "application/xml";
    if (cookie) {
      headers.Cookie = cookie;
    }
    return data;
  }],
});


// Create a new BrowserWindow when `app` is ready
function createWindow () {

  mainWindow = new BrowserWindow({
    width: 1000, height: 800,
    webPreferences: { nodeIntegration: true }
  })

  // Load index.html into the new BrowserWindow
  mainWindow.loadFile('index.html')

  // Open DevTools - Remove for PRODUCTION!
  mainWindow.webContents.openDevTools();

  http.get('webserver/SesTokInfo')
    .then(function (response) {
      const xml = response.data;
      var data = parser.parse(xml)
      session = data.response.SesInfo;
      const token = data.response.TokInfo;
      cookie = 'SessionId='+session

      const hash = Base64.encode(sha256("admin"+Base64.encode(sha256(password))+token));
      const request = {
        "request": {
          "Username":"admin",
          "Password": hash,
          "password_type": 4
        }
      };
      const login = new parser.j2xParser({}).parse(request)
      http({method:'post',
            url:'user/login',
            headers: {'__RequestVerificationToken' : token},
            data: login
      }).then(function(response) {
        const setCookie = response.headers['set-cookie']
        // Cookie get replaced after successful authentication
        if (setCookie) {
          cookie = setCookie
        }

        http.get('device/signal').then( console.log )
      })
    })

  // Listen for window being closed
  mainWindow.on('closed',  () => {
    mainWindow = null
  })
}

// Electron `app` is ready
app.on('ready', createWindow)

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
  if (mainWindow === null) createWindow()
})

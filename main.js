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
let token

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

  axios.get('http://192.168.1.1/api/webserver/SesTokInfo')
    .then(function (response) {
      const xml = response.data;
      var data = parser.parse(xml)
      cookie = data.response.SesInfo;
      token = data.response.TokInfo;
      console.log("cookie = " + cookie);
      console.log("token = " + token);

      axios.post('http://192.168.1.1/api/user/login')
    })

  Base64.encode(sha256('loofun0'))


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

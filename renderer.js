// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer } = require('electron')

console.log('hello!')

ipcRenderer.on('net-mode', (event, data) => {
    document.getElementById('NetworkMode').innerText = data.NetworkMode
    document.getElementById('NetworkBand').innerText = data.NetworkBand
    document.getElementById('LTEBand').innerText = data.LTEBand
})

ipcRenderer.on('metrics', (event, data) => {
    document.getElementById('rsrq').innerText = data.rsrq
    document.getElementById('rsrp').innerText = data.rsrp
    document.getElementById('rssi').innerText = data.rssi
    document.getElementById('sinr').innerText = data.sinr
    document.getElementById('earfcn').innerText = data.earfcn
})
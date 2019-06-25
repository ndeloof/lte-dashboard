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
    setMetric('rsrq', data.rsrq, 'dB', -10, -15, -20)
    setMetric('rsrp', data.rsrp, 'dBm', -80, -90, -100)
    setMetric('rssi', data.rssi, 'dBm', -80, -90, -100)
    setMetric('sinr', data.rssi, 'dB', 20, 13, 0)
    document.getElementById('earfcn').innerText = data.earfcn
})

function setMetric(name, value, unit, excellent, good, acceptable) {
    target = document.getElementById(name)
    target.innerText = value + ' ' + unit
    if (value >= excellent) {
        target.style='color:limegreen'
    } else if (value >= good) {
        target.style='color:green'
    } else if (value >= acceptable) {
        target.style='color:yellow'
    } else {
        target.style='color:red'
    }
}
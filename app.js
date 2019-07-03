// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer } = require('electron')
import React from 'react'
import ReactDOM from 'react-dom'

console.log('hello!')

ipcRenderer.on('net-mode', (event, data) => {
    console.log(data)
    document.getElementById('NetworkMode').innerText = data.NetworkMode
    document.getElementById('NetworkBand').innerText = data.NetworkBand
    document.getElementById('LTEBand').innerText = data.LTEBand
})

ipcRenderer.on('metrics', (event, data) => {
    console.log(data)
    setMetric('rsrq', data.rsrq, 'dB', -10, -15, -20)
    setMetric('rsrp', data.rsrp, 'dBm', -80, -90, -100)
    setMetric('rssi', data.rssi, 'dBm', -80, -90, -100)
    setMetric('sinr', data.rssi, 'dB', 20, 13, 0)
    document.getElementById('earfcn').innerText = data.earfcn
})

function setMetric(name, value, unit, excellent, good, acceptable) {
    const target = document.getElementById(name)
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

ReactDOM.render(<Metrics/>, document.getElementById('metrics'))

function Metrics() {
  return (
    <tbody>
      <tr>
        <td>NetworkMode</td><td id="NetworkMode"></td>
      </tr>
      <tr>
        <td>NetworkBand</td><td id="NetworkBand"></td>
      </tr>
      <tr>
        <td>LTEBand</td><td id="LTEBand"></td>
      </tr>
      <tr>
        <td title="Reference signal Receive Quality">rsrq</td><td id="rsrq"></td>
      </tr>
      <tr>
        <td title="Reference signal Receive Power">rsrp</td><td id="rsrp"></td>
      </tr>
      <tr>
        <td title="Reference signal Strenght Indication">rssi</td><td id="rssi"></td>
      </tr>
      <tr>
        <td title="Signal to Interference + Noise Ratio">sinr</td><td id="sinr"></td>
      </tr>
      <tr>
        <td title="Absolute Radio Frequency Channel Number">earfcn</td><td id="earfcn"></td>
      </tr>
    </tbody>
  )
}
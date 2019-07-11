// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

import React from 'react'
import ReactDOM from 'react-dom'
import Metrics from './Metrics'
const { ipcRenderer } = require('electron')

const metrics = ReactDOM.render(<Metrics/>, document.getElementById('metrics'))

ipcRenderer.on('metrics', (event, data) => {
  metrics.updateMetrics(data)
})

ipcRenderer.on('net-mode', (event, data) => {
  metrics.updateNework(data)
})
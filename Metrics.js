import React, { Component } from 'react'
const { ipcRenderer } = require('electron')

const color = (value, excellent, good, acceptable) => {
    if (value >= excellent) {
        return 'limegreen'
    } else if (value >= good) {
        return 'green'
    } else if (value >= acceptable) {
        return 'orange'
    } else {
        return 'red'
    }    
}

class Metrics extends Component {    
    state = {        
        networkMode: '',
        networkBand: '',
        band: '',
        rsrq: '',
        rsrp: '',
        rssi: '',
        sinr: '',
        rsrqColor: 'grey',
        rsrpColor: 'grey',
        rssiColor: 'grey',
        sinrColor: 'grey',
        earfcn: ''
    }

    constructor(props) {
        super(props);

        ipcRenderer.on('metrics', (event, data) => {
            this.setState( {
                rsrq: data.rsrq + ' dB',
                rsrp: data.rsrq + ' dBm',
                rssi: data.rssi + ' dBm',
                sinr: data.sinr + ' dB',
                earfcn: data.earfcn,
                rsrqColor: color(data.rsrq, -10, -15, -20),
                rsrpColor: color(data.rsrp, -80, -90, -100),
                rssiColor: color(data.rssi, -80, -90, -100),
                sinrColor: color(data.sinr, 20, 13, 0),
            })
        })

        ipcRenderer.on('net-mode', (event, data) => {
            this.setState( {
                networkMode: data.NetworkMode, 
                networkBand: data.NetworkBand,
                band: data.LTEBand
            })
        })
    }


    render() {
        return (
            <tbody>
              <tr>
                <td>NetworkMode</td><td>{this.state.networkMode}</td>
              </tr>
              <tr>
                <td>NetworkBand</td><td>{this.state.networkBand}</td>
              </tr>
              <tr>
                <td>LTEBand</td><td>{this.state.band}</td>
              </tr>
              <tr>
                <td title="Reference signal Receive Quality">rsrq</td>
                <td style={{color: this.state.rsrqColor}}>{this.state.rsrq}</td>
              </tr>
              <tr>
                <td title="Reference signal Receive Power">rsrp</td>
                <td style={{color: this.state.rsrpColor}}>{this.state.rsrp}</td>
              </tr>
              <tr>
                <td title="Reference signal Strenght Indication">rssi</td>
                <td style={{color: this.state.rssiColor}}>{this.state.rssi}</td>
              </tr>
              <tr>
                <td title="Signal to Interference + Noise Ratio">sinr</td>
                <td style={{color: this.state.sinrColor}}>{this.state.sinr}</td>
              </tr>
              <tr>
                <td title="Absolute Radio Frequency Channel Number">earfcn</td>
                <td>{this.state.earfcn}</td>
              </tr>
            </tbody>
        )
    }
}

export default Metrics
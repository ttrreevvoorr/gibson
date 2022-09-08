const https = require('https')
const fs = require('fs')

module.exports = {
  readFile: (fileName) => {
    return new Promise((response, reject)=>{
      fs.readFile(fileName, 'utf8', async (err, data) => {
        if (err) {
          return reject(`Error reading file from disk: ${err}`)
        }
        else {
          // parse JSON string to JSON object
          response(JSON.parse(data))
        }
      })
    })
  },
  getURL: (mp3URL) => {
    return new Promise((response, reject)=> {
      https.get(mp3URL, (data) => {
        if (data.statusCode !== 200) {
          reject("Shit hit the fan, shrug.")
        } 
        response(data)
      })
    })
  }
}
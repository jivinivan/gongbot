// Requires
import express from 'express'
import path from 'path'
import querystring from 'querystring'
import gong from './gong'

// Create app
const app = express()
const port = 3700
let gongActive = false

// Send commands to PI
app.get("/gong", (req, res) => {
  if (!gongActive) {
    gongActive = true
    gong.gong( 0.10, 0.25, 3000 ).then(() => {
      gong.gong( 0.25, 0.10, 0 ).then(() => {
        gong.gong( 0.10, 0.11, 0 ).then(() => {
          gong.gong( 0.11, 0.10, 2000 ).then(() => {
            gong.gong( 0.10, 0, 0 ).then(() => {
              gongActive = false
            })
          })
        })
      })
    })
    res.send('Gong sequence Initiated.')
  } else {
    res.send('Gong is gonging. Please try again later.')
  }
})

// Start server
app.listen(port)
console.log("Listening on port " + port)

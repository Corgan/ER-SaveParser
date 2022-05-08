const express = require('express')
const app = express()
const port = process.argv[2] || 8080;

app.use(express.static('.'))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
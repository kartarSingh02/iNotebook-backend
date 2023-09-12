const connectToMongo = require("./db");
const express = require('express')
connectToMongo();


const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// used to send and fetch json data
app.use(express.json())

// Available Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`App listening on port at http://localhost:${port}`)
})

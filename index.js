const connectToMongo = require("./db");
const express = require('express')
connectToMongo();


const app = express()
// changing port because our react app will be running on port 3000
const port = 5000

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

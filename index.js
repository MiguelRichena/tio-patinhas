const express = require("express")
const app = express()
const porta = 3000

app.listen(porta, () => {
  console.log(`Server is running on http://localhost:${porta}`)
})
import express from 'express'
import dotenv from 'dotenv'
import gastosRoutes from './routes/gastos.js'

dotenv.config()

const app = express()
app.use(express.json())

// Rota inicial
app.get('/', (req, res) => {
  res.send('💬 Bot de controle financeiro ativo!')
  console.log("entrou na rota /")
})

// Rotas de gastos
app.use('/gastos', gastosRoutes)

// Inicia o servidor
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})

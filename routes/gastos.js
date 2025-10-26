import express from 'express'
import supabase from '../db/supabase.js'

const router = express.Router()

// POST /gastos
router.post('/', async (req, res) => {
  try {
    const { valor, descricao } = req.body

    if (!valor || !descricao) {
      return res.status(400).json({ error: 'Valor e descrição são obrigatórios.' })
    }

    const { data: resultado, error } = await supabase
      .from('gastos')
      .insert([{ valor, descricao }]) // campo data é preenchido automaticamente

    if (error) throw error

    res.status(201).json({ message: 'Gasto registrado com sucesso!', data: resultado })
    console.log("Gasto registrado com sucesso!", resultado)
  } catch (err) {   
    console.error(err)
    res.status(500).json({ error: 'Erro ao registrar gasto.' })
  }
})

export default router

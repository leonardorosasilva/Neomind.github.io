import { useState } from 'react'
import './App.css'
import ListagemFornecedores from './pages/listagemFornecedores'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <ListagemFornecedores />
    </>
  )
}

export default App

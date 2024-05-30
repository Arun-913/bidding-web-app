import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { Landing } from './components/Landing'
import { Register } from './components/Register'
import { Login } from './components/Login'
import { Temp } from './components/Temp'

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/temp' element={<Temp/>} />
      </Routes>
    </BrowserRouter>
  )
}
export default App

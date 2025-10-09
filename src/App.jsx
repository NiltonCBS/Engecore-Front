import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import "@fortawesome/fontawesome-free/css/all.min.css";
import SingUp from "./pages/singup.jsx";
import SingIn from "./pages/singIn.jsx";
import Dashboard from './pages/Dashboard/dashboard.jsx';
import Produtos from './pages/Dashboard/Produtos/produtos.jsx';
import ListarProdutos from './pages/Dashboard/Produtos/listarprodutos.jsx';
import Categorias from './pages/Dashboard/Produtos/categoriaproduto.jsx';
import Estoque from './pages/Dashboard/Produtos/estoque.jsx';
import CadCliente from './pages/Dashboard/Clientes/cadastrarcliente.jsx';
import ListarCliente from './pages/Dashboard/Clientes/listarcliente.jsx';
import CadastrarObra from './pages/Dashboard/Obras/cadastrarobra.jsx';
import ListarObra from './pages/Dashboard/Obras/listarobra.jsx';

import CadastrarMovimentacao from './pages/Dashboard/Movimentacao/cadastrarMovimentacao.jsx';
import ListarMovimentacoes from './pages/Dashboard/Movimentacao/listaMovimentacao.jsx';

function App() {


  return (
    <BrowserRouter>
    <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<SingIn />} />
        <Route path="/register" element={<SingUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/produtos/adicionar" element={<Produtos />} />
        <Route path="/produtos/listar" element={<ListarProdutos />} />
        <Route path="/produtos/categorias" element={<Categorias />} />
        <Route path="/produtos/estoque" element={<Estoque />} />
        <Route path="/users/adicionar" element={<CadCliente />} />
        <Route path="/users/listar" element={<ListarCliente />} />
        <Route path="/obras/adicionar" element={<CadastrarObra />} />
        <Route path="/obras/listar" element={<ListarObra />} />
        <Route path="/movimentacao/adicionar" element={<CadastrarMovimentacao />} />
        <Route path="/movimentacao/listar" element={<ListarMovimentacoes />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

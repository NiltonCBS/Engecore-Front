import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";
import { NavLink } from "react-router-dom";
import { api } from "../../../services/api";
import ModalEditarFuncionario from "./modalfuncionario.jsx"; // Importa o novo modal
import { toast } from 'react-toastify';

// Mapeia o FuncionarioResponse (da lista) para o estado local
const mapResponseToState = (func) => ({
  id: func.id,
  nome: func.nome,
  email: func.email,
  telefone: func.telefone,
  cargo: func.cargo,
  salario: func.salario,
  dataAdmissao: func.dataAdmissao,
  status: func.status === "STATUS_ATIVO" ? "ativo" : "inativo", // Mapeamento
  role: func.role,
});

// Mapeia um DTO completo (do modal) para o estado local
const mapDtoToState = (funcDTO) => ({
  id: funcDTO.id,
  nome: funcDTO.nome,
  email: funcDTO.email,
  telefone: funcDTO.telefone,
  cargo: funcDTO.cargo,
  salario: funcDTO.salario,
  dataAdmissao: funcDTO.dataAdmissao,
  status: funcDTO.status === "STATUS_ATIVO" ? "ativo" : "inativo",
  role: funcDTO.role,
});


export default function ListarFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [filtros, setFiltros] = useState({
    busca: "",
    status: "",
    role: "",
  });

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(10);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [funcionarioParaEdicao, setFuncionarioParaEdicao] = useState(null); // Vai segurar o FuncionarioResponse

  // Lista de Roles para o filtro
  const ROLES_FUNCIONARIO = [
    "ROLE_FUNC_ADM", "ROLE_FUNC_FINANCEIRO", "ROLE_FUNC_GERENTE",
    "ROLE_FUNC_GESTOR", "ROLE_FUNC_RH", "ROLE_FUNC_CONST"
  ];

  // Buscar funcionários do backend
  useEffect(() => {
    buscarFuncionarios();
  }, []);

  const buscarFuncionarios = async () => {
    try {
      setLoading(true);
      setErro("");
    
      const response = await api.get("/funcionario/listar");
      
      if (response.data.success) {
        // Usa o mapResponseToState
        const funcionariosMapeados = response.data.data.map(mapResponseToState);
        setFuncionarios(funcionariosMapeados);
      } else {
       toast.error("Erro ao carregar funcionários");
      }
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      setErro("Erro ao conectar com o servidor: " + (error.response?.data?.message || "Tente novamente"));
    } finally {
      setLoading(false);
    }
  };

  // Filtrar funcionários
  const funcionariosFiltrados = funcionarios.filter(func => {
    const matchBusca = func.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                      func.email.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                      (func.cargo && func.cargo.toLowerCase().includes(filtros.busca.toLowerCase()));
    
    const matchStatus = filtros.status === "" || func.status === filtros.status;
    const matchRole = filtros.role === "" || func.role === filtros.role;

    return matchBusca && matchStatus && matchRole;
  });

  // Paginação
  const indexUltimo = paginaAtual * itensPorPagina;
  const indexPrimeiro = indexUltimo - itensPorPagina;
  const funcionariosAtuais = funcionariosFiltrados.slice(indexPrimeiro, indexUltimo);
  const totalPaginas = Math.ceil(funcionariosFiltrados.length / itensPorPagina);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginaAtual(1); // Reset para primeira página ao filtrar
  };

  const formatarData = (data) => {
    if (!data) return "N/A";
    return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };
  
  const formatarRole = (role) => {
    return role.replace("ROLE_FUNC_", "");
  }

 const alternarStatus = async (id) => {
  try {
    const response = await api.put(`/usuarios/${id}/alterar-status`); // Endpoint genérico do UserController
    const statusRetornadoPelaApi = response.data?.data; 
    
    if (!statusRetornadoPelaApi) {
      throw new Error("A API não retornou o novo status.");
    }
    
    const novoStatus = statusRetornadoPelaApi === "STATUS_ATIVO" ? "ativo" : "inativo";
    
    setFuncionarios(listaCompleta =>
      listaCompleta.map(func =>
        func.id === id ? { ...func, status: novoStatus } : func
      )
    );
     toast.success(`Funcionário ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`);
  } catch (error) {
    console.error("Erro ao alterar status:", error);
    const msg = error.response?.data?.message || error.message || "Ocorreu um erro.";
    toast.error(`Não foi possível alterar o status: ${msg}`);
  }
};

  const excluirFuncionario = async (id) => {
    toast.warn(
      ({ closeToast }) => (
        <div>
          <p className="font-semibold">Confirmar Exclusão</p>
          <p className="text-sm">Tem certeza que deseja excluir este funcionário?</p>
          <div className="flex gap-2 mt-3">
            <button
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
              onClick={() => {
                _confirmarExclusao(id);
                closeToast();
              }}
            >
              Sim, Excluir
            </button>
            <button
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm"
              onClick={closeToast}
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false, draggable: false }
    );
  };

  const _confirmarExclusao = async (id) => {
    try {
      await api.delete(`/funcionario/deletar/${id}`); // Endpoint do FuncionarioController
      setFuncionarios(prev => prev.filter(func => func.id !== id));
      toast.success("Funcionário excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir funcionário:", error);
      toast.error("Erro ao excluir: " + (error.response?.data?.message || "Tente novamente"));
    }
  };


  const editarFuncionario = (funcionario) => {
    setFuncionarioParaEdicao(funcionario); // Passa o FuncionarioResponse (com ID)
    setModalEdicaoAberto(true);
  };

  const fecharModalEdicao = () => {
    setModalEdicaoAberto(false);
    setFuncionarioParaEdicao(null);
  };

  const handleFuncionarioAtualizado = (funcionarioAtualizadoDTO) => {
    // O modal retorna o DTO completo, mapeamos para o formato da lista (Response)
    const funcionarioMapeado = mapDtoToState(funcionarioAtualizadoDTO);
    setFuncionarios(prev =>
      prev.map(func => 
        func.id === funcionarioMapeado.id ? funcionarioMapeado : func
      )
    );
    fecharModalEdicao(); // Fecha o modal de edição
  };

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      status: "",
      role: "",
    });
    setPaginaAtual(1);
  };

  // Renderização de Loading e Erro
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="ml-64">
          <Header />
          <div className="p-6 text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-cordes-blue"></i>
            <p className="mt-2 text-gray-600">Carregando funcionários...</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-md">
            {/* Cabeçalho */}
            <div className="p-8 border-b">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-cordes-blue">Lista de Funcionários</h1>
                  <p className="text-gray-600 mt-2">Gerencie os membros da equipe</p>
                </div>
                <NavLink
                  to="/funcionario/adicionar"
                  className="bg-blue-700 text-white font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Novo Funcionário
                </NavLink>
              </div>
            </div>

            {/* Filtros */}
            <div className="p-6 bg-gray-50 border-b">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Buscar</label>
                  <input
                    type="text"
                    name="busca"
                    value={filtros.busca}
                    onChange={handleFiltroChange}
                    placeholder="Nome, email ou cargo..."
                    className="w-full border border-gray-300 rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Status</label>
                  <select
                    name="status"
                    value={filtros.status}
                    onChange={handleFiltroChange}
                    className="w-full border border-gray-300 rounded-lg p-3"
                  >
                    <option value="">Todos</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Permissão (Role)</label>
                  <select
                    name="role"
                    value={filtros.role}
                    onChange={handleFiltroChange}
                    className="w-full border border-gray-300 rounded-lg p-3"
                  >
                    <option value="">Todas</option>
                    {ROLES_FUNCIONARIO.map(role => (
                      <option key={role} value={role}>{formatarRole(role)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={limparFiltros}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Funcionário</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Permissão</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Admissão</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {funcionariosAtuais.map((func) => (
                    <tr key={func.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{func.nome}</div>
                          <div className="text-sm text-gray-500">{func.email}</div>
                          <div className="text-sm text-gray-500">{func.telefone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{func.cargo}</div>
                        <div className="text-sm text-gray-500">R$ {func.salario.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {formatarRole(func.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatarData(func.dataAdmissao)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          func.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {func.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editarFuncionario(func)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Editar"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => alternarStatus(func.id)}
                            className={`transition-colors ${
                              func.status === 'ativo' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                            }`}
                            title={func.status === 'ativo' ? 'Desativar' : 'Ativar'}
                          >
                            <i className={`fas ${func.status === 'ativo' ? 'fa-ban' : 'fa-check'}`}></i>
                          </button>
                          <button
                            onClick={() => excluirFuncionario(func.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Excluir"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ... (renderização de "Nenhum funcionário" e Paginação) ... */}

          </div>
        </div>
      </div>

      {/* Modal de Edição */}
     <ModalEditarFuncionario
        // Passa o ID do funcionário para o modal
        funcionarioId={funcionarioParaEdicao?.id} 
        isOpen={modalEdicaoAberto}
        onClose={fecharModalEdicao}
        onFuncionarioAtualizado={handleFuncionarioAtualizado}
      />
    </div>
  );
}
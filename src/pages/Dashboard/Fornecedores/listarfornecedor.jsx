import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";
import { NavLink } from "react-router-dom";
import { api } from "../../../services/api";
import ModalEditarFornecedor from "./modalfornecedor.jsx"; // Importa o novo modal
import { toast } from 'react-toastify';

export default function ListarFornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [filtros, setFiltros] = useState({
    busca: "",
    status: "",
    tipoPessoa: "", // Alterado
  });

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [clientesPorPagina] = useState(10); // Renomear isso pode ser confuso, mas mantendo
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  const [fornecedorParaEdicao, setFornecedorParaEdicao] = useState(null);

  const tiposPessoa = [ // Renomeado
    "Pessoa Física",
    "Pessoa Jurídica",
  ];

  // Buscar fornecedores do backend
  useEffect(() => {
    buscarFornecedores();
  }, []);

  const mapFornecedorDTO = (f) => ({
    id: f.id,
    nome: f.nome,
    razaoSocial: f.razaoSocial || "",
    tipoPessoa: f.tipoPessoa === "FISICA" ? "Pessoa Física" : "Pessoa Jurídica",
    cpfCnpj: f.cpf || f.cnpj || "",
    inscricaoEstadual: f.inscricaoEstadual || "",
    telefone: f.telefone,
    email: f.email,
    status: f.status === "STATUS_ATIVO" ? "ativo" : "inativo",
    dataNascimento: f.dataNascimento || null, // Para o modal
    rg: f.rg || null, // Para o modal
  });

  const buscarFornecedores = async () => {
    try {
      setLoading(true);
      setErro("");
    
      // Endpoint alterado
      const response = await api.get("/fornecedor/listar", { withCredentials: true });
      
      if (response.data.success) {
        // Mapeamento alterado para FornecedorDTO
        const fornecedoresMapeados = response.data.data.map(mapFornecedorDTO);
        setFornecedores(fornecedoresMapeados);
      } else {
       toast.error("Erro ao carregar fornecedores");
      }
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
      setErro("Erro ao conectar com o servidor: " + (error.response?.data?.message || "Tente novamente"));
    } finally {
      setLoading(false);
    }
  };

  // Filtrar fornecedores
  const fornecedoresFiltrados = fornecedores.filter(f => {
    const matchBusca = f.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                      (f.cpfCnpj && f.cpfCnpj.includes(filtros.busca)) ||
                      f.email.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchStatus = filtros.status === "" || f.status === filtros.status;
    const matchTipo = filtros.tipoPessoa === "" || f.tipoPessoa === filtros.tipoPessoa;

    return matchBusca && matchStatus && matchTipo;
  });

  // Paginação
  const indexUltimo = paginaAtual * clientesPorPagina;
  const indexPrimeiro = indexUltimo - clientesPorPagina;
  const fornecedoresAtuais = fornecedoresFiltrados.slice(indexPrimeiro, indexUltimo);
  const totalPaginas = Math.ceil(fornecedoresFiltrados.length / clientesPorPagina);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginaAtual(1); // Reset para primeira página ao filtrar
  };

  // Esta função deve funcionar, pois Fornecedor é um User
 const alternarStatus = async (id) => {
  try {
    const response = await api.put(`/usuarios/${id}/alterar-status`); // Endpoint do UserController
    const statusRetornadoPelaApi = response.data?.data; 
    
    if (!statusRetornadoPelaApi) {
      throw new Error("A API não retornou o novo status.");
    }
    
    const novoStatus = statusRetornadoPelaApi === "STATUS_ATIVO" ? "ativo" : "inativo";
    
    setFornecedores(listaCompleta =>
      listaCompleta.map(f =>
        f.id === id ? { ...f, status: novoStatus } : f
      )
    );
     toast.success(`Fornecedor ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`);
  } catch (error) {
    console.error("Erro ao alterar status:", error);
    const msg = error.response?.data?.message || error.message || "Ocorreu um erro.";
    toast.error(`Não foi possível alterar o status: ${msg}`);
  }
};

  const excluirFornecedor = async (id) => {
    toast.warn(
      ({ closeToast }) => (
        <div>
          <p className="font-semibold">Confirmar Exclusão</p>
          <p className="text-sm">Tem certeza que deseja excluir este fornecedor?</p>
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

  // Função interna para ser chamada pelo toast
  const _confirmarExclusao = async (id) => {
    try {
      // Endpoint alterado
      await api.delete(`/fornecedor/deletar/${id}`, { withCredentials: true });
      setFornecedores(prev => prev.filter(f => f.id !== id));
      toast.success("Fornecedor excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir fornecedor:", error);
      toast.error("Erro ao excluir fornecedor: " + (error.response?.data?.message || "Tente novamente"));
    }
  };

  const visualizarFornecedor = (fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    setMostrarModal(true);
  };

  const editarFornecedor = (fornecedor) => {
    setFornecedorParaEdicao(fornecedor);
    setMostrarModalEdicao(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setFornecedorSelecionado(null);
  };

  const fecharModalEdicao = () => {
    setMostrarModalEdicao(false);
    setFornecedorParaEdicao(null);
  };

  const handleFornecedorAtualizado = (fornecedorAtualizadoDTO) => {
    // Mapeia o DTO (que vem do backend) para o formato do estado local
    const fornecedorMapeado = mapFornecedorDTO(fornecedorAtualizadoDTO);

    setFornecedores(prev =>
      prev.map(f => 
        f.id === fornecedorMapeado.id ? fornecedorMapeado : f
      )
    );
    fecharModalEdicao(); // Fecha o modal de edição
  };

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      status: "",
      tipoPessoa: "",
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
          <div className="p-6">
            <div className="bg-white rounded-xl shadow-md p-8 flex justify-center items-center h-64">
              <i className="fas fa-spinner fa-spin text-4xl text-cordes-blue"></i>
              <span className="text-xl text-gray-600 ml-4">Carregando fornecedores...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="ml-64">
          <Header />
          <div className="p-6">
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="text-center">
                <div className="text-red-600 text-xl mb-4">{erro}</div>
                <button
                  onClick={buscarFornecedores}
                  className="bg-blue-700 text-white font-semibold border border-gray-300 py-2 px-4 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
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
                  <h1 className="text-3xl font-bold text-cordes-blue">Lista de Fornecedores</h1>
                  <p className="text-gray-600 mt-2">Gerencie todos os fornecedores cadastrados</p>
                </div>
                <NavLink
                  to="/fornecedores/adicionar"
                  className="bg-blue-700 text-white font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md hover:shadow-lg"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Novo Fornecedor
                </NavLink>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-blue-600 text-2xl font-bold">{fornecedores.length}</div>
                  <div className="text-blue-600 text-sm">Total de Fornecedores</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-green-600 text-2xl font-bold">
                    {fornecedores.filter(c => c.status === 'ativo').length}
                  </div>
                  <div className="text-green-600 text-sm">Fornecedores Ativos</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-red-600 text-2xl font-bold">
                    {fornecedores.filter(c => c.status === 'inativo').length}
                  </div>
                  <div className="text-red-600 text-sm">Fornecedores Inativos</div>
                </div>
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
                    placeholder="Nome, CPF/CNPJ ou email..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Status</label>
                  <select
                    name="status"
                    value={filtros.status}
                    onChange={handleFiltroChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  >
                    <option value="">Todos</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Tipo de Fornecedor</label>
                  <select
                    name="tipoPessoa"
                    value={filtros.tipoPessoa}
                    onChange={handleFiltroChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  >
                    <option value="">Todos</option>
                    {tiposPessoa.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={limparFiltros}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300"
                >
                  <i className="fas fa-eraser mr-2"></i>
                  Limpar Filtros
                </button>
                <button
                  onClick={buscarFornecedores}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  Atualizar
                </button>
                <div className="text-sm text-gray-600 flex items-center">
                  Mostrando {fornecedoresAtuais.length} de {fornecedoresFiltrados.length} fornecedores
                </div>
              </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fornecedor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fornecedoresAtuais.map((f, index) => (
                    <tr key={f.id || `fornecedor-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{f.nome}</div>
                          <div className="text-sm text-gray-500">{f.cpfCnpj}</div>
                          {f.razaoSocial && (
                            <div className="text-xs text-gray-400">{f.razaoSocial}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          f.tipoPessoa === 'Pessoa Física' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {f.tipoPessoa === 'Pessoa Física' ? 'PF' : 'PJ'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900">{f.telefone}</div>
                          <div className="text-sm text-gray-500">{f.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          f.status === 'ativo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {f.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => visualizarFornecedor(f)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Visualizar"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            onClick={() => editarFornecedor(f)}
                            className="text-yellow-600 hover:text-yellow-800 transition-colors"
                            title="Editar"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => alternarStatus(f.id)}
                            className={`transition-colors ${
                              f.status === 'ativo' 
                                ? 'text-red-600 hover:text-red-800' 
                                : 'text-green-600 hover:text-green-800'
                            }`}
                            title={f.status === 'ativo' ? 'Desativar' : 'Ativar'}
                          >
                            <i className={`fas ${f.status === 'ativo' ? 'fa-ban' : 'fa-check'}`}></i>
                          </button>
                          <button
                            onClick={() => excluirFornecedor(f.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
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

            {fornecedoresAtuais.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                {filtros.busca || filtros.status || filtros.tipoPessoa ? 
                  "Nenhum fornecedor encontrado com os filtros aplicados." :
                  "Nenhum fornecedor cadastrado ainda."
                }
              </div>
            )}

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t">
                {/* ... (lógica de paginação idêntica à de clientes) ... */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Visualização */}
      {mostrarModal && fornecedorSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              {/* ... (JSX do modal de visualização, adaptado para fornecedor) ... */}
              <button onClick={fecharModal}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
     <ModalEditarFornecedor
        fornecedor={fornecedorParaEdicao}
        isOpen={mostrarModalEdicao}
        onClose={fecharModalEdicao}
        onFornecedorAtualizado={handleFornecedorAtualizado}
      />
    </div>
  );
}
import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";
import { api } from "../../../services/api.js";
import { toast } from "react-toastify";
import ModalEditarObra from "./modalObra.jsx"; // 1. Importar o novo modal de edição

// Função para formatar o status vindo do Enum do backend
const formatarStatus = (statusEnum) => {
  if (!statusEnum) return "N/A";
  return statusEnum.replace("_", " "); // Ex: "EM_ANDAMENTO" -> "EM ANDAMENTO"
}

// Enums do backend para os filtros
const categorias = ["RESIDENCIAL", "COMERCIAL", "INFRAESTRUTURA"];
const statusOptions = ["PLANEJAMENTO", "EM_ANDAMENTO", "CONCLUIDA", "CANCELADA"];

// Helper para mapear DTO para o estado local (evita duplicação)
const mapObraDTOToState = (obra) => ({
  id: obra.idObra,
  nome: obra.nomeObra,
  cliente: obra.clienteNome || "N/A",
  categoria: obra.tipo,
  // Endereço resumido para a tabela
  endereco: `${obra.endereco?.rua || ''}, ${obra.endereco?.numero || ''} - ${obra.endereco?.cidade || ''}`,
  // Endereço completo para o modal de visualização/edição
  enderecoCompleto: obra.endereco || {},
  dataInicio: obra.dataInicio,
  previsaoTermino: obra.dataPrevistaConclusao,
  valorContrato: obra.valorTotal,
  status: obra.status,
  // Passa os dados brutos de progresso
  totalUnidades: obra.totalUnidades,
  unidadesConcluidas: obra.unidadesConcluidas,
  progresso: (obra.totalUnidades > 0)
    ? Math.round((obra.unidadesConcluidas / obra.totalUnidades) * 100)
    : 0,
  engenheiro: obra.responsavelNome || "N/A"
});


export default function ListarObras() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  
  const [engenheiros, setEngenheiros] = useState([]);

  // 2. Estados para controlar os modais
  const [obraSelecionada, setObraSelecionada] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [filtros, setFiltros] = useState({
    nome: "",
    cliente: "",
    categoria: "",
    status: "",
    engenheiro: ""
  });

  const [obrasFiltradas, setObrasFiltradas] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  // Busca os dados da API
  useEffect(() => {
    const buscarObras = async () => {
      try {
        setLoading(true);
        setErro("");
        
        const [obrasResponse, funcResponse] = await Promise.all([
          api.get("/obras/listar", { withCredentials: true }),
          api.get("/funcionario/listar", { withCredentials: true })
        ]);

        if (obrasResponse.data.success) {
          const obrasMapeadas = obrasResponse.data.data.map(mapObraDTOToState); // Usa a função
          setObras(obrasMapeadas);
        } else {
          setErro("Erro ao carregar obras: " + obrasResponse.data.message);
          toast.error("Erro ao carregar obras.");
        }
        
        if (funcResponse.data.success) {
          // Salva apenas os nomes para o filtro
          setEngenheiros(funcResponse.data.data.map(f => f.nome) || []);
        }

      } catch (error) {
        console.error("Erro ao buscar obras:", error);
        setErro("Erro ao conectar com o servidor: " + (error.response?.data?.message || "Tente novamente"));
        toast.error("Erro ao conectar com o servidor.");
      } finally {
        setLoading(false);
      }
    };

    buscarObras();
  }, []); // Roda apenas uma vez

  // Aplica os filtros
  useEffect(() => {
    let resultado = obras;

    if (filtros.nome) {
      resultado = resultado.filter(obra => 
        obra.nome.toLowerCase().includes(filtros.nome.toLowerCase())
      );
    }
    if (filtros.cliente) {
      resultado = resultado.filter(obra => 
        obra.cliente.toLowerCase().includes(filtros.cliente.toLowerCase())
      );
    }
    if (filtros.categoria) {
      resultado = resultado.filter(obra => obra.categoria === filtros.categoria);
    }
    if (filtros.status) {
      resultado = resultado.filter(obra => obra.status === filtros.status);
    }
    if (filtros.engenheiro) {
      resultado = resultado.filter(obra => obra.engenheiro === filtros.engenheiro);
    }

    setObrasFiltradas(resultado);
    setPaginaAtual(1);
  }, [filtros, obras]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const limparFiltros = () => {
    setFiltros({
      nome: "",
      cliente: "",
      categoria: "",
      status: "",
      engenheiro: ""
    });
  };

  const formatarMoeda = (valor) => {
    if (typeof valor !== 'number') {
      valor = parseFloat(valor) || 0;
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data) => {
    if (!data) return "-";
    const dataObj = new Date(data);
    dataObj.setMinutes(dataObj.getMinutes() + dataObj.getTimezoneOffset());
    return dataObj.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    const colors = {
      "PLANEJAMENTO": "bg-yellow-100 text-yellow-800",
      "EM_ANDAMENTO": "bg-blue-100 text-blue-800",
      "CANCELADA": "bg-red-100 text-red-800",
      "CONCLUIDA": "bg-green-100 text-green-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getProgressColor = (progresso) => {
    if (progresso >= 80) return "bg-green-500";
    if (progresso >= 50) return "bg-blue-500";
    if (progresso >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const confirmarExclusao = (callback) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p>Tem certeza que deseja excluir esta obra?</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              onClick={() => {
                callback(); 
                closeToast();
              }}
              style={{ background: "red", color: "white", padding: "5px 10px", borderRadius: "5px" }}
            >
              Excluir
            </button>
            <button
              onClick={closeToast}
              style={{ padding: "5px 10px", border: "1px solid #ccc", borderRadius: "5px" }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      { closeOnClick: false, autoClose: false }
    );
  };

  // Paginação
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const obrasExibidas = obrasFiltradas.slice(indiceInicio, indiceFim);
  const totalPaginas = Math.ceil(obrasFiltradas.length / itensPorPagina);

  const handleExcluir = (id) => {
    confirmarExclusao(async () => {
      try {
        await api.delete(`/obras/deletar/${id}`, { withCredentials: true });
        setObras((prev) => prev.filter((obra) => obra.id !== id));
        toast.success("Obra excluída com sucesso!");
      } catch (error) {
        // Usa a mensagem genérica do GlobalExceptionHandler
        toast.error(error.response?.data?.message || "Erro ao excluir obra.");
      }
    });
  };

  // 3. Funções para controlar os modais
  const handleVisualizar = (obra) => {
    setObraSelecionada(obra);
    setIsViewModalOpen(true);
  };

  const handleEditar = (obra) => {
    setObraSelecionada(obra);
    setIsEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setObraSelecionada(null); // Limpa a seleção
  };

  // 4. Função para atualizar a lista após a edição
  const handleObraAtualizada = (obraAtualizadaDTO) => {
    const obraMapeada = mapObraDTOToState(obraAtualizadaDTO);
    setObras(prev => 
      prev.map(obra => 
        obra.id === obraMapeada.id ? obraMapeada : obra
      )
    );
    handleCloseModals();
  };

  
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="ml-64">
          <Header />
          <div className="p-6 text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-cordes-blue"></i>
            <p className="mt-2 text-gray-600">Carregando obras...</p>
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
          <div className="p-6 text-center text-red-600">
            <p>Erro ao carregar dados: {erro}</p>
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
          <div className="bg-white rounded-xl shadow-md p-8">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-cordes-blue">Lista de Obras</h1>
                <p className="text-gray-600 mt-2">Gerencie e acompanhe todas as obras da construtora</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total de Obras</div>
                <div className="text-2xl font-bold text-cordes-blue">{obrasFiltradas.length}</div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nome da Obra</label>
                  <input
                    type="text"
                    name="nome"
                    value={filtros.nome}
                    onChange={handleFiltroChange}
                    placeholder="Filtrar por nome..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Cliente</label>
                  <input
                    type="text"
                    name="cliente"
                    value={filtros.cliente}
                    onChange={handleFiltroChange}
                    placeholder="Filtrar por cliente..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Categoria</label>
                  <select
                    name="categoria"
                    value={filtros.categoria}
                    onChange={handleFiltroChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  >
                    <option value="">Todas as categorias</option>
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Status</label>
                  <select
                    name="status"
                    value={filtros.status}
                    onChange={handleFiltroChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  >
                    <option value="">Todos os status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{formatarStatus(status)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Engenheiro</label>
                  <select
                    name="engenheiro"
                    value={filtros.engenheiro}
                    onChange={handleFiltroChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  >
                    <option value="">Todos os engenheiros</option>
                    {engenheiros.map(engenheiro => (
                      <option key={engenheiro} value={engenheiro}>{engenheiro}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex gap-4">
                <button
                  onClick={limparFiltros}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>

            {/* Tabela de Obras */}
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Obra / Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progresso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engenheiro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {obrasExibidas.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <i className="fas fa-clipboard text-4xl text-gray-300 mb-2"></i>
                          <p>Nenhuma obra encontrada</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    obrasExibidas.map((obra) => (
                      <tr key={obra.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{obra.nome}</div>
                            <div className="text-sm text-gray-500">{obra.cliente}</div>
                            <div className="text-xs text-gray-400">{obra.endereco}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {obra.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <div className="text-xs text-gray-500">Início</div>
                            <div>{formatarData(obra.dataInicio)}</div>
                            <div className="text-xs text-gray-500 mt-1">Previsão</div>
                            <div>{formatarData(obra.previsaoTermino)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatarMoeda(obra.valorContrato)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(obra.status)}`}>
                            {formatarStatus(obra.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>{obra.progresso}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getProgressColor(obra.progresso)}`}
                                  style={{ width: `${obra.progresso}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {obra.engenheiro}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {/* 5. Botões com onClick atualizados */}
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleVisualizar(obra)} 
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Visualizar"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              onClick={() => handleEditar(obra)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Editar"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              onClick={() => handleExcluir(obra.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Excluir"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Mostrando {indiceInicio + 1} a {Math.min(indiceFim, obrasFiltradas.length)} de {obrasFiltradas.length} obras
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                    disabled={paginaAtual === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  {[...Array(totalPaginas)].map((_, index) => {
                    const pagina = index + 1;
                    return (
                      <button
                        key={pagina}
                        onClick={() => setPaginaAtual(pagina)}
                        className={`px-3 py-1 border rounded-md text-sm font-medium ${
                          paginaAtual === pagina
                            ? 'bg-cordes-blue border-cordes-blue text-white'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pagina}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                    disabled={paginaAtual === totalPaginas}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {/* Resumo Estatístico */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 text-2xl font-bold">
                  {obras.filter(o => o.status === "EM_ANDAMENTO").length}
                </div>
                <div className="text-blue-800 text-sm">Em Andamento</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-2xl font-bold">
                  {obras.filter(o => o.status === "CONCLUIDA").length}
                </div>
                <div className="text-green-800 text-sm">Concluídas</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-yellow-600 text-2xl font-bold">
                  {obras.filter(o => o.status === "PLANEJAMENTO").length}
                </div>
                <div className="text-yellow-800 text-sm">Planejamento</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 text-2xl font-bold">
                  {formatarMoeda(obras.reduce((total, obra) => total + obra.valorContrato, 0))}
                </div>
                <div className="text-purple-800 text-sm">Valor Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Renderização dos Modais */}

      {/* Modal de Visualização (embutido) */}
      {isViewModalOpen && obraSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-cordes-blue">{obraSelecionada.nome}</h2>
                <button
                  onClick={handleCloseModals}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(obraSelecionada.status)}`}>
                {formatarStatus(obraSelecionada.status)}
              </span>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Detalhes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Cliente</label>
                    <div className="text-gray-900">{obraSelecionada.cliente}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Responsável</label>
                    <div className="text-gray-900">{obraSelecionada.engenheiro}</div>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-600">Categoria</label>
                    <div className="text-gray-900">{obraSelecionada.categoria}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Valor do Contrato</label>
                    <div className="text-gray-900">{formatarMoeda(obraSelecionada.valorContrato)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Data de Início</label>
                    <div className="text-gray-900">{formatarData(obraSelecionada.dataInicio)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Previsão de Término</label>
                    <div className="text-gray-900">{formatarData(obraSelecionada.previsaoTermino)}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Rua e Número</label>
                    <div className="text-gray-900">{obraSelecionada.enderecoCompleto.rua}, {obraSelecionada.enderecoCompleto.numero}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Bairro</label>
                    <div className="text-gray-900">{obraSelecionada.enderecoCompleto.bairro}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Cidade/Estado</label>
                    <div className="text-gray-900">{obraSelecionada.enderecoCompleto.cidade} / {obraSelecionada.enderecoCompleto.estado}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">CEP</label>
                    <div className="text-gray-900">{obraSelecionada.enderecoCompleto.cep}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={handleCloseModals}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição (importado) */}
      <ModalEditarObra
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        obra={obraSelecionada}
        onObraAtualizada={handleObraAtualizada}
      />
    </div>
  );
}
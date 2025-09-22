import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";

export default function ListarObras() {
  const [obras, setObras] = useState([
    {
      id: 1,
      nome: "Residencial Vila Verde",
      cliente: "João Silva",
      categoria: "Residencial",
      endereco: "Rua das Flores, 123 - Centro",
      dataInicio: "2024-01-15",
      previsaoTermino: "2024-12-20",
      valorContrato: 850000.00,
      status: "Em Andamento",
      progresso: 45,
      engenheiro: "Carlos Ferreira"
    },
    {
      id: 2,
      nome: "Edifício Comercial Downtown",
      cliente: "Construtora ABC Ltda",
      categoria: "Comercial",
      endereco: "Av. Principal, 456 - Centro",
      dataInicio: "2024-03-01",
      previsaoTermino: "2025-08-30",
      valorContrato: 2500000.00,
      status: "Em Andamento",
      progresso: 25,
      engenheiro: "Ana Costa"
    },
    {
      id: 3,
      nome: "Reforma Casa de Campo",
      cliente: "Maria Santos",
      categoria: "Reforma",
      endereco: "Estrada Rural, km 15",
      dataInicio: "2023-11-01",
      previsaoTermino: "2024-04-30",
      valorContrato: 180000.00,
      status: "Concluída",
      progresso: 100,
      engenheiro: "Pedro Oliveira"
    },
    {
      id: 4,
      nome: "Condomínio Horizontal Jardins",
      cliente: "Incorporadora XYZ",
      categoria: "Residencial",
      endereco: "Loteamento Jardins, Quadra A",
      dataInicio: "2024-02-10",
      previsaoTermino: "2025-12-15",
      valorContrato: 5200000.00,
      status: "Planejamento",
      progresso: 10,
      engenheiro: "Carlos Ferreira"
    },
    {
      id: 5,
      nome: "Ampliação Galpão Industrial",
      cliente: "Indústria Metalúrgica S.A.",
      categoria: "Industrial",
      endereco: "Distrito Industrial, Lote 45",
      dataInicio: "2024-04-01",
      previsaoTermino: "2024-10-30",
      valorContrato: 750000.00,
      status: "Paralisada",
      progresso: 30,
      engenheiro: "Ana Costa"
    }
  ]);

  const [filtros, setFiltros] = useState({
    nome: "",
    cliente: "",
    categoria: "",
    status: "",
    engenheiro: ""
  });

  const [obrasFiltradas, setObrasFiltradas] = useState(obras);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const categorias = ["Residencial", "Comercial", "Industrial", "Reforma", "Infraestrutura"];
  const statusOptions = ["Planejamento", "Em Andamento", "Paralisada", "Concluída"];
  const engenheiros = ["Carlos Ferreira", "Ana Costa", "Pedro Oliveira", "João Admin"];

  useEffect(() => {
    let resultado = obras;

    // Aplicar filtros
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
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    const colors = {
      "Planejamento": "bg-yellow-100 text-yellow-800",
      "Em Andamento": "bg-blue-100 text-blue-800",
      "Paralisada": "bg-red-100 text-red-800",
      "Concluída": "bg-green-100 text-green-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getProgressColor = (progresso) => {
    if (progresso >= 80) return "bg-green-500";
    if (progresso >= 50) return "bg-blue-500";
    if (progresso >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Paginação
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const obrasExibidas = obrasFiltradas.slice(indiceInicio, indiceFim);
  const totalPaginas = Math.ceil(obrasFiltradas.length / itensPorPagina);

  const handleExcluir = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta obra?")) {
      setObras(obras.filter(obra => obra.id !== id));
      alert("Obra excluída com sucesso!");
    }
  };

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
                      <option key={status} value={status}>{status}</option>
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
                            {obra.status}
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
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900 p-1">
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="text-green-600 hover:text-green-900 p-1">
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              onClick={() => handleExcluir(obra.id)}
                              className="text-red-600 hover:text-red-900 p-1"
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
                  {obras.filter(o => o.status === "Em Andamento").length}
                </div>
                <div className="text-blue-800 text-sm">Em Andamento</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-2xl font-bold">
                  {obras.filter(o => o.status === "Concluída").length}
                </div>
                <div className="text-green-800 text-sm">Concluídas</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-yellow-600 text-2xl font-bold">
                  {obras.filter(o => o.status === "Planejamento").length}
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
    </div>
  );
}
import { useState } from "react";
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";

export default function ListarProdutos() {
  const [produtos, setProdutos] = useState([
    {
      id: 1,
      nome: "Cimento Portland CP II-E-32",
      categoria: "Cimento e Argamassa",
      marca: "Votorantim",
      unidadeMedida: "sc",
      preco: 32.50,
      precoCusto: 25.00,
      estoque: 150,
      estoqueMinimo: 50,
      fornecedor: "Distribuidora ABC",
      localizacao: "Galpão A - Prateleira 1"
    },
    {
      id: 2,
      nome: "Tijolo Cerâmico 6 Furos",
      categoria: "Tijolos e Blocos",
      marca: "Cerâmica São José",
      unidadeMedida: "un",
      preco: 0.85,
      precoCusto: 0.65,
      estoque: 25,
      estoqueMinimo: 100,
      fornecedor: "Cerâmica Ltda",
      localizacao: "Pátio Externo"
    },
    {
      id: 3,
      nome: "Areia Média Lavada",
      categoria: "Areia e Brita",
      marca: "Pedreira Central",
      unidadeMedida: "m³",
      preco: 45.00,
      precoCusto: 35.00,
      estoque: 80,
      estoqueMinimo: 20,
      fornecedor: "Pedreira Central",
      localizacao: "Pátio B"
    }
  ]);

  const [filtro, setFiltro] = useState({
    busca: "",
    categoria: "",
    estoqueMinimo: false
  });

  const [paginacao, setPaginacao] = useState({
    paginaAtual: 1,
    itensPorPagina: 10
  });

  const categorias = [
    "Cimento e Argamassa",
    "Tijolos e Blocos",
    "Areia e Brita",
    "Ferro e Aço",
    "Madeira",
    "Tintas e Vernizes",
    "Hidráulica",
    "Elétrica",
    "Cerâmica e Revestimentos",
    "Vidros",
    "Ferramentas",
    "EPIs",
    "Outros"
  ];

  const produtosFiltrados = produtos.filter(produto => {
    const matchBusca = produto.nome.toLowerCase().includes(filtro.busca.toLowerCase()) ||
                      produto.marca.toLowerCase().includes(filtro.busca.toLowerCase());
    const matchCategoria = !filtro.categoria || produto.categoria === filtro.categoria;
    const matchEstoque = !filtro.estoqueMinimo || produto.estoque <= produto.estoqueMinimo;
    
    return matchBusca && matchCategoria && matchEstoque;
  });

  const totalPaginas = Math.ceil(produtosFiltrados.length / paginacao.itensPorPagina);
  const indiceInicio = (paginacao.paginaAtual - 1) * paginacao.itensPorPagina;
  const produtosPaginados = produtosFiltrados.slice(indiceInicio, indiceInicio + paginacao.itensPorPagina);

  const calcularMargem = (preco, precoCusto) => {
    if (preco && precoCusto) {
      return ((preco - precoCusto) / precoCusto * 100).toFixed(1);
    }
    return "0";
  };

  const getStatusEstoque = (estoque, estoqueMinimo) => {
    if (estoque <= estoqueMinimo) {
      return { texto: "Crítico", cor: "text-red-600 bg-red-100" };
    } else if (estoque <= estoqueMinimo * 1.5) {
      return { texto: "Baixo", cor: "text-yellow-600 bg-yellow-100" };
    }
    return { texto: "Normal", cor: "text-green-600 bg-green-100" };
  };

  const handleFiltroChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltro(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setPaginacao(prev => ({ ...prev, paginaAtual: 1 }));
  };

  const handleExcluir = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      setProdutos(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEditar = (id) => {
    console.log("Editar produto:", id);
    // Aqui você redirecionaria para a página de edição
    alert(`Redirecionando para edição do produto ID: ${id}`);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-cordes-blue">Lista de Produtos</h1>
                <p className="text-gray-600 mt-2">Gerencie todos os produtos cadastrados</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total de Produtos</div>
                <div className="text-2xl font-bold text-cordes-blue">{produtos.length}</div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Buscar</label>
                  <input
                    type="text"
                    name="busca"
                    value={filtro.busca}
                    onChange={handleFiltroChange}
                    placeholder="Nome ou marca do produto..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Categoria</label>
                  <select
                    name="categoria"
                    value={filtro.categoria}
                    onChange={handleFiltroChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  >
                    <option value="">Todas as categorias</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    name="estoqueMinimo"
                    checked={filtro.estoqueMinimo}
                    onChange={handleFiltroChange}
                    className="h-4 w-4 text-cordes-blue focus:ring-cordes-blue border-gray-300 rounded mr-3"
                  />
                  <label className="text-gray-700 font-medium">Apenas produtos com estoque baixo</label>
                </div>
              </div>
            </div>

            {/* Tabela de Produtos */}
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {produtosPaginados.map((produto) => {
                    const statusEstoque = getStatusEstoque(produto.estoque, produto.estoqueMinimo);
                    return (
                      <tr key={produto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                            <div className="text-sm text-gray-500">{produto.marca}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {produto.categoria}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">R$ {produto.preco.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">por {produto.unidadeMedida}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-green-600">
                            {calcularMargem(produto.preco, produto.precoCusto)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{produto.estoque} {produto.unidadeMedida}</div>
                          <div className="text-sm text-gray-500">Mín: {produto.estoqueMinimo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusEstoque.cor}`}>
                            {statusEstoque.texto}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditar(produto.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleExcluir(produto.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Mostrando {indiceInicio + 1} até {Math.min(indiceInicio + paginacao.itensPorPagina, produtosFiltrados.length)} de {produtosFiltrados.length} produtos
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPaginacao(prev => ({ ...prev, paginaAtual: Math.max(1, prev.paginaAtual - 1) }))}
                    disabled={paginacao.paginaAtual === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pagina => (
                    <button
                      key={pagina}
                      onClick={() => setPaginacao(prev => ({ ...prev, paginaAtual: pagina }))}
                      className={`px-3 py-2 border rounded-md text-sm font-medium ${
                        pagina === paginacao.paginaAtual
                          ? 'bg-cordes-blue text-white border-cordes-blue'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pagina}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setPaginacao(prev => ({ ...prev, paginaAtual: Math.min(totalPaginas, prev.paginaAtual + 1) }))}
                    disabled={paginacao.paginaAtual === totalPaginas}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {produtosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">Nenhum produto encontrado</div>
                <p className="text-gray-400 mt-2">Tente ajustar os filtros ou cadastrar novos produtos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
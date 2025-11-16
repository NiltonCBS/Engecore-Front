import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";
import { api } from "../../../services/api.js";
import { toast } from "react-toastify";
import ModalEditarProduto from "./ModalEditarProduto.jsx";

export default function ListarProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  /*const handleVisualizar = (produto) => {
    setProdutoSelecionado(produto);
    setIsViewModalOpen(true);
  };*/

  const handleEditar = (produto) => {
    setProdutoSelecionado(produto);
    setIsEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setProdutoSelecionado(null);
  };

  const mapInsumoToProduto = (insumo) => ({
    id: insumo.id,
    nome: insumo.nome,
    unidadeMedida: insumo.unidade,
  });

  const handleProdutoAtualizado = (insumoAtualizadoDTO) => {

    const produtoMapeado = mapInsumoToProduto(insumoAtualizadoDTO);
    setProdutos((prev) =>
      prev.map((p) => (p.id === produtoMapeado.id ? produtoMapeado : p))
    );
    handleCloseModals();
  };

  const [filtro, setFiltro] = useState({
    busca: "",
    categoria: "",
    estoqueMinimo: false,
  });

  const [paginacao, setPaginacao] = useState({
    paginaAtual: 1,
    itensPorPagina: 10,
  });

  const categorias = [
    "Cimento e Argamassa",
    "Tijolos e Blocos",
    "Areia e Brita",
    "Ferro e Aço",
  ];

  async function fetchInsumos() {
    setLoading(true);
    try {
      const response = await api.get("/insumo/listar", { withCredentials: true });
      if (response.data.success) {
        const insumosMapeados = response.data.data.map(mapInsumoToProduto);
        setProdutos(insumosMapeados);
      } else {
        toast.error("Erro ao carregar insumos.");
        setErro("Erro ao carregar insumos.");
      }
    } catch (error) {
      toast.error("Falha ao conectar com o servidor.");
      setErro("Falha ao conectar com o servidor.", error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchInsumos();
  }, []);

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(filtro.busca.toLowerCase())
  );

  const totalPaginas = Math.ceil(produtosFiltrados.length / paginacao.itensPorPagina);
  const indiceInicio = (paginacao.paginaAtual - 1) * paginacao.itensPorPagina;
  const produtosPaginados = produtosFiltrados.slice(
    indiceInicio,
    indiceInicio + paginacao.itensPorPagina
  );

  const handleFiltroChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltro((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setPaginacao((prev) => ({ ...prev, paginaAtual: 1 }));
  };

  const handleExcluir = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este insumo?")) {
      api
        .delete(`/insumo/deletar/${id}`)
        .then(() => {
          setProdutos((prev) => prev.filter((p) => p.id !== id));
          toast.success("Insumo excluído com sucesso!");
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || "Erro ao excluir insumo.");
        });
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="ml-64">
          <Header />
          <div className="p-6 text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-cordes-blue"></i>
            <p className="mt-2 text-gray-600">Carregando produtos/insumos...</p>
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-cordes-blue">
                  Lista de Produtos (Insumos)
                </h1>
                <p className="text-gray-600 mt-2">
                  Gerencie todos os insumos mestres cadastrados
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total de Insumos</div>
                <div className="text-2xl font-bold text-cordes-blue">
                  {produtos.length}
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Buscar
                  </label>
                  <input
                    type="text"
                    name="busca"
                    value={filtro.busca}
                    onChange={handleFiltroChange}
                    placeholder="Nome do insumo..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Categoria
                  </label>
                  <select
                    name="categoria"
                    value={filtro.categoria}
                    onChange={handleFiltroChange}
                    disabled
                    className="w-full border border-gray-300 rounded-lg p-3 bg-gray-200"
                  >
                    <option value="">(Não disponível)</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    name="estoqueMinimo"
                    checked={filtro.estoqueMinimo}
                    onChange={handleFiltroChange}
                    disabled
                    className="h-4 w-4 text-cordes-blue border-gray-300 rounded mr-3"
                  />
                  <label className="text-gray-700 font-medium">
                    Apenas produtos com estoque baixo (Não disponível)
                  </label>
                </div>
              </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto (Insumo)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {produtosPaginados.map((produto) => (
                    <tr key={produto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {produto.nome}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {produto.unidadeMedida}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditar(produto)}
                            className="text-green-600 hover:text-green-900 p-1"
                          >
                            <i className="fas fa-edit"></i>
                          </button>

                          <button
                            onClick={() => handleExcluir(produto.id)}
                            className="text-red-600 hover:text-red-900 p-1"
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

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Mostrando {indiceInicio + 1} até{" "}
                  {Math.min(
                    indiceInicio + paginacao.itensPorPagina,
                    produtosFiltrados.length
                  )}{" "}
                  de {produtosFiltrados.length}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setPaginacao((prev) => ({
                        ...prev,
                        paginaAtual: Math.max(1, prev.paginaAtual - 1),
                      }))
                    }
                    disabled={paginacao.paginaAtual === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    Anterior
                  </button>

                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                    (pagina) => (
                      <button
                        key={pagina}
                        onClick={() =>
                          setPaginacao((prev) => ({
                            ...prev,
                            paginaAtual: pagina,
                          }))
                        }
                        className={`px-3 py-2 border rounded-md text-sm ${pagina === paginacao.paginaAtual
                          ? "bg-cordes-blue text-white border-cordes-blue"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {pagina}
                      </button>
                    )
                  )}

                  <button
                    onClick={() =>
                      setPaginacao((prev) => ({
                        ...prev,
                        paginaAtual: Math.min(totalPaginas, prev.paginaAtual + 1),
                      }))
                    }
                    disabled={paginacao.paginaAtual === totalPaginas}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}

            {produtosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  Nenhum produto encontrado
                </div>
                <p className="text-gray-400 mt-2">
                  Tente ajustar os filtros ou cadastrar novos produtos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isViewModalOpen && produtoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-cordes-blue">
                  {produtoSelecionado.nome}
                </h2>
                <button
                  onClick={handleCloseModals}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  ID do Insumo
                </label>
                <div className="text-gray-900">{produtoSelecionado.id}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Nome do Insumo
                </label>
                <div className="text-gray-900">{produtoSelecionado.nome}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Unidade de Medida
                </label>
                <div className="text-gray-900">
                  {produtoSelecionado.unidadeMedida}
                </div>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg text-yellow-700 text-sm">
                <i className="fas fa-info-circle mr-2"></i>
                Preço, estoque e fornecedores são gerenciados em "Controle de Estoque" e "Cotações".
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={handleCloseModals}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalEditarProduto
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        produto={produtoSelecionado}
        onProdutoAtualizado={handleProdutoAtualizado}
      />

    </div>
  );
}

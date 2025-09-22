import { useState } from "react";
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";

export default function GerenciarCategorias() {
  const [categorias, setCategorias] = useState([
    { id: 1, nome: "Cimento e Argamassa", descricao: "Cimentos, argamassas e produtos similares", ativo: true, produtosCount: 15 },
    { id: 2, nome: "Tijolos e Blocos", descricao: "Tijolos cerâmicos, blocos de concreto e similares", ativo: true, produtosCount: 8 },
    { id: 3, nome: "Areia e Brita", descricao: "Agregados para construção", ativo: true, produtosCount: 12 },
    { id: 4, nome: "Ferro e Aço", descricao: "Barras de ferro, vergalhões e estruturas metálicas", ativo: true, produtosCount: 25 },
    { id: 5, nome: "Madeira", descricao: "Madeiras, compensados e derivados", ativo: true, produtosCount: 18 },
    { id: 6, nome: "Tintas e Vernizes", descricao: "Tintas, vernizes, primers e produtos para pintura", ativo: true, produtosCount: 32 },
    { id: 7, nome: "Hidráulica", descricao: "Tubos, conexões, válvulas e acessórios hidráulicos", ativo: true, produtosCount: 45 },
    { id: 8, nome: "Elétrica", descricao: "Fios, cabos, interruptores e material elétrico", ativo: true, produtosCount: 38 },
    { id: 9, nome: "Cerâmica e Revestimentos", descricao: "Cerâmicas, porcelanatos e revestimentos", ativo: true, produtosCount: 28 },
    { id: 10, nome: "Vidros", descricao: "Vidros temperados, laminados e acessórios", ativo: false, produtosCount: 5 },
    { id: 11, nome: "Ferramentas", descricao: "Ferramentas manuais e elétricas", ativo: true, produtosCount: 67 },
    { id: 12, nome: "EPIs", descricao: "Equipamentos de proteção individual", ativo: true, produtosCount: 22 }
  ]);

  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [novaCategoria, setNovaCategoria] = useState({
    nome: "",
    descricao: "",
    ativo: true
  });

  const [filtro, setFiltro] = useState("");
  const [mostrarInativos, setMostrarInativos] = useState(false);

  const categoriasFiltradas = categorias.filter(categoria => {
    const matchNome = categoria.nome.toLowerCase().includes(filtro.toLowerCase());
    const matchStatus = mostrarInativos || categoria.ativo;
    return matchNome && matchStatus;
  });

  const handleAbrirModal = (categoria = null) => {
    if (categoria) {
      setCategoriaEditando(categoria);
      setNovaCategoria({
        nome: categoria.nome,
        descricao: categoria.descricao,
        ativo: categoria.ativo
      });
    } else {
      setCategoriaEditando(null);
      setNovaCategoria({
        nome: "",
        descricao: "",
        ativo: true
      });
    }
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setCategoriaEditando(null);
    setNovaCategoria({
      nome: "",
      descricao: "",
      ativo: true
    });
  };

  const handleSalvar = () => {
    if (!novaCategoria.nome.trim()) {
      alert("Nome da categoria é obrigatório!");
      return;
    }

    if (categoriaEditando) {
      setCategorias(prev => prev.map(cat => 
        cat.id === categoriaEditando.id 
          ? { ...cat, ...novaCategoria }
          : cat
      ));
    } else {
      const novoId = Math.max(...categorias.map(c => c.id)) + 1;
      setCategorias(prev => [...prev, {
        id: novoId,
        ...novaCategoria,
        produtosCount: 0
      }]);
    }

    handleFecharModal();
  };

  const handleExcluir = (categoria) => {
    if (categoria.produtosCount > 0) {
      alert(`Não é possível excluir a categoria "${categoria.nome}" pois ela possui ${categoria.produtosCount} produto(s) associado(s).`);
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir a categoria "${categoria.nome}"?`)) {
      setCategorias(prev => prev.filter(c => c.id !== categoria.id));
    }
  };

  const handleToggleStatus = (categoria) => {
    if (!categoria.ativo && categoria.produtosCount > 0) {
      alert(`Não é possível desativar a categoria "${categoria.nome}" pois ela possui ${categoria.produtosCount} produto(s) associado(s).`);
      return;
    }

    setCategorias(prev => prev.map(cat => 
      cat.id === categoria.id 
        ? { ...cat, ativo: !cat.ativo }
        : cat
    ));
  };

  const totalCategorias = categorias.length;
  const categoriasAtivas = categorias.filter(c => c.ativo).length;
  const totalProdutos = categorias.reduce((sum, cat) => sum + cat.produtosCount, 0);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-cordes-blue">Gerenciar Categorias</h1>
                <p className="text-gray-600 mt-2">Organize e gerencie as categorias de produtos</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Categorias Ativas</div>
                <div className="text-2xl font-bold text-cordes-blue">{categoriasAtivas}/{totalCategorias}</div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 text-sm font-medium">Total de Categorias</div>
                <div className="text-2xl font-bold text-blue-800">{totalCategorias}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-sm font-medium">Categorias Ativas</div>
                <div className="text-2xl font-bold text-green-800">{categoriasAtivas}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 text-sm font-medium">Total de Produtos</div>
                <div className="text-2xl font-bold text-purple-800">{totalProdutos}</div>
              </div>
            </div>

            {/* Filtros e Ações */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  placeholder="Buscar categoria..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={mostrarInativos}
                  onChange={(e) => setMostrarInativos(e.target.checked)}
                  className="h-4 w-4 text-cordes-blue focus:ring-cordes-blue border-gray-300 rounded mr-2"
                />
                <label className="text-gray-700">Mostrar inativas</label>
              </div>
              <button
                onClick={() => handleAbrirModal()}
                className="bg-cordes-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
              >
                Nova Categoria
              </button>
            </div>

            {/* Lista de Categorias */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriasFiltradas.map((categoria) => (
                <div key={categoria.id} className={`border rounded-lg p-6 ${categoria.ativo ? 'bg-white' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${categoria.ativo ? 'text-gray-800' : 'text-gray-500'}`}>
                        {categoria.nome}
                      </h3>
                      <p className={`text-sm mt-1 ${categoria.ativo ? 'text-gray-600' : 'text-gray-400'}`}>
                        {categoria.descricao}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      categoria.ativo 
                        ? 'text-green-800 bg-green-100' 
                        : 'text-gray-800 bg-gray-200'
                    }`}>
                      {categoria.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">
                      {categoria.produtosCount} produto(s)
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAbrirModal(categoria)}
                      className="flex-1 text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleToggleStatus(categoria)}
                      className={`flex-1 text-sm px-3 py-2 rounded transition ${
                        categoria.ativo
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {categoria.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleExcluir(categoria)}
                      disabled={categoria.produtosCount > 0}
                      className="flex-1 text-sm bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {categoriasFiltradas.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">Nenhuma categoria encontrada</div>
                <p className="text-gray-400 mt-2">Tente ajustar os filtros ou criar uma nova categoria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Nome da Categoria *</label>
                <input
                  type="text"
                  value={novaCategoria.nome}
                  onChange={(e) => setNovaCategoria(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Digite o nome da categoria"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Descrição</label>
                <textarea
                  value={novaCategoria.descricao}
                  onChange={(e) => setNovaCategoria(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva a categoria (opcional)"
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                ></textarea>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={novaCategoria.ativo}
                  onChange={(e) => setNovaCategoria(prev => ({ ...prev, ativo: e.target.checked }))}
                  className="h-4 w-4 text-cordes-blue focus:ring-cordes-blue border-gray-300 rounded mr-2"
                />
                <label className="text-gray-700 font-medium">Categoria ativa</label>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSalvar}
                className="flex-1 bg-cordes-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
              >
                {categoriaEditando ? 'Atualizar' : 'Cadastrar'}
              </button>
              <button
                onClick={handleFecharModal}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300 font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from "react";
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";
import { toast } from 'react-toastify';

export default function ControleEstoque() {
  const [produtos, setProdutos] = useState([
    {
      id: 1,
      nome: "Cimento Portland CP II-E-32",
      categoria: "Cimento e Argamassa",
      marca: "Votorantim",
      unidadeMedida: "sc",
      estoque: 150,
      estoqueMinimo: 50,
      estoqueMaximo: 300,
      localizacao: "Galpão A - Prateleira 1",
      ultimaMovimentacao: "2024-01-15",
      valorEstoque: 4875.00
    },
    {
      id: 2,
      nome: "Tijolo Cerâmico 6 Furos",
      categoria: "Tijolos e Blocos",
      marca: "Cerâmica São José",
      unidadeMedida: "un",
      estoque: 25,
      estoqueMinimo: 100,
      estoqueMaximo: 500,
      localizacao: "Pátio Externo",
      ultimaMovimentacao: "2024-01-14",
      valorEstoque: 21.25
    },
    {
      id: 3,
      nome: "Areia Média Lavada",
      categoria: "Areia e Brita",
      marca: "Pedreira Central",
      unidadeMedida: "m³",
      estoque: 80,
      estoqueMinimo: 20,
      estoqueMaximo: 150,
      localizacao: "Pátio B",
      ultimaMovimentacao: "2024-01-16",
      valorEstoque: 3600.00
    },
    {
      id: 4,
      nome: "Ferro 12mm CA-50",
      categoria: "Ferro e Aço",
      marca: "Gerdau",
      unidadeMedida: "kg",
      estoque: 5,
      estoqueMinimo: 50,
      estoqueMaximo: 200,
      localizacao: "Galpão B - Área 1",
      ultimaMovimentacao: "2024-01-10",
      valorEstoque: 45.00
    }
  ]);

  const [movimentacoes, setMovimentacoes] = useState([
    {
      id: 1,
      produtoId: 1,
      produto: "Cimento Portland CP II-E-32",
      tipo: "entrada",
      quantidade: 50,
      motivo: "Compra",
      responsavel: "João Silva",
      data: "2024-01-15",
      observacoes: "Lote XYZ123"
    },
    {
      id: 2,
      produtoId: 2,
      produto: "Tijolo Cerâmico 6 Furos",
      tipo: "saida",
      quantidade: 75,
      motivo: "Venda",
      responsavel: "Maria Santos",
      data: "2024-01-14",
      observacoes: "Pedido #001"
    }
  ]);

  const [modalMovimentacao, setModalMovimentacao] = useState(false);
  const [novaMovimentacao, setNovaMovimentacao] = useState({
    produtoId: "",
    tipo: "entrada",
    quantidade: "",
    motivo: "",
    responsavel: "",
    observacoes: ""
  });

  const [filtro, setFiltro] = useState({
    busca: "",
    categoria: "",
    status: "todos"
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

  const motivos = {
    entrada: ["Compra", "Devolução", "Ajuste", "Transferência"],
    saida: ["Venda", "Uso interno", "Perda", "Transferência", "Ajuste"]
  };

  const getStatusEstoque = (estoque, estoqueMinimo, estoqueMaximo) => {
    if (estoque <= estoqueMinimo) {
      return { texto: "Crítico", cor: "text-red-600 bg-red-100", icon: "⚠️" };
    } else if (estoque <= estoqueMinimo * 1.5) {
      return { texto: "Baixo", cor: "text-yellow-600 bg-yellow-100", icon: "⚡" };
    } else if (estoque >= estoqueMaximo) {
      return { texto: "Excesso", cor: "text-orange-600 bg-orange-100", icon: "📦" };
    }
    return { texto: "Normal", cor: "text-green-600 bg-green-100", icon: "✅" };
  };

  const produtosFiltrados = produtos.filter(produto => {
    const matchBusca = produto.nome.toLowerCase().includes(filtro.busca.toLowerCase());
    const matchCategoria = !filtro.categoria || produto.categoria === filtro.categoria;
    
    let matchStatus = true;
    if (filtro.status === "critico") {
      matchStatus = produto.estoque <= produto.estoqueMinimo;
    } else if (filtro.status === "baixo") {
      matchStatus = produto.estoque <= produto.estoqueMinimo * 1.5 && produto.estoque > produto.estoqueMinimo;
    } else if (filtro.status === "excesso") {
      matchStatus = produto.estoque >= produto.estoqueMaximo;
    }
    
    return matchBusca && matchCategoria && matchStatus;
  });

  const handleMovimentacao = () => {
    if (!novaMovimentacao.produtoId || !novaMovimentacao.quantidade || !novaMovimentacao.motivo) {
      toast.info("Preencha todos os campos obrigatórios!");
      return;
    }

    const produto = produtos.find(p => p.id === parseInt(novaMovimentacao.produtoId));
    const quantidade = parseInt(novaMovimentacao.quantidade);
    
    if (novaMovimentacao.tipo === "saida" && produto.estoque < quantidade) {
      toast.error("Quantidade insuficiente em estoque!");
      return;
    }

    // Atualizar estoque do produto
    setProdutos(prev => prev.map(p => {
      if (p.id === parseInt(novaMovimentacao.produtoId)) {
        const novoEstoque = novaMovimentacao.tipo === "entrada" 
          ? p.estoque + quantidade 
          : p.estoque - quantidade;
        return { ...p, estoque: novoEstoque, ultimaMovimentacao: new Date().toISOString().split('T')[0] };
      }
      return p;
    }));

    // Adicionar movimentação ao histórico
    const novoId = Math.max(...movimentacoes.map(m => m.id), 0) + 1;
    setMovimentacoes(prev => [{
      id: novoId,
      produtoId: parseInt(novaMovimentacao.produtoId),
      produto: produto.nome,
      tipo: novaMovimentacao.tipo,
      quantidade: quantidade,
      motivo: novaMovimentacao.motivo,
      responsavel: novaMovimentacao.responsavel || "Sistema",
      data: new Date().toISOString().split('T')[0],
      observacoes: novaMovimentacao.observacoes
    }, ...prev]);

    // Limpar formulário e fechar modal
    setNovaMovimentacao({
      produtoId: "",
      tipo: "entrada",
      quantidade: "",
      motivo: "",
      responsavel: "",
      observacoes: ""
    });
    setModalMovimentacao(false);
  };

  const estatisticas = {
    totalProdutos: produtos.length,
    produtosCriticos: produtos.filter(p => p.estoque <= p.estoqueMinimo).length,
    produtosBaixos: produtos.filter(p => p.estoque <= p.estoqueMinimo * 1.5 && p.estoque > p.estoqueMinimo).length,
    valorTotalEstoque: produtos.reduce((sum, p) => sum + p.valorEstoque, 0)
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
                <h1 className="text-3xl font-bold text-cordes-blue">Controle de Estoque</h1>
                <p className="text-gray-600 mt-2">Monitore e gerencie o estoque de produtos</p>
              </div>
              <button
                onClick={() => setModalMovimentacao(true)}
                className="bg-cordes-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
              >
                Nova Movimentação
              </button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 text-sm font-medium">Total de Produtos</div>
                <div className="text-2xl font-bold text-blue-800">{estatisticas.totalProdutos}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-red-600 text-sm font-medium">Estoque Crítico</div>
                <div className="text-2xl font-bold text-red-800">{estatisticas.produtosCriticos}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-yellow-600 text-sm font-medium">Estoque Baixo</div>
                <div className="text-2xl font-bold text-yellow-800">{estatisticas.produtosBaixos}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-sm font-medium">Valor Total</div>
                <div className="text-2xl font-bold text-green-800">R$ {estatisticas.valorTotalEstoque.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Buscar Produto</label>
                  <input
                    type="text"
                    value={filtro.busca}
                    onChange={(e) => setFiltro(prev => ({ ...prev, busca: e.target.value }))}
                    placeholder="Nome do produto..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Categoria</label>
                  <select
                    value={filtro.categoria}
                    onChange={(e) => setFiltro(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  >
                    <option value="">Todas as categorias</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Status do Estoque</label>
                  <select
                    value={filtro.status}
                    onChange={(e) => setFiltro(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  >
                    <option value="todos">Todos os status</option>
                    <option value="critico">Crítico</option>
                    <option value="baixo">Baixo</option>
                    <option value="excesso">Excesso</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tabela de Estoque */}
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque Atual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min/Max</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Movimentação</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {produtosFiltrados.map((produto) => {
                    const status = getStatusEstoque(produto.estoque, produto.estoqueMinimo, produto.estoqueMaximo);
                    return (
                      <tr key={produto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                            <div className="text-sm text-gray-500">{produto.marca}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {produto.localizacao}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {produto.estoque} {produto.unidadeMedida}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {produto.estoqueMinimo}/{produto.estoqueMaximo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${status.cor}`}>
                            <span className="mr-1">{status.icon}</span>
                            {status.texto}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {produto.valorEstoque.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(produto.ultimaMovimentacao).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Últimas Movimentações */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Últimas Movimentações</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Responsável</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {movimentacoes.slice(0, 5).map((mov) => (
                      <tr key={mov.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(mov.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{mov.produto}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            mov.tipo === 'entrada' 
                              ? 'text-green-800 bg-green-100' 
                              : 'text-red-800 bg-red-100'
                          }`}>
                            {mov.tipo === 'entrada' ? '⬆️ Entrada' : '⬇️ Saída'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{mov.quantidade}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{mov.motivo}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{mov.responsavel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nova Movimentação */}
      {modalMovimentacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Nova Movimentação de Estoque</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Produto *</label>
                <select
                  value={novaMovimentacao.produtoId}
                  onChange={(e) => setNovaMovimentacao(prev => ({ ...prev, produtoId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map(produto => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome} (Estoque: {produto.estoque} {produto.unidadeMedida})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Tipo de Movimentação *</label>
                <select
                  value={novaMovimentacao.tipo}
                  onChange={(e) => setNovaMovimentacao(prev => ({ ...prev, tipo: e.target.value, motivo: "" }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Quantidade *</label>
                <input
                  type="number"
                  value={novaMovimentacao.quantidade}
                  onChange={(e) => setNovaMovimentacao(prev => ({ ...prev, quantidade: e.target.value }))}
                  placeholder="Quantidade"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Motivo *</label>
                <select
                  value={novaMovimentacao.motivo}
                  onChange={(e) => setNovaMovimentacao(prev => ({ ...prev, motivo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                >
                  <option value="">Selecione o motivo</option>
                  {motivos[novaMovimentacao.tipo].map(motivo => (
                    <option key={motivo} value={motivo}>{motivo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Responsável</label>
                <input
                  type="text"
                  value={novaMovimentacao.responsavel}
                  onChange={(e) => setNovaMovimentacao(prev => ({ ...prev, responsavel: e.target.value }))}
                  placeholder="Nome do responsável"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Observações</label>
                <input
                  type="text"
                  value={novaMovimentacao.observacoes}
                  onChange={(e) => setNovaMovimentacao(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleMovimentacao}
                className="flex-1 bg-cordes-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
              >
                Registrar Movimentação
              </button>
              <button
                onClick={() => {
                  setModalMovimentacao(false);
                  setNovaMovimentacao({
                    produtoId: "",
                    tipo: "entrada",
                    quantidade: "",
                    motivo: "",
                    responsavel: "",
                    observacoes: ""
                  });
                }}
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
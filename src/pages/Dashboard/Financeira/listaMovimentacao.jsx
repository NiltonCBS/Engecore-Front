import { useState } from "react";
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";
import ModalEditarMovimentacao from "./modalMovimentacao";

export default function ListarMovimentacoes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [movimentacaoSelecionada, setMovimentacaoSelecionada] = useState(null);

  // Dados mockados para exemplo
  const [movimentacoes, setMovimentacoes] = useState([
    {
      idMovFin: 1,
      valor: 15000.00,
      tipo: "Receita",
      categoriaFinanceira: "Material de Construção",
      obraRelacionada: "Edifício Residencial ABC",
      funcionarioResponsavel: "João Silva",
      data: "2024-10-01",
      desc: "Venda de materiais excedentes",
      clienteReferente: "João Silva"
    },
    {
      idMovFin: 2,
      valor: 8500.50,
      tipo: "Despesa",
      categoriaFinanceira: "Mão de Obra",
      obraRelacionada: "Reforma Comercial XYZ",
      funcionarioResponsavel: "Maria Santos",
      data: "2024-10-05",
      desc: "Pagamento equipe de pedreiros",
      clienteReferente: "Maria Santos"
    },
    {
      idMovFin: 3,
      valor: 3200.00,
      tipo: "Despesa",
      categoriaFinanceira: "Equipamentos",
      obraRelacionada: "Construção Galpão Industrial",
      funcionarioResponsavel: "Pedro Oliveira",
      data: "2024-10-08",
      desc: "Aluguel de betoneira",
      clienteReferente: "Construtora ABC Ltda"
    },
    {
      idMovFin: 4,
      valor: 25000.00,
      tipo: "Receita",
      categoriaFinanceira: "Serviços Terceirizados",
      obraRelacionada: "Ampliação Residencial Silva",
      funcionarioResponsavel: "Ana Costa",
      data: "2024-10-10",
      desc: "Recebimento parcela cliente",
      clienteReferente: "Pedro Oliveira"
    },
    {
      idMovFin: 5,
      valor: 1200.00,
      tipo: "Transferência",
      categoriaFinanceira: "Administrativo",
      obraRelacionada: "Obra Condomínio Premium",
      funcionarioResponsavel: "Carlos Ferreira",
      data: "2024-10-12",
      desc: "Transferência entre contas",
      clienteReferente: "Incorporadora XYZ S/A"
    }
  ]);

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'Receita': return 'bg-green-100 text-green-800 border-green-200';
      case 'Despesa': return 'bg-red-100 text-red-800 border-red-200';
      case 'Transferência': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipoIcon = (tipo) => {
    switch(tipo) {
      case 'Receita': return 'fa-arrow-up';
      case 'Despesa': return 'fa-arrow-down';
      case 'Transferência': return 'fa-exchange-alt';
      default: return 'fa-dollar-sign';
    }
  };

  const handleEditar = (movimentacao) => {
    setMovimentacaoSelecionada(movimentacao);
    setModalAberto(true);
  };

  const handleSalvarEdicao = (movimentacaoEditada) => {
    setMovimentacoes(movimentacoes.map(m => 
      m.idMovFin === movimentacaoEditada.idMovFin ? movimentacaoEditada : m
    ));
    setModalAberto(false);
    alert("Movimentação atualizada com sucesso!");
  };

  const handleDeletar = (id) => {
    if (window.confirm("Tem certeza que deseja deletar esta movimentação?")) {
      setMovimentacoes(movimentacoes.filter(m => m.idMovFin !== id));
      alert("Movimentação deletada com sucesso!");
    }
  };

  const movimentacoesFiltradas = movimentacoes.filter(m => {
    const matchSearch = 
      m.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.obraRelacionada.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.clienteReferente.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchTipo = !filtroTipo || m.tipo === filtroTipo;
    const matchCategoria = !filtroCategoria || m.categoriaFinanceira === filtroCategoria;

    return matchSearch && matchTipo && matchCategoria;
  });

  const calcularTotais = () => {
    const totais = movimentacoesFiltradas.reduce((acc, m) => {
      if (m.tipo === 'Receita') acc.receitas += m.valor;
      if (m.tipo === 'Despesa') acc.despesas += m.valor;
      return acc;
    }, { receitas: 0, despesas: 0 });

    totais.saldo = totais.receitas - totais.despesas;
    return totais;
  };

  const totais = calcularTotais();

  const categorias = [...new Set(movimentacoes.map(m => m.categoriaFinanceira))];

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-cordes-blue">Movimentações Financeiras</h1>
                <p className="text-gray-600 mt-2">Gerencie todas as movimentações financeiras</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total de Registros</div>
                <div className="text-2xl font-bold text-cordes-blue">{movimentacoesFiltradas.length}</div>
              </div>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total Receitas</p>
                    <p className="text-2xl font-bold text-green-700">
                      R$ {totais.receitas.toFixed(2)}
                    </p>
                  </div>
                  <i className="fas fa-arrow-up text-3xl text-green-600"></i>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Total Despesas</p>
                    <p className="text-2xl font-bold text-red-700">
                      R$ {totais.despesas.toFixed(2)}
                    </p>
                  </div>
                  <i className="fas fa-arrow-down text-3xl text-red-600"></i>
                </div>
              </div>

              <div className={`${totais.saldo >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${totais.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Saldo</p>
                    <p className={`text-2xl font-bold ${totais.saldo >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                      R$ {totais.saldo.toFixed(2)}
                    </p>
                  </div>
                  <i className={`fas fa-balance-scale text-3xl ${totais.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}></i>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Buscar</label>
                  <div className="relative">
                    <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                    <input
                      type="text"
                      placeholder="Buscar por descrição, obra ou cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 pl-10 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Tipo</label>
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="Receita">Receita</option>
                    <option value="Despesa">Despesa</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Categoria</label>
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                  >
                    <option value="">Todas as categorias</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tabela de Movimentações */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Valor</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoria</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Obra</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentacoesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        <i className="fas fa-inbox text-4xl mb-2"></i>
                        <p>Nenhuma movimentação encontrada</p>
                      </td>
                    </tr>
                  ) : (
                    movimentacoesFiltradas.map((movimentacao) => (
                      <tr key={movimentacao.idMovFin} className="border-b border-gray-200 hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm text-gray-700">#{movimentacao.idMovFin}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {new Date(movimentacao.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getTipoColor(movimentacao.tipo)}`}>
                            <i className={`fas ${getTipoIcon(movimentacao.tipo)}`}></i>
                            {movimentacao.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                          R$ {movimentacao.valor.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{movimentacao.categoriaFinanceira}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{movimentacao.obraRelacionada}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{movimentacao.clienteReferente}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditar(movimentacao)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Editar"
                            >
                              <i className="fas fa-edit text-lg"></i>
                            </button>
                            <button
                              onClick={() => handleDeletar(movimentacao.idMovFin)}
                              className="text-red-600 hover:text-red-800 transition"
                              title="Deletar"
                            >
                              <i className="fas fa-trash text-lg"></i>
                            </button>
                            <button
                              onClick={() => alert(`Detalhes da movimentação #${movimentacao.idMovFin}`)}
                              className="text-gray-600 hover:text-gray-800 transition"
                              title="Ver Detalhes"
                            >
                              <i className="fas fa-eye text-lg"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {modalAberto && (
        <ModalEditarMovimentacao
          movimentacao={movimentacaoSelecionada}
          onClose={() => setModalAberto(false)}
          onSave={handleSalvarEdicao}
        />
      )}
    </div>
  );
}
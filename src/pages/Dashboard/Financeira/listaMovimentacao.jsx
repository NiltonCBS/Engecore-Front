import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";
import ModalEditarMovimentacao from "./modalMovimentacao"; 
import { toast } from "react-toastify";
import financeiroService from "../../../services/financeiroService";
import { api } from "../../../services/api";

const formatarMoeda = (valor) => {
    if (typeof valor !== 'number') valor = Number(valor) || 0;
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function ListarMovimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 1. ALTERAÇÃO: Inicia com "TODOS" para listar tudo ao entrar
  const [escopo, setEscopo] = useState("TODOS"); // TODOS, EMPRESA, OBRA, CLIENTE
  const [idSelecionado, setIdSelecionado] = useState(""); 
  
  const [obrasLista, setObrasLista] = useState([]);
  const [clientesLista, setClientesLista] = useState([]);

  const [saldoAtual, setSaldoAtual] = useState(0);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);

  const [modalAberto, setModalAberto] = useState(false);
  const [movimentacaoSelecionada, setMovimentacaoSelecionada] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  useEffect(() => {
      async function loadResources() {
          try {
              const [obrasRes, clientesRes] = await Promise.all([
                  api.get("/obras/listar"),
                  api.get("/cliente/listar")
              ]);
              if (obrasRes.data.success) setObrasLista(obrasRes.data.data);
              if (clientesRes.data.success) setClientesLista(clientesRes.data.data);
          } catch (error) {
              console.error("Erro ao carregar filtros:", error);
          }
      }
      loadResources();
  }, []);

  useEffect(() => {
      buscarDadosFinanceiros();
  }, [escopo, idSelecionado]);

  const buscarDadosFinanceiros = async () => {
      setLoading(true);
      setMovimentacoes([]);
      setSaldoAtual(0);
      
      try {
          let dados = [];
          let saldo = 0;

          // 2. ALTERAÇÃO: Lógica para buscar TODOS os registros
          if (escopo === "TODOS") {
              // Chama o endpoint de listagem geral (ajuste a rota se necessário, ex: /movFinanceiro)
              const response = await api.get("/movFinanceira/listar"); 
              if (response.data.success) {
                  dados = response.data.data || [];
                  
                  // Calcula o saldo geral somando/subtraindo localmente
                  saldo = dados.reduce((acc, curr) => {
                      const val = Number(curr.valor) || 0;
                      return curr.tipo === 'RECEITA' ? acc + val : acc - val;
                  }, 0);
              }
          }
          else if (escopo === "EMPRESA") {
              dados = await financeiroService.listarMovimentacoesEmpresa();
              saldo = await financeiroService.getSaldoEmpresa();
          } 
          else if (escopo === "OBRA") {
              if (!idSelecionado) { setLoading(false); return; }
              dados = await financeiroService.listarMovimentacoesObra(idSelecionado);
              saldo = await financeiroService.getSaldoObra(idSelecionado);
          }
          else if (escopo === "CLIENTE") {
             if (!idSelecionado) { setLoading(false); return; }
             dados = await financeiroService.listarMovimentacoesCliente(idSelecionado);
             saldo = await financeiroService.getSaldoCliente(idSelecionado);
          }

          setMovimentacoes(dados);
          setSaldoAtual(saldo);

          const receitas = dados.filter(m => m.tipo === 'RECEITA').reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
          const despesas = dados.filter(m => m.tipo === 'DESPESA').reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
          
          setTotalReceitas(receitas);
          setTotalDespesas(despesas);

      } catch (error) {
          console.error("Erro ao buscar dados financeiros:", error);
          toast.error("Erro ao carregar dados financeiros.");
      } finally {
          setLoading(false);
      }
  };

  const handleDeletar = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar esta movimentação?")) {
      try {
          await financeiroService.deletar(id);
          toast.success("Movimentação deletada!");
          buscarDadosFinanceiros();
      } catch (error) {
          toast.error("Erro ao deletar.");
      }
    }
  };

  const handleEditar = (movimentacao) => {
    setMovimentacaoSelecionada(movimentacao);
    setModalAberto(true);
  };

  const handleSalvarEdicao = async (movimentacaoEditada) => {
      try {
          const dto = {
               valor: Number(movimentacaoEditada.valor),
               tipo: movimentacaoEditada.tipo,
               categoriaFinanceira: movimentacaoEditada.categoriaFinanceira,
               dataMovimento: movimentacaoEditada.data,
               descricao: movimentacaoEditada.desc,
               funcionarioResponsavelId: movimentacaoEditada.funcionarioResponsavelId || null,
               obraId: movimentacaoEditada.obraRelacionada ? Number(movimentacaoEditada.obraRelacionada) : null, 
          };

          const id = movimentacaoEditada.idMovFin || movimentacaoEditada.id;

          await financeiroService.atualizar(id, dto);
          setModalAberto(false);
          toast.success("Movimentação atualizada!");
          buscarDadosFinanceiros();
      } catch (error) {
          toast.error("Erro ao atualizar.");
          console.error(error);
      }
  };

  const dadosFiltrados = movimentacoes.filter(m => {
      const termo = searchTerm.toLowerCase();
      const matchSearch = 
        (m.descricao && m.descricao.toLowerCase().includes(termo)) ||
        (m.categoriaFinanceira && m.categoriaFinanceira.toLowerCase().includes(termo));
      
      const matchTipo = !filtroTipo || m.tipo === filtroTipo;
      return matchSearch && matchTipo;
  });

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-md p-8">
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-cordes-blue">Movimentações Financeiras</h1>
                <p className="text-gray-600 mt-2">Gestão de receitas, despesas e saldos</p>
              </div>
              
              {/* 3. ALTERAÇÃO: Botão "Geral" adicionado */}
              <div className="flex gap-4 bg-gray-100 p-2 rounded-lg">
                  <button 
                    onClick={() => { setEscopo("TODOS"); setIdSelecionado(""); }}
                    className={`px-4 py-2 rounded-md font-medium transition ${escopo === "TODOS" ? "bg-white shadow text-cordes-blue" : "text-gray-600 hover:bg-gray-200"}`}
                  >
                    Geral
                  </button>
                  <button 
                    onClick={() => { setEscopo("EMPRESA"); setIdSelecionado(""); }}
                    className={`px-4 py-2 rounded-md font-medium transition ${escopo === "EMPRESA" ? "bg-white shadow text-cordes-blue" : "text-gray-600 hover:bg-gray-200"}`}
                  >
                    Empresa
                  </button>
                  <button 
                    onClick={() => { setEscopo("OBRA"); setIdSelecionado(""); }}
                    className={`px-4 py-2 rounded-md font-medium transition ${escopo === "OBRA" ? "bg-white shadow text-cordes-blue" : "text-gray-600 hover:bg-gray-200"}`}
                  >
                    Por Obra
                  </button>
                  <button 
                    onClick={() => { setEscopo("CLIENTE"); setIdSelecionado(""); }}
                    className={`px-4 py-2 rounded-md font-medium transition ${escopo === "CLIENTE" ? "bg-white shadow text-cordes-blue" : "text-gray-600 hover:bg-gray-200"}`}
                  >
                    Por Cliente
                  </button>
              </div>
            </div>

            {(escopo === "OBRA" || escopo === "CLIENTE") && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Selecione {escopo === "OBRA" ? "a Obra" : "o Cliente"}:
                    </label>
                    <select 
                        value={idSelecionado} 
                        onChange={(e) => setIdSelecionado(e.target.value)}
                        className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">-- Selecione --</option>
                        {escopo === "OBRA" 
                            ? obrasLista.map(o => <option key={o.idObra} value={o.idObra}>{o.nomeObra}</option>)
                            : clientesLista.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)
                        }
                    </select>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Receitas (Filtro)</p>
                <p className="text-2xl font-bold text-green-700">{formatarMoeda(totalReceitas)}</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 font-medium">Despesas (Filtro)</p>
                <p className="text-2xl font-bold text-red-700">{formatarMoeda(totalDespesas)}</p>
              </div>

              <div className={`${saldoAtual >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4`}>
                <p className={`text-sm font-medium ${saldoAtual >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    Saldo {escopo === 'TODOS' ? 'Geral' : (escopo === 'EMPRESA' ? 'da Empresa' : (escopo === 'OBRA' ? 'da Obra' : 'do Cliente'))}
                </p>
                <p className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  {formatarMoeda(saldoAtual)}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Buscar na lista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border p-2 rounded-md flex-1"
                />
                <select 
                    value={filtroTipo} 
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="border p-2 rounded-md"
                >
                    <option value="">Todos os Tipos</option>
                    <option value="RECEITA">Receitas</option>
                    <option value="DESPESA">Despesas</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center py-10"><i className="fas fa-spinner fa-spin text-2xl"></i></div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoria</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descrição</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Valor</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                    {dadosFiltrados.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-4 text-gray-500">Nenhum registro encontrado.</td></tr>
                    ) : (
                        dadosFiltrados.map((mov) => (
                        <tr key={mov.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                            <td className="px-4 py-3 text-sm text-gray-700">
                            {new Date(mov.dataMovimento).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${mov.tipo === 'RECEITA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {mov.tipo}
                            </span>
                            </td>
                            {/* Exibindo Cliente se houver */}
                            <td className="px-4 py-3 text-sm text-gray-700">
                                {mov.cliente ? mov.cliente.nome : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{mov.categoriaFinanceira}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{mov.descricao}</td>
                            <td className="px-4 py-3 text-sm font-bold text-gray-800">
                            {formatarMoeda(mov.valor)}
                            </td>
                            <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-2">
                                <button
                                onClick={() => handleEditar({
                                    idMovFin: mov.id,
                                    valor: mov.valor,
                                    tipo: mov.tipo === 'RECEITA' ? 'Receita' : 'Despesa',
                                    categoriaFinanceira: mov.categoriaFinanceira,
                                    data: mov.dataMovimento,
                                    desc: mov.descricao,
                                    funcionarioResponsavelId: mov.funcionarioResponsavel,
                                    obraRelacionada: mov.obraId
                                })}
                                className="text-blue-600 hover:text-blue-800"
                                >
                                <i className="fas fa-edit"></i>
                                </button>
                                <button
                                onClick={() => handleDeletar(mov.id)}
                                className="text-red-600 hover:text-red-800"
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
            )}
          </div>
        </div>
      </div>

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
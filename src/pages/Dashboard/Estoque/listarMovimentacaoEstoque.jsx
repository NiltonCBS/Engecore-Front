import { useState, useEffect } from "react";
import { toast } from 'react-toastify';

// Caminhos ajustados para a estrutura correta de pastas
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";
import ModalEditarMovEstoque from "../../../components/ModalEditarMovEstoque"; // Modal para edição

// Supondo que você tenha um serviço de API
// import api from "../../../services/api";

const TIPOS_MOVIMENTACAO = ["ENTRADA", "SAIDA", "TRANSFERENCIA", "AJUSTE"];

export default function ListarMovimentacaoEstoque() {
    const [movimentacoes, setMovimentacoes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("");

    // Estados para o Modal
    const [modalAberto, setModalAberto] = useState(false);
    const [movimentacaoSelecionada, setMovimentacaoSelecionada] = useState(null);

    useEffect(() => {
        const fetchMovimentacoes = async () => {
            setIsLoading(true);
            try {
                // --- Substitua pela chamada real à sua API ---
                // const response = await api.get('/movEstoque/listar');
                // setMovimentacoes(response.data || []);
                
                // --- DADOS MOCKADOS (baseado no seu MovEstoqueResponse) ---
                const mockData = [
                    { id: 1, material: "Cimento Votoran CP II", estoqueOrigem: null, estoqueDestino: 1, quantidade: 100, tipoMov: "ENTRADA", dataMovimentacao: "2025-10-27", funcionarioResponsavel: 1 },
                    { id: 2, material: "Tijolo Baiano 8 Furos", estoqueOrigem: 1, estoqueDestino: 2, quantidade: 500, tipoMov: "TRANSFERENCIA", dataMovimentacao: "2025-10-28", funcionarioResponsavel: 1 },
                    { id: 3, material: "Cimento Votoran CP II", estoqueOrigem: 2, estoqueDestino: null, quantidade: 20, tipoMov: "SAIDA", dataMovimentacao: "2025-10-29", funcionarioResponsavel: 2 },
                    { id: 4, material: "Areia Média (m³)", estoqueOrigem: 1, estoqueDestino: 1, quantidade: 15, tipoMov: "AJUSTE", dataMovimentacao: "2025-10-30", funcionarioResponsavel: 1 }
                ];
                await new Promise(resolve => setTimeout(resolve, 1000));
                setMovimentacoes(mockData);
                // --------------------------------------------------

            } catch (error) {
                toast.error("Falha ao buscar movimentações de estoque.");
                console.error("Erro ao buscar dados:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMovimentacoes();
    }, []);

    const handleEditar = (movimentacao) => {
        setMovimentacaoSelecionada(movimentacao);
        setModalAberto(true);
    };

    const handleSalvarEdicao = async (movimentacaoEditada) => {
        try {
            // --- Chamada à API para ATUALIZAR ---
            // await api.put(`/movEstoque/alterar/${movimentacaoEditada.id}`, movimentacaoEditada);
            
            setMovimentacoes(movs => movs.map(m => m.id === movimentacaoEditada.id ? movimentacaoEditada : m));
            toast.success("Movimentação atualizada com sucesso!");
        } catch (error) {
            toast.error("Erro ao atualizar a movimentação.");
        } finally {
            setModalAberto(false);
        }
    };

    const handleDeletar = (id) => {
        toast.info(
            <div>
                <p>Tem certeza que deseja deletar esta movimentação?</p>
                <div className="flex gap-2 mt-2">
                    <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => confirmarDelecao(id)}>Sim</button>
                    <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => toast.dismiss()}>Não</button>
                </div>
            </div>, { autoClose: false, closeOnClick: false }
        );
    };

    const confirmarDelecao = async (id) => {
        try {
            // --- Chamada à API para DELETAR ---
            // await api.delete(`/movEstoque/deletar/${id}`);

            setMovimentacoes(movs => movs.filter(m => m.id !== id));
            toast.success("Movimentação deletada com sucesso!");
        } catch(error) {
            toast.error("Erro ao deletar a movimentação.");
        } finally {
            toast.dismiss();
        }
    };
    
    const movimentacoesFiltradas = movimentacoes.filter(m => {
        const matchSearch = m.material.toLowerCase().includes(searchTerm.toLowerCase());
        const matchTipo = !filtroTipo || m.tipoMov === filtroTipo;
        return matchSearch && matchTipo;
    });

    const totais = movimentacoesFiltradas.reduce((acc, m) => {
        if (m.tipoMov === 'ENTRADA' || m.tipoMov === 'AJUSTE') acc.entradas += m.quantidade;
        if (m.tipoMov === 'SAIDA') acc.saidas += m.quantidade;
        return acc;
    }, { entradas: 0, saidas: 0 });

    const getTipoBadgeStyle = (tipo) => {
        switch(tipo) {
            case 'ENTRADA': return 'bg-green-100 text-green-800 border-green-200';
            case 'SAIDA': return 'bg-red-100 text-red-800 border-red-200';
            case 'TRANSFERENCIA': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'AJUSTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    
    return (
        <div className="bg-gray-100 min-h-screen">
            <Sidebar />
            <div className="ml-64">
                <Header />
                <div className="p-6">
                    <div className="bg-white rounded-xl shadow-md p-8">
                        {/* Cabeçalho e Totais */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-cordes-blue">Histórico de Movimentações de Estoque</h1>
                                <p className="text-gray-600 mt-2">Visualize o fluxo de entrada e saída de insumos.</p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Registros Encontrados</div>
                                <div className="text-2xl font-bold text-cordes-blue">{movimentacoesFiltradas.length}</div>
                            </div>
                        </div>

                        {/* Cards de Resumo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Total de Entradas</p>
                                    <p className="text-2xl font-bold text-green-700">{totais.entradas} itens</p>
                                </div>
                                <i className="fas fa-arrow-down text-3xl text-green-500"></i>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-600 font-medium">Total de Saídas</p>
                                    <p className="text-2xl font-bold text-red-700">{totais.saidas} itens</p>
                                </div>
                                <i className="fas fa-arrow-up text-3xl text-red-500"></i>
                            </div>
                        </div>
                        
                        {/* Filtros */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Buscar por Insumo</label>
                                <input type="text" placeholder="Nome do insumo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cordes-blue" />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Tipo de Movimentação</label>
                                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cordes-blue">
                                    <option value="">Todos os tipos</option>
                                    {TIPOS_MOVIMENTACAO.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Tabela */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b-2 border-gray-300">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Insumo</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Qtd.</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Origem</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Destino</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan="7" className="text-center py-10"><i className="fas fa-spinner fa-spin text-2xl text-cordes-blue"></i></td></tr>
                                    ) : movimentacoesFiltradas.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-10 text-gray-500">Nenhuma movimentação encontrada.</td></tr>
                                    ) : (
                                        movimentacoesFiltradas.map((mov) => (
                                            <tr key={mov.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm">{new Date(mov.dataMovimentacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{mov.material}</td>
                                                <td className="px-4 py-3"><span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTipoBadgeStyle(mov.tipoMov)}`}>{mov.tipoMov}</span></td>
                                                <td className="px-4 py-3 text-center text-sm font-bold">{mov.quantidade}</td>
                                                <td className="px-4 py-3 text-sm">{mov.estoqueOrigem ? `Estoque #${mov.estoqueOrigem}` : 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm">{mov.estoqueDestino ? `Estoque #${mov.estoqueDestino}` : 'N/A'}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button onClick={() => handleEditar(mov)} className="text-blue-600 hover:text-blue-800" title="Editar"><i className="fas fa-edit"></i></button>
                                                        <button onClick={() => handleDeletar(mov.id)} className="text-red-600 hover:text-red-800" title="Deletar"><i className="fas fa-trash-alt"></i></button>
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

            {modalAberto && (
                <ModalEditarMovEstoque
                    movimentacao={movimentacaoSelecionada}
                    onClose={() => setModalAberto(false)}
                    onSave={handleSalvarEdicao}
                />
            )}
        </div>
    );
}


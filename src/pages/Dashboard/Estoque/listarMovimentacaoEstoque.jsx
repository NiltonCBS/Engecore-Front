import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../../../services/api';
import Sidebar from '../../../components/SideBar';
import Header from '../../../components/Header';
import ModalEditarMovEstoque from '../../../components/ModalEditarMovEstoque';
import { NavLink } from 'react-router-dom';

export default function ListarMovimentacaoEstoque() {
    const [movimentacoes, setMovimentacoes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("");
    const [filtroDataInicio, setFiltroDataInicio] = useState("");
    const [filtroDataFim, setFiltroDataFim] = useState("");

    // Estados para o Modal
    const [modalAberto, setModalAberto] = useState(false);
    const [movimentacaoSelecionada, setMovimentacaoSelecionada] = useState(null);

    const TIPOS_MOVIMENTACAO = ["ENTRADA", "SAIDA", "TRANSFERENCIA", "AJUSTE"];

    // Função de busca das movimentações
    const fetchMovimentacoes = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/movEstoque/listar', { withCredentials: true });

            let dados = response.data;
            
            if (response.data.success && response.data.data) {
                dados = response.data.data;
            }

            if (!Array.isArray(dados)) {
                toast.error("Formato de dados inválido recebido da API");
                return;
            }

            const movMapeados = dados.map(mov => ({
                id: mov.id,
                insumoId: mov.insumoId, // <--- ADICIONADO: Mapeia o ID do insumo vindo do backend
                material: mov.material,
                estoqueOrigem: mov.estoqueOrigem,
                estoqueDestino: mov.estoqueDestino,
                nomeOrigem: mov.nomeOrigem, 
                nomeDestino: mov.nomeDestino, 
                quantidade: mov.quantidade,
                tipoMov: mov.tipoMov,
                dataMovimentacao: mov.dataMovimentacao,
                funcionarioResponsavel: mov.funcionarioResponsavel,
                valorUnitario: mov.valorUnitario,
                observacao: mov.observacao
            }));
            
            setMovimentacoes(movMapeados);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            toast.error(error.response?.data?.message || "Falha ao buscar movimentações de estoque.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMovimentacoes();
    }, []);

    const handleEditar = (movimentacao) => {
        setMovimentacaoSelecionada(movimentacao);
        setModalAberto(true);
    };

    const handleSalvarEdicao = async (movimentacaoEditada) => {
        try {
            const payload = {
                tipoMov: movimentacaoEditada.tipoMov,
                insumoId: movimentacaoEditada.insumoId, // Agora este campo terá valor
                estoqueOrigemId: movimentacaoEditada.estoqueOrigem || movimentacaoEditada.estoqueOrigemId || null, // Garante compatibilidade de nomes
                estoqueDestinoId: movimentacaoEditada.estoqueDestino || movimentacaoEditada.estoqueDestinoId,
                quantidade: movimentacaoEditada.quantidade,
                valorUnitario: movimentacaoEditada.valorUnitario,
                observacao: movimentacaoEditada.observacao,
                dataMovimentacao: movimentacaoEditada.dataMovimentacao,
                funcionarioId: movimentacaoEditada.funcionarioResponsavel
            };
            
            const response = await api.put(
                `/movEstoque/alterar/${movimentacaoEditada.id}`, 
                payload,
                { withCredentials: true }
            );
            
            if (response.data) {
                await fetchMovimentacoes(); 
                toast.success("Movimentação atualizada com sucesso!");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Erro ao atualizar a movimentação.";
            toast.error(errorMessage);
            console.error("Erro ao atualizar movimentação:", error);
        } finally {
            setModalAberto(false);
        }
    };

    const handleDeletar = (id) => {
        toast.info(
            <div>
                <p>Tem certeza que deseja deletar esta movimentação?</p>
                <p className="text-sm text-gray-600 mt-1">Esta ação reverterá os efeitos no estoque.</p>
                <div className="flex gap-2 mt-3">
                    <button 
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors" 
                        onClick={() => confirmarDelecao(id)}
                    >
                        Confirmar
                    </button>
                    <button 
                        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-colors" 
                        onClick={() => toast.dismiss()}
                    >
                        Cancelar
                    </button>
                </div>
            </div>, 
            { autoClose: false, closeOnClick: false }
        );
    };

    const confirmarDelecao = async (id) => {
        try {
            await api.delete(`/movEstoque/deletar/${id}`, { withCredentials: true });
            setMovimentacoes(movs => movs.filter(m => m.id !== id));
            toast.success("Movimentação deletada com sucesso!");
        } catch (error) {
            console.error("Erro ao deletar movimentação:", error);
            const errorMessage = error.response?.data?.message || "Erro ao deletar a movimentação.";
            toast.error(errorMessage);
        } finally {
            toast.dismiss();
        }
    };

    const movimentacoesFiltradas = movimentacoes.filter(m => {
        const matchSearch = m.material && m.material.toLowerCase().includes(searchTerm.toLowerCase());
        const matchTipo = !filtroTipo || m.tipoMov === filtroTipo;
        
        let matchData = true;
        if (filtroDataInicio || filtroDataFim) {
            const dataMovimentacao = new Date(m.dataMovimentacao);
            if (filtroDataInicio) {
                matchData = matchData && dataMovimentacao >= new Date(filtroDataInicio);
            }
            if (filtroDataFim) {
                const dataFim = new Date(filtroDataFim);
                dataFim.setHours(23, 59, 59, 999);
                matchData = matchData && dataMovimentacao <= dataFim;
            }
        }
        
        return matchSearch && matchTipo && matchData;
    });

    const getTipoBadgeStyle = (tipo) => {
        switch (tipo) {
            case 'ENTRADA': return 'bg-green-100 text-green-800 border-green-200';
            case 'SAIDA': return 'bg-red-100 text-red-800 border-red-200';
            case 'TRANSFERENCIA': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'AJUSTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const limparFiltros = () => {
        setSearchTerm("");
        setFiltroTipo("");
        setFiltroDataInicio("");
        setFiltroDataFim("");
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Sidebar />
            <div className="ml-64">
                <Header />
                <div className="p-6">
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-cordes-blue">
                                    Histórico de Movimentações de Estoque
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Visualize e gerencie o fluxo de entrada e saída de insumos.
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <NavLink
                                    to="/movimentacao/adicionar"
                                    className="bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-2 px-4 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md"
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    Nova Movimentação
                                </NavLink>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">Registros Encontrados</div>
                                    <div className="text-2xl font-bold text-cordes-blue">
                                        {movimentacoesFiltradas.length}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        <i className="fas fa-search mr-2"></i>Buscar por Insumo
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Nome do insumo..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cordes-blue" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        <i className="fas fa-filter mr-2"></i>Tipo de Movimentação
                                    </label>
                                    <select 
                                        value={filtroTipo} 
                                        onChange={(e) => setFiltroTipo(e.target.value)} 
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                                    >
                                        <option value="">Todos os tipos</option>
                                        {TIPOS_MOVIMENTACAO.map(tipo => (
                                            <option key={tipo} value={tipo}>{tipo}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        <i className="fas fa-calendar mr-2"></i>Data Início
                                    </label>
                                    <input 
                                        type="date" 
                                        value={filtroDataInicio} 
                                        onChange={(e) => setFiltroDataInicio(e.target.value)} 
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cordes-blue" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        <i className="fas fa-calendar mr-2"></i>Data Fim
                                    </label>
                                    <input 
                                        type="date" 
                                        value={filtroDataFim} 
                                        onChange={(e) => setFiltroDataFim(e.target.value)} 
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cordes-blue" 
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button 
                                    onClick={limparFiltros} 
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <i className="fas fa-times"></i>
                                    Limpar Filtros
                                </button>
                            </div>
                        </div>

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
                                        <tr>
                                            <td colSpan="7" className="text-center py-10">
                                                <i className="fas fa-spinner fa-spin text-2xl text-cordes-blue"></i>
                                                <p className="text-gray-500 mt-2">Carregando movimentações...</p>
                                            </td>
                                        </tr>
                                    ) : movimentacoesFiltradas.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-10">
                                                <i className="fas fa-inbox text-4xl text-gray-400 mb-2"></i>
                                                <p className="text-gray-500">Nenhuma movimentação encontrada.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        movimentacoesFiltradas.map((mov) => (
                                            <tr key={mov.id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-sm">
                                                    {new Date(mov.dataMovimentacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {mov.material}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTipoBadgeStyle(mov.tipoMov)}`}>
                                                        {mov.tipoMov}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center text-sm font-bold">
                                                    {Number(mov.quantidade).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {mov.nomeOrigem || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {mov.nomeDestino || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button 
                                                            onClick={() => handleEditar(mov)} 
                                                            className="text-blue-600 hover:text-blue-800 transition-colors" 
                                                            title="Editar"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeletar(mov.id)} 
                                                            className="text-red-600 hover:text-red-800 transition-colors" 
                                                            title="Deletar"
                                                        >
                                                            <i className="fas fa-trash-alt"></i>
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
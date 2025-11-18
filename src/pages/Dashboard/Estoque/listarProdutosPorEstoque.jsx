/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";
import { api } from "../../../services/api";
import { toast } from 'react-toastify';
// Importa os DOIS modais
import ModalDetalhesProdutoEstoque from "../../../components/ModalDetalhesProdutoEstoque.jsx";
import ModalEditarProdutoEstoque from "../../../components/ModalEditarProdutoEstoque.jsx"; // <-- NOVO

// Helper para formatar moeda
const formatarMoeda = (valor) => {
  if (typeof valor !== 'number') valor = 0;
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Helper de Status (corrigido da sua última sugestão)
const getStatusEstoque = (produto) => {
    const atual = Number(produto.quantidadeAtual);
    const min = Number(produto.quantidadeMinima);

    if (atual === 0) {
        return { text: 'Finalizado', color: 'bg-red-900 text-white' };
    }
    if (min === 0 || !min) { 
        return { text: 'OK', color: 'bg-green-100 text-green-800' };
    }
    if (atual <= min) {
        return { text: 'Crítico', color: 'bg-red-100 text-red-800' };
    }
    if (atual <= min * 1.25) { 
        return { text: 'Baixo', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: 'OK', color: 'bg-green-100 text-green-800' };
};


export default function ListarProdutosPorEstoque() {
    const [estoques, setEstoques] = useState([]);
    const [selectedEstoqueId, setSelectedEstoqueId] = useState("");
    const [produtosDoEstoque, setProdutosDoEstoque] = useState([]);
    
    const [loadingEstoques, setLoadingEstoques] = useState(true);
    const [loadingProdutos, setLoadingProdutos] = useState(false);
    const [erro, setErro] = useState("");

    // --- ESTADO DOS MODAIS ATUALIZADO ---
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);

    // 1. Carrega a lista de estoques
    useEffect(() => {
        async function carregarEstoques() {
            setLoadingEstoques(true);
            setErro("");
            try {
                const response = await api.get("/estoque/listar");
                const dados = response.data?.data || response.data || [];
                if (Array.isArray(dados)) {
                    setEstoques(dados);
                }
            } catch (error) {
                toast.error("Erro ao carregar lista de estoques.");
                setErro("Erro ao carregar dados.");
            } finally {
                setLoadingEstoques(false);
            }
        }
        carregarEstoques();
    }, []);

    // 2. Extrai a busca de produtos para ser reutilizável
    const buscarProdutos = async () => {
        if (!selectedEstoqueId) {
            setProdutosDoEstoque([]);
            return;
        }
        setLoadingProdutos(true);
        setErro("");
        try {
            const response = await api.get(`/material-estoque/listar/por-estoque/${selectedEstoqueId}`);
            const dados = response.data?.data || response.data || [];
            
            if (Array.isArray(dados)) {
                setProdutosDoEstoque(dados); 
            } else {
                 throw new Error("Formato de dados de produtos inesperado.");
            }
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            setErro("Erro ao buscar produtos do estoque.");
            setProdutosDoEstoque([]);
        } finally {
            setLoadingProdutos(false);
        }
    };

    // 3. useEffect agora só chama a função
    useEffect(() => {
        buscarProdutos();
    }, [selectedEstoqueId]); 

    // --- NOVOS HANDLERS ---

    const handleVisualizar = (produto) => {
        setProdutoSelecionado(produto);
        setIsViewModalOpen(true);
    };

    const handleEditar = (produto) => {
        setProdutoSelecionado(produto);
        setIsEditModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsViewModalOpen(false);
        setIsEditModalOpen(false);
        setProdutoSelecionado(null);
    };

    // Recarrega a lista após a edição
    // eslint-disable-next-line no-unused-vars
    const handleProdutoAtualizado = (produtoAtualizado) => {
        handleCloseModals();
        toast.success("Produto atualizado! Recarregando lista...");
        buscarProdutos(); // Re-busca os dados
    };

    // Deletar
    const handleDeletar = (idProdutoEstoque) => {
        toast.warn(
            ({ closeToast }) => (
                <div>
                    <p className="font-semibold">Confirmar Exclusão</p>
                    <p className="text-sm">Tem certeza que deseja excluir este item do estoque?</p>
                    <p className="text-xs text-red-500 mt-1">Esta ação não pode ser desfeita.</p>
                    <div className="flex gap-2 mt-3">
                        <button
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                            onClick={() => {
                                _confirmarExclusao(idProdutoEstoque);
                                closeToast();
                            }}
                        >
                            Sim, Excluir
                        </button>
                        <button
                            className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm"
                            onClick={closeToast}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ), { autoClose: false }
        );
    };

    const _confirmarExclusao = async (idProdutoEstoque) => {
        try {
            // Você precisará de um endpoint no backend para isso
            // (Ex: @DeleteMapping("/material-estoque/deletar/{id}")
            await api.delete(`/material-estoque/deletar/${idProdutoEstoque}`);
            
            // Remove da lista local
            setProdutosDoEstoque(prev => prev.filter(p => p.materialEstoqueId !== idProdutoEstoque));
            toast.success("Produto removido do estoque!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao excluir produto.");
        }
    };
    
    // --- FIM DOS NOVOS HANDLERS ---


    // Renderização de loading
    if (loadingEstoques) {
         return (
            <div className="bg-gray-100 min-h-screen">
                <Sidebar />
                <div className="ml-64">
                    <Header />
                    <div className="p-6 text-center">
                        <i className="fas fa-spinner fa-spin text-4xl text-cordes-blue"></i>
                        <p className="mt-2 text-gray-600">Carregando estoques...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    const estoqueSelecionado = estoques.find(e => e.id == selectedEstoqueId);

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
                                <h1 className="text-3xl font-bold text-cordes-blue">Relatório de Produtos por Estoque</h1>
                                <p className="text-gray-600 mt-2">Veja os insumos disponíveis em cada local</p>
                            </div>
                        </div>

                        {/* Filtro de Estoque */}
                        <div className="bg-gray-50 p-6 rounded-lg mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecione um Estoque</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Estoque *</label>
                                    <select
                                        name="estoqueId"
                                        value={selectedEstoqueId}
                                        onChange={(e) => setSelectedEstoqueId(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                                    >
                                        <option value="">Selecione para carregar os produtos</option>
                                        {estoques.map(e => (
                                        <option key={e.id} value={e.id}>{e.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                {estoqueSelecionado && (
                                    <div className="p-3 bg-blue-100 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-700">Localização:</p>
                                        <p className="font-semibold text-blue-800">{estoqueSelecionado.localizacao || "Não informada"}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tabela de Produtos ATUALIZADA */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b-2 border-gray-300">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Insumo</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Marca</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Qtd. Atual</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Un.</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Valor Unit. (R$)</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                                </tr>
                                </thead>
                                <tbody>
                                {loadingProdutos ? (
                                    <tr><td colSpan="7" className="text-center py-10"><i className="fas fa-spinner fa-spin text-2xl text-cordes-blue"></i></td></tr>
                                ) : !selectedEstoqueId ? (
                                    <tr><td colSpan="7" className="text-center py-10 text-gray-500">Selecione um estoque acima.</td></tr>
                                ) : produtosDoEstoque.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-10 text-gray-500">Nenhum produto encontrado neste estoque.</td></tr>
                                ) : (
                                    produtosDoEstoque.map((produto) => {
                                        const status = getStatusEstoque(produto); 
                                        
                                        return (
                                            <tr key={produto.materialEstoqueId} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{produto.insumoNome}</td>
                                                <td className="px-4 py-3 text-sm">{produto.marcaNome}</td>
                                                <td className="px-4 py-3 text-sm font-bold text-center">{produto.quantidadeAtual}</td>
                                                <td className="px-4 py-3 text-sm">{produto.unidade}</td>
                                                
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                                                        {status.text}
                                                    </span>
                                                </td>
                                                
                                                <td className="px-4 py-3 text-sm font-semibold text-green-700">{formatarMoeda(produto.valorUni)}</td>
                                                
                                                {/* --- CÉLULA DE AÇÕES ATUALIZADA --- */}
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => handleVisualizar(produto)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="Visualizar Detalhes"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditar(produto)}
                                                            className="text-yellow-600 hover:text-yellow-800"
                                                            title="Editar Valor/Mín/Máx"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletar(produto.materialEstoqueId)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Deletar Item do Estoque"
                                                        >
                                                            <i className="fas fa-trash-alt"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Renderiza os DOIS modais */}
            <ModalDetalhesProdutoEstoque
                isOpen={isViewModalOpen}
                onClose={handleCloseModals}
                produto={produtoSelecionado}
            />
            
            <ModalEditarProdutoEstoque
                isOpen={isEditModalOpen}
                onClose={handleCloseModals}
                produto={produtoSelecionado}
                onProdutoAtualizado={handleProdutoAtualizado}
            />
        </div>
    );
}
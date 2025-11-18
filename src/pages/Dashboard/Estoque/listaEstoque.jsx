/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";
import { NavLink } from "react-router-dom";
import { api } from "../../../services/api";
import { toast } from 'react-toastify';
import ModalEditarEstoque from "../../../components/ModalEditarEstoque.jsx"; 

export default function ListarEstoque() {
    const [estoques, setEstoques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");

    const [modalAberto, setModalAberto] = useState(false);
    const [estoqueSelecionado, setEstoqueSelecionado] = useState(null);

    // Função de busca
    const fetchEstoques = async () => {
        setLoading(true);
        try {
            const response = await api.get('/estoque/listar', { withCredentials: true });
            const dados = response.data?.data || response.data || [];
            
            if (Array.isArray(dados)) {
                setEstoques(dados);
            } else {
                throw new Error("Formato de dados inesperado.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Falha ao buscar estoques.");
            setErro("Falha ao buscar estoques.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEstoques();
    }, []);

    const handleEditar = (estoque) => {
        setEstoqueSelecionado(estoque);
        setModalAberto(true);
    };

    const handleCloseModal = () => {
        setModalAberto(false);
        setEstoqueSelecionado(null);
    };

    // --- CORREÇÃO AQUI ---
    // Esta função agora é 'async' e chama 'fetchEstoques'
    const handleEstoqueAtualizado = async (estoqueAtualizado) => {
        // 1. Fecha o modal
        handleCloseModal();
        
        // 2. Avisa o usuário
        toast.success("Estoque atualizado com sucesso! Recarregando lista...");
        
        // 3. Busca a lista FRESCA do banco de dados
        // Isso é mais garantido do que atualizar o estado manualmente.
        await fetchEstoques();
    };
    // --- FIM DA CORREÇÃO ---

    const handleDeletar = (id) => {
        toast.warn(
            ({ closeToast }) => (
                <div>
                    <p className="font-semibold">Confirmar Exclusão</p>
                    <p className="text-sm">Tem certeza que deseja excluir este estoque?</p>
                    <p className="text-xs text-red-500 mt-1">Apenas estoques vazios podem ser excluídos.</p>
                    <div className="flex gap-2 mt-3">
                        <button
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                            onClick={() => {
                                _confirmarExclusao(id);
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

    const _confirmarExclusao = async (id) => {
        try {
            await api.delete(`/estoque/deletar/${id}`);
            setEstoques(prev => prev.filter(e => e.id !== id));
            toast.success("Estoque excluído com sucesso!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao excluir estoque. Verifique se ele está vazio.");
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
                        <p className="mt-2 text-gray-600">Carregando estoques...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    // ... (Renderização de erro similar, se desejar) ...

    return (
        <div className="bg-gray-100 min-h-screen">
            <Sidebar />
            <div className="ml-64">
                <Header />
                <div className="p-6">
                    <div className="bg-white rounded-xl shadow-md p-8">
                        {/* Cabeçalho */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-cordes-blue">
                                    Lista de Estoques
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Gerencie os locais de armazenamento da empresa.
                                </p>
                            </div>
                            <NavLink
                                to="/estoque/cadastrar"
                                className="bg-blue-700 text-white font-semibold border border-gray-300 py-2 px-4 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md"
                            >
                                <i className="fas fa-plus mr-2"></i>
                                Novo Estoque
                            </NavLink>
                        </div>

                        {/* Tabela */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b-2 border-gray-300">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome da Obra</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estoques.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-10 text-gray-500">
                                                Nenhum estoque cadastrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        estoques.map((estoque) => (
                                            <tr key={estoque.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">#{estoque.id}</td>
                                                <td className="px-4 py-3 text-sm">{estoque.nome}</td>
                                                <td className="px-4 py-3 text-sm">{estoque.nomeObra || '-'}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => handleEditar(estoque)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="Editar"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletar(estoque.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Excluir"
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

            {/* Modal de Edição */}
            <ModalEditarEstoque
                isOpen={modalAberto}
                onClose={handleCloseModal}
                estoque={estoqueSelecionado}
                onEstoqueAtualizado={handleEstoqueAtualizado}
            />
        </div>
    );
}
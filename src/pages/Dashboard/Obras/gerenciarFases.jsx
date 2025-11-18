import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";
import { api } from "../../../services/api.js";
import { toast } from 'react-toastify';
import obrasService from "../../../services/obrasService.js";
import ModalGerenciarFase from "../../../components/ModalGerenciarFase.jsx"; // (Seu modal)

// Formatação de data
const formatarData = (data) => {
    if (!data) return "-";
    const dataObj = new Date(data);
    dataObj.setMinutes(dataObj.getMinutes() + dataObj.getTimezoneOffset());
    return dataObj.toLocaleDateString('pt-BR');
};

// Funções 'formatarStatus' e 'getStatusColor' REMOVIDAS

export default function GerenciarFases() {
    const [obras, setObras] = useState([]);
    const [fases, setFases] = useState([]);
    const [selectedObraId, setSelectedObraId] = useState("");
    
    const [loadingObras, setLoadingObras] = useState(true);
    const [loadingFases, setLoadingFases] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [faseSelecionada, setFaseSelecionada] = useState(null); // null para "Criar", objeto para "Editar"

    // 1. Carrega a lista de obras para o dropdown
    useEffect(() => {
        async function carregarObras() {
            setLoadingObras(true);
            try {
                const dados = await obrasService.listarObras(); 
                setObras(dados);
            } catch (error) {
                toast.error("Erro ao carregar lista de obras.");
            } finally {
                setLoadingObras(false);
            }
        }
        carregarObras();
    }, []);

    // 2. Busca as fases QUANDO a obra selecionada muda
    const buscarFases = async () => {
        if (!selectedObraId) {
            setFases([]);
            return;
        }
        setLoadingFases(true);
        try {
            const dados = await obrasService.listarFasesPorObra(selectedObraId);
            setFases(dados);
        } catch (error) {
            toast.error("Erro ao buscar fases da obra.");
            setFases([]);
        } finally {
            setLoadingFases(false);
        }
    };

    useEffect(() => {
        if (selectedObraId) {
          buscarFases();
        } else {
          setFases([]); // Limpa as fases se nenhuma obra estiver selecionada
        }
    }, [selectedObraId]); 

    // --- Handlers para o Modal ---
    const handleAbrirModalNovo = () => {
        setFaseSelecionada(null); // null = Modo "Criar"
        setIsModalOpen(true);
    };

    const handleEditar = (fase) => {
        setFaseSelecionada(fase); // objeto = Modo "Editar"
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFaseSelecionada(null);
    };

    // Função chamada pelo modal após sucesso (criar ou editar)
    const handleFaseAtualizada = () => {
        handleCloseModal();
        toast.success("Operação concluída! Recarregando fases...");
        buscarFases(); // Re-busca a lista de fases
    };

    // --- Handler para Deletar ---
    const handleDeletar = (faseId) => {
        toast.warn(
            ({ closeToast }) => (
                <div>
                    <p className="font-semibold">Confirmar Exclusão</p>
                    <p className="text-sm">Tem certeza que deseja excluir esta fase?</p>
                    <div className="flex gap-2 mt-3">
                        <button
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                            onClick={() => {
                                _confirmarExclusao(faseId);
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

    const _confirmarExclusao = async (faseId) => {
        try {
            await obrasService.deletarFase(faseId);
            toast.success("Fase excluída com sucesso!");
            buscarFases(); // Re-busca a lista
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao excluir fase.");
        }
    };

    // ... (Renderização de loadingObras) ...
    if (loadingObras) {
         return (
            <div className="bg-gray-100 min-h-screen">
                <Sidebar />
                <div className="ml-64"><Header /><div className="p-6 text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-cordes-blue"></i>
                    <p className="mt-2 text-gray-600">Carregando obras...</p>
                </div></div>
            </div>
        );
    }
    
    const obraSelecionada = obras.find(o => o.idObra == selectedObraId);

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
                                <h1 className="text-3xl font-bold text-cordes-blue">Gerenciar Fases da Obra</h1>
                                <p className="text-gray-600 mt-2">Adicione, edite ou remova as fases de um projeto</p>
                            </div>
                        </div>

                        {/* Filtro de Obra */}
                        <div className="bg-gray-50 p-6 rounded-lg mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecione uma Obra</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Obra *</label>
                                    <select
                                        name="obraId"
                                        value={selectedObraId}
                                        onChange={(e) => setSelectedObraId(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                                    >
                                        <option value="">Selecione para carregar as fases</option>
                                        {obras.map(o => (
                                        <option key={o.idObra} value={o.idObra}>{o.nomeObra}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleAbrirModalNovo}
                                    disabled={!selectedObraId} // Desabilitado se nenhuma obra for selecionada
                                    className="bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md self-end disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    Nova Fase
                                </button>
                            </div>
                        </div>

                        {/* Tabela de Fases (COLUNA STATUS REMOVIDA) */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b-2 border-gray-300">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome da Fase</th>
                                    {/* <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th> <-- REMOVIDO */ }
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data Início</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Data Término</th> {/* <-- RENOMEADO */}
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tempo Esperado</th> {/* <-- RENOMEADO */}
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tempo Levado</th> {/* <-- RENOMEADO */}
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                                </tr>
                                </thead>
                                <tbody>
                                {loadingFases ? (
                                    <tr><td colSpan="4" className="text-center py-10"><i className="fas fa-spinner fa-spin text-2xl text-cordes-blue"></i></td></tr>
                                ) : !selectedObraId ? (
                                    <tr><td colSpan="4" className="text-center py-10 text-gray-500">Selecione uma obra acima.</td></tr>
                                ) : fases.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center py-10 text-gray-500">Nenhuma fase cadastrada para esta obra.</td></tr>
                                ) : (
                                    fases.map((fase) => (
                                    <tr key={fase.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{fase.nome}</td>
                                        
                                        {/* CÉLULA REMOVIDA
                                        <td className="px-4 py-3">
                                            <span className={`... ${getStatusColor(fase.status)}`}>
                                                {formatarStatus(fase.status)}
                                            </span>
                                        </td>
                                        */}

                                        <td className="px-4 py-3 text-sm">{formatarData(fase.dataInicio)}</td>
                                        {/* Assumindo que o DTO de listagem também foi atualizado para dataTermino */}
                                        <td className="px-4 py-3 text-sm">{formatarData(fase.dataTermino || fase.dataPrevistaFim)}</td>
                                        <td className="px-4 py-3 text-sm">{fase.tempoEsperado}</td>
                                        <td className="px-4 py-3 text-sm">{fase.tempoLevado}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleEditar(fase)}
                                                    className="text-yellow-600 hover:text-yellow-800"
                                                    title="Editar"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDeletar(fase.id)}
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

            {/* Modal de Criação/Edição */}
            <ModalGerenciarFase
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onFaseAtualizada={handleFaseAtualizada}
                fase={faseSelecionada} // (null se for "Novo", objeto se for "Editar")
                obraId={selectedObraId} // Passa o ID da obra para o modal
            />
        </div>
    );
}
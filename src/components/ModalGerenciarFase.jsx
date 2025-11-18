/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { api } from "../services/api.js";
import obrasService from "../services/obrasService.js";

// statusFase foi removido, pois não é mais usado

export default function ModalGerenciarFase({ isOpen, onClose, onFaseAtualizada, fase, obraId }) {
    
    // Estado do formulário
    const [formData, setFormData] = useState({
        nome: "",
        dataInicio: "",
        dataTermino: "", 
        tempoEsperado: "",
        tempoLevado: "", // Este campo agora será calculado
        descricao: ""
    });
    const [loading, setLoading] = useState(false);

    const isEditMode = Boolean(fase && fase.id);

    // Popula o formulário quando o modal abre
    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setFormData({
                    nome: fase.nome || "",
                    dataInicio: fase.dataInicio || "",
                    dataTermino: fase.dataTermino || fase.dataPrevistaFim || "", 
                    tempoEsperado: fase.tempoEsperado || "",
                    tempoLevado: fase.tempoLevado || "", // Carrega o valor salvo
                    descricao: fase.descricao || ""
                });
            } else {
                setFormData({
                    nome: "", dataInicio: "", dataTermino: "",
                    tempoEsperado: "", tempoLevado: "", descricao: ""
                });
            }
        }
    }, [fase, isOpen, isEditMode]);

    // --- NOVO useEffect PARA CALCULAR O tempoLevado ---
    useEffect(() => {
        // Só calcula se ambas as datas estiverem preenchidas
        if (formData.dataInicio && formData.dataTermino) {
            try {
                // Criar datas (dividindo a string para evitar erros de fuso horário)
                const [startY, startM, startD] = formData.dataInicio.split('-').map(Number);
                const [endY, endM, endD] = formData.dataTermino.split('-').map(Number);
                
                const startDate = new Date(startY, startM - 1, startD);
                const endDate = new Date(endY, endM - 1, endD);

                if (endDate < startDate) {
                    setFormData(prev => ({ ...prev, tempoLevado: "" })); // Limpa se for inválido
                    return;
                }

                // Calcula a diferença em milissegundos
                const diffInMs = endDate.getTime() - startDate.getTime();
                
                // Converte para dias
                const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
                
                // Ex: 15/Fev - 10/Jan = 36 dias (bate com seu exemplo)
                setFormData(prev => ({ ...prev, tempoLevado: diffInDays }));

            } catch (error) {
                console.error("Erro ao calcular datas:", error);
                setFormData(prev => ({ ...prev, tempoLevado: "" })); // Limpa em caso de erro
            }
        } else {
            // Se uma das datas for apagada, limpa o campo
            setFormData(prev => ({ ...prev, tempoLevado: "" }));
        }
    }, [formData.dataInicio, formData.dataTermino]); // Roda sempre que as datas mudarem
    // --- FIM DO NOVO useEffect ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.nome) {
            toast.warn("O nome da fase é obrigatório.");
            return;
        }
        if (!obraId && !isEditMode) {
            toast.error("Erro: ID da Obra não encontrado.");
            return;
        }
        if (formData.dataInicio && formData.dataTermino && formData.dataTermino < formData.dataInicio) {
             toast.warn("A Data de Término não pode ser anterior à Data de Início.");
             return;
        }

        setLoading(true);
        try {
            // O payload agora envia o 'tempoLevado' calculado do estado
            const payload = {
                nome: formData.nome,
                dataInicio: formData.dataInicio || null,
                dataTermino: formData.dataTermino || null,
                tempoEsperado: Number(formData.tempoEsperado) || 0,
                tempoLevado: Number(formData.tempoLevado) || 0, // Pega o valor do estado
                descricao: formData.descricao,
            };

            if (isEditMode) {
                await obrasService.atualizarFase(fase.id, payload);
            } else {
                const createPayload = {
                    ...payload,
                    obra: Number(obraId) 
                };
                await obrasService.cadastrarFase(createPayload);
            }
            
            onFaseAtualizada(); 

        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao salvar fase.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b bg-gray-50 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {isEditMode ? "Editar Fase" : "Adicionar Nova Fase"}
                        </h2>
                        <button onClick={onClose} disabled={loading} className="text-gray-500 hover:text-gray-700">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 font-medium mb-2">Nome da Fase *</label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    placeholder="Ex: Fundação, Alvenaria, Acabamento"
                                    className="w-full border border-gray-300 rounded-lg p-3"
                                    autoFocus
                                />
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Data de Início</label>
                                <input
                                    type="date"
                                    name="dataInicio"
                                    value={formData.dataInicio}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-3"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Data de Término</label>
                                <input
                                    type="date"
                                    name="dataTermino" 
                                    value={formData.dataTermino}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg p-3"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Tempo Esperado (dias)</label>
                                <input
                                    type="number"
                                    name="tempoEsperado"
                                    value={formData.tempoEsperado}
                                    onChange={handleChange}
                                    placeholder="Ex: 30"
                                    min="0"
                                    className="w-full border border-gray-300 rounded-lg p-3"
                                />
                            </div>
                             
                             {/* --- CAMPO tempoLevado ATUALIZADO --- */}
                             <div>
                                <label className="block text-gray-700 font-medium mb-2">Tempo Levado (dias)</label>
                                <input
                                    type="number"
                                    name="tempoLevado"
                                    value={formData.tempoLevado}
                                    onChange={handleChange}
                                    placeholder="(Cálculo automático)"
                                    min="0"
                                    className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 cursor-not-allowed"
                                    disabled // <-- Torna o campo não editável
                                />
                            </div>
                            {/* --- FIM DA ATUALIZAÇÃO --- */}
                            
                            <div className="md:col-span-2">
                                <label className="block text-gray-700 font-medium mb-2">Descrição</label>
                                <textarea
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleChange}
                                    placeholder="Descreva as atividades desta fase..."
                                    className="w-full border border-gray-300 rounded-lg p-3"
                                    rows="3"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-end border-t p-6 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
                        >
                            {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
                            {loading ? "Salvando..." : "Salvar Fase"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
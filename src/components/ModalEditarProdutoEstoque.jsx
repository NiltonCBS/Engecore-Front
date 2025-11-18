import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { api } from "../services/api.js";
import FormSection from "./FormSection"; // Assumindo que este componente está em ../../components/FormSection

// Helper para formatar moeda
const formatarMoeda = (valor) => {
    if (typeof valor !== 'number') valor = 0;
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function ModalEditarProdutoEstoque({ isOpen, onClose, produto, onProdutoAtualizado }) {

    // CORREÇÃO 1: Mude o nome do estado inicial para 'valor'
    const [formData, setFormData] = useState({
        valor: 0,
        quantidadeMinima: 0,
        quantidadeMaxima: 0,
        modelo: ""
    });
    const [loading, setLoading] = useState(false);

    // Popula o formulário quando o 'produto' (prop) é carregado
    useEffect(() => {
        if (produto) {
            setFormData({
                // CORREÇÃO 2: Leia 'produto.valorUni' mas salve em 'formData.valor'
                valor: produto.valorUni || 0,
                quantidadeMinima: produto.quantidadeMinima || 0,
                quantidadeMaxima: produto.quantidadeMaxima || 0,
                modelo: produto.modelo || ""
            });
        }
    }, [produto, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Este payload agora está correto, pois lê 'formData.valor'
            const payload = {
                valor: Number(formData.valor),
                quantidadeMinima: Number(formData.quantidadeMinima) || null,
                quantidadeMaxima: Number(formData.quantidadeMaxima) || null,
                modelo: formData.modelo
            };

            const response = await api.put(
                `/material-estoque/alterar/${produto.materialEstoqueId}`,
                payload
            );

            onProdutoAtualizado(response.data.data);

        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao atualizar produto.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !produto) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* ... (Cabeçalho) ... */}
                <div className="p-6 border-b bg-gray-50 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Editar Produto no Estoque
                        </h2>
                        <button onClick={onClose} disabled={loading} className="text-gray-500 hover:text-gray-700">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        {/* ... (Identificação Read-Only) ... */}
                        <div className="bg-gray-100 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Identificação</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Insumo</label>
                                    <div className="text-gray-900 font-semibold">{produto.insumoNome}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Marca</label>
                                    <div className="text-gray-900">{produto.marcaNome}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Qtd. Atual</label>
                                    <div className="text-gray-900 font-bold">{produto.quantidadeAtual} {produto.unidade}</div>
                                </div>
                            </div>
                        </div>

                        {/* Seção 2: Campos Editáveis */}
                        <FormSection title="Dados Editáveis">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Modelo</label>
                                    <input
                                        type="text"
                                        name="modelo"
                                        value={formData.modelo}
                                        onChange={handleChange}
                                        placeholder="Ex: Saco 50kg, 2 Litros"
                                        className="w-full border border-gray-300 rounded-lg p-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Valor Unitário (Custo) *</label>
                                    <input
                                        type="number"
                                        name="valor"
                                        // CORREÇÃO 3: O 'value' deve bater com o nome do estado
                                        value={formData.valor}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full border border-gray-300 rounded-lg p-3"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Qtd. Mínima</label>
                                    <input
                                        type="number"
                                        name="quantidadeMinima"
                                        value={formData.quantidadeMinima}
                                        onChange={handleChange}
                                        step="1"
                                        min="0"
                                        className="w-full border border-gray-300 rounded-lg p-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Qtd. Máxima</label>
                                     <input
                                        type="number"
                                        name="quantidadeMaxima"
                                        value={formData.quantidadeMaxima}
                                        onChange={handleChange}
                                        step="1"
                                        min="0"
                                        className="w-full border border-gray-300 rounded-lg p-3"
                                    />
                                </div>
                                      </div>
                        </FormSection>
                    </div>

                    {/* ... (Botões de Ação) ... */}
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
                            {loading ? "Salvando..." : "Salvar Alterações"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
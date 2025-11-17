import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

export default function ItensCotacaoForm({ 
    insumosDisponiveis, // A lista completa de todos os insumos
    itensSelecionados, // A lista de itens já no "carrinho"
    onAddItem, 
    onRemoveItem, 
    onUpdateQuantity 
}) {
    
    // Estado local para o formulário de "Adicionar Item"
    const [insumoId, setInsumoId] = useState("");
    const [quantidade, setQuantidade] = useState(""); // Começa vazio para placeholder

    // Encontra o insumo selecionado no dropdown para mostrar a unidade
    const insumoSelecionado = insumosDisponiveis.find(i => i.id == insumoId);
    const unidade = insumoSelecionado ? insumoSelecionado.unidade : "";

    const handleAdicionar = () => {
        const insumoIdNum = Number(insumoId);
        const quantidadeNum = Number(quantidade);

        if (!insumoIdNum || insumoIdNum <= 0) {
            toast.warn("Selecione um insumo.");
            return;
        }
        if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
            toast.warn("Insira uma quantidade válida.");
            return;
        }

        // Passa o novo item para a página pai
        onAddItem({
            insumoId: insumoIdNum,
            quantidade: quantidadeNum
        });

        // Limpa os campos locais
        setInsumoId("");
        setQuantidade("");
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">2. Itens da Cotação</h2>
            
            {/* Formulário para Adicionar Novo Item */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 bg-gray-50 rounded-lg">
                <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">Insumo *</label>
                    <select
                        value={insumoId}
                        onChange={(e) => setInsumoId(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3"
                    >
                        <option value="">Selecione o insumo</option>
                        {insumosDisponiveis.map(insumo => (
                            <option key={insumo.id} value={insumo.id}>{insumo.nome}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Quantidade *</label>
                    <input
                        type="number"
                        value={quantidade}
                        onChange={(e) => setQuantidade(e.target.value)}
                        placeholder="0"
                        className="w-full border border-gray-300 rounded-lg p-3"
                        min="0"
                    />
                </div>
                <div className="flex items-center gap-2 pt-7">
                    <input
                        type="text"
                        value={unidade}
                        disabled
                        placeholder="Un."
                        className="w-20 border border-gray-300 rounded-lg p-3 bg-gray-100 text-center"
                    />
                    <button
                        onClick={handleAdicionar}
                        className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition"
                    >
                        <i className="fas fa-plus"></i> Adicionar
                    </button>
                </div>
            </div>

            {/* Lista de Itens Adicionados */}
            {itensSelecionados.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Insumo</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700" style={{ width: '150px' }}>Quantidade</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Un.</th>
                                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Remover</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {itensSelecionados.map(item => (
                                <tr key={item.insumoId} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm">{item.insumoNome}</td>
                                    <td className="px-4 py-3">
                                        {/* Input para atualizar a quantidade diretamente */}
                                        <input 
                                            type="number"
                                            value={item.quantidade}
                                            onChange={(e) => onUpdateQuantity(item.insumoId, e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-2"
                                            min="0"
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-sm">{item.unidade}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => onRemoveItem(item.insumoId)} className="text-red-500 hover:text-red-700">
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

ItensCotacaoForm.propTypes = {
    insumosDisponiveis: PropTypes.array.isRequired,
    itensSelecionados: PropTypes.array.isRequired,
    onAddItem: PropTypes.func.isRequired,
    onRemoveItem: PropTypes.func.isRequired,
    onUpdateQuantity: PropTypes.func.isRequired,
};
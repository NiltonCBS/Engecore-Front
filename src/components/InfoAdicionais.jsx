import React from 'react';

export default function InfoAdicionais({ movimentacao, handleChange, funcionarios }) {
    const { funcionarioId, dataMovimentacao, observacao } = movimentacao;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-gray-700 font-medium mb-2">Funcionário Responsável *</label>
                <select name="funcionarioId" value={funcionarioId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue">
                    <option value="">Selecione...</option>
                    {funcionarios.map(func => (<option key={func.id} value={func.id}>{func.nome}</option>))}
                </select>
            </div>
            <div>
                <label className="block text-gray-700 font-medium mb-2">Data da Movimentação *</label>
                <input type="date" name="dataMovimentacao" value={dataMovimentacao} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue" />
            </div>
            <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">Observação</label>
                <textarea name="observacao" value={observacao} onChange={handleChange} placeholder="Adicione detalhes..." className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue" rows="3"></textarea>
            </div>
        </div>
    );
}
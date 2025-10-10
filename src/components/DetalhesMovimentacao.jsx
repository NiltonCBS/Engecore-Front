import React from 'react';

export default function DetalhesMovimentacao({ movimentacao, handleChange, tipos, insumos, estoques }) {
    const { tipoMov, insumoId, quantidade, estoqueOrigemId, estoqueDestinoId } = movimentacao;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
                <label className="block text-gray-700 font-medium mb-2">Tipo de Mov. *</label>
                <select name="tipoMov" value={tipoMov} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue">
                    <option value="">Selecione...</option>
                    {tipos.map(tipo => (<option key={tipo} value={tipo}>{tipo}</option>))}
                </select>
            </div>
            <div className="lg:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">Insumo *</label>
                <select name="insumoId" value={insumoId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue">
                    <option value="">Selecione o insumo</option>
                    {insumos.map(insumo => (<option key={insumo.id} value={insumo.id}>{insumo.nome}</option>))}
                </select>
            </div>
            <div className="lg:col-span-1">
                <label className="block text-gray-700 font-medium mb-2">Quantidade *</label>
                <input type="number" name="quantidade" value={quantidade} onChange={handleChange} placeholder="0" className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue" />
            </div>

            {(tipoMov === 'SAIDA' || tipoMov === 'TRANSFERENCIA') && (
                <div className="lg:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">Estoque de Origem *</label>
                    <select name="estoqueOrigemId" value={estoqueOrigemId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue">
                        <option value="">Selecione...</option>
                        {estoques.map(e => (<option key={e.id} value={e.id}>{e.nome}</option>))}
                    </select>
                </div>
            )}
            {(tipoMov === 'ENTRADA' || tipoMov === 'TRANSFERENCIA' || tipoMov === 'AJUSTE') && (
                <div className="lg:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">Estoque de Destino *</label>
                    <select name="estoqueDestinoId" value={estoqueDestinoId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue">
                        <option value="">Selecione...</option>
                        {estoques.map(e => (<option key={e.id} value={e.id}>{e.nome}</option>))}
                    </select>
                </div>
            )}
        </div>
    );
}
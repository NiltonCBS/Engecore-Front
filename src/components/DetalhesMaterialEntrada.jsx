import React from 'react';

export default function DetalhesMaterialEntrada({ materialEstoque, handleMaterialChange }) {
    const { valor, quantidadeMinima, quantidadeMaxima } = materialEstoque;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
                <label className="block text-gray-700 font-medium mb-2">Valor Unitário (R$)</label>
                <input type="number" name="valor" value={valor} onChange={handleMaterialChange} placeholder="0.00" step="0.01" className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"/>
            </div>
            <div>
                <label className="block text-gray-700 font-medium mb-2">Qtd. Mínima</label>
                <input type="number" name="quantidadeMinima" value={quantidadeMinima} onChange={handleMaterialChange} placeholder="0" className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"/>
            </div>
            <div>
                <label className="block text-gray-700 font-medium mb-2">Qtd. Máxima</label>
                <input type="number" name="quantidadeMaxima" value={quantidadeMaxima} onChange={handleMaterialChange} placeholder="0" className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"/>
            </div>
        </div>
    );
}
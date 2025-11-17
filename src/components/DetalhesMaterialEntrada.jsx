import React from 'react';

export default function DetalhesMaterialEntrada({ materialEstoque, handleMaterialChange, marcas = [] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Marca */}
            <div>
                <label className="block text-gray-700 font-medium mb-2">
                    <i className="fas fa-tag mr-2 text-cordes-blue"></i>
                    Marca *
                </label>
                <select
                    name="marcaId"
                    value={materialEstoque.marcaId}
                    onChange={handleMaterialChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                    required
                >
                    <option value="">Selecione a marca</option>
                    {Array.isArray(marcas) && marcas.map(marca => (
                        <option key={marca.id} value={marca.id}>
                            {marca.nome}
                        </option>
                    ))}
                </select>
                {(!marcas || marcas.length === 0) && (
                    <p className="text-sm text-red-500 mt-1">
                        <i className="fas fa-exclamation-circle mr-1"></i>
                        Nenhuma marca cadastrada
                    </p>
                )}
            </div>

            {/* Modelo */}
            <div>
                <label className="block text-gray-700 font-medium mb-2">
                    <i className="fas fa-cube mr-2 text-cordes-blue"></i>
                    Modelo
                </label>
                <input
                    type="text"
                    name="modelo"
                    value={materialEstoque.modelo}
                    onChange={handleMaterialChange}
                    placeholder="Ex: Modelo ABC-123"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                />
                <p className="text-sm text-gray-500 mt-1">
                    <i className="fas fa-info-circle mr-1"></i>
                    Campo opcional
                </p>
            </div>

            {/* Valor Unitário */}
            <div>
                <label className="block text-gray-700 font-medium mb-2">
                    <i className="fas fa-dollar-sign mr-2 text-cordes-blue"></i>
                    Valor Unitário (R$) *
                </label>
                <input
                    type="number"
                    name="valor"
                    value={materialEstoque.valor}
                    onChange={handleMaterialChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                    required
                />
            </div>

            {/* Quantidade Mínima */}
            <div>
                <label className="block text-gray-700 font-medium mb-2">
                    <i className="fas fa-exclamation-triangle mr-2 text-yellow-600"></i>
                    Quantidade Mínima
                </label>
                <input
                    type="number"
                    name="quantidadeMinima"
                    value={materialEstoque.quantidadeMinima}
                    onChange={handleMaterialChange}
                    placeholder="Ex: 10"
                    step="0.01"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                />
                <p className="text-sm text-gray-500 mt-1">
                    <i className="fas fa-info-circle mr-1"></i>
                    Alerta de estoque baixo
                </p>
            </div>

            {/* Quantidade Máxima */}
            <div>
                <label className="block text-gray-700 font-medium mb-2">
                    <i className="fas fa-chart-line mr-2 text-green-600"></i>
                    Quantidade Máxima
                </label>
                <input
                    type="number"
                    name="quantidadeMaxima"
                    value={materialEstoque.quantidadeMaxima}
                    onChange={handleMaterialChange}
                    placeholder="Ex: 100"
                    step="0.01"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                />
                <p className="text-sm text-gray-500 mt-1">
                    <i className="fas fa-info-circle mr-1"></i>
                    Capacidade máxima do estoque
                </p>
            </div>

            {/* Info Box */}
            <div className="md:col-span-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <i className="fas fa-lightbulb"></i>
                        Informações Importantes
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>
                            <i className="fas fa-check-circle mr-2"></i>
                            A <strong>marca</strong> é obrigatória para identificar o fornecedor do material
                        </li>
                        <li>
                            <i className="fas fa-check-circle mr-2"></i>
                            O <strong>modelo</strong> ajuda a diferenciar variações do mesmo insumo
                        </li>
                        <li>
                            <i className="fas fa-check-circle mr-2"></i>
                            Os limites mínimo e máximo auxiliam no controle de estoque
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
import React from 'react';

const UNIDADES_INTEIRAS = new Set(["UN", "PACOTE", "JOGO", "ROLO"]);

export default function DetalhesMovimentacao({ 
    movimentacao, handleChange, tipos, insumos, estoques,
    loadingInsumos, 
    insumoSelecionadoInfo,
    unidadeSelecionada 
}) {
    const { tipoMov, insumoId, quantidade, estoqueOrigemId, estoqueDestinoId } = movimentacao;

    // CORREÇÃO: AJUSTE agora está junto com SAIDA
    const isOrigemRequired = (tipoMov === 'SAIDA' || tipoMov === 'TRANSFERENCIA' || tipoMov === 'AJUSTE');
    const isInsumoDisabled = isOrigemRequired && !estoqueOrigemId;
    
    // CORREÇÃO: AJUSTE NÃO requer um destino separado (ele usa a origem)
    const isDestinoRequired = (tipoMov === 'ENTRADA' || tipoMov === 'TRANSFERENCIA');

    const isInteger = UNIDADES_INTEIRAS.has(unidadeSelecionada);
    const stepValue = isInteger ? "1" : "0.01";
    const placeholderValue = isInteger ? "0" : "0.00";

    const handleKeyDown = (e) => {
        if (isInteger && (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E')) {
            e.preventDefault();
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Tipo de Movimentação */}
            <div className="lg:col-span-1">
                <label className="block text-gray-700 font-medium mb-2">Tipo de Mov. *</label>
                <select 
                    name="tipoMov" 
                    value={tipoMov} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                >
                    <option value="">Selecione...</option>
                    {tipos.map(tipo => (<option key={tipo} value={tipo}>{tipo}</option>))}
                </select>
            </div>

            {/* Select de Insumo */}
            <div className="lg:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">Insumo *</label>
                <select 
                    name="insumoId" 
                    value={insumoId} 
                    onChange={handleChange} 
                    className={`w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue ${isInsumoDisabled ? 'bg-gray-200 cursor-not-allowed' : ''}`}
                    disabled={isInsumoDisabled || loadingInsumos || !tipoMov}
                >
                    <option value="">Selecione o insumo</option>
                    {loadingInsumos ? (
                        <option value="" disabled>Carregando insumos do estoque...</option>
                    ) : (
                        insumos.map(insumo => (
                            <option key={insumo.id} value={insumo.id}>
                                {insumo.nomeCompleto || insumo.nome}
                            </option>
                        ))
                    )}
                </select>
                {!tipoMov && (
                    <p className="text-xs text-gray-500 mt-1">Selecione o Tipo de Movimentação primeiro.</p>
                )}
                {isOrigemRequired && !estoqueOrigemId && tipoMov && (
                    <p className="text-xs text-gray-500 mt-1">Selecione o Estoque de {tipoMov === 'AJUSTE' ? 'Referência' : 'Origem'} para listar os insumos.</p>
                )}
                {isOrigemRequired && estoqueOrigemId && insumos.length === 0 && !loadingInsumos && (
                     <p className="text-xs text-red-500 mt-1">Nenhum insumo encontrado neste estoque.</p>
                )}
            </div>

            {/* Input de Quantidade */}
            <div className="lg:col-span-1">
                <label className="block text-gray-700 font-medium mb-2">Quantidade *</label>
                <input 
                    type="number" 
                    name="quantidade" 
                    value={quantidade} 
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}      
                    placeholder={placeholderValue} 
                    step={stepValue}             
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                    // Para AJUSTE, removemos o 'max' e permitimos negativos (o 'min' agora é omitido)
                    max={(isOrigemRequired && insumoSelecionadoInfo && tipoMov !== 'AJUSTE') ? insumoSelecionadoInfo.quantidadeAtual : undefined}
                    min={tipoMov !== 'AJUSTE' ? "0" : undefined} // Ajuste pode ser negativo
                    disabled={!insumoId} 
                />
                {(isOrigemRequired && insumoSelecionadoInfo) && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                        Disponível: {insumoSelecionadoInfo.quantidadeAtual} {insumoSelecionadoInfo.unidade}
                    </p>
                )}
                {tipoMov === 'AJUSTE' && (
                     <p className="text-xs text-gray-500 mt-1">
                        Use valores negativos para reduzir (ex: -5) e positivos para adicionar (ex: 5).
                    </p>
                )}
            </div>

            {/* Estoque de Origem */}
            {isOrigemRequired && (
                <div className="lg:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">
                        {/* Muda o label baseado no tipo */}
                        {tipoMov === 'AJUSTE' ? 'Estoque de Referência *' : 'Estoque de Origem *'}
                    </label>
                    <select 
                        name="estoqueOrigemId" 
                        value={estoqueOrigemId} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                    >
                        <option value="">Selecione...</option>
                        {estoques.map(e => (<option key={e.id} value={e.id}>{e.nome}</option>))}
                    </select>
                </div>
            )}

            {/* Estoque de Destino (Não aparece para AJUSTE) */}
            {isDestinoRequired && (
                <div className="lg:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">Estoque de Destino *</label>
                    <select 
                        name="estoqueDestinoId" 
                        value={estoqueDestinoId} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                        disabled={tipoMov === 'TRANSFERENCIA' && !estoqueOrigemId}
                    >
                        <option value="">Selecione...</option>
                        {estoques
                            .filter(e => tipoMov !== 'TRANSFERENCIA' || e.id != estoqueOrigemId)
                            .map(e => (<option key={e.id} value={e.id}>{e.nome}</option>))}
                    </select>
                    {tipoMov === 'TRANSFERENCIA' && !estoqueOrigemId && (
                         <p className="text-xs text-gray-500 mt-1">Selecione a Origem primeiro.</p>
                    )}
                </div>
            )}
        </div>
    );
}
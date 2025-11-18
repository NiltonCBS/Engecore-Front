import React from 'react';

// Helper para formatar moeda
const formatarMoeda = (valor) => {
  if (typeof valor !== 'number') valor = 0;
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Helper para status
const getStatusEstoque = (produto) => {
    const atual = Number(produto.quantidadeAtual);
    const min = Number(produto.quantidadeMinima);
    const max = Number(produto.quantidadeMaxima);

    if (min > 0 && atual <= min) {
        return { text: 'Crítico', color: 'text-red-600', icon: 'fas fa-exclamation-triangle' };
    }
    if (min > 0 && atual <= min * 1.25) { // 25% acima do mínimo
        return { text: 'Atenção (Baixo)', color: 'text-yellow-600', icon: 'fas fa-exclamation-circle' };
    }
    if (max > 0 && atual >= max) {
        return { text: 'Excesso', color: 'text-blue-600', icon: 'fas fa-box-open' };
    }
    return { text: 'OK', color: 'text-green-600', icon: 'fas fa-check-circle' };
};

export default function ModalDetalhesProdutoEstoque({ isOpen, onClose, produto }) {
    if (!isOpen || !produto) return null;

    const status = getStatusEstoque(produto);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b bg-gray-50 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Detalhes do Produto no Estoque
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Seção 1: Identificação */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Identificação</h3>
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
                                <label className="block text-sm font-medium text-gray-600">Modelo</label>
                                <div className="text-gray-900">{produto.modelo || '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Seção 2: Quantidade e Status */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Controle de Quantidade</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Status</label>
                                <div className={`font-bold text-lg ${status.color} flex items-center gap-2`}>
                                    <i className={status.icon}></i>
                                    {status.text}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Quantidade Atual</label>
                                <div className="text-gray-900 text-lg font-bold">{produto.quantidadeAtual} {produto.unidade}</div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-600">Qtd. Mínima</label>
                                <div className="text-gray-900">{produto.quantidadeMinima || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Seção 3: Valores */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Financeiro</h3>
                         <div>
                            <label className="block text-sm font-medium text-gray-600">Valor Unitário (Custo)</label>
                            <div className="text-green-700 text-xl font-bold">{formatarMoeda(produto.valorUni)}</div>
                        </div>
                    </div>

                </div>

                <div className="flex gap-4 justify-end border-t p-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
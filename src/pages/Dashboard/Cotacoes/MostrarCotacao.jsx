import React, { useState } from 'react';
import Sidebar from '../../../components/SideBar';
import Header from '../../../components/Header';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

// O ícone MenuItem não é mais necessário aqui, pois a navegação é feita pelo SideBar principal.

export default function MostrarCotacao() {
    const [obraSelecionada, setObraSelecionada] = useState('edificio-vista-mar');
    const [produtoSelecionado, setProdutoSelecionado] = useState('cimento-cp2');
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState(1); // Seleciona o melhor preço por padrão

    const cotacoes = [
        {
            id: 1,
            fornecedor: 'Materiais Silva & Cia',
            cnpj: '12.345.678/0001-90',
            valorUnitario: 32.50,
            prazoEntrega: '5 dias úteis',
            condicaoPagamento: '30 dias',
            observacoes: 'Frete incluso para pedidos acima de 100 unidades',
            melhorPreco: true
        },
        {
            id: 2,
            fornecedor: 'Construtora Central Ltda',
            cnpj: '23.456.789/0001-01',
            valorUnitario: 34.80,
            prazoEntrega: '3 dias úteis',
            condicaoPagamento: '15/45 dias',
            observacoes: 'Entrega expressa disponível'
        },
        {
            id: 3,
            fornecedor: 'Distribuidora Norte Sul',
            cnpj: '34.567.890/0001-12',
            valorUnitario: 35.20,
            prazoEntrega: '7 dias úteis',
            condicaoPagamento: 'À vista com 5% desc.',
            observacoes: 'Desconto progressivo para grandes volumes'
        },
        {
            id: 4,
            fornecedor: 'MegaMat Construções',
            cnpj: '45.678.901/0001-23',
            valorUnitario: 36.90,
            prazoEntrega: '2 dias úteis',
            condicaoPagamento: '28 dias',
            observacoes: 'Melhor prazo de entrega'
        },
        {
            id: 5,
            fornecedor: 'Atacado do Construtor',
            cnpj: '56.789.012/0001-34',
            valorUnitario: 38.00,
            prazoEntrega: '4 dias úteis',
            condicaoPagamento: '30/60 dias',
            observacoes: 'Parcelamento facilitado'
        }
    ];

    const quantidadeSolicitada = 200;
    const fornecedorAtivo = fornecedorSelecionado
        ? cotacoes.find(c => c.id === fornecedorSelecionado)
        : cotacoes.find(c => c.melhorPreco) || cotacoes[0];

    const totalEstimado = fornecedorAtivo ? fornecedorAtivo.valorUnitario * quantidadeSolicitada : 0;

    const handleConfirmarCompra = () => {
        if (fornecedorAtivo) {
            toast.success(`Compra de ${quantidadeSolicitada} unidades de ${produtoSelecionado} confirmada com ${fornecedorAtivo.fornecedor}. Total: R$ ${totalEstimado.toFixed(2)}`);
        } else {
            toast.error("Nenhum fornecedor selecionado para a compra.");
        }
    };

    const handleExportarPdf = () => {
        toast.info("Exportando PDF da cotação...");
    };

    const handleRefazerCotacao = () => {
        toast.warn("Refazendo a cotação. Redirecionando para a tela de cotação inicial...");
        // Aqui você adicionaria a lógica de navegação para a tela de cotação inicial.
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Utilizando o Sidebar existente do projeto */}
            <Sidebar />
            <div className="ml-64">
                {/* Utilizando o Header existente do projeto */}
                <Header />

                {/* Content Area */}
                <div className="p-6 flex-1">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-3xl font-bold text-cordes-blue">
                                Detalhes da Cotação
                            </h2>
                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                                Ativo
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Compare os preços e condições dos fornecedores e selecione a melhor proposta
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informações Solicitadas</h3>
                        {/* ALTERADO DE GRID PARA FLEX */}
                        <div className="flex flex-col md:flex-row gap-5">
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Obra <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={obraSelecionada}
                                    onChange={(e) => setObraSelecionada(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                                >
                                    <option value="edificio-vista-mar">Edifício Residencial Vista Mar</option>
                                    <option value="condominio-flores">Condomínio Parque das Flores</option>
                                    <option value="shopping-norte">Shopping Center Norte</option>
                                </select>
                            </div>
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Produto <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={produtoSelecionado}
                                    onChange={(e) => setProdutoSelecionado(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                                >
                                    <option value="cimento-cp2">Cimento CP-II 50kg</option>
                                    <option value="areia">Areia Média - m³</option>
                                    <option value="tijolo">Tijolo Cerâmico 8 Furos</option>
                                </select>
                            </div>
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantidade Solicitada
                                </label>
                                <input
                                    type="text"
                                    value={`${quantidadeSolicitada} unidades`}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ALTERADO DE GRID PARA FLEX */}
                    <div className="flex flex-row lg:flex-row gap-6">

                        {/* Table Section (2/3 width) */}
                        <div className="w-full lg:w-2/3">
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="text-lg font-semibold text-gray-800">Comparativo de Fornecedores</h3>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fornecedor</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Valor Unit.</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Prazo</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Pagamento</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {cotacoes.map((cotacao) => (
                                                <tr
                                                    key={cotacao.id}
                                                    className={`border-b border-gray-100 transition-colors cursor-pointer ${cotacao.melhorPreco ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'
                                                        } ${fornecedorSelecionado === cotacao.id ? 'border-l-4 border-cordes-blue' : ''}`}
                                                    onClick={() => setFornecedorSelecionado(cotacao.id)}
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {cotacao.melhorPreco && (
                                                                <i className="fas fa-star text-green-600 text-sm"></i>
                                                            )}
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {cotacao.fornecedor}
                                                                </div>
                                                                <div className="text-xs text-gray-500">{cotacao.cnpj}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={`px-4 py-4 text-sm ${cotacao.melhorPreco ? 'font-bold text-green-700' : 'text-gray-700'
                                                        }`}>
                                                        R$ {cotacao.valorUnitario.toFixed(2).replace('.', ',')}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-700">{cotacao.prazoEntrega}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-700">{cotacao.condicaoPagamento}</td>
                                                    <td className="px-4 py-4">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setFornecedorSelecionado(cotacao.id)
                                                            }}
                                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shadow-sm ${fornecedorSelecionado === cotacao.id
                                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                }`}
                                                        >
                                                            {fornecedorSelecionado === cotacao.id ? (
                                                                <span className="flex items-center gap-1">
                                                                    <i className="fas fa-check"></i> Selecionado
                                                                </span>
                                                            ) : (
                                                                'Selecionar'
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <h4 className="text-xs font-semibold text-gray-700 mb-3">Observações dos Fornecedores</h4>
                                    <div className="space-y-2">
                                        {cotacoes.map((cotacao) => (
                                            <div key={cotacao.id} className="text-xs text-gray-600">
                                                <span className="font-medium text-gray-800">{cotacao.fornecedor}:</span> {cotacao.observacoes}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Card (1/3 width) */}
                        <div className="w-full lg:w-1/3">
                            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6 border border-gray-200">
                                <h3 className="text-xl font-bold text-cordes-blue mb-5 border-b pb-2">
                                    Resumo da Compra
                                </h3>

                                <div className="space-y-4 mb-6">
                                    <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                                        <label className="text-xs text-gray-700 block mb-1 font-semibold">Fornecedor Escolhido</label>
                                        <div className="text-base font-bold text-gray-900">
                                            {fornecedorAtivo ? fornecedorAtivo.fornecedor : 'Nenhum selecionado'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Valor Unitário</label>
                                        <div className="text-base font-medium text-gray-900">
                                            R$ {fornecedorAtivo ? fornecedorAtivo.valorUnitario.toFixed(2).replace('.', ',') : '0,00'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Quantidade</label>
                                        <div className="text-base font-medium text-gray-900">{quantidadeSolicitada} unidades</div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <label className="text-xs text-cordes-blue block mb-1 font-bold">TOTAL ESTIMADO</label>
                                        <div className="text-3xl font-extrabold text-cordes-blue">
                                            R$ {totalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Prazo de Entrega</label>
                                        <div className="text-base font-medium text-gray-900">
                                            {fornecedorAtivo ? fornecedorAtivo.prazoEntrega : '-'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Condição de Pagamento</label>
                                        <div className="text-base font-medium text-gray-900">
                                            {fornecedorAtivo ? fornecedorAtivo.condicaoPagamento : '-'}
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-3 pt-4 border-t'>
                                    <button
                                        onClick={handleConfirmarCompra}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-base hover:bg-green-700 transition-colors shadow-md flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-shopping-cart"></i>
                                        Confirmar Pedido
                                    </button>

                                    <button
                                        onClick={handleExportarPdf}
                                        className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
                                    >
                                        <i className="fas fa-file-pdf"></i>
                                        Exportar PDF
                                    </button>

                                    <button
                                        onClick={handleRefazerCotacao}
                                        className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
                                    >
                                        <i className="fas fa-sync-alt"></i>
                                        Refazer Cotação
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

MostrarCotacao.propTypes = {
    // Caso este componente receba props de rota ou contexto
};
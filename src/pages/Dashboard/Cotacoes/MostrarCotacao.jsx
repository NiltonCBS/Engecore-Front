import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/SideBar';
import Header from '../../../components/Header';
import { toast } from 'react-toastify';
import { api } from '../../../services/api';

export default function MostrarCotacao() {

    // Obtém o ID da cotação dos parâmetros da URL
    const { id } = useParams();
    const navigate = useNavigate();
    const [cotacaoInfo, setCotacaoInfo] = useState(null);
    const [propostas, setPropostas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConfirmando, setIsConfirmando] = useState(false);
    const [isRegerando, setIsRegerando] = useState(false);
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);

    // Carrega os dados da cotação e suas propostas
    useEffect(() => {
        if (!id) {
            toast.error("ID de cotação não fornecido.");
            navigate("/cotacoes");
            return;
        }

        async function carregarDetalhesCotacao() {
            setLoading(true);
            try {
                const [cotacaoRes, propostasRes] = await Promise.all([
                    api.get(`/cotacoes/${id}`),
                    api.get(`/cotacoes/${id}/propostas`)
                ]);

                if (cotacaoRes.data.success) {
                    setCotacaoInfo(cotacaoRes.data.data);
                } else {
                    throw new Error(cotacaoRes.data.message);
                }

                if (propostasRes.data.success) {
                    const propostasRecebidas = propostasRes.data.data;
                    setPropostas(propostasRecebidas);
                    
                    const melhorProposta = propostasRecebidas.find(p => p.melhorPreco);
                    if (melhorProposta) {
                        setFornecedorSelecionado(melhorProposta.id);
                    } else if (propostasRecebidas.length > 0) {
                        setFornecedorSelecionado(propostasRecebidas[0].id);
                    }
                } else {
                    throw new Error(propostasRes.data.message);
                }

            } catch (error) {
                toast.error(`Erro ao carregar cotação: ${error.message}`);
                console.error(error);
                navigate("/cotacoes"); 
            } finally {
                setLoading(false);
            }
        }

        carregarDetalhesCotacao();
    }, [id, navigate]);

    // Calcula o total estimado com base na proposta selecionada
    const fornecedorAtivo = fornecedorSelecionado
        ? propostas.find(c => c.id === fornecedorSelecionado)
        : null;

    // Evita NaN se cotacaoInfo ou quantidade for indefinido
    const totalEstimado = fornecedorAtivo ? fornecedorAtivo.valorUnitario * (cotacaoInfo?.quantidade || 0) : 0;

    // Função para confirmar a compra com o fornecedor selecionado
    const handleConfirmarCompra = async () => {
        if (!fornecedorSelecionado) {
            toast.error("Nenhum fornecedor selecionado para a compra.");
            return;
        }

        setIsConfirmando(true); // Ativa loading do botão confirmar
        try {
            await api.post(`/cotacoes/propostas/${fornecedorSelecionado}/confirmar`);
            toast.success(`Pedido confirmado com fornecedor ${fornecedorAtivo.fornecedor}!`);
            navigate('/cotacoes'); // Volta para a lista
            
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao confirmar pedido.");
            console.error(error);
        } finally {
            setIsConfirmando(false);
        }
    };

    // Função para regerar as propostas de fornecedores
    const handleRegerarPropostas = async () => {
        setIsRegerando(true);
        try {
            const response = await api.post(`/cotacoes/${id}/regerar-propostas`);
            if (response.data.success) {
                const novasPropostas = response.data.data;
                setPropostas(novasPropostas);
                toast.success(`Propostas atualizadas! ${novasPropostas.length} fornecedores encontrados.`);
                
                // Re-seleciona o melhor
                const melhorProposta = novasPropostas.find(p => p.melhorPreco);
                if (melhorProposta) {
                    setFornecedorSelecionado(melhorProposta.id);
                } else if (novasPropostas.length > 0) {
                    setFornecedorSelecionado(novasPropostas[0].id);
                } else {
                    setFornecedorSelecionado(null);
                }
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao atualizar propostas.");
        } finally {
            setIsRegerando(false);
        }
    };

    // Exibe loading enquanto carrega os dados
    if (loading) {
        return (
            <div className="bg-gray-100 min-h-screen">
                <Sidebar />
                <div className="ml-64">
                    <Header />
                    <div className="p-6 text-center">
                        <i className="fas fa-spinner fa-spin text-4xl text-cordes-blue"></i>
                        <p className="mt-2 text-gray-600">Carregando detalhes da cotação...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Desabilita botões de ação se não estiver aberta
    const isAberta = cotacaoInfo?.status === 'ABERTA';

    return (
        <div className="bg-gray-100 min-h-screen">
            <Sidebar />
            <div className="ml-64">
                <Header />
                <div className="p-6 flex-1">
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-3xl font-bold text-cordes-blue">
                                Detalhes da Cotação #{cotacaoInfo?.id}
                            </h2>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                isAberta ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                                {cotacaoInfo?.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Compare os preços e condições dos fornecedores e selecione a melhor proposta
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informações Solicitadas</h3>
                        <div className="flex flex-col md:flex-row gap-5">
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Obra</label>
                                <input
                                    type="text"
                                    value={cotacaoInfo?.nomeObra || ''}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                                />
                            </div>
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Produto (Insumo)</label>
                                <input
                                    type="text"
                                    value={cotacaoInfo?.insumo?.nome || ''}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                                />
                            </div>
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade Solicitada</label>
                                <input
                                    type="text"
                                    value={`${cotacaoInfo?.quantidade || 0} ${cotacaoInfo?.insumo?.unidade || ''}`}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Tabela de Propostas */}
                        <div className="w-full lg:w-2/3">
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-800">Comparativo de Fornecedores ({propostas.length} encontrados)</h3>
                                    {/* 3. BOTÃO DE REGERAR ADICIONADO AQUI */}
                                    {isAberta && (
                                        <button
                                            onClick={handleRegerarPropostas}
                                            disabled={isRegerando}
                                            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <i className={`fas fa-sync-alt ${isRegerando ? 'fa-spin' : ''} mr-2`}></i>
                                            {isRegerando ? 'Buscando...' : 'Atualizar Propostas'}
                                        </button>
                                    )}
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        {/* ... (thead da tabela) ... */}
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fornecedor</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Valor Unit.</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Prazo</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Pagamento</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {propostas.map((proposta) => (
                                                <tr
                                                    key={proposta.id}
                                                    className={`border-b border-gray-100 transition-colors cursor-pointer ${proposta.melhorPreco ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'} ${fornecedorSelecionado === proposta.id ? 'border-l-4 border-cordes-blue' : ''}`}
                                                    onClick={() => setFornecedorSelecionado(proposta.id)}
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {proposta.melhorPreco && (<i className="fas fa-star text-green-600 text-sm"></i>)}
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{proposta.fornecedor}</div>
                                                                <div className="text-xs text-gray-500">{proposta.cnpj}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={`px-4 py-4 text-sm ${proposta.melhorPreco ? 'font-bold text-green-700' : 'text-gray-700'}`}>
                                                        R$ {proposta.valorUnitario.toFixed(2).replace('.', ',')}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-700">{proposta.prazoEntrega}</td>
                                                    <td className="px-4 py-4 text-sm text-gray-700">{proposta.condicaoPagamento}</td>
                                                    <td className="px-4 py-4">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setFornecedorSelecionado(proposta.id); }}
                                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shadow-sm ${fornecedorSelecionado === proposta.id ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                        >
                                                            {fornecedorSelecionado === proposta.id ? (<span className="flex items-center gap-1"><i className="fas fa-check"></i> Selecionado</span>) : ('Selecionar')}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {propostas.length === 0 && (
                                    <div className="text-center p-10 text-gray-500">
                                        <i className="fas fa-box-open text-4xl mb-3"></i>
                                        <p>Nenhuma proposta de fornecedor foi encontrada para esta cotação.</p>
                                        <p className="text-xs mt-1">Verifique se você cadastrou fornecedores para este insumo.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cartão de Resumo da Compra */}
                        <div className="w-full lg:w-1/3">
                            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6 border border-gray-200">
                                <h3 className="text-xl font-bold text-cordes-blue mb-5 border-b pb-2">
                                    Resumo da Compra
                                </h3>
                                {fornecedorAtivo ? (
                                    <>
                                        {/* ... (JSX do resumo com fornecedorAtivo) ... */}
                                        <div className="space-y-4 mb-6">
                                            <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                                                <label className="text-xs text-gray-700 block mb-1 font-semibold">Fornecedor Escolhido</label>
                                                <div className="text-base font-bold text-gray-900">{fornecedorAtivo.fornecedor}</div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">Valor Unitário</label>
                                                <div className="text-base font-medium text-gray-900">R$ {fornecedorAtivo.valorUnitario.toFixed(2).replace('.', ',')}</div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">Quantidade</label>
                                                <div className="text-base font-medium text-gray-900">{cotacaoInfo.quantidade} {cotacaoInfo.insumo.unidade}</div>
                                            </div>
                                            <div className="pt-4 border-t border-gray-200">
                                                <label className="text-xs text-cordes-blue block mb-1 font-bold">TOTAL ESTIMADO</label>
                                                <div className="text-3xl font-extrabold text-cordes-blue">R$ {totalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">Prazo de Entrega</label>
                                                <div className="text-base font-medium text-gray-900">{fornecedorAtivo.prazoEntrega || '-'}</div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">Condição de Pagamento</label>
                                                <div className="text-base font-medium text-gray-900">{fornecedorAtivo.condicaoPagamento || '-'}</div>
                                            </div>
                                        </div>

                                        {/* 4. BOTÕES DE AÇÃO ATUALIZADOS */}
                                        <div className='space-y-3 pt-4 border-t'>
                                            <button
                                                onClick={handleConfirmarCompra}
                                                disabled={isConfirmando || isRegerando || !isAberta}
                                                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-base hover:bg-green-700 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                                                title={!isAberta ? 'Esta cotação não está mais aberta' : ''}
                                            >
                                                <i className={`fas ${isConfirmando ? 'fa-spinner fa-spin' : 'fa-shopping-cart'}`}></i>
                                                {isConfirmando ? 'Confirmando...' : 'Confirmar Pedido'}
                                            </button>
                                            
                                            {/* Botão de Regerar visível apenas se estiver ABERTA */}
                                            {isAberta && (
                                                <button
                                                    onClick={handleRegerarPropostas}
                                                    disabled={isConfirmando || isRegerando}
                                                    className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                                                >
                                                    <i className={`fas ${isRegerando ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
                                                    {isRegerando ? 'Buscando...' : 'Atualizar Propostas'}
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    // Mensagem para "0 encontrados"
                                    <div className="text-center text-gray-500 py-10">
                                        <i className="fas fa-box-open text-3xl mb-3"></i>
                                        <p className="font-medium">Nenhuma proposta encontrada.</p>
                                        <p className="text-sm mt-2">Verifique se cadastrou fornecedores para este insumo e tente atualizar.</p>
                                        {/* 5. BOTÃO DE REGERAR NA TELA VAZIA */}
                                        {isAberta && (
                                            <button
                                                onClick={handleRegerarPropostas}
                                                disabled={isConfirmando || isRegerando}
                                                className="w-full mt-4 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                                            >
                                                <i className={`fas ${isRegerando ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
                                                {isRegerando ? 'Buscando...' : 'Buscar Fornecedores Agora'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
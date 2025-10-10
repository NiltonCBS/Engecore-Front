import { useState } from "react";
import { toast } from 'react-toastify'; // Importação do toast
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";
import ModeSelector from "../../../components/ModeSelector";
import CotacaoForm from "../../../components/CotacaoForm";
import QuotationResults from "../../../components/QuotationResults";

// Mock Data (baseado em dados de outros arquivos do projeto)
// Mantenha os mocks aqui para fácil acesso em toda a página, se necessário.
const mockObras = [
    "Edifício Residencial ABC",
    "Reforma Comercial XYZ",
    "Construção Galpão Industrial",
    "Ampliação Residencial Silva",
    "Obra Condomínio Premium"
];

const mockUnidadesMedida = [
    "kg", "ton", "m", "m²", "m³", "un", "cx", "sc", "pç", "par", "dz", "l"
];

const mockFornecedores = [
    { id: 1, nome: "Materiais Silva & Cia", cnpj: "12.345.678/0001-90", valorUnitario: 32.50, prazoEntrega: "5 dias úteis", condicaoPagamento: "30 dias", isBestPrice: true },
    { id: 2, nome: "Construtora Central Ltda", cnpj: "23.456.789/0001-01", valorUnitario: 34.80, prazoEntrega: "3 dias úteis", condicaoPagamento: "15/45 dias", isBestPrice: false },
    { id: 3, nome: "Distribuidora Norte Sul", cnpj: "34.567.890/0001-12", valorUnitario: 35.20, prazoEntrega: "7 dias úteis", condicaoPagamento: "À vista com 5% desc.", isBestPrice: false },
    { id: 4, nome: "MegaMat Construções", cnpj: "45.678.901/0001-23", valorUnitario: 36.90, prazoEntrega: "2 dias úteis", condicaoPagamento: "28 dias", isBestPrice: false },
    { id: 5, nome: "Atacado do Construtor", cnpj: "56.789.012/0001-34", valorUnitario: 38.00, prazoEntrega: "4 dias úteis", condicaoPagamento: "30/60 dias", isBestPrice: false },
];

export default function CotacaoDeValores() {
    const [cotacao, setCotacao] = useState({
        obra: "",
        dataNecessidade: "2025-10-20",
        prioridade: "Normal",
        produto: "",
        quantidade: 0,
        unidadeMedida: "",
    });

    const [mode, setMode] = useState('manual'); // 'manual' or 'auto'
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(true);

    const handleModeChange = (newMode) => {
        setMode(newMode);
        // Esconde resultados quando troca para auto mode antes de gerar
        if (newMode === 'auto') {
            setShowResults(false);
        } else {
            setShowResults(true); // Mostra resultados mockados no modo manual
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCotacao(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateQuote = () => {
        if (mode === 'auto') {
            setShowResults(false);
            setLoading(true);

            // Simula a requisição/processamento do modo automático
            setTimeout(() => {
                setLoading(false);
                setShowResults(true);
                toast.success("Cotação automática gerada!", { autoClose: 3000 });
            }, 2500);
        } else {
            toast.info("Modo manual ativado. Prossiga para salvar e enviar.", { autoClose: 3000 });
        }
    };

    const handleSaveAndSend = () => {
        // Adicionar validação de campos obrigatórios aqui
        if (!cotacao.obra || !cotacao.dataNecessidade || !cotacao.produto || !cotacao.quantidade || !cotacao.unidadeMedida) {
            toast.error("Por favor, preencha todos os campos obrigatórios (*).");
            return;
        }
        console.log("Cotação a ser salva:", cotacao);
        toast.success("Cotação salva e enviada para fornecedores!");
    };

    const getStatusBadge = () => (
        <span className="inline-flex items-center px-3 py-1 ml-4 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Ativo
        </span>
    );

    return (
        <div className="bg-gray-100 min-h-screen">
            <Sidebar />
            <div className="ml-64">
                <Header />
                <div className="p-6">

                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-cordes-blue flex items-center">
                                    Cotação de Valores
                                    {getStatusBadge()}
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Compare preços e condições de fornecedores para otimizar o custo de suas obras
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">

                        {/* Componente de Seleção de Modo */}
                        <ModeSelector mode={mode} onModeChange={handleModeChange} />

                        {/* Componente de Formulário */}
                        <CotacaoForm
                            cotacao={cotacao}
                            handleChange={handleChange}
                            mockObras={mockObras}
                            mockUnidadesMedida={mockUnidadesMedida}
                        />

                        {/* Auto Mode Info */}
                        {mode === 'auto' && (
                            <div className="p-6 rounded-xl text-white bg-gradient-to-r from-cordes-blue to-purple-700 shadow-md">
                                <div className="font-bold text-lg mb-2">🤖 Cotação Automática Ativada</div>
                                <div className="text-sm opacity-90">
                                    O sistema está analisando: categoria do produto, CEP da obra, histórico de compras e preço médio anterior para selecionar os melhores fornecedores automaticamente.
                                </div>
                            </div>
                        )}

                        {/* Loading Panel */}
                        {loading && (
                            <div className="text-center p-10 bg-white rounded-xl shadow-md">
                                <div className="w-12 h-12 border-4 border-gray-200 border-t-cordes-blue rounded-full animate-spin mx-auto mb-4"></div>
                                <div className="text-gray-700 font-medium">Gerando cotações automaticamente...</div>
                            </div>
                        )}

                        {/* Componente de Resultados */}
                        {showResults && !loading && (
                            <QuotationResults mockFornecedores={mockFornecedores} />
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6 border-t justify-end">
                            <button
                                type="button"
                                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition duration-300"
                            >
                                <i className="fas fa-times mr-2"></i>
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={handleGenerateQuote}
                                disabled={loading}
                                className="px-6 py-3 bg-light-blue-800 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 shadow-md disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Gerando...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-magic mr-2"></i>
                                        Gerar Cotação
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={handleSaveAndSend}
                                disabled={loading || !showResults}
                                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-300 shadow-md disabled:opacity-50"
                            >
                                <i className="fas fa-envelope mr-2"></i>
                                Salvar e Enviar para Fornecedores
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
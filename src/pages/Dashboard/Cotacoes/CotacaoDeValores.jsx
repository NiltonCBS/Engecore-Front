import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";
import CotacaoForm from "../../../components/CotacaoForm";
import ItensCotacaoForm from "../../../components/ItensCotacaoForm";
import { api } from "../../../services/api";
import { useNavigate } from "react-router-dom";

export default function CotacaoDeValores() {

    // Estados para os dados carregados da API
    const [obras, setObras] = useState([]);
    const [insumos, setInsumos] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [cotacao, setCotacao] = useState({
        obraId: "",
        dataNecessidade: new Date().toISOString().split('T')[0],
        prioridade: "Normal",
        funcionarioId: ""
    });
    const [itens, setItens] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const navigate = useNavigate();

    // Carrega Obras, Insumos e FUNCIONÁRIOS do backend
    useEffect(() => {
        async function carregarDados() {
            setLoadingData(true);
            try {
                const [obrasRes, insumosRes, funcionariosRes] = await Promise.all([
                    api.get("/obras/listar"),
                    api.get("/insumo/listar"),
                    api.get("/funcionario/listar")
                ]);

                if (obrasRes.data.success) {
                    setObras(obrasRes.data.data.map(o => ({ 
                        id: o.idObra || o.id,
                        nome: o.nomeObra || o.nome 
                    })));
                }
                
                if (insumosRes.data.success) {
                    setInsumos(insumosRes.data.data);
                }

                if (funcionariosRes.data.success) {
                    setFuncionarios(funcionariosRes.data.data); 
                }
            } catch (error) {
                toast.error("Erro ao carregar dados de obras, insumos ou funcionários.");
                console.error(error);
            } finally {
                setLoadingData(false);
            }
        }
        carregarDados();
    }, []);

    // Atualiza os dados gerais (Obra, Data, etc)
    const handleChangeGeral = (e) => {
        const { name, value } = e.target;
        setCotacao(prev => ({ ...prev, [name]: value }));
    };

    // LÓGICA PARA ADICIONAR ITEM (IMPLEMENTA A REGRA DE DUPLICIDADE)
    const handleAddItem = (novoItem) => {
        const itemExistente = itens.find(i => i.insumoId === novoItem.insumoId);

        if (itemExistente) {
            // Se existe, ATUALIZA A QUANTIDADE
            toast.info("Item já adicionado. A quantidade foi somada.");
            setItens(prevItens => 
                prevItens.map(item => 
                    item.insumoId === novoItem.insumoId 
                    ? { ...item, quantidade: Number(item.quantidade) + Number(novoItem.quantidade) } 
                    : item
                )
            );
        } else {
            // Se não existe, ADICIONA O NOVO ITEM
            // Precisamos buscar o nome e a unidade da lista mestra
            const insumoInfo = insumos.find(i => i.id === novoItem.insumoId);
            const itemCompleto = {
                insumoId: novoItem.insumoId,
                insumoNome: insumoInfo.nome,
                unidade: insumoInfo.unidade,
                quantidade: novoItem.quantidade
            };
            setItens(prev => [...prev, itemCompleto]);
        }
    };

    // LÓGICA PARA REMOVER ITEM DA LISTA
    const handleRemoveItem = (insumoId) => {
        setItens(prev => prev.filter(item => item.insumoId !== insumoId));
    };

    // LÓGICA PARA ATUALIZAR QUANTIDADE DIRETO NA LISTA
    const handAtualizarQuantidade = (insumoId, novaQuantidade) => {
        const valorNum = Number(novaQuantidade);
        if (isNaN(valorNum) || valorNum <= 0) {
            handleRemoveItem(insumoId);
        } else {
            // Atualiza a quantidade
            setItens(prevItens => 
                prevItens.map(item => 
                    item.insumoId === insumoId ? { ...item, quantidade: valorNum } : item
                )
            );
        }
    };

    // Envia a cotação em lote para o backend
   const handleGerarCotas = async () => {
        const obraIdNum = Number(cotacao.obraId);
        const funcionarioIdNum = Number(cotacao.funcionarioId);

        // Filtra a lista de itens para enviar apenas os que têm quantidade
        const itensParaEnviar = itens
            .filter(item => Number(item.quantidade) > 0)
            .map(item => ({ 
                insumoId: item.insumoId, // O DTO do backend só quer ID e Qtd
                quantidade: Number(item.quantidade) 
            }));

        // Validação
        if (!obraIdNum || obraIdNum <= 0) {
            toast.warn("Selecione uma Obra válida.");
            return;
        }
        if (!funcionarioIdNum || funcionarioIdNum <= 0) {
            toast.warn("Selecione um Funcionário Solicitante.");
            return; 
        }
        if (itensParaEnviar.length === 0) {
            toast.warn("Adicione pelo menos um insumo à cotação (definindo uma quantidade maior que 0).");
            return;
        }

        setLoading(true);
        
        try {
            // Monta o DTO final (CotacaoRequestDTO)
            const dto = {
                obraId: obraIdNum,
                dataNecessidade: cotacao.dataNecessidade,
                prioridade: cotacao.prioridade,
                funcionarioId: funcionarioIdNum,
                itens: itensParaEnviar // Envia a lista de itens filtrada
            };

            // --- INÍCIO DA DEPURAÇÃO ---
            
            console.log("===================================");
            console.log("ENVIANDO DTO PARA /cotacoes/solicitar:");
            console.log(JSON.stringify(dto, null, 2)); // Mostra o JSON formatado
            console.log("===================================");

            // --- FIM DA DEPURAÇÃO ---

            // Esta é a linha 156 (ou próxima dela) que está falhando
            const response = await api.post('/cotacoes/solicitar', dto);

            if (response.data.success) {
                toast.success(`${response.data.data.length} cotação(ões) gerada(s) com sucesso!`);
                navigate(`/cotacoes`); // Volta para a lista de cotações
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            // O erro 400 será pego aqui
            console.error("ERRO NA API:", error.response);
            toast.error(error.response?.data?.message || "Erro ao gerar cotação.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Sidebar />
            <div className="ml-64">
                <Header />
                <div className="p-6">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-cordes-blue flex items-center">
                                Nova Cotação de Valores
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Preencha os dados gerais e adicione os insumos para a cotação automática.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {loadingData ? (
                             <div className="text-center p-10 bg-white rounded-xl shadow-md">
                                <i className="fas fa-spinner fa-spin text-2xl text-cordes-blue"></i>
                                <p className="mt-2 text-gray-600">Carregando dados...</p>
                            </div>
                        ) : (
                            <>
                                {/* Formulário de Dados Gerais */}
                                <div className="bg-white rounded-xl shadow-md p-8">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">1. Informações da Solicitação</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <CotacaoForm
                                            cotacao={cotacao}
                                            handleChange={handleChangeGeral}
                                            listaObras={obras}
                                            listaFuncionarios={funcionarios}
                                        />
                                    </div>
                                </div>

                                {/* Novo Componente para Lista de Insumos */}
                                <ItensCotacaoForm 
                                    insumosDisponiveis={insumos}
                                    itensSelecionados={itens}
                                    onAddItem={handleAddItem}
                                    onRemoveItem={handleRemoveItem}
                                    onUpdateQuantity={handAtualizarQuantidade}
                                />
                            </>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6 border-t justify-end">
                            <button
                                type="button"
                                onClick={() => navigate("/cotacoes")}
                                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition duration-300"
                            >
                                <i className="fas fa-times mr-2"></i>
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={handleGerarCotas}
                                disabled={loading || loadingData}
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
                                        Gerar Cotação Automática
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
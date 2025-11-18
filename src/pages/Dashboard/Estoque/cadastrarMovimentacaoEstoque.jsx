/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';

import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";
import FormSection from "../../../components/FormSection";
import DetalhesMovimentacao from "../../../components/DetalhesMovimentacao";
import DetalhesMaterialEntrada from "../../../components/DetalhesMaterialEntrada";
import InfoAdicionais from "../../../components/InfoAdicionais";
import ActionButtons from "../../../components/ActionButtons";
import { api } from "../../../services/api";

const TIPOS_MOVIMENTACAO = ["ENTRADA", "SAIDA", "TRANSFERENCIA", "AJUSTE"];
const UNIDADES_INTEIRAS = new Set(["UN", "PACOTE", "JOGO", "ROLO"]);

export default function CadastrarMovimentacaoEstoque() {
    const [movimentacao, setMovimentacao] = useState({
        tipoMov: "",
        insumoId: "",
        estoqueOrigemId: "",
        estoqueDestinoId: "",
        quantidade: "",
        funcionarioId: "",
        dataMovimentacao: new Date().toISOString().split('T')[0],
        observacao: "",
        materialEstoque: {
            marcaId: "",
            modelo: "",
            valor: "",
            quantidadeMinima: "",
            quantidadeMaxima: ""
        }
    });

    const [insumosMestre, setInsumosMestre] = useState([]); 
    const [insumosDisponiveis, setInsumosDisponiveis] = useState([]); 
    const [insumoSelecionadoInfo, setInsumoSelecionadoInfo] = useState(null); 
    const [marcas, setMarcas] = useState([]); 
    const [estoques, setEstoques] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isCarregandoDados, setIsCarregandoDados] = useState(true);
    const [loadingInsumos, setLoadingInsumos] = useState(false);
    const [unidadeSelecionada, setUnidadeSelecionada] = useState("");


    useEffect(() => {
        const carregarDadosIniciais = async () => {
            setIsCarregandoDados(true);
            try {
                const [insumosRes, estoquesRes, funcionariosRes, marcasRes] = await Promise.all([
                    api.get("/insumo/listar"),
                    api.get("/estoque/listar"),
                    api.get("/funcionario/listar"),
                    api.get("/marca/listar")
                ]);

                const insumosData = insumosRes.data?.data || insumosRes.data || [];
                const estoquesData = estoquesRes.data?.data || estoquesRes.data || [];
                const funcionariosData = funcionariosRes.data?.data || funcionariosRes.data || [];
                const marcasData = marcasRes.data?.data || marcasRes.data || [];

                setInsumosMestre(Array.isArray(insumosData) ? insumosData : []);
                setEstoques(Array.isArray(estoquesData) ? estoquesData : []);
                setFuncionarios(Array.isArray(funcionariosData) ? funcionariosData : []);
                setMarcas(Array.isArray(marcasData) ? marcasData : []);
                
            } catch (error) {
                toast.error("Erro ao carregar dados do servidor.");
                console.error("Erro ao carregar dados:", error);
            } finally {
                setIsCarregandoDados(false);
            }
        };
        
        carregarDadosIniciais();
    }, []);

    // useEffect de busca dinâmica (CORRETO)
    useEffect(() => {
        const { tipoMov, estoqueOrigemId } = movimentacao;
        if ((tipoMov === 'AJUSTE' || tipoMov === 'SAIDA' || tipoMov === 'TRANSFERENCIA') && estoqueOrigemId) {
            const fetchInsumosDoEstoque = async () => {
                setLoadingInsumos(true);
                setInsumosDisponiveis([]);
                setInsumoSelecionadoInfo(null);
                try {
                    const response = await api.get(`/material-estoque/listar/por-estoque/${estoqueOrigemId}`);
                    const insumosDoEstoque = response.data?.data || response.data || [];
                    
                    if (!Array.isArray(insumosDoEstoque)) {
                         setInsumosDisponiveis([]);
                         return;
                    }
                    setInsumosDisponiveis(insumosDoEstoque);
                    if (insumosDoEstoque.length === 0) {
                        toast.info("Este estoque de origem não possui insumos.");
                    }
                } catch (error) {
                    toast.error("Erro ao carregar insumos do estoque de origem.");
                } finally {
                    setLoadingInsumos(false);
                }
            };
            fetchInsumosDoEstoque();
        } else {
            setInsumosDisponiveis([]);
        }
    }, [movimentacao.tipoMov, movimentacao.estoqueOrigemId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let unit = ""; 

        if (name === 'tipoMov') {
            setMovimentacao(prev => ({
                ...prev,
                [name]: value,
                insumoId: "", estoqueOrigemId: "", estoqueDestinoId: "", quantidade: ""
            }));
            setInsumoSelecionadoInfo(null);
            setUnidadeSelecionada(""); 
        } else if (name === 'estoqueOrigemId') {
            setMovimentacao(prev => ({
                ...prev,
                [name]: value,
                insumoId: "", quantidade: ""
            }));
            setInsumoSelecionadoInfo(null);
            setUnidadeSelecionada(""); 
        } else if (name === 'insumoId') {
            
            if (movimentacao.tipoMov === 'SAIDA' || movimentacao.tipoMov === 'TRANSFERENCIA' || movimentacao.tipoMov === 'AJUSTE') {
                // Encontra o objeto completo do insumo na lista carregada do estoque
                const info = insumosDisponiveis.find(i => i.insumoId == value);
                setInsumoSelecionadoInfo(info || null);
                if (info) unit = info.unidade;
            } else { 
                const infoMestre = insumosMestre.find(i => i.id == value);
                setInsumoSelecionadoInfo(null);
                if (infoMestre) unit = infoMestre.unidade;
            }
            setUnidadeSelecionada(unit); 
            setMovimentacao(prev => ({ ...prev, [name]: value, quantidade: "" }));
        } else {
            setMovimentacao(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleMaterialChange = (e) => {
        const { name, value } = e.target;
        setMovimentacao(prev => ({
            ...prev,
            materialEstoque: { ...prev.materialEstoque, [name]: value }
        }));
    };

    const validarCampos = () => {
        const { tipoMov, insumoId, quantidade, funcionarioId, estoqueOrigemId, estoqueDestinoId, materialEstoque } = movimentacao;

        if (!tipoMov) { toast.warn("Selecione o tipo de movimentação."); return false; }
        if (!insumoId) { toast.warn("Selecione um insumo."); return false; }
        
        if (tipoMov !== 'AJUSTE' && (!quantidade || Number(quantidade) <= 0)) { 
            toast.warn("Informe uma quantidade válida."); return false; 
        }
        if (tipoMov === 'AJUSTE' && (!quantidade || Number(quantidade) === 0)) {
            toast.warn("A quantidade do ajuste não pode ser zero."); return false;
        }
        if (!funcionarioId) { toast.warn("Selecione o funcionário responsável."); return false; }

        if (unidadeSelecionada && UNIDADES_INTEIRAS.has(unidadeSelecionada)) {
            if (Number(quantidade) % 1 !== 0) {
                toast.warn(`A quantidade para ${unidadeSelecionada} deve ser um número inteiro (sem decimais).`);
                return false;
            }
        }

        if (tipoMov === 'SAIDA' || tipoMov === 'TRANSFERENCIA' || tipoMov === 'AJUSTE') {
            if (!estoqueOrigemId) { toast.warn(`Selecione o estoque de ${tipoMov === 'AJUSTE' ? 'referência' : 'origem'}.`); return false; }
            if (!insumoSelecionadoInfo) { toast.warn("Insumo selecionado é inválido."); return false; }
            
            if (tipoMov === 'SAIDA' || tipoMov === 'TRANSFERENCIA') {
                if (Number(quantidade) > insumoSelecionadoInfo.quantidadeAtual) {
                    toast.warn(`Quantidade excede o estoque. Disponível: ${insumoSelecionadoInfo.quantidadeAtual} ${insumoSelecionadoInfo.unidade}`);
                    return false;
                }
            }
            
            if (tipoMov === 'TRANSFERENCIA') {
                if (!estoqueDestinoId) { toast.warn("Selecione o estoque de destino."); return false; }
                if (estoqueOrigemId === estoqueDestinoId) { toast.warn("Os estoques de origem e destino devem ser diferentes."); return false; }
            }
        }
        
        if (tipoMov === 'ENTRADA') {
            if (!estoqueDestinoId) { toast.warn(`Para ENTRADA, selecione o estoque de destino.`); return false; }
            if (!materialEstoque.valor || Number(materialEstoque.valor) <= 0) { toast.warn("Informe o valor unitário do material."); return false; }
            if (!materialEstoque.marcaId) { toast.warn("Selecione a marca do material."); return false; }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validarCampos()) { return; }
        setIsLoading(true);
        try {
            const { tipoMov } = movimentacao;
            
            const dtoParaApi = {
                tipoMov: movimentacao.tipoMov,
                insumoId: Number(movimentacao.insumoId),
                estoqueOrigemId: movimentacao.estoqueOrigemId ? Number(movimentacao.estoqueOrigemId) : null,
                estoqueDestinoId: movimentacao.estoqueDestinoId ? Number(movimentacao.estoqueDestinoId) : null,
                quantidade: Number(movimentacao.quantidade),
                funcionarioId: Number(movimentacao.funcionarioId),
                dataMovimentacao: movimentacao.dataMovimentacao,
                observacao: movimentacao.observacao || null,
                valorUnitario: null, 
                materialEstoque: null 
            };
            
            // --- LÓGICA CORRIGIDA PARA TRANSFERÊNCIA E SAÍDA ---
            
            // 1. Se for TRANSFERENCIA:
            // Precisamos passar os dados do item de origem para o caso de precisar CRIAR o item no destino.
            if (tipoMov === 'TRANSFERENCIA') {
                if (insumoSelecionadoInfo) {
                    // Valor unitário para registro histórico
                    dtoParaApi.valorUnitario = Number(insumoSelecionadoInfo.valorUni);
                    
                    // Dados completos para criação do material no destino (se não existir)
                    dtoParaApi.materialEstoque = {
                        marcaId: Number(insumoSelecionadoInfo.marcaId), // ID da Marca é OBRIGATÓRIO
                        modelo: insumoSelecionadoInfo.modelo || "",
                        valor: Number(insumoSelecionadoInfo.valorUni), // Valor de Custo
                        quantidadeMinima: Number(insumoSelecionadoInfo.quantidadeMinima) || 0,
                        quantidadeMaxima: Number(insumoSelecionadoInfo.quantidadeMaxima) || 0
                    };
                }
            }

            // 2. Se for SAIDA ou AJUSTE:
            // Apenas precisamos do valor unitário para o histórico financeiro
            if (tipoMov === 'SAIDA' || tipoMov === 'AJUSTE') {
                if (insumoSelecionadoInfo && insumoSelecionadoInfo.valor) {
                    dtoParaApi.valorUnitario = Number(insumoSelecionadoInfo.valor);
                }
            }
            
            // 3. Se for ENTRADA (Novo Item):
            if (movimentacao.tipoMov === 'ENTRADA') {
                dtoParaApi.valorUnitario = Number(movimentacao.materialEstoque.valor);
                dtoParaApi.materialEstoque = {
                    estoqueId: Number(movimentacao.estoqueDestinoId),
                    materialId: Number(movimentacao.insumoId),
                    marcaId: Number(movimentacao.materialEstoque.marcaId),
                    modelo: movimentacao.materialEstoque.modelo || null,
                    valor: Number(movimentacao.materialEstoque.valor),
                    quantidadeAtual: Number(movimentacao.quantidade),
                    quantidadeMinima: movimentacao.materialEstoque.quantidadeMinima ? Number(movimentacao.materialEstoque.quantidadeMinima) : null,
                    quantidadeMaxima: movimentacao.materialEstoque.quantidadeMaxima ? Number(movimentacao.materialEstoque.quantidadeMaxima) : null
                };
            }

            // Ajuste especial para o backend (Ajuste geralmente ocorre no "destino" lógico ou na origem, depende da implementação)
            // No seu caso, ajustamos a origem.
            if (movimentacao.tipoMov === 'AJUSTE') {
                dtoParaApi.estoqueDestinoId = Number(movimentacao.estoqueOrigemId);
            }
            
            console.log("FRONTEND: Enviando payload:", JSON.stringify(dtoParaApi, null, 2));

            await api.post('/movEstoque/cadastrar', dtoParaApi, { withCredentials: true });
            toast.success("Movimentação registrada com sucesso!");
            limparCampos();
        } catch (error) {
            console.error(error);
            const mensagemErro = error.response?.data?.erro || error.response?.data?.message || "Erro ao registrar movimentação.";
            toast.error(mensagemErro, { autoClose: 5000 });
        } finally {
            setIsLoading(false);
        }
    };

    const limparCampos = () => {
        setMovimentacao({
            tipoMov: "", insumoId: "", estoqueOrigemId: "", estoqueDestinoId: "",
            quantidade: "", funcionarioId: "", dataMovimentacao: new Date().toISOString().split('T')[0],
            observacao: "", materialEstoque: { marcaId: "", modelo: "", valor: "", quantidadeMinima: "", quantidadeMaxima: "" }
        });
        setInsumosDisponiveis([]);
        setInsumoSelecionadoInfo(null);
        setUnidadeSelecionada(""); 
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Sidebar />
            <div className="ml-64">
                <Header />
                <div className="p-6">
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-cordes-blue">
                                    Movimentação de Estoque
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Registre entradas, saídas e transferências de insumos
                                </p>
                            </div>
                            {isCarregandoDados && (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>Carregando dados...</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                           <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                <i className="fas fa-info-circle"></i>
                                Tipos de Movimentação
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
                                <div><strong>ENTRADA:</strong> Novo item. Usa lista mestra. Requer Destino.</div>
                                <div><strong>SAÍDA/TRANSFERÊNCIA:</strong> Item existente. Requer Origem. Lista insumos da origem.</div>
                                <div><strong>AJUSTE:</strong> Item existente. Requer Estoque (Origem). Lista insumos da origem.</div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <FormSection title="Detalhes da Movimentação">
                                <DetalhesMovimentacao
                                    movimentacao={movimentacao}
                                    handleChange={handleChange}
                                    tipos={TIPOS_MOVIMENTACAO}
                                    
                                    insumos={
                                        (movimentacao.tipoMov === 'SAIDA' || movimentacao.tipoMov === 'TRANSFERENCIA' || movimentacao.tipoMov === 'AJUSTE')
                                        ? insumosDisponiveis.map(i => ({ 
                                            id: i.insumoId, 
                                            // ATENÇÃO: Usando 'i.material' e 'i.marcaNome' conforme a atualização do Backend DTO
                                            nomeCompleto: `${i.insumoNome} - ${i.marcaNome || 'S/ Marca'} (${i.modelo || ''}) - R$ ${i.valorUni} | Disp: ${i.quantidadeAtual} ${i.unidade}`,
                                            nome: i.material
                                          }))
                                        : insumosMestre 
                                    }
                                    
                                    estoques={estoques}
                                    loadingInsumos={loadingInsumos}
                                    insumoSelecionadoInfo={insumoSelecionadoInfo}
                                    unidadeSelecionada={unidadeSelecionada}
                                />
                            </FormSection>

                            {(movimentacao.tipoMov === 'ENTRADA') && (
                                <FormSection title="Detalhes do Material no Estoque (Novo Item)">
                                    <DetalhesMaterialEntrada
                                        materialEstoque={movimentacao.materialEstoque}
                                        handleMaterialChange={handleMaterialChange}
                                        marcas={marcas} 
                                    />
                                </FormSection>
                            )}

                            <FormSection title="Informações Adicionais">
                                <InfoAdicionais
                                    movimentacao={movimentacao}
                                    handleChange={handleChange}
                                    funcionarios={funcionarios}
                                />
                            </FormSection>

                            <ActionButtons
                                onSave={handleSubmit}
                                onClear={limparCampos}
                                isLoading={isLoading || isCarregandoDados || loadingInsumos}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
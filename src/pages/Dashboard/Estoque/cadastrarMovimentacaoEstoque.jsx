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

    const [insumos, setInsumos] = useState([]);
    const [estoques, setEstoques] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCarregandoDados, setIsCarregandoDados] = useState(true);

    useEffect(() => {
        carregarDadosIniciais();
    }, []);

    const carregarDadosIniciais = async () => {
        setIsCarregandoDados(true);
        try {
            console.log("Iniciando carregamento de dados...");

            const [insumosRes, estoquesRes, funcionariosRes, marcasRes] = await Promise.all([
                api.get("/insumo/listar", { withCredentials: true }),
                api.get("/estoque/listar", { withCredentials: true }),
                api.get("/funcionario/listar", { withCredentials: true }),
                api.get("/marca/listar", { withCredentials: true })
            ]);

            console.log("=== DADOS RECEBIDOS ===");
            console.log("Insumos:", insumosRes.data);
            console.log("Estoques:", estoquesRes.data);
            console.log("Funcionários:", funcionariosRes.data);
            console.log("Marcas RAW:", marcasRes.data);

            // Trata diferentes formatos de resposta da API
            const insumosData = insumosRes.data?.data || insumosRes.data || [];
            const estoquesData = estoquesRes.data?.data || estoquesRes.data || [];
            const funcionariosData = funcionariosRes.data?.data || funcionariosRes.data || [];
            const marcasData = marcasRes.data?.data || marcasRes.data || [];

            console.log("Marcas processadas:", marcasData);
            console.log("Marcas é array?", Array.isArray(marcasData));
            console.log("Quantidade de marcas:", marcasData.length);

            setInsumos(Array.isArray(insumosData) ? insumosData : []);
            setEstoques(Array.isArray(estoquesData) ? estoquesData : []);
            setFuncionarios(Array.isArray(funcionariosData) ? funcionariosData : []);
            setMarcas(Array.isArray(marcasData) ? marcasData : []);

            console.log("Estado de marcas atualizado");

            toast.success(`Dados carregados: ${insumosData.length} insumos, ${estoquesData.length} estoques, ${funcionariosData.length} funcionários, ${marcasData.length} marcas`);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            console.error("Detalhes do erro:", error.response?.data);
            toast.error(error.response?.data?.message || "Erro ao carregar dados do servidor.");
        } finally {
            setIsCarregandoDados(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMovimentacao(prev => ({ ...prev, [name]: value }));
    };

    const handleMaterialChange = (e) => {
        const { name, value } = e.target;
        setMovimentacao(prev => ({
            ...prev,
            materialEstoque: { ...prev.materialEstoque, [name]: value }
        }));
    };

    const validarCampos = () => {
        const { tipoMov, insumoId, quantidade, funcionarioId, estoqueOrigemId, estoqueDestinoId } = movimentacao;

        if (!tipoMov) {
            toast.warn("Selecione o tipo de movimentação.");
            return false;
        }

        if (!insumoId) {
            toast.warn("Selecione um insumo.");
            return false;
        }

        if (!quantidade || Number(quantidade) <= 0) {
            toast.warn("Informe uma quantidade válida.");
            return false;
        }

        if (!funcionarioId) {
            toast.warn("Selecione o funcionário responsável.");
            return false;
        }

        // Validações específicas por tipo
        if (tipoMov === 'TRANSFERENCIA') {
            if (!estoqueOrigemId) {
                toast.warn("Para transferência, selecione o estoque de origem.");
                return false;
            }
            if (!estoqueDestinoId) {
                toast.warn("Para transferência, selecione o estoque de destino.");
                return false;
            }
            if (estoqueOrigemId === estoqueDestinoId) {
                toast.warn("Os estoques de origem e destino devem ser diferentes.");
                return false;
            }
        }

        if (tipoMov === 'SAIDA' && !estoqueOrigemId) {
            toast.warn("Para saída, selecione o estoque de origem.");
            return false;
        }

        if ((tipoMov === 'ENTRADA' || tipoMov === 'AJUSTE') && !estoqueDestinoId) {
            toast.warn(`Para ${tipoMov.toLowerCase()}, selecione o estoque de destino.`);
            return false;
        }

        // Validação do MaterialEstoque para ENTRADA e AJUSTE
        if (tipoMov === 'ENTRADA' || tipoMov === 'AJUSTE') {
            if (!movimentacao.materialEstoque.valor || Number(movimentacao.materialEstoque.valor) <= 0) {
                toast.warn("Informe o valor unitário do material.");
                return false;
            }
            if (!movimentacao.materialEstoque.marcaId) {
                toast.warn("Selecione a marca do material.");
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validarCampos()) {
            return;
        }

        setIsLoading(true);
        try {
            // Preparar DTO básico conforme MovEstoqueDTO
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

            // Adiciona materialEstoque e valorUnitario apenas para ENTRADA e AJUSTE
            if (movimentacao.tipoMov === 'ENTRADA' || movimentacao.tipoMov === 'AJUSTE') {
                dtoParaApi.valorUnitario = Number(movimentacao.materialEstoque.valor);
                
                dtoParaApi.materialEstoque = {
                    estoqueId: Number(movimentacao.estoqueDestinoId),
                    materialId: Number(movimentacao.materialEstoque.materialId),
                    marcaId: Number(movimentacao.materialEstoque.marcaId),
                    modelo: movimentacao.materialEstoque.modelo || null,
                    valor: Number(movimentacao.materialEstoque.valor),
                    quantidadeAtual: Number(movimentacao.quantidade),
                    quantidadeMinima: movimentacao.materialEstoque.quantidadeMinima 
                        ? Number(movimentacao.materialEstoque.quantidadeMinima) 
                        : null,
                    quantidadeMaxima: movimentacao.materialEstoque.quantidadeMaxima 
                        ? Number(movimentacao.materialEstoque.quantidadeMaxima) 
                        : null
                };
            }

            console.log("=== PAYLOAD ENVIADO PARA API ===");
            console.log(JSON.stringify(dtoParaApi, null, 2));

            const response = await api.post('/movEstoque/cadastrar', dtoParaApi, { withCredentials: true });

            console.log("=== RESPOSTA DA API ===");
            console.log(response.data);

            toast.success("Movimentação registrada com sucesso!");
            limparCampos();
        } catch (error) {
            console.error("=== ERRO AO REGISTRAR ===");
            console.error("Erro completo:", error);
            console.error("Response data:", error.response?.data);
            console.error("Status:", error.response?.status);
            
            const mensagemErro = error.response?.data?.erro 
                || error.response?.data?.message 
                || error.response?.data?.error
                || "Erro ao registrar movimentação. Verifique o console para mais detalhes.";
            
            toast.error(mensagemErro, { autoClose: 5000 });
        } finally {
            setIsLoading(false);
        }
    };

    const limparCampos = () => {
        setMovimentacao({
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
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Sidebar />
            <div className="ml-64">
                <Header />
                <div className="p-6">
                    <div className="bg-white rounded-xl shadow-md p-8">
                        {/* Cabeçalho */}
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

                        {/* Informativo sobre tipos de movimentação */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                <i className="fas fa-info-circle"></i>
                                Tipos de Movimentação
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
                                <div>
                                    <strong>ENTRADA:</strong> Compra ou reposição de material
                                </div>
                                <div>
                                    <strong>SAÍDA:</strong> Uso ou consumo do material
                                </div>
                                <div>
                                    <strong>TRANSFERÊNCIA:</strong> Movimentação entre estoques
                                </div>
                                <div>
                                    <strong>AJUSTE:</strong> Correção manual de inventário
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <FormSection title="Detalhes da Movimentação">
                                <DetalhesMovimentacao
                                    movimentacao={movimentacao}
                                    handleChange={handleChange}
                                    tipos={TIPOS_MOVIMENTACAO}
                                    insumos={insumos}
                                    estoques={estoques}
                                />
                            </FormSection>

                            {(movimentacao.tipoMov === 'ENTRADA' || movimentacao.tipoMov === 'AJUSTE') && (
                                <FormSection title="Detalhes do Material no Estoque">
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
                                isLoading={isLoading || isCarregandoDados}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
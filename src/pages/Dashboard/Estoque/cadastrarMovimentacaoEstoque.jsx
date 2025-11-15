import { useState, useEffect } from "react";
import { toast } from 'react-toastify';

// Caminhos ajustados conforme sua estrutura
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";

// Componentes agora importados da pasta de componentes principal
import FormSection from "../../../components/FormSection";
import DetalhesMovimentacao from "../../../components/DetalhesMovimentacao";
import DetalhesMaterialEntrada from "../../../components/DetalhesMaterialEntrada";
import InfoAdicionais from "../../../components/InfoAdicionais";
import ActionButtons from "../../../components/ActionButtons";

// PASSO 1: Importar o serviço de API
import { api } from "../../../services/api";

const TIPOS_MOVIMENTACAO = ["ENTRADA", "SAIDA", "TRANSFERENCIA", "AJUSTE"];

export default function CadastrarMovimentacaoEstoque() {
    const [movimentacao, setMovimentacao] = useState({
        tipoMov: "", insumoId: "", estoqueOrigemId: "", estoqueDestinoId: "",
        quantidade: "", funcionarioId: "", dataMovimentacao: new Date().toISOString().split('T')[0],
        observacao: "", materialEstoque: { valor: "", quantidadeMinima: "", quantidadeMaxima: "" }
    });

    const [insumos, setInsumos] = useState([]);
    const [estoques, setEstoques] = useState([]);
    const [funcionarios, setFuncionarios] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDadosCarregados, setIsDadosCarregados] = useState(false); // Para carregar dados iniciais
    
    useEffect(() => {
        // PASSO 2: Alterar a função para async e chamar a API
        const carregarDadosIniciais = async () => {
            setIsDadosCarregados(true); // Evita recarregar
            try {
                // Carrega todos os dados em paralelo
                const [insumosRes, estoquesRes, funcionariosRes] = await Promise.all([
                    api.get("/insumo/listar"),       //
                    api.get("/estoque/listar"),      //
                    api.get("/funcionario/listar") //
                ]);

                // PASSO 3: Atualizar o estado com os dados reais da API
                // (response.data.data) é o padrão do seu ApiResponse
                setInsumos(insumosRes.data.data || []);
                setEstoques(estoquesRes.data.data || []);
                setFuncionarios(funcionariosRes.data.data || []);
                
            } catch (error) {
                toast.error("Erro ao carregar dados do servidor.");
                console.error("Erro ao carregar dados:", error);
            } finally {
                setIsDadosCarregados(false);
            }
        };
        
        if (!isDadosCarregados) {
            carregarDadosIniciais();
        }
    }, [isDadosCarregados]); // Dependência atualizada

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

    const handleSubmit = async () => {
        // Lógica de validação...
        if (!movimentacao.tipoMov || !movimentacao.insumoId || !movimentacao.quantidade || !movimentacao.funcionarioId) {
            toast.warn("Preencha todos os campos obrigatórios (*).");
            return;
        }

        setIsLoading(true);
        try {
            // PASSO 4: Preparar o DTO para o backend
            const dtoParaApi = {
                ...movimentacao,
                // Garantir que os IDs sejam números e campos vazios sejam nulos
                insumoId: Number(movimentacao.insumoId),
                estoqueOrigemId: movimentacao.estoqueOrigemId ? Number(movimentacao.estoqueOrigemId) : null,
                estoqueDestinoId: movimentacao.estoqueDestinoId ? Number(movimentacao.estoqueDestinoId) : null,
                quantidade: Number(movimentacao.quantidade),
                funcionarioId: Number(movimentacao.funcionarioId),
                materialEstoque: {
                    ...movimentacao.materialEstoque,
                    valor: Number(movimentacao.materialEstoque.valor) || 0,
                    quantidadeMinima: Number(movimentacao.materialEstoque.quantidadeMinima) || 0,
                    quantidadeMaxima: Number(movimentacao.materialEstoque.quantidadeMaxima) || 0,
                }
            };
            
            // Se não for ENTRADA ou AJUSTE, não enviar os detalhes do materialEstoque
            if (movimentacao.tipoMov !== 'ENTRADA' && movimentacao.tipoMov !== 'AJUSTE') {
                delete dtoParaApi.materialEstoque;
            }

            console.log("Enviando para API:", dtoParaApi);
            
            // PASSO 5: Chamar a API de cadastro de movimentação
            await api.post('/movEstoque/cadastrar', dtoParaApi); //

            toast.success("Movimentação registrada com sucesso!");
            limparCampos();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao registrar movimentação.");
            console.error("Erro no handleSubmit:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const limparCampos = () => {
        setMovimentacao({
            tipoMov: "", insumoId: "", estoqueOrigemId: "", estoqueDestinoId: "",
            quantidade: "", funcionarioId: "", dataMovimentacao: new Date().toISOString().split('T')[0],
            observacao: "", materialEstoque: { valor: "", quantidadeMinima: "", quantidadeMaxima: "" }
        });
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Sidebar />
            <div className="ml-64">
                <Header />
                <div className="p-6">
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <h1 className="text-3xl font-bold text-cordes-blue">Movimentação de Estoque</h1>
                        <p className="text-gray-600 mt-2 mb-8">Registre entradas, saídas e transferências de insumos</p>

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
                                isLoading={isLoading || isDadosCarregados}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
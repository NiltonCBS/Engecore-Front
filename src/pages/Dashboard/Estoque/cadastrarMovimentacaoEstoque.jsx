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

// Supondo um serviço de API configurado
// import api from "../../../services/api";

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
    
    useEffect(() => {
        const carregarDadosIniciais = async () => {
            try {
                // MOCK DATA - Substitua por chamadas reais à sua API
                setInsumos([{ id: 1, nome: "Cimento Votoran CP II" }, { id: 2, nome: "Tijolo Baiano 8 Furos" }]);
                setEstoques([{ id: 1, nome: "Estoque Central" }, { id: 2, nome: "Estoque Obra ABC" }]);
                setFuncionarios([{ id: 1, nome: "João Almoxarife" }, { id: 2, nome: "Maria Gestora" }]);
            // eslint-disable-next-line no-unused-vars
            } catch (error) {
                toast.error("Erro ao carregar dados do servidor.");
            }
        };
        carregarDadosIniciais();
    }, []);

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
        // Lógica de validação e submissão...
        setIsLoading(true);
        try {
            console.log("Enviando para API...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Movimentação registrada com sucesso!");
            limparCampos();
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error("Erro ao registrar movimentação.");
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
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
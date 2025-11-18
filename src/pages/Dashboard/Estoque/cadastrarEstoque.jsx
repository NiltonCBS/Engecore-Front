import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";
import FormSection from "../../../components/FormSection.jsx";
import ActionButtons from "../../../components/ActionButtons.jsx";
import { toast } from 'react-toastify';
import { api } from "../../../services/api.js";
import { useNavigate } from "react-router-dom";
import obrasService from "../../../services/obrasService.js";

export default function CadastrarEstoque() {
    const [nome, setNome] = useState("");
    // Removido 'localizacao'
    const [obraId, setObraId] = useState("");

    // Estados para carregar a lista de obras
    const [obras, setObras] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Carregar lista de obras ao montar
    useEffect(() => {
        const fetchObras = async () => {
            setLoadingData(true);
            try {
                const data = await obrasService.listarObras();
                // Mapeia para o formato de select { id, nome }
                setObras(data.map(o => ({ id: o.idObra, nome: o.nomeObra })));
            } catch (error) {
                toast.error("Erro ao carregar lista de obras.");
            } finally {
                setLoadingData(false);
            }
        };
        fetchObras();
    }, []);


    const handleSubmit = async () => {
        if (!nome) {
            toast.warn("O nome do estoque é obrigatório.");
            return;
        }

        const obraIdNumber = obraId ? Number(obraId) : null;

        // Determina o tipo com base se a obra foi selecionada ou não.
        // Se obraIdNumber for diferente de null, o tipo é OBRA, senão é EMPRESA.
        const tipoEstoque = obraIdNumber ? "OBRA" : "EMPRESA";

        setLoading(true);
        try {
            const payload = {
                nome,
                estoqueMateriais: [],
                obra: obraIdNumber,
                tipo: tipoEstoque
            };
            
            console.log("Payload enviado:", payload);

            await api.post("/estoque/cadastrar", payload, { withCredentials: true });

            toast.success("Estoque cadastrado com sucesso!");
            limparCampos();
            navigate("/estoque/listar-estoques");

        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao cadastrar estoque.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const limparCampos = () => {
        setNome("");
        setObraId("");
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
                                    Cadastrar Novo Estoque
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Crie um novo local de armazenamento (Estoque de Obra ou da Empresa).
                                </p>
                            </div>
                        </div>

                        {/* Exibe carregamento de dados */}
                        {loadingData && (
                            <div className="text-center p-10">
                                <i className="fas fa-spinner fa-spin text-4xl text-cordes-blue"></i>
                                <p className="mt-2 text-gray-600">Carregando dados de obras...</p>
                            </div>
                        )}

                        {!loadingData && (
                            <div className="space-y-8">
                                <FormSection title="Detalhes do Estoque">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        
                                        {/* Nome do Estoque */}
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">Nome do Estoque *</label>
                                            <input
                                                type="text"
                                                name="nome"
                                                value={nome}
                                                onChange={(e) => setNome(e.target.value)}
                                                placeholder="Ex: Almoxarifado Central"
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                                            />
                                        </div>
                                        
                                        {/* Tipo de Estoque (Automático) */}
                                        <div className="w-full border border-gray-300 rounded-lg p-3 flex">
                                            <i className={`fas ${obraId ? 'fa-building-columns text-green-600' : 'fa-industry text-blue-600'} mr-3`}></i>
                                            <div>
                                                <label className="block text-gray-700 font-medium text-sm">Tipo de Estoque</label>
                                                <span className="font-bold text-gray-900">
                                                    {obraId ? "OBRA" : "EMPRESA"}
                                                </span>
                                            </div>
                                        </div>


                                        {/* Select para Obra Relacionada */}
                                        <div className="md:col-span-2">
                                            <label className="block text-gray-700 font-medium mb-2">Obra Relacionada</label>
                                            <select
                                                name="obraId"
                                                value={obraId}
                                                onChange={(e) => setObraId(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                                            >
                                                <option value="">(Opcional) Estoque geral da empresa</option>
                                                {obras.map(obra => (
                                                    <option key={obra.id} value={obra.id}>{obra.nome}</option>
                                                ))}
                                            </select>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Selecione uma obra para que o estoque seja do tipo **OBRA**. Se vazio, será do tipo **EMPRESA**.
                                            </p>
                                        </div>
                                    </div>
                                </FormSection>

                                <ActionButtons
                                    onSave={handleSubmit}
                                    onClear={limparCampos}
                                    isLoading={loading}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
import { useState } from "react";
import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";
import FormSection from "../../../components/FormSection.jsx";
import ActionButtons from "../../../components/ActionButtons.jsx";
import { toast } from 'react-toastify';
import { api } from "../../../services/api.js";
import { useNavigate } from "react-router-dom";

export default function CadastrarEstoque() {
    const [nome, setNome] = useState("");
    const [localizacao, setLocalizacao] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!nome) {
            toast.warn("O nome do estoque é obrigatório.");
            return;
        }

        setLoading(true);
        try {
            const payload = { nome, localizacao };
            await api.post("/estoque/cadastrar", payload, { withCredentials: true });
            
            toast.success("Estoque cadastrado com sucesso!");
            limparCampos();
            navigate("/estoque/listar-estoques"); // Navega para a lista após o cadastro

        } catch (error)
        {
            toast.error(error.response?.data?.message || "Erro ao cadastrar estoque.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const limparCampos = () => {
        setNome("");
        setLocalizacao("");
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
                                    Crie um novo local de armazenamento (ex: Almoxarifado, Obra X).
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <FormSection title="Detalhes do Estoque">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">Localização</label>
                                        <input
                                            type="text"
                                            name="localizacao"
                                            value={localizacao}
                                            onChange={(e) => setLocalizacao(e.target.value)}
                                            placeholder="Ex: Galpão A, Prateleira 5"
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                                        />
                                    </div>
                                </div>
                            </FormSection>

                            <ActionButtons
                                onSave={handleSubmit}
                                onClear={limparCampos}
                                isLoading={loading}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
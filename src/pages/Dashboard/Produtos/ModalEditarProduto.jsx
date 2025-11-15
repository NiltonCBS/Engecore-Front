import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { api } from "../../../services/api.js";

const unidadesMedida = [
    "UN",
    "KG",
    "G",
    "L",
    "ML",
    "M",
    "CM",
    "MM",
    "PACOTE",
    "JOGO",
    "ROLO",
    "M2",
    "M3",
];

export default function ModalEditarProduto({
    isOpen,
    onClose,
    produto,
    onProdutoAtualizado,
}) {
    const [formData, setFormData] = useState({ nome: "", unidade: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (produto) {
            setFormData({
                nome: produto.nome || "",
                unidade: produto.unidadeMedida || "",
            });
        }
    }, [produto, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nome || !formData.unidade) {
            toast.warn("Nome e Unidade são obrigatórios.");
            return;
        }

        setLoading(true);

        const insumoDTO = {
            nome: formData.nome,
            unidade: formData.unidade,
        };

        try {
            // 1. Faz a chamada PUT para a API
            const response = await api.put(
                `/insumo/alterar/${produto.id}`,
                insumoDTO
            );
            onProdutoAtualizado(response.data.data);
            toast.success("Insumo atualizado com sucesso!");
            onClose();
        } catch (error) {
            toast.error(
                "Erro ao atualizar insumo: " +
                (error.response?.data?.message || "Erro desconhecido.")
            );
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b bg-gray-50 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Editar Insumo: {produto.nome}
                        </h2>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Nome do Insumo *
                            </label>
                            <input
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Unidade de Medida *
                            </label>
                            <select
                                name="unidade"
                                value={formData.unidade}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                            >
                                <option value="">Selecione a unidade</option>
                                {unidadesMedida.map((u) => (
                                    <option key={u} value={u}>
                                        {u}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t mt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-3 px-6 rounded-lg shadow-md hover:bg-blue-600 hover:text-white transition disabled:opacity-50"
                        >
                            {loading ? "Salvando..." : "Salvar Alterações"}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

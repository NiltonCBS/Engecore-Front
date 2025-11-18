import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api.js";

export default function ModalEditarEstoque({ isOpen, onClose, estoque, onEstoqueAtualizado }) {
    const [formData, setFormData] = useState({ nome: "", localizacao: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (estoque) {
            setFormData({
                nome: estoque.nome || "",
                localizacao: estoque.localizacao || "",
            });
        }
    }, [estoque, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nome) {
            toast.warn("O nome do estoque é obrigatório.");
            return;
        }

        setLoading(true);
        try {
            const payload = { ...formData };
            // A API de alterar espera o DTO e o ID
            const response = await api.put(
                `/estoque/alterar/${estoque.id}`,
                payload
            );
            
            // O backend retorna o DTO atualizado
            onEstoqueAtualizado(response.data.data || response.data); 

        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao atualizar estoque.");
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
                            Editar Estoque: {estoque.nome}
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
                                Nome do Estoque *
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
                                Localização
                            </label>
                            <input
                                type="text"
                                name="localizacao"
                                value={formData.localizacao}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
                        >
                            {loading ? (
                                <><i className="fas fa-spinner fa-spin mr-2"></i>Salvando...</>
                            ) : (
                                <><i className="fas fa-save mr-2"></i>Salvar Alterações</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
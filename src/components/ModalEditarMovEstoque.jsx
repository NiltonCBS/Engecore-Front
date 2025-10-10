import { useState, useEffect } from "react";

const TIPOS_MOVIMENTACAO = ["ENTRADA", "SAIDA", "TRANSFERENCIA", "AJUSTE"];

export default function ModalEditarMovEstoque({ movimentacao, onClose, onSave }) {
    const [formData, setFormData] = useState(movimentacao);

    useEffect(() => {
        setFormData(movimentacao);
    }, [movimentacao]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-cordes-blue">Editar Movimentação #{formData.id}</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Tipo</label>
                            <select name="tipoMov" value={formData.tipoMov} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3">
                                {TIPOS_MOVIMENTACAO.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Insumo</label>
                            {/* Em um cenário real, você passaria a lista de insumos como prop */}
                            <input type="text" readOnly disabled value={formData.material} className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Quantidade</label>
                            <input type="number" name="quantidade" value={formData.quantidade} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Data</label>
                            <input type="date" name="dataMovimentacao" value={formData.dataMovimentacao} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" />
                        </div>
                         {/* Adicione mais campos se necessário para edição */}
                    </div>
                </form>
                
                <div className="p-6 border-t flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-cordes-blue text-white rounded-lg hover:bg-blue-700">
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
}


import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { api } from "../../../services/api.js"; 

export default function ModalEditarProdutoFornecedor({ 
  isOpen, 
  onClose, 
  produto, 
  onProdutoAtualizado,
  // Recebe as listas como props para não recarregar
  listaInsumos,
  listaFornecedores,
  listaMarcas
}) {
  
  const [formData, setFormData] = useState({
    insumoId: "",
    fornecedorId: "",
    marcaId: "",
    modelo: "",
    valor: "",
    prazoEntrega: "",
    condicaoPagamento: "",
    observacoes: ""
  });

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Carrega os dados do produto selecionado no formulário
  useEffect(() => {
    if (produto) {
      setFormData({
        insumoId: produto.insumoId || "",
        fornecedorId: produto.fornecedorId || "",
        marcaId: produto.marcaId || "",
        modelo: produto.modelo || "",
        valor: produto.valor || "",
        prazoEntrega: produto.prazoEntrega || "",
        condicaoPagamento: produto.condicaoPagamento || "",
        observacoes: produto.observacoes || ""
      });
    }
  }, [produto, isOpen]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoadingSubmit(true);
    
    // Validações
    if (!formData.insumoId || !formData.fornecedorId || !formData.marcaId || !formData.modelo || !formData.valor) {
      toast.warn("Por favor, preencha os campos obrigatórios (*).");
      setLoadingSubmit(false);
      return;
    }

    // Preparar payload
    const payload = {
      insumoId: Number(formData.insumoId),
      fornecedorId: Number(formData.fornecedorId),
      marcaId: Number(formData.marcaId),
      modelo: formData.modelo,
      valor: Number(formData.valor),
      prazoEntrega: formData.prazoEntrega,
      condicaoPagamento: formData.condicaoPagamento,
      observacoes: formData.observacoes
    };

    try {
      console.log("Atualizando payload:", payload);
      // A API é de "cadastrar-atualizar" (upsert)
      const response = await api.post("/produtos-fornecedor/cadastrar-atualizar", payload);
      
      if (response.data.success) {
        // Retorna a entidade atualizada (conforme o backend)
        onProdutoAtualizado(response.data.data);
      } else {
        toast.error(response.data.message || "Erro ao salvar o produto.");
      }
    
    } catch (error) {
      console.error("Erro ao atualizar produto do fornecedor:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Erro desconhecido. Tente novamente.");
    } finally {
        setLoadingSubmit(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b bg-gray-50 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Editar Produto do Fornecedor</h2>
              <button
                onClick={onClose}
                disabled={loadingSubmit}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
        </div>
      
        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="p-6">
          <div className="space-y-8">
            {/* Informações Básicas */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Vincular Produto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Fornecedor *</label>
                  <select
                    name="fornecedorId"
                    value={formData.fornecedorId}
                    onChange={handleChange}
                    disabled // Desabilitado pois faz parte da "chave" de upsert
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue bg-gray-200"
                  >
                    <option value="">Selecione o fornecedor</option>
                    {listaFornecedores.map(f => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Insumo (Produto Mestre) *</label>
                  <select
                    name="insumoId"
                    value={formData.insumoId}
                    onChange={handleChange}
                    disabled // Desabilitado pois faz parte da "chave" de upsert
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue bg-gray-200"
                  >
                    <option value="">Selecione o insumo</option>
                    {listaInsumos.map(i => (
                      <option key={i.id} value={i.id}>{i.nome} ({i.unidade})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Marca *</label>
                  <select
                    name="marcaId"
                    value={formData.marcaId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                  >
                    <option value="">Selecione a marca</option>
                    {listaMarcas.map(m => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Detalhes da Oferta */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Detalhes da Oferta</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Modelo / Especificação *</label>
                  <input
                    type="text"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    placeholder="Ex: Saco 50kg, Barra 12m"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Valor (R$) *</label>
                  <input
                    type="number"
                    name="valor"
                    value={formData.valor}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Prazo de Entrega</label>
                  <input
                    type="text"
                    name="prazoEntrega"
                    value={formData.prazoEntrega}
                    onChange={handleChange}
                    placeholder="Ex: 5 dias úteis"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-medium mb-2">Condição de Pagamento</label>
                  <input
                    type="text"
                    name="condicaoPagamento"
                    value={formData.condicaoPagamento}
                    onChange={handleChange}
                    placeholder="Ex: 30 dias, Boleto 30/60"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-gray-700 font-medium mb-2">Observações</label>
                  <textarea
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    placeholder="Ex: Frete grátis acima de 10 unidades"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-4 pt-6 border-t sticky bottom-0 bg-white pb-6 px-6 -mx-6">
              <button
                type="button"
                onClick={onClose}
                disabled={loadingSubmit}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition duration-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loadingSubmit}
                className="flex-1 bg-blue-700 text-white font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {loadingSubmit ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Salvando...</>
                ) : (
                  <><i className="fas fa-save mr-2"></i>Salvar Alterações</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
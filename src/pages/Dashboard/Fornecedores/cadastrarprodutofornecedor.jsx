import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";
import { toast } from 'react-toastify';
import { api } from "../../../services/api.js"; 

export default function CadastrarProdutoFornecedor() {
  
  // Estado para o formulário
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

  // Estados para carregar os dropdowns
  const [insumos, setInsumos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [marcas, setMarcas] = useState([]);
  
  // Estados de loading
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Carregar dados dos dropdowns (Insumos, Fornecedores, Marcas)
  useEffect(() => {
    async function carregarDados() {
      setLoadingData(true);
      try {
        const [insumosRes, fornecedoresRes, marcasRes] = await Promise.all([
          api.get("/insumo/listar"),
          api.get("/fornecedor/listar"),
          api.get("/marca/listar")
        ]);

        if (insumosRes.data.success) {
          setInsumos(insumosRes.data.data);
        } else {
          toast.error("Erro ao carregar insumos.");
        }

        if (fornecedoresRes.data.success) {
          // Mapeia para um formato mais simples, caso o DTO seja complexo
          setFornecedores(fornecedoresRes.data.data.map(f => ({
            id: f.id,
            nome: f.nome || f.nomeFantasia,
          })));
        } else {
          toast.error("Erro ao carregar fornecedores.");
        }
        
        if (marcasRes.data.success) {
          setMarcas(marcasRes.data.data);
        } else {
          toast.error("Erro ao carregar marcas.");
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados para o formulário.");
      } finally {
        setLoadingData(false);
      }
    }
    carregarDados();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const limparCampos = () => {
    setFormData({
      insumoId: "",
      fornecedorId: "",
      marcaId: "",
      modelo: "",
      valor: "",
      prazoEntrega: "",
      condicaoPagamento: "",
      observacoes: ""
    });
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
      console.log("Enviando payload:", payload);
      // Usar a rota do controller ProdutoFornecedorController
      const response = await api.post("/produtos-fornecedor/cadastrar-atualizar", payload);
      
      if (response.data.success) {
        toast.success("Produto cadastrado para o fornecedor com sucesso!");
        limparCampos();
      } else {
        toast.error(response.data.message || "Erro ao salvar o produto.");
      }
    
    } catch (error) {
      console.error("Erro ao cadastrar produto do fornecedor:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Erro desconhecido. Tente novamente.");
    } finally {
        setLoadingSubmit(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-cordes-blue">Cadastrar Produto por Fornecedor</h1>
                <p className="text-gray-600 mt-2">Vincule um insumo a um fornecedor, definindo marca e preço.</p>
              </div>
            </div>

            {loadingData ? (
              <div className="text-center p-10">
                <i className="fas fa-spinner fa-spin text-4xl text-cordes-blue"></i>
                <p className="text-gray-600 mt-2">Carregando dados...</p>
              </div>
            ) : (
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
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                      >
                        <option value="">Selecione o fornecedor</option>
                        {fornecedores.map(f => (
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
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                      >
                        <option value="">Selecione o insumo</option>
                        {insumos.map(i => (
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
                        {marcas.map(m => (
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
                <div className="flex gap-4 pt-6 border-t">
                  <button
                    onClick={handleSubmit}
                    disabled={loadingSubmit || loadingData}
                    className="flex-1 bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loadingSubmit ? (
                      <><i className="fas fa-spinner fa-spin mr-2"></i>Salvando...</>
                    ) : (
                      <><i className="fas fa-save mr-2"></i>Salvar Produto do Fornecedor</>
                    )}
                  </button>
                  <button
                    onClick={limparCampos}
                    disabled={loadingSubmit || loadingData}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 disabled:opacity-50"
                  >
                    <i className="fas fa-eraser mr-2"></i>
                    Limpar Campos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
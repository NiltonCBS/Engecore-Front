import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { api } from "../../../services/api.js";

// Enums (idealmente viriam da API, mas definidos localmente por enquanto)
const tiposObra = ["RESIDENCIAL", "COMERCIAL", "INFRAESTRUTURA"];
const statusConst = ["PLANEJAMENTO", "EM_ANDAMENTO", "CONCLUIDA", "CANCELADA"];
const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function ModalEditarObra({ isOpen, onClose, obra, onObraAtualizada }) {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clientesLista, setClientesLista] = useState([]);
  const [funcionariosLista, setFuncionariosLista] = useState([]);

  // Carrega dados dos dropdowns (clientes, funcionários)
  useEffect(() => {
    if (!isOpen) return; // Só carrega se o modal estiver aberto

    async function carregarDadosDropdown() {
      try {
        const [clientesRes, funcionariosRes] = await Promise.all([
          api.get("/cliente/listar"),
          api.get("/funcionario/listar")
        ]);
        setClientesLista(clientesRes.data.data || []);
        setFuncionariosLista(funcionariosRes.data.data || []);
      } catch (error) {
        toast.error("Erro ao carregar dados de suporte para edição.");
      }
    }
    carregarDadosDropdown();
  }, [isOpen]);

  // Carrega os dados da obra selecionada no formulário
  useEffect(() => {
    if (obra) {
      // Mapeia o ObrasDTO para o estado do formulário
      setFormData({
        idObra: obra.id,
        nomeObra: obra.nome || "",
        clienteId: clientesLista.find(c => c.nome === obra.cliente)?.id || "", // Tenta achar o ID pelo nome
        responsavelId: funcionariosLista.find(f => f.nome === obra.engenheiro)?.id || "", // Tenta achar o ID pelo nome
        status: obra.status || "PLANEJAMENTO",
        tipo: obra.categoria || "", // 'categoria' no frontend é 'tipo' no backend
        endereco: {
          rua: obra.endereco?.split(',')[0] || "", // Lógica simples de split, pode precisar de ajuste
          numero: obra.endereco?.split(',')[1]?.split('-')[0]?.trim() || "",
          cidade: obra.endereco?.split('-')[1]?.trim() || "",
          // O DTO completo (ObrasDTO) tem mais campos de endereço
          // Se o 'obra' prop não tiver, preenchemos com o básico
          complemento: obra.endereco?.complemento || "",
          bairro: obra.endereco?.bairro || "",
          estado: obra.endereco?.estado || "",
          cep: obra.endereco?.cep || ""
        },
        dataInicio: obra.dataInicio || "",
        dataPrevistaConclusao: obra.previsaoTermino || "",
        valorTotal: obra.valorContrato || 0,
        // Adicione outros campos do ObrasDTO se necessário
        totalUnidades: obra.progresso > 0 ? 100 : 0, // Mock, pois progresso não está no DTO
        unidadesConcluidas: obra.progresso || 0,
      });
    }
  }, [obra, clientesLista, funcionariosLista]); // Recarrega se o 'obra' ou as listas mudarem

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [outerKey, innerKey] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [outerKey]: { ...prev[outerKey], [innerKey]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nomeObra || !formData.clienteId || !formData.tipo) {
      toast.warn("Nome, Cliente e Categoria são obrigatórios.");
      return;
    }

    setLoading(true);

    // Constrói o ObrasDTO para enviar ao backend
    const dtoParaEnviar = {
      ...formData,
      // Garante que os IDs sejam números
      clienteId: parseInt(formData.clienteId),
      responsavelId: parseInt(formData.responsavelId),
      valorTotal: parseFloat(formData.valorTotal),
      totalUnidades: parseInt(formData.totalUnidades),
      unidadesConcluidas: parseInt(formData.unidadesConcluidas),
      // Remove campos que não devem ir se estiverem vazios
      dataInicio: formData.dataInicio || null,
      dataPrevistaConclusao: formData.dataPrevistaConclusao || null,
    };
    
    try {
      // Chama o endpoint PUT do backend
      const response = await api.put(`/obras/alterar/${formData.idObra}`, dtoParaEnviar);
      
      onObraAtualizada(response.data.data); // Envia o ObrasDTO atualizado de volta para a lista
      toast.success("Obra atualizada com sucesso!");
      onClose(); // Fecha o modal
    } catch (error) {
      toast.error("Erro ao atualizar obra: " + (error.response?.data?.message || "Erro desconhecido."));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Funções de formatação (copiadas de cadastrarobra.jsx)
  const formatarCep = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    return numeros.slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleCepChange = (e) => {
    const valorFormatado = formatarCep(e.target.value);
    setFormData(prev => ({
      ...prev,
      endereco: { ...prev.endereco, cep: valorFormatado }
    }));
    // Aqui você também pode adicionar a busca de CEP (viaCEP)
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b bg-gray-50 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Editar Obra: {obra.nome}</h2>
            <button onClick={onClose} disabled={loading} className="text-gray-500 hover:text-gray-700 disabled:opacity-50">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-8">
            {/* Informações Básicas */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informações Básicas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nome da Obra *</label>
                  <input
                    type="text"
                    name="nomeObra"
                    value={formData.nomeObra}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Cliente *</label>
                  <select
                    name="clienteId"
                    value={formData.clienteId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3"
                  >
                    <option value="">Selecione o cliente</option>
                    {clientesLista.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3"
                  >
                    {statusConst.map(status => (
                      <option key={status} value={status}>{status.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Endereço da Obra */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Endereço</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-gray-700 font-medium mb-2">CEP</label>
                    <input
                      type="text"
                      name="endereco.cep"
                      value={formData.endereco.cep}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      className="w-full border border-gray-300 rounded-lg p-3"
                      maxLength="9"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">Rua</label>
                    <input
                      type="text"
                      name="endereco.rua"
                      value={formData.endereco.rua}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Número</label>
                    <input
                      type="text"
                      name="endereco.numero"
                      value={formData.endereco.numero}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Bairro</label>
                    <input
                      type="text"
                      name="endereco.bairro"
                      value={formData.endereco.bairro}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Cidade</label>
                    <input
                      type="text"
                      name="endereco.cidade"
                      value={formData.endereco.cidade}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Estado</label>
                    <select
                      name="endereco.estado"
                      value={formData.endereco.estado}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    >
                      <option value="">Selecione</option>
                      {estados.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
              </div>
            </div>

            {/* Dados Técnicos */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Dados Técnicos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Categoria *</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3"
                  >
                    <option value="">Selecione</option>
                    {tiposObra.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Data de Início</label>
                  <input
                    type="date"
                    name="dataInicio"
                    value={formData.dataInicio}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Previsão de Término</label>
                  <input
                    type="date"
                    name="dataPrevistaConclusao"
                    value={formData.dataPrevistaConclusao}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Valor Total (Orçado)</label>
                  <input
                    type="number"
                    name="valorTotal"
                    value={formData.valorTotal}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg p-3"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Responsável Técnico</label>
                  <select
                    name="responsavelId"
                    value={formData.responsavelId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3"
                  >
                    <option value="">Selecione</option>
                    {funcionariosLista.map(func => (
                      <option key={func.id} value={func.id}>{func.nome} ({func.cargo})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition duration-300 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
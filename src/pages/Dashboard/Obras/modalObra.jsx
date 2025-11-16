import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import obrasService from "../../../services/obrasService";

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
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [clientesLista, setClientesLista] = useState([]);
  const [funcionariosLista, setFuncionariosLista] = useState([]);

  // Carrega dados dos dropdowns e dados completos da obra
  useEffect(() => {
    if (!isOpen || !obra) return;

    async function carregarDados() {
      setCarregandoDados(true);
      try {
        console.log("=== INICIANDO CARREGAMENTO ===");
        console.log("Obra recebida na prop:", obra);
        
        // Busca o ID correto (pode vir como 'id' ou 'idObra')
        const obraId = obra.id || obra.idObra;
        console.log("ID extraído:", obraId);
        
        if (!obraId) {
          toast.error("ID da obra não encontrado");
          onClose();
          return;
        }

        // Carrega clientes, funcionários e dados completos da obra em paralelo
        const [clientesRes, funcionariosRes, obraCompleta] = await Promise.all([
          obrasService.listarClientes(),
          obrasService.listarFuncionarios(),
          obrasService.buscarObraPorId(obraId)
        ]);

        console.log("Obra completa do backend:", obraCompleta);

        setClientesLista(clientesRes);
        setFuncionariosLista(funcionariosRes);

        // Usa o método do service para formatar os dados da obra para edição
        const dadosFormatados = obrasService.formatarObraParaEdicao(obraCompleta);
        console.log("Dados formatados para o form:", dadosFormatados);
        
        setFormData(dadosFormatados);

      } catch (error) {
        toast.error("Erro ao carregar dados da obra: " + (error.message || "Erro desconhecido"));
        console.error("Erro no carregamento:", error);
        onClose(); // Fecha o modal em caso de erro
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarDados();
  }, [isOpen, obra, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [outerKey, innerKey] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [outerKey]: { ...prev[outerKey], [innerKey]: value }
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
  };

  const handleCepChange = async (e) => {
    const valorFormatado = formatarCep(e.target.value);
    setFormData(prev => ({
      ...prev,
      endereco: { ...prev.endereco, cep: valorFormatado }
    }));

    // Busca o CEP automaticamente quando estiver completo
    const numeros = valorFormatado.replace(/\D/g, '');
    if (numeros.length === 8) {
      try {
        const dadosCep = await obrasService.buscarCep(valorFormatado);
        setFormData(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            ...dadosCep,
            cep: valorFormatado
          }
        }));
        toast.success("CEP encontrado!");
      } catch {
        toast.error("CEP não encontrado ou inválido");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("=== INICIANDO SUBMIT ===");
    console.log("FormData atual:", formData);
    console.log("ID da obra no formData:", formData?.idObra);
    
    if (!formData.nomeObra || !formData.clienteId || !formData.tipo) {
      toast.warn("Nome, Cliente e Categoria são obrigatórios.");
      return;
    }

    if (!formData.idObra) {
      console.error("ID DA OBRA ESTÁ UNDEFINED!");
      console.log("FormData completo:", formData);
      toast.error("ID da obra não encontrado. Não é possível salvar.");
      return;
    }

    setLoading(true);

    try {
      // Usa o método do service para formatar os dados para envio
      const dtoParaEnviar = obrasService.formatarObraParaEnvio(formData, formData.responsavelId);
      
      console.log("DTO para enviar:", dtoParaEnviar);
      console.log("ID que será usado na URL:", formData.idObra);
      
      // Chama o endpoint PUT do backend
      const obraAtualizada = await obrasService.atualizarObra(formData.idObra, dtoParaEnviar);
      
      console.log("Obra atualizada com sucesso:", obraAtualizada);
      
      onObraAtualizada(obraAtualizada);
      toast.success("Obra atualizada com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro no submit:", error);
      console.error("Resposta do servidor:", error.response?.data);
      toast.error("Erro ao atualizar obra: " + (error.response?.data?.message || error.message || "Erro desconhecido."));
    } finally {
      setLoading(false);
    }
  };
  
  // Função de formatação de CEP
  const formatarCep = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    return numeros.slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
  };

  if (!isOpen) return null;

  // Mostra loading enquanto carrega os dados
  if (carregandoDados || !formData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 font-medium">Carregando dados da obra...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b bg-gray-50 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Editar Obra: {formData.nomeObra}
              <span className="text-sm text-gray-500 ml-2">(ID: {formData.idObra || 'não encontrado'})</span>
            </h2>
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
                  <label className="block text-gray-700 font-medium mb-2">Complemento</label>
                  <input
                    type="text"
                    name="endereco.complemento"
                    value={formData.endereco.complemento}
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
                      <option key={func.id} value={func.id}>
                        {func.nome} {func.cargo ? `(${func.cargo})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Total de Unidades</label>
                  <input
                    type="number"
                    name="totalUnidades"
                    value={formData.totalUnidades}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Unidades Concluídas</label>
                  <input
                    type="number"
                    name="unidadesConcluidas"
                    value={formData.unidadesConcluidas}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3"
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
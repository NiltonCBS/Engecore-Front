/* eslint-disable no-unused-vars */
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
  const [loading, setLoading] = useState(false); // Loading do botão "Salvar"
  const [cepLoading, setCepLoading] = useState(false); // 1. Novo estado para o loading do CEP
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
    // Só preenche o form se as listas de dropdown estiverem carregadas
    // Evita piscar os campos de select
    if (obra && clientesLista.length > 0 && funcionariosLista.length > 0) {
      
      const clienteEncontrado = clientesLista.find(c => c.nome === obra.cliente);
      const funcEncontrado = funcionariosLista.find(f => f.nome === obra.engenheiro);

      setFormData({
        idObra: obra.id,
        nomeObra: obra.nome || "",
        clienteId: clienteEncontrado?.id || "", 
        responsavelId: funcEncontrado?.id || "", 
        status: obra.status || "PLANEJAMENTO",
        tipo: obra.categoria || "", 
        
        endereco: {
          rua: obra.enderecoCompleto?.rua || "",
          numero: obra.enderecoCompleto?.numero || "",
          complemento: obra.enderecoCompleto?.complemento || "",
          bairro: obra.enderecoCompleto?.bairro || "",
          cidade: obra.enderecoCompleto?.cidade || "",
          estado: obra.enderecoCompleto?.estado || "",
          cep: obra.enderecoCompleto?.cep || ""
        },

        dataInicio: obra.dataInicio || "",
        dataPrevistaConclusao: obra.previsaoTermino || "",
        valorTotal: obra.valorContrato || 0,
        totalUnidades: obra.totalUnidades || 0,
        unidadesConcluidas: obra.unidadesConcluidas || 0,
        valorLiberado: obra.valorLiberado || 0,
        pagosFornecedores: obra.pagosFornecedores || 0,
        custoPorUnidade: obra.custoPorUnidade || 0,
        faixaRenda: obra.faixaRenda || null,
        documentacaoAprovada: obra.documentacaoAprovada || false,
        programaSocial: obra.programaSocial || null,
        dataConclusaoReal: obra.dataConclusaoReal || null,
        fases: obra.fases || []
      });
    }
  }, [obra, clientesLista, funcionariosLista, isOpen]); // Adicionado isOpen para resetar o form se reabrir

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

    // --- INÍCIO DA NOVA VALIDAÇÃO ---
    // Valida as datas
    if (formData.dataInicio && formData.dataPrevistaConclusao) {
      // Compara as strings "YYYY-MM-DD" diretamente.
      // Isso é seguro e evita problemas de fuso horário com new Date().
      if (formData.dataPrevistaConclusao < formData.dataInicio) {
        toast.warn("A data de Previsão de Término não pode ser anterior à Data de Início.");
        return; // Impede o envio
      }
    }
    // --- FIM DA NOVA VALIDAÇÃO ---

    setLoading(true);

    // Constrói o ObrasDTO para enviar ao backend
    const dtoParaEnviar = {
      ...formData,
      clienteId: parseInt(formData.clienteId),
      responsavelId: formData.responsavelId ? parseInt(formData.responsavelId) : null,
      valorTotal: parseFloat(formData.valorTotal) || 0,
      totalUnidades: parseInt(formData.totalUnidades) || 0,
      unidadesConcluidas: parseInt(formData.unidadesConcluidas) || 0,
      dataInicio: formData.dataInicio || null,
      dataPrevistaConclusao: formData.dataPrevistaConclusao || null,
      dataConclusaoReal: formData.dataConclusaoReal || null,
    };
    
    try {
      const response = await api.put(`/obras/alterar/${formData.idObra}`, dtoParaEnviar);
      onObraAtualizada(response.data.data); 
      toast.success("Obra atualizada com sucesso!");
      onClose();
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

  // 2. Nova função para buscar o CEP
  const buscarEnderecoPorCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, ''); // Remove traço
    if (cepLimpo.length !== 8) return; // Não busca se não tiver 8 dígitos

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      if (!response.ok) throw new Error('Erro na resposta da API.');

      const data = await response.json();

      if (data.erro) {
        toast.warn("CEP não encontrado.");
        // Limpa os campos se o CEP for inválido
        setFormData(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            rua: "",
            bairro: "",
            cidade: "",
            estado: "",
            complemento: ""
          }
        }));
      } else {
        // Preenche o formulário com os dados retornados
        setFormData(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            rua: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || "",
            complemento: data.complemento || ""
          }
        }));
        toast.success("Endereço preenchido automaticamente!");
        // Foca no campo "número" após preencher
        document.getElementsByName("endereco.numero")[0].focus();
      }
    } catch (error) {
      toast.error("Erro ao buscar CEP. Verifique sua conexão.");
      console.error("Erro ViaCEP:", error);
    } finally {
      setCepLoading(false);
    }
  };


  // 3. Função de onChange do CEP modificada
  const handleCepChange = (e) => {
    const valorFormatado = formatarCep(e.target.value);
    
    setFormData(prev => ({
      ...prev,
      endereco: { ...prev.endereco, cep: valorFormatado }
    }));

    // Se o CEP está completo (XXXXX-XXX), busca o endereço
    if (valorFormatado.length === 9) {
      buscarEnderecoPorCep(valorFormatado);
    }
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
                    {/* 4. ATUALIZAÇÃO DO CAMPO CEP */}
                    <div className="relative">
                      <input
                        type="text"
                        name="endereco.cep"
                        value={formData.endereco.cep}
                        onChange={handleCepChange} // Usa a nova função
                        placeholder="00000-000"
                        className="w-full border border-gray-300 rounded-lg p-3 pr-10" // Adiciona padding-right
                        maxLength="9"
                        disabled={loading || cepLoading} // Desabilita durante a busca
                      />
                      {cepLoading && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <i className="fas fa-spinner fa-spin text-gray-500"></i>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">Rua</label>
                    <input
                      type="text"
                      name="endereco.rua"
                      value={formData.endereco.rua}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      disabled={cepLoading} // Desabilita durante a busca
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
                      disabled={cepLoading} // Desabilita durante a busca
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
                      disabled={cepLoading} // Desabilita durante a busca
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Estado</label>
                    <select
                      name="endereco.estado"
                      value={formData.endereco.estado}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      disabled={cepLoading} // Desabilita durante a busca
                    >
                      <option value="">Selecione</option>
                      {estados.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
                  {/* CAMPO COMPLEMENTO */}
                  <div className="md:col-span-3">
                    <label className="block text-gray-700 font-medium mb-2">Complemento</label>
                    <input
                      type="text"
                      name="endereco.complemento"
                      value={formData.endereco.complemento}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
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
                 {/* Campos de Unidades */}
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
                disabled={loading || cepLoading} // Desabilita se estiver salvando OU buscando CEP
                className="flex-1 bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading || cepLoading}
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
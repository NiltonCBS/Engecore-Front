import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";
import { toast } from "react-toastify";
import { api } from "../../../services/api.js";
import authService from "../../../services/authService.jsx";

// Listas de Enums do Backend (definidas localmente por falta de endpoint)
const tiposObra = [
  "RESIDENCIAL",
  "COMERCIAL",
  "INFRAESTRUTURA"
];

const statusConst = [
  "PLANEJAMENTO",
  "EM_ANDAMENTO",
  "CONCLUIDA",
  "CANCELADA"
];

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function CadastrarObra() {
  
  const [clientesLista, setClientesLista] = useState([]);
  const [funcionariosLista, setFuncionariosLista] = useState([]);
  const [loading, setLoading] = useState(true);

  const [obra, setObra] = useState({
    nomeObra: "",
    clienteId: "",
    responsavelId: "",
    status: "PLANEJAMENTO",
    tipo: "",
    
    endereco: {
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: ""
    },
    
    totalUnidades: 0,
    unidadesConcluidas: 0,
    valorTotal: "",
    valorLiberado: 0,
    pagosFornecedores: 0,
    custoPorUnidade: 0,
    faixaRenda: null,
    documentacaoAprovada: false,
    programaSocial: null,
    dataInicio: "",
    dataPrevistaConclusao: "",
    dataConclusaoReal: null,
    fases: []
  });

  useEffect(() => {
    async function carregarDados() {
      setLoading(true);
      try {
        const [clientesRes, funcionariosRes] = await Promise.all([
          api.get("/cliente/listar"),
          api.get("/funcionario/listar")
        ]);

        setClientesLista(clientesRes.data.data || []);
        setFuncionariosLista(funcionariosRes.data.data || []);
        
      } catch (error) {
        toast.error("Erro ao carregar dados de clientes ou funcionários.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []); 


  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [outerKey, innerKey] = name.split('.');
      setObra(prev => ({
        ...prev,
        [outerKey]: {
          ...prev[outerKey],
          [innerKey]: value
        }
      }));
    } else {
      setObra(prev => ({ ...prev, [name]: value }));
    }
  };

  // 1. FUNÇÃO ADICIONADA (copiada do cadastrarcliente.jsx)
  const buscarCep = async (cep) => {
    const numeros = cep.replace(/\D/g, '');
    if (numeros.length !== 8) return; 

    try {
      const response = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.warn("CEP não encontrado");
        return;
      }

      // Atualiza o estado da OBRA
      setObra(prev => ({ 
        ...prev,
        endereco: {
          ...prev.endereco,
          rua: data.logradouro || prev.endereco.rua,
          bairro: data.bairro || prev.endereco.bairro,
          cidade: data.localidade || prev.endereco.cidade,
          estado: data.uf || prev.endereco.estado,
        }
      }));
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP. Tente novamente.");
    }
  };

  const handleSubmit = async () => {
    const currentUser = authService.getCurrentUserLocal();

    if (!obra.nomeObra || !obra.clienteId || !obra.tipo) {
      toast.warn("Por favor, preencha os campos obrigatórios: Nome da Obra, Cliente e Categoria.");
      return;
    }

    const dtoParaEnviar = {
      ...obra,
      valorTotal: parseFloat(obra.valorTotal) || 0,
      totalUnidades: parseInt(obra.totalUnidades) || 0,
      responsavelId: obra.responsavelId ? parseInt(obra.responsavelId) : currentUser.userId,
      clienteId: parseInt(obra.clienteId),
    };

    if (!dtoParaEnviar.dataInicio) delete dtoParaEnviar.dataInicio;
    if (!dtoParaEnviar.dataPrevistaConclusao) delete dtoParaEnviar.dataPrevistaConclusao;

    console.log("Enviando para API:", dtoParaEnviar);

    try {
      setLoading(true);
      await api.post("/obras/cadastrar", dtoParaEnviar);
      
      toast.success("Obra cadastrada com sucesso!");
      limparCampos();
    } catch (error) {
      toast.error("Erro ao cadastrar obra: " + (error.response?.data?.message || "Erro desconhecido."));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const limparCampos = () => {
    setObra({
      nomeObra: "",
      clienteId: "",
      responsavelId: "",
      status: "PLANEJAMENTO",
      tipo: "",
      endereco: {
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: ""
      },
      totalUnidades: 0,
      unidadesConcluidas: 0,
      valorTotal: "",
      valorLiberado: 0,
      pagosFornecedores: 0,
      custoPorUnidade: 0,
      faixaRenda: null,
      documentacaoAprovada: false,
      programaSocial: null,
      dataInicio: "",
      dataPrevistaConclusao: "",
      dataConclusaoReal: null,
      fases: []
    });
  };

  const formatarCep = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    return numeros
      .slice(0, 8)
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  // 2. FUNÇÃO ATUALIZADA
  const handleCepChange = (e) => {
    const valor = e.target.value;
    const valorFormatado = formatarCep(valor);
    setObra(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        cep: valorFormatado
      }
    }));
    
    // Chama a API de CEP
    if (valor.replace(/\D/g, '').length === 8) {
      buscarCep(valor);
    }
  };

  const getStatusColor = () => {
    switch(obra.status) {
      case 'PLANEJAMENTO': return 'text-blue-600';
      case 'EM_ANDAMENTO': return 'text-yellow-600';
      case 'CONCLUIDA': return 'text-green-600';
      case 'CANCELADA': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getStatusText = () => {
     return obra.status.replace("_", " ") || "PLANEJAMENTO";
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
                <h1 className="text-3xl font-bold text-cordes-blue">Cadastro de Obras</h1>
                <p className="text-gray-600 mt-2">Cadastre novas obras e mantenha o controle de projetos</p>
              </div>
            </div>

            {loading && (
              <div className="text-center p-10">
                <i className="fas fa-spinner fa-spin text-4xl text-cordes-blue"></i>
                <p className="text-gray-600 mt-2">Carregando dados...</p>
              </div>
            )}

            {!loading && (
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
                        value={obra.nomeObra}
                        onChange={handleChange}
                        placeholder="Ex: Edifício Residencial ABC"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Cliente *</label>
                      <select
                        name="clienteId"
                        value={obra.clienteId}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
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
                        value={obra.status}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
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
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Endereço da Obra</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">CEP</label>
                      <input
                        type="text"
                        name="endereco.cep"
                        value={obra.endereco.cep}
                        onChange={handleCepChange}
                        placeholder="00000-000"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                        maxLength="9"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-medium mb-2">Rua (Logradouro)</label>
                      <input
                        type="text"
                        name="endereco.rua"
                        value={obra.endereco.rua}
                        onChange={handleChange}
                        placeholder="Rua, Avenida, etc."
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Número</label>
                      <input
                        type="text"
                        name="endereco.numero"
                        value={obra.endereco.numero}
                        onChange={handleChange}
                        placeholder="123"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Complemento</label>
                      <input
                        type="text"
                        name="endereco.complemento"
                        value={obra.endereco.complemento}
                        onChange={handleChange}
                        placeholder="Lote, Quadra, etc."
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Bairro</label>
                      <input
                        type="text"
                        name="endereco.bairro"
                        value={obra.endereco.bairro}
                        onChange={handleChange}
                        placeholder="Nome do bairro"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Cidade</label>
                      <input
                        type="text"
                        name="endereco.cidade"
                        value={obra.endereco.cidade}
                        onChange={handleChange}
                        placeholder="Nome da cidade"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Estado</label>
                      <select
                        name="endereco.estado"
                        value={obra.endereco.estado}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
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
                      <label className="block text-gray-700 font-medium mb-2">Categoria (Tipo de Obra) *</label>
                      <select
                        name="tipo"
                        value={obra.tipo}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      >
                        <option value="">Selecione a categoria</option>
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
                        value={obra.dataInicio}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Previsão de Término</label>
                      <input
                        type="date"
                        name="dataPrevistaConclusao"
                        value={obra.dataPrevistaConclusao}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Valor Total (Orçado)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">R$</span>
                        <input
                          type="number"
                          name="valorTotal"
                          value={obra.valorTotal}
                          onChange={handleChange}
                          step="0.01"
                          placeholder="0,00"
                          className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Responsável Técnico</label>
                      <select
                        name="responsavelId"
                        value={obra.responsavelId}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      >
                        <option value="">(Usuário Logado)</option>
                        {funcionariosLista.map(func => (
                          <option key={func.id} value={func.id}>{func.nome} ({func.cargo})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-4 pt-6 border-t">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? "Cadastrando..." : "Cadastrar Obra"}
                  </button>
                  <button
                    onClick={limparCampos}
                    disabled={loading}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 disabled:opacity-50"
                  >
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
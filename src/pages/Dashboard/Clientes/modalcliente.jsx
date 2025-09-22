import React, { useState, useEffect } from "react";
import { api } from "../../../services/api";

export default function ModalEditarCliente({ cliente, isOpen, onClose, onClienteAtualizado }) {
  const [formData, setFormData] = useState({
    nome: "",
    razaoSocial: "",
    tipoCliente: "Pessoa Física",
    cpfCnpj: "",
    inscricaoEstadual: "",
    telefone: "",
    email: "",
    endereco: {
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: ""
    },
    status: "ativo"
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState({});

  const tiposCliente = [
    "Pessoa Física",
    "Pessoa Jurídica",
    "Microempreendedor Individual (MEI)"
  ];

  const estados = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  // Carregar dados do cliente quando o modal abrir
  useEffect(() => {
    if (isOpen && cliente) {
      console.log("Cliente recebido no modal:", cliente); // Debug
      
      setFormData({
        nome: cliente.nome || "",
        razaoSocial: cliente.razaoSocial || "",
        tipoCliente: cliente.tipoCliente || "Pessoa Física",
        cpfCnpj: cliente.cpfCnpj || "",
        inscricaoEstadual: cliente.inscricaoEstadual || "",
        telefone: cliente.telefone || "",
        email: cliente.email || "",
        endereco: {
          rua: cliente.endereco?.rua || "",
          numero: cliente.endereco?.numero || "",
          complemento: cliente.endereco?.complemento || "",
          bairro: cliente.endereco?.bairro || "",
          cidade: cliente.endereco?.cidade || "",
          estado: cliente.endereco?.estado || "",
          cep: cliente.endereco?.cep || ""
        },
        status: cliente.status || "ativo"
      });
      setErro("");
      setErros({});
    } else if (isOpen && !cliente) {
      console.error("Modal aberto sem cliente definido"); // Debug
      setErro("Erro: Cliente não encontrado. Feche o modal e tente novamente.");
    }
  }, [isOpen, cliente]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith("endereco.")) {
      const enderecoField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [enderecoField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Limpar erro do campo quando o usuário começar a digitar
    if (erros[name]) {
      setErros(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");
    
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: {
              ...prev.endereco,
              rua: data.logradouro || "",
              bairro: data.bairro || "",
              cidade: data.localidade || "",
              estado: data.uf || ""
            }
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleCepChange = (e) => {
    const { value } = e.target;
    const cepFormatado = value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2");
    
    setFormData(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        cep: cepFormatado
      }
    }));

    if (cepFormatado.length === 9) {
      buscarCep(cepFormatado);
    }
  };

  const formatarCpfCnpj = (valor, tipo) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    
    if (tipo === "Pessoa Física") {
      return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
  };

  const handleCpfCnpjChange = (e) => {
    const { value } = e.target;
    const valorFormatado = formatarCpfCnpj(value, formData.tipoCliente);
    
    setFormData(prev => ({
      ...prev,
      cpfCnpj: valorFormatado
    }));
  };

  const validarFormulario = () => {
    const novosErros = {};

    if (!formData.nome.trim()) {
      novosErros.nome = "Nome é obrigatório";
    }

    if (!formData.cpfCnpj.trim()) {
      novosErros.cpfCnpj = "CPF/CNPJ é obrigatório";
    }

    if (!formData.email.trim()) {
      novosErros.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      novosErros.email = "Email inválido";
    }

    if (!formData.telefone.trim()) {
      novosErros.telefone = "Telefone é obrigatório";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar se o cliente e seu ID existem
    const clienteId = cliente?.id || cliente?.idUsuario;
    if (!cliente || !clienteId) {
      setErro("Cliente não encontrado. Tente fechar e abrir o modal novamente.");
      return;
    }
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setErro("");

    try {
      console.log("Atualizando cliente ID:", clienteId); // Debug
      
      // Preparar dados para envio baseado no formato do backend
      const dadosParaEnvio = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim(),
        tipoPessoa: formData.tipoCliente === "Pessoa Física" ? "FISICA" : "JURIDICA",
        status: formData.status === "ativo" ? "STATUS_ATIVO" : "STATUS_INATIVO"
      };

      // Adicionar endereço apenas se tiver dados
      if (formData.endereco.cep || formData.endereco.rua || formData.endereco.cidade) {
        dadosParaEnvio.endereco = {
          rua: formData.endereco.rua.trim(),
          numero: formData.endereco.numero.trim(),
          complemento: formData.endereco.complemento.trim(),
          bairro: formData.endereco.bairro.trim(),
          cidade: formData.endereco.cidade.trim(),
          estado: formData.endereco.estado.trim(),
          cep: formData.endereco.cep.replace(/\D/g, "")
        };
      }

      // Adicionar campos específicos baseado no tipo APENAS se tiver dados válidos
      if (formData.tipoCliente === "Pessoa Física") {
        const cpfLimpo = formData.cpfCnpj.replace(/\D/g, "");
        if (cpfLimpo && cpfLimpo.length === 11) {
          dadosParaEnvio.usuarioFisico = {
            cpf: cpfLimpo
          };
        } else {
          setErro("CPF inválido. Deve conter 11 dígitos.");
          return;
        }
      } else {
        const cnpjLimpo = formData.cpfCnpj.replace(/\D/g, "");
        if (cnpjLimpo && cnpjLimpo.length === 14) {
          dadosParaEnvio.usuarioJuridico = {
            cnpj: cnpjLimpo,
            razaoSocial: formData.razaoSocial.trim(),
            inscricaoEstadual: formData.inscricaoEstadual.trim()
          };
        } else {
          setErro("CNPJ inválido. Deve conter 14 dígitos.");
          return;
        }
      }

      console.log("Dados para envio:", dadosParaEnvio); // Debug

      const response = await api.put(`/clientes/${clienteId}`, dadosParaEnvio, { 
        withCredentials: true 
      });

      if (response.data.success) {
        // Criar objeto cliente atualizado no formato do frontend
        const clienteAtualizado = {
          id: cliente.idUsuario,
          nome: formData.nome,
          razaoSocial: formData.razaoSocial,
          tipoCliente: formData.tipoCliente,
          cpfCnpj: formData.cpfCnpj,
          inscricaoEstadual: formData.inscricaoEstadual,
          telefone: formData.telefone,
          email: formData.email,
          endereco: formData.endereco,
          status: formData.status,
          dataCadastro: cliente.dataCadastro
        };

        onClienteAtualizado(clienteAtualizado);
        onClose();
        alert("Cliente atualizado com sucesso!");
      } else {
        setErro("Erro ao atualizar cliente: " + (response.data.message || "Resposta inválida do servidor"));
      }
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      
      let mensagemErro = "Erro desconhecido";
      
      if (error.response) {
        // Erro do servidor (4xx, 5xx)
        mensagemErro = `Erro ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        // Erro de rede
        mensagemErro = "Erro de rede. Verifique sua conexão.";
      } else {
        // Outro tipo de erro
        mensagemErro = error.message;
      }
      
      setErro("Erro ao conectar com o servidor: " + mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Editar Cliente</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {erro && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-600">{erro}</div>
            </div>
          )}

          {/* Informações Básicas */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    erros.nome ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nome completo"
                />
                {erros.nome && <p className="text-red-500 text-sm mt-1">{erros.nome}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cliente *
                </label>
                <select
                  name="tipoCliente"
                  value={formData.tipoCliente}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tiposCliente.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              {formData.tipoCliente !== "Pessoa Física" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razão Social
                  </label>
                  <input
                    type="text"
                    name="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Razão social da empresa"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.tipoCliente === "Pessoa Física" ? "CPF *" : "CNPJ *"}
                </label>
                <input
                  type="text"
                  name="cpfCnpj"
                  value={formData.cpfCnpj}
                  onChange={handleCpfCnpjChange}
                  maxLength={formData.tipoCliente === "Pessoa Física" ? 14 : 18}
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    erros.cpfCnpj ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={formData.tipoCliente === "Pessoa Física" ? "000.000.000-00" : "00.000.000/0000-00"}
                />
                {erros.cpfCnpj && <p className="text-red-500 text-sm mt-1">{erros.cpfCnpj}</p>}
              </div>

              {formData.tipoCliente !== "Pessoa Física" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inscrição Estadual
                  </label>
                  <input
                    type="text"
                    name="inscricaoEstadual"
                    value={formData.inscricaoEstadual}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Inscrição estadual"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Informações de Contato
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    erros.telefone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(00) 00000-0000"
                />
                {erros.telefone && <p className="text-red-500 text-sm mt-1">{erros.telefone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    erros.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email@exemplo.com"
                />
                {erros.email && <p className="text-red-500 text-sm mt-1">{erros.email}</p>}
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Endereço
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  name="endereco.cep"
                  value={formData.endereco.cep}
                  onChange={handleCepChange}
                  maxLength={9}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="00000-000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rua
                </label>
                <input
                  type="text"
                  name="endereco.rua"
                  value={formData.endereco.rua}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da rua"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número
                </label>
                <input
                  type="text"
                  name="endereco.numero"
                  value={formData.endereco.numero}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  name="endereco.complemento"
                  value={formData.endereco.complemento}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Apto, sala, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro
                </label>
                <input
                  type="text"
                  name="endereco.bairro"
                  value={formData.endereco.bairro}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do bairro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  name="endereco.cidade"
                  value={formData.endereco.cidade}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da cidade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  name="endereco.estado"
                  value={formData.endereco.estado}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {estados.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 justify-end border-t pt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Salvando...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
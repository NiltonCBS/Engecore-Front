import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { api } from "../../../services/api.js"; // Importa a api real

export default function ModalEditarFornecedor({ fornecedor, isOpen, onClose, onFornecedorAtualizado }) {
  const [formData, setFormData] = useState({
    nome: "",
    razaoSocial: "",
    tipoPessoa: "Pessoa Física",
    cpfCnpj: "",
    inscricaoEstadual: "",
    telefone: "",
    email: "",
    status: "ativo",
    // Campos PF
    rg: "",
    dataNascimento: ""
  });

  const [loading, setLoading] = useState(false);
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState({});

  const tiposPessoa = [
    "Pessoa Física",
    "Pessoa Jurídica",
  ];

  // Carregar dados do fornecedor quando o modal abrir
  useEffect(() => {
    if (isOpen && fornecedor) {
      console.log("Fornecedor recebido no modal:", fornecedor);
      
      setFormData({
        nome: fornecedor.nome || "",
        razaoSocial: fornecedor.razaoSocial || "",
        tipoPessoa: fornecedor.tipoPessoa || "Pessoa Física", // Mapeado no listar
        cpfCnpj: fornecedor.cpfCnpj || "",
        inscricaoEstadual: fornecedor.inscricaoEstadual || "",
        telefone: fornecedor.telefone || "",
        email: fornecedor.email || "",
        status: fornecedor.status || "ativo",
        rg: fornecedor.rg || "",
        dataNascimento: fornecedor.dataNascimento || ""
      });
      setErro("");
      setErros({});
    } else if (isOpen && !fornecedor) {
      console.error("Modal aberto sem fornecedor definido");
      setErro("Erro: Fornecedor não encontrado. Feche o modal e tente novamente.");
    }
  }, [isOpen, fornecedor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: "" }));
    }
  };

  const buscarCnpj = async (cnpj) => {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) return;

    setLoadingCnpj(true);
    setErro("");
    try {
      const response = await fetch(`https://minhareceita.org/${cnpjLimpo}`);
      if (!response.ok) {
        throw new Error('CNPJ não encontrado ou API indisponível.');
      }
      const data = await response.json();

      setFormData(prev => ({
        ...prev,
        nome: data.nome_fantasia || prev.nome,
        razaoSocial: data.razao_social || "",
        email: data.email || prev.email,
      }));

    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      setErro("Erro ao consultar CNPJ. Verifique o número e tente novamente.");
    } finally {
      setLoadingCnpj(false);
    }
  };


  const formatarCpfCnpj = (valor, tipo) => {
    const apenasNumeros = (valor || "").replace(/\D/g, "");
    
    if (tipo === "Pessoa Física") {
      return apenasNumeros
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      return apenasNumeros
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }
  };

  const handleCpfCnpjChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      cpfCnpj: formatarCpfCnpj(value, prev.tipoPessoa)
    }));
  };
  
  const handleCnpjBlur = (e) => {
    if (formData.tipoPessoa !== "Pessoa Física") {
      buscarCnpj(e.target.value);
    }
  };

  const validarFormulario = () => {
    const novosErros = {};
    if (!formData.nome.trim()) novosErros.nome = "Nome é obrigatório";
    if (!formData.cpfCnpj.trim()) novosErros.cpfCnpj = "CPF/CNPJ é obrigatório";
    if (!formData.email.trim()) {
      novosErros.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      novosErros.email = "Email inválido";
    }
    if (!formData.telefone.trim()) novosErros.telefone = "Telefone é obrigatório";
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const fornecedorId = fornecedor?.id;
    if (!fornecedor || !fornecedorId) {
      setErro("ID do fornecedor não encontrado. Tente novamente.");
      return;
    }
    
    if (!validarFormulario()) return;

    setLoading(true);
    setErro("");

    const dadosParaEnvio = {
      nome: formData.nome.trim(),
      email: formData.email.trim(),
      telefone: formData.telefone.trim(),
      status: formData.status === "ativo" ? "STATUS_ATIVO" : "STATUS_INATIVO",
      role: "ROLE_FORNECEDOR", // Role de fornecedor
      tipoPessoa: formData.tipoPessoa === "Pessoa Física" ? "FISICA" : "JURIDICA",
      
      // Inicializa campos PF/PJ
      cpf: null,
      rg: null,
      dataNascimento: null,
      cnpj: null,
      razaoSocial: null,
      nomeFantasia: null,
      inscricaoEstadual: null,
    };

    if (formData.tipoPessoa === "Pessoa Física") {
      dadosParaEnvio.cpf = (formData.cpfCnpj || "").replace(/\D/g, "");
      dadosParaEnvio.rg = formData.rg || null;
      dadosParaEnvio.dataNascimento = formData.dataNascimento || null;
    } else {
      dadosParaEnvio.cnpj = (formData.cpfCnpj || "").replace(/\D/g, "");
      dadosParaEnvio.razaoSocial = formData.razaoSocial.trim();
      dadosParaEnvio.nomeFantasia = formData.nome.trim(); // Nome vira Nome Fantasia
      dadosParaEnvio.inscricaoEstadual = formData.inscricaoEstadual.trim() || null;
    }
    
    try {
      console.log("Dados para envio:", JSON.stringify(dadosParaEnvio, null, 2));

      // Endpoint alterado
      const response = await api.put(`/fornecedor/alterar/${fornecedorId}`, dadosParaEnvio);

      // A API retorna o FornecedorDTO atualizado
      onFornecedorAtualizado(response.data.data);
      onClose();
      toast.success("Fornecedor atualizado com sucesso!");
      
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error);
      const msg = error.response?.data?.message || error.message || "Erro desconhecido";
      setErro(`Erro ao conectar com o servidor: ${msg}`);
      toast.error(`Erro ao atualizar: ${msg}`);
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
        <div className="p-6 border-b bg-gray-50 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Editar Fornecedor</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {erro && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-600">{erro}</div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome / Nome Fantasia *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${erros.nome ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nome do fornecedor ou fantasia"
                />
                {erros.nome && <p className="text-red-500 text-sm mt-1">{erros.nome}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Fornecedor *
                </label>
                <select
                  name="tipoPessoa"
                  value={formData.tipoPessoa}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tiposPessoa.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              {formData.tipoPessoa !== "Pessoa Física" && (
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
                  {formData.tipoPessoa === "Pessoa Física" ? "CPF *" : "CNPJ *"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={handleCpfCnpjChange}
                    onBlur={handleCnpjBlur}
                    maxLength={formData.tipoPessoa === "Pessoa Física" ? 14 : 18}
                    className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${erros.cpfCnpj ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder={formData.tipoPessoa === "Pessoa Física" ? "000.000.000-00" : "00.000.000/0000-00"}
                  />
                  {loadingCnpj && <i className="fas fa-spinner fa-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>}
                </div>
                {erros.cpfCnpj && <p className="text-red-500 text-sm mt-1">{erros.cpfCnpj}</p>}
              </div>

              {formData.tipoPessoa !== "Pessoa Física" && (
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

              {formData.tipoPessoa === "Pessoa Física" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">RG</label>
                    <input
                      type="text"
                      name="rg"
                      value={formData.rg}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
                    <input
                      type="date"
                      name="dataNascimento"
                      value={formData.dataNascimento}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                </>
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
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${erros.telefone ? 'border-red-500' : 'border-gray-300'}`}
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
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${erros.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="email@exemplo.com"
                />
                {erros.email && <p className="text-red-500 text-sm mt-1">{erros.email}</p>}
              </div>
            </div>
          </div>
          
          {/* SEÇÃO DE ENDEREÇO REMOVIDA */}

          <div className="flex gap-4 justify-end border-t pt-6 sticky bottom-0 bg-white pb-6 px-6 -mx-6">
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
              disabled={loading || loadingCnpj}
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
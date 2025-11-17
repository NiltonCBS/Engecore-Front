import { useState } from "react";
import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";
import { toast } from 'react-toastify';
import { api } from "../../../services/api.js"; 


export default function CadastrarFornecedor() {
  // Estado para armazenar os dados do fornecedor
  const [fornecedor, setFornecedor] = useState({
    nome: "",
    razaoSocial: "",
    tipoPessoa: "", // Alterado de tipoCliente
    cpfCnpj: "",
    inscricaoEstadual: "",
    telefone: "",
    email: "",
    status: "ativo"
  });

  // Estados de Loading
  const [loading, setLoading] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);

  // Função para buscar dados do CNPJ na API Minha Receita
  const buscarCnpj = async (cnpj) => {
    // Remove caracteres não numéricos
    const numeros = cnpj.replace(/\D/g, '');
    if (numeros.length !== 14) return; // Só busca se for um CNPJ completo

    setCnpjLoading(true);
    try {
      // Usando um proxy CORS se necessário, ou uma API que permita
      const response = await fetch(`https://minhareceita.org/${numeros}`);
      
      if (!response.ok) {
        throw new Error('CNPJ não encontrado ou API indisponível.');
      }

      const data = await response.json();

      // Atualiza o estado do fornecedor com os dados retornados da API
      setFornecedor(prev => ({
        ...prev,
        nome: data.nome_fantasia || "",
        razaoSocial: data.razao_social || "",
        email: data.email || prev.email, // Mantém o email digitado se a API não retornar
        telefone: data.ddd_telefone_1 ? formatarTelefone(data.ddd_telefone_1) : prev.telefone, // Formata o telefone
      }));
      toast.success("Dados do CNPJ preenchidos.");

    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      toast.error("Erro ao consultar o CNPJ. Verifique o número e tente novamente.");
    } finally {
      setCnpjLoading(false);
    }
  };

  const tiposPessoa = [ // Renomeado
    "Pessoa Física",
    "Pessoa Jurídica",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFornecedor(prev => ({ ...prev, [name]: value }));
  };

  const limparMascara = (valor) => (valor || "").replace(/\D/g, "");


  const handleSubmit = async () => {
    setLoading(true);
    // Validações básicas primeiro
    if (!fornecedor.nome || !fornecedor.cpfCnpj || !fornecedor.telefone || !fornecedor.email || !fornecedor.tipoPessoa) {
      toast.warn("Por favor, preencha os campos obrigatórios (*).");
      setLoading(false);
      return;
    }

    // 1. Limpa a máscara do CPF/CNPJ
    const cpfCnpjSemMascara = limparMascara(fornecedor.cpfCnpj);

    // 2. Valida se tem pelo menos 8 dígitos
    if (cpfCnpjSemMascara.length < 8) {
        toast.warn("O CPF/CNPJ deve ter pelo menos 8 dígitos para gerar a senha.");
        setLoading(false);
        return;
    }

    // 3. Pega os 8 primeiros dígitos para a senha
    const senhaProvisoria = cpfCnpjSemMascara.substring(0, 8);

    // Monta o payload para FornecedorDTO
    let payload = {
      nome: fornecedor.nome,
      email: fornecedor.email,
      senha: senhaProvisoria, 
      telefone: fornecedor.telefone,
      status: fornecedor.status === "ativo" ? "STATUS_ATIVO" : "STATUS_INATIVO",
      role: "ROLE_FORNECEDOR", // Definido pelo backend, mas enviando por segurança
      tipoPessoa: fornecedor.tipoPessoa === "Pessoa Física" ? "FISICA" : "JURIDICA",
    };

    // Adiciona os dados específicos de PF ou PJ
    if (fornecedor.tipoPessoa === "Pessoa Física") {
      payload = {
        ...payload,
        cpf: cpfCnpjSemMascara,
        rg: fornecedor.rg || null,
        dataNascimento: fornecedor.dataNascimento || null
      };
    } else { // Pessoa Jurídica
      payload = {
        ...payload,
        cnpj: cpfCnpjSemMascara,
        razaoSocial: fornecedor.razaoSocial,
        nomeFantasia: fornecedor.nome,
        inscricaoEstadual: fornecedor.inscricaoEstadual || null
      };
    }

    try {
      console.log("Enviando payload:", payload);
      // Alterado para o endpoint de fornecedor
      const response = await api.post("/fornecedor/cadastrar", payload, { withCredentials: true });
       toast.success("Fornecedor cadastrado com sucesso!");
      console.log("Resposta do servidor:", response.data);
      limparCampos();
    
    } catch (error) {
      console.error("Erro ao cadastrar fornecedor:", error.response?.data || error.message);
      let erroMsg = error.response?.data?.message || "Erro desconhecido. Tente novamente.";

      if (erroMsg.toLowerCase().includes("duplicate entry")) {
          if (erroMsg.includes(fornecedor.telefone)) {
              toast.error("Erro: O Telefone '" + fornecedor.telefone + "' já está cadastrado.");
          } else if (erroMsg.includes(fornecedor.email)) { 
              toast.error("Erro: O E-mail '" + fornecedor.email + "' já está cadastrado.");
          } else if (erroMsg.includes(cpfCnpjSemMascara)) {
              toast.error("Erro: O CPF/CNPJ '" + fornecedor.cpfCnpj + "' já está cadastrado.");
          } else {
              toast.error("Erro de duplicidade: E-mail, Telefone ou CPF/CNPJ já cadastrado.");
          }
      } else {
          toast.error("Erro ao cadastrar: " + erroMsg);
      }
    } finally {
        setLoading(false);
    }
  };


  const limparCampos = () => {
    setFornecedor({
      nome: "",
      razaoSocial: "",
      tipoPessoa: "",
      cpfCnpj: "",
      inscricaoEstadual: "",
      telefone: "",
      email: "",
      status: "ativo"
    });
  };

  const formatarCpfCnpj = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    
    if (fornecedor.tipoPessoa === "Pessoa Física") {
      return numeros
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    // Se for CNPJ (ou tipo não selecionado)
    return numeros
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };


  const handleCpfCnpjChange = (e) => {
    const valor = e.target.value;
    setFornecedor(prev => ({ ...prev, cpfCnpj: formatarCpfCnpj(valor) }));
  };

  // Handler para o evento onBlur do campo CNPJ
  const handleCnpjBlur = (e) => {
    if (fornecedor.tipoPessoa.includes("Jurídica")) {
      buscarCnpj(e.target.value);
    }
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 10) { // Fixo
      return numeros
        .slice(0, 10)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else { // Celular
      return numeros
        .slice(0, 11)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  };

  const handleTelefoneChange = (e) => {
    const valor = e.target.value;
    const valorFormatado = formatarTelefone(valor);
    setFornecedor(prev => ({ ...prev, telefone: valorFormatado }));
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
                <h1 className="text-3xl font-bold text-cordes-blue">Cadastro de Fornecedores</h1>
                <p className="text-gray-600 mt-2">Cadastre novos fornecedores</p>
              </div>
              <div className="text-right">
                <label className="block text-sm text-gray-500 mb-1">Status</label>
                 <select
                      name="status"
                      value={fornecedor.status}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                 </select>
              </div>
            </div>

            <div className="space-y-8">
              {/* Informações Básicas */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informações Básicas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Tipo de Fornecedor *</label>
                    <select
                      name="tipoPessoa"
                      value={fornecedor.tipoPessoa}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    >
                      <option value="">Selecione o tipo</option>
                      {tiposPessoa.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">CPF/CNPJ *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cpfCnpj"
                        value={fornecedor.cpfCnpj}
                        onChange={handleCpfCnpjChange}
                        onBlur={handleCnpjBlur}
                        placeholder={fornecedor.tipoPessoa === 'Pessoa Física' ? '000.000.000-00' : '00.000.000/0000-00'}
                        className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                        maxLength="18"
                        disabled={!fornecedor.tipoPessoa || cnpjLoading}
                      />
                      {cnpjLoading && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <i className="fas fa-spinner fa-spin text-gray-500"></i>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Nome/Nome Fantasia *</label>
                    <input
                      type="text"
                      name="nome"
                      value={fornecedor.nome}
                      onChange={handleChange}
                      placeholder="Ex: Fornecedor ABC"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  {fornecedor.tipoPessoa === "Pessoa Jurídica" && (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 font-medium mb-2">Razão Social</label>
                        <input
                          type="text"
                          name="razaoSocial"
                          value={fornecedor.razaoSocial}
                          onChange={handleChange}
                          placeholder="Razão Social da empresa"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Inscrição Estadual</label>
                        <input
                          type="text"
                          name="inscricaoEstadual"
                          value={fornecedor.inscricaoEstadual}
                          onChange={handleChange}
                          placeholder="Inscrição Estadual"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Contato */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Contato</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Celular *</label>
                    <input
                      type="text"
                      name="telefone"
                      value={fornecedor.telefone}
                      onChange={handleTelefoneChange}
                      placeholder="(00) 00000-0000"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      maxLength="15"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">E-mail *</label>
                    <input
                      type="email"
                      name="email"
                      value={fornecedor.email}
                      onChange={handleChange}
                      placeholder="fornecedor@email.com"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={handleSubmit}
                  disabled={loading || cnpjLoading}
                  className="flex-1 bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Cadastrando...</>
                  ) : (
                    <><i className="fas fa-check mr-2"></i>Cadastrar Fornecedor</>
                  )}
                </button>
                <button
                  onClick={limparCampos}
                  disabled={loading || cnpjLoading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 disabled:opacity-50"
                >
                  <i className="fas fa-eraser mr-2"></i>
                  Limpar Campos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
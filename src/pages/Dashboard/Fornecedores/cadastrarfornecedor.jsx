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
    tipoPessoa: "Pessoa Física", // Valor padrão para evitar bugs no select
    cpfCnpj: "",
    inscricaoEstadual: "",
    rg: "", // Adicionado
    dataNascimento: "", // Adicionado
    telefone: "",
    email: "",
    endereco: { // Adicionado objeto endereço
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

  // Estados de Loading
  const [loading, setLoading] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const tiposPessoa = [
    "Pessoa Física",
    "Pessoa Jurídica",
  ];

  const estados = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  // --- Helpers e Formatadores ---

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 10) { 
      return numeros.slice(0, 10).replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    } else { 
      return numeros.slice(0, 11).replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
    }
  };

  const formatarCep = (valor) => {
    if (!valor) return "";
    const numeros = valor.replace(/\D/g, '');
    return numeros.slice(0, 8).replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatarRg = (valor) => {
      // Remove tudo que não é dígito ou 'X'/'x' no final
      const rg = valor.replace(/[^\dX]/gi, '');
      
      // Aplica a máscara XX.XXX.XXX-X (padrão comum, mas varia por estado)
      // Esta é uma formatação genérica para 9 dígitos
      if (rg.length <= 9) {
          return rg
              .replace(/(\d{2})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})([\dX])$/, '$1-$2');
      }
      return rg; // Retorna sem formatação se exceder o tamanho esperado
  };


  const limparMascara = (valor) => (valor || "").replace(/\D/g, "");

  const capitalizar = (texto = "") => {
    if (!texto) return "";
    return texto
      .toLowerCase()
      .replace(/(?:^|\s)\S/g, (letra) => letra.toUpperCase());
  };

  const normalizarEmail = (email = "") => email.trim().toLowerCase();

  const normalizarDados = (c) => {
    return {
      ...c,
      nome: capitalizar(c.nome),
      razaoSocial: capitalizar(c.razaoSocial),
      email: normalizarEmail(c.email),
      endereco: {
        ...c.endereco,
        rua: capitalizar(c.endereco.rua),
        bairro: capitalizar(c.endereco.bairro),
        cidade: capitalizar(c.endereco.cidade),
        estado: c.endereco.estado?.toUpperCase()
      }
    };
  };

  const formatarCpfCnpj = (valor, tipo) => {
    const numeros = valor.replace(/\D/g, '');
    if (tipo === "Pessoa Física") {
      return numeros
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    // CNPJ
    return numeros
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  // --- Funções de Busca (API) ---

  const buscarCnpj = async (cnpj) => {
    const numeros = cnpj.replace(/\D/g, '');
    if (numeros.length !== 14) return;

    setCnpjLoading(true);
    try {
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${numeros}`);

      if (!response.ok) {
        throw new Error('CNPJ não encontrado ou API indisponível.');
      }

      const data = await response.json();

      // Dados principais
      const empresa = data;
      const est = data.estabelecimento;

      // Telefone (a API separa ddd1 e telefone1)
      const telefoneCompleto =
        est.ddd1 && est.telefone1
          ? formatarTelefone(`${est.ddd1}${est.telefone1}`)
          : fornecedor.telefone;

      // CEP formatado
      const cepFormatado = est.cep ? formatarCep(est.cep) : fornecedor.endereco.cep;

      setFornecedor((prev) => ({
        ...prev,

        nome: capitalizar(est.nome_fantasia) || "",
        razaoSocial: capitalizar(empresa.razao_social) || "",
        email: normalizarEmail(est.email) || prev.email,

        telefone: telefoneCompleto,

        endereco: {
          ...prev.endereco,
          rua: capitalizar(est.logradouro) || "",
          numero: est.numero || "",
          complemento: est.complemento || "",
          bairro: capitalizar(est.bairro) || "",
          cidade: capitalizar(est.cidade?.nome) || "",
          estado: est.estado?.sigla || "",
          cep: cepFormatado || "",
        },
      }));

      toast.success("Dados do CNPJ carregados com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      toast.error("Erro ao consultar o CNPJ. Verifique o número e tente novamente.");
    } finally {
      setCnpjLoading(false);
    }
  };

  const buscarCep = async (cep) => {
    const numeros = cep.replace(/\D/g, '');
    if (numeros.length !== 8) return;

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.warn("CEP não encontrado");
        // Limpa os campos se o CEP for inválido
        setFornecedor(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            rua: "",
            bairro: "",
            cidade: "",
            estado: "",
          }
        }));
        return;
      }

      setFornecedor(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          rua: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
          cep: formatarCep(data.cep || numeros)
        }
      }));
      toast.success("Endereço preenchido.");
      // Foca no campo "número" se possível
      document.getElementsByName("endereco.numero")[0]?.focus();
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };

  // --- Handlers ---

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('endereco.')) {
      const campo = name.split('.')[1];
      setFornecedor(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [campo]: value
        }
      }));
    } else {
      setFornecedor(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCpfCnpjChange = (e) => {
    const { value } = e.target;
    setFornecedor(prev => ({ ...prev, cpfCnpj: formatarCpfCnpj(value, prev.tipoPessoa) }));
  };

  const handleRgChange = (e) => {
      const { value } = e.target;
      setFornecedor(prev => ({ ...prev, rg: formatarRg(value) }));
  };


  const handleCnpjBlur = (e) => {
    if (fornecedor.tipoPessoa === "Pessoa Jurídica") {
      buscarCnpj(e.target.value);
    }
  };

  const handleCepChange = (e) => {
    const { value } = e.target;
    const cepFormatado = formatarCep(value);
    
    setFornecedor(prev => ({
      ...prev,
      endereco: { ...prev.endereco, cep: cepFormatado }
    }));

    if (value.replace(/\D/g, '').length === 8) {
      buscarCep(value);
    }
  };

  const handleTelefoneChange = (e) => {
    const valor = e.target.value;
    setFornecedor(prev => ({ ...prev, telefone: formatarTelefone(valor) }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Validações
    if (!fornecedor.nome || !fornecedor.cpfCnpj || !fornecedor.telefone || !fornecedor.email || !fornecedor.tipoPessoa) {
      toast.warn("Por favor, preencha os campos obrigatórios (*).");
      setLoading(false);
      return;
    }

    const cpfCnpjSemMascara = limparMascara(fornecedor.cpfCnpj);
    const cepSemMascara = limparMascara(fornecedor.endereco.cep);

    if (cpfCnpjSemMascara.length < 8) {
        toast.warn("O CPF/CNPJ deve ter pelo menos 8 dígitos para gerar a senha.");
        setLoading(false);
        return;
    }

    const senhaProvisoria = cpfCnpjSemMascara.substring(0, 8);
    const fornecedorNormalizado = normalizarDados(fornecedor);

    // Monta o payload
    let payload = {
      nome: fornecedorNormalizado.nome,
      email: fornecedorNormalizado.email,
      senha: senhaProvisoria, 
      telefone: fornecedorNormalizado.telefone,
      status: fornecedor.status === "ativo" ? "STATUS_ATIVO" : "STATUS_INATIVO",
      role: "ROLE_FORNECEDOR",
      tipoPessoa: fornecedor.tipoPessoa === "Pessoa Física" ? "FISICA" : "JURIDICA",
      endereco: {
        ...fornecedorNormalizado.endereco,
        cep: cepSemMascara
      }
    };

    if (fornecedor.tipoPessoa === "Pessoa Física") {
      payload = {
        ...payload,
        cpf: cpfCnpjSemMascara,
        rg: fornecedor.rg || null,
        dataNascimento: fornecedor.dataNascimento || null
      };
    } else { 
      payload = {
        ...payload,
        cnpj: cpfCnpjSemMascara,
        razaoSocial: fornecedorNormalizado.razaoSocial,
        nomeFantasia: fornecedorNormalizado.nome,
        inscricaoEstadual: fornecedor.inscricaoEstadual || null
      };
    }

    try {
      console.log("Enviando payload:", payload);
      const response = await api.post("/fornecedor/cadastrar", payload, { withCredentials: true });
      toast.success("Fornecedor cadastrado com sucesso!");
      console.log("Resposta do servidor:", response.data);
      limparCampos();
    
    } catch (error) {
      console.error("Erro ao cadastrar fornecedor:", error.response?.data || error.message);
      let erroMsg = error.response?.data?.message || "Erro desconhecido. Tente novamente.";

      // Tratamento de erros específicos (Duplicidade)
      if (erroMsg.toLowerCase().includes("duplicate entry")) {
          if (erroMsg.includes(fornecedor.telefone)) {
              toast.error("Erro: O Telefone já está cadastrado.");
          } else if (erroMsg.includes(fornecedor.email)) { 
              toast.error("Erro: O E-mail já está cadastrado.");
          } else if (erroMsg.includes(cpfCnpjSemMascara)) {
              toast.error("Erro: O CPF/CNPJ já está cadastrado.");
          } else {
              toast.error("Erro de duplicidade: Dados já cadastrados.");
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
      tipoPessoa: "Pessoa Física",
      cpfCnpj: "",
      inscricaoEstadual: "",
      rg: "",
      dataNascimento: "",
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
                <p className="text-gray-600 mt-2">Cadastre novos fornecedores e mantenha os dados atualizados</p>
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
                        disabled={cnpjLoading}
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

                  {fornecedor.tipoPessoa === "Pessoa Física" && (
                    <>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">RG</label>
                        <input
                          type="text"
                          name="rg"
                          value={fornecedor.rg}
                          onChange={handleRgChange}
                          placeholder="00.000.000-0"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Data de Nascimento</label>
                        <input
                          type="date"
                          name="dataNascimento"
                          value={fornecedor.dataNascimento}
                          onChange={handleChange}
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

               {/* Endereço */}
               <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Endereço</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">CEP</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="endereco.cep"
                        value={fornecedor.endereco.cep}
                        onChange={handleCepChange}
                        placeholder="00000-000"
                        className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                        maxLength="9"
                        disabled={cepLoading}
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
                      value={fornecedor.endereco.rua}
                      onChange={handleChange}
                      placeholder="Rua, Avenida, etc."
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      disabled={cepLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Número</label>
                    <input
                      type="text"
                      name="endereco.numero"
                      value={fornecedor.endereco.numero}
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
                      value={fornecedor.endereco.complemento}
                      onChange={handleChange}
                      placeholder="Apto, Sala, etc."
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Bairro</label>
                    <input
                      type="text"
                      name="endereco.bairro"
                      value={fornecedor.endereco.bairro}
                      onChange={handleChange}
                      placeholder="Nome do bairro"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      disabled={cepLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Cidade</label>
                    <input
                      type="text"
                      name="endereco.cidade"
                      value={fornecedor.endereco.cidade}
                      onChange={handleChange}
                      placeholder="Nome da cidade"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      disabled={cepLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Estado</label>
                    <select
                      name="endereco.estado"
                      value={fornecedor.endereco.estado}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      disabled={cepLoading}
                    >
                      <option value="">Selecione</option>
                      {estados.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={handleSubmit}
                  disabled={loading || cepLoading || cnpjLoading}
                  className="flex-1 bg-blue-700 text-white font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Cadastrando...</>
                  ) : (
                    <><i className="fas fa-check mr-2"></i>Cadastrar Fornecedor</>
                  )}
                </button>
                <button
                  onClick={limparCampos}
                  disabled={loading || cepLoading || cnpjLoading}
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
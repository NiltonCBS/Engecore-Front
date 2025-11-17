import { useState } from "react";
import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";
import { toast } from 'react-toastify';
import { api } from "../../../services/api.js"; 


export default function CadastrarCliente() {
  // Estado para armazenar os dados do cliente
  const [cliente, setCliente] = useState({
    nome: "",
    razaoSocial: "",
    tipoCliente: "",
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
    dadosComerciais: {
      limiteCredito: "",
      prazoVencimento: "",
      desconto: "",
      vendedor: "",
      observacoes: ""
    },
    status: "ativo"
  });

  // Estados de Loading
  const [loading, setLoading] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  // Função para buscar dados do CNPJ na API Minha Receita
  const buscarCnpj = async (cnpj) => {
    // Remove caracteres não numéricos
    const numeros = cnpj.replace(/\D/g, '');
    if (numeros.length !== 14) return; // Só busca se for um CNPJ completo

    setCnpjLoading(true);
    try {
      const response = await fetch(`https://minhareceita.org/${numeros}`);
      
      if (!response.ok) {
        throw new Error('CNPJ não encontrado ou API indisponível.');
      }

      const data = await response.json();

      // Atualiza o estado do cliente com os dados retornados da API
      setCliente(prev => ({
        ...prev,
        nome: data.nome_fantasia || "",
        razaoSocial: data.razao_social || "",
        email: data.email || prev.email, // Mantém o email digitado se a API não retornar
        telefone: data.ddd_telefone_1 ? formatarTelefone(data.ddd_telefone_1) : prev.telefone, // Formata o telefone
        endereco: {
          ...prev.endereco,
          rua: data.logradouro || "",
          numero: data.numero || "",
          complemento: data.complemento || "",
          bairro: data.bairro || "",
          cidade: data.municipio || "",
          estado: data.uf || "",
          cep: formatarCep(data.cep || "")
        }
      }));
      toast.success("Dados do CNPJ preenchidos.");

    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      toast.error("Erro ao consultar o CNPJ. Verifique o número e tente novamente.");
    } finally {
      setCnpjLoading(false);
    }
  };

  const buscarCep = async (cep) => {
    // Remove caracteres não numéricos
    const numeros = cep.replace(/\D/g, '');
    if (numeros.length !== 8) return; // CEP inválido

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.warn("CEP não encontrado");
         // Limpa os campos se o CEP for inválido
         setCliente(prev => ({
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

      // Atualiza o estado do cliente com os dados retornados
      setCliente(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          rua: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
          cep: formatarCep(data.cep || numeros) // já formata o CEP
        }
      }));
      toast.success("Endereço preenchido.");
      // Foca no campo "número"
      document.getElementsByName("endereco.numero")[0]?.focus();
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('endereco.')) {
      const campo = name.split('.')[1];
      setCliente(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [campo]: value
        }
      }));
    } else if (name.includes('dadosComerciais.')) {
      const campo = name.split('.')[1];
      setCliente(prev => ({
        ...prev,
        dadosComerciais: {
          ...prev.dadosComerciais,
          [campo]: value
        }
      }));
    } else {
      setCliente(prev => ({ ...prev, [name]: value }));
    }
  };

  const limparMascara = (valor) => (valor || "").replace(/\D/g, "");


  const handleSubmit = async () => {
    setLoading(true);
    // Validações básicas primeiro
    if (!cliente.nome || !cliente.cpfCnpj || !cliente.telefone || !cliente.email || !cliente.tipoCliente) {
      toast.warn("Por favor, preencha os campos obrigatórios (*).");
      setLoading(false);
      return;
    }

    // 1. Limpa a máscara do CPF/CNPJ
    const cpfCnpjSemMascara = limparMascara(cliente.cpfCnpj);
    const cepSemMascara = limparMascara(cliente.endereco.cep);

    // 2. Valida se tem pelo menos 8 dígitos
    if (cpfCnpjSemMascara.length < 8) {
        toast.warn("O CPF/CNPJ deve ter pelo menos 8 dígitos para gerar a senha.");
        setLoading(false);
        return;
    }

    // 3. Pega os 8 primeiros dígitos para a senha
    const senhaProvisoria = cpfCnpjSemMascara.substring(0, 8);

    // Monta o payload
    let payload = {
      nome: cliente.nome,
      email: cliente.email,
      senha: senhaProvisoria, // ATUALIZADO: usa os 8 dígitos
      telefone: cliente.telefone, // Mantém a máscara (Ex: (17) 99777-1234)
      status: cliente.status === "ativo" ? "STATUS_ATIVO" : "STATUS_INATIVO",
      role: "ROLE_CLIENTE", 
      tipoPessoa: cliente.tipoCliente === "Pessoa Física" ? "FISICA" : "JURIDICA",
      endereco: {
        ...cliente.endereco,
        cep: cepSemMascara // Envia CEP sem máscara
      }
    };

    // Adiciona os dados específicos de PF ou PJ
    if (cliente.tipoCliente === "Pessoa Física") {
      payload = {
        ...payload,
        cpf: cpfCnpjSemMascara,
        rg: cliente.rg || null,
        dataNascimento: cliente.dataNascimento || null
      };
    } else { // Pessoa Jurídica ou MEI
      payload = {
        ...payload,
        cnpj: cpfCnpjSemMascara,
        razaoSocial: cliente.razaoSocial,
        nomeFantasia: cliente.nome,
        inscricaoEstadual: cliente.inscricaoEstadual || null
      };
    }

    try {
      console.log("Enviando payload:", payload);
      const response = await api.post("/cliente/cadastrar", payload, { withCredentials: true });
       toast.success("Cliente cadastrado com sucesso!");
      console.log("Resposta do servidor:", response.data);
      limparCampos();
    
    } catch (error) {
      // --- INÍCIO DO TRATAMENTO DE ERRO DETALHADO ---
      console.error("Erro ao cadastrar cliente:", error.response?.data || error.message);
      
      let erroMsg = "Erro desconhecido. Tente novamente.";

      if (error.response && error.response.data) {
          // 'message' ou 'erro' (depende de como seu GlobalExceptionHandler está configurado)
          erroMsg = error.response.data.message || error.response.data.erro || JSON.stringify(error.response.data);
      } else {
          erroMsg = error.message;
      }

      const erroMsgLower = erroMsg.toLowerCase();

      // Procura por "duplicate entry" (erro do MySQL) ou pelo nome da constraint
      if (erroMsgLower.includes("duplicate entry") || erroMsgLower.includes("constraintviolation")) {
          
          // Chave UK86phslelq64eeo6insr50y422 = telefone (conforme seu log)
          if (erroMsgLower.includes("uk86phslelq64eeo6insr50y422") || erroMsg.includes(cliente.telefone)) {
              toast.error("Erro: O Telefone '" + cliente.telefone + "' já está cadastrado.");
          
          // Chave do email (geralmente tem 'email' no nome)
          } else if (erroMsgLower.includes("email") || erroMsg.includes(cliente.email)) { 
              toast.error("Erro: O E-mail '" + cliente.email + "' já está cadastrado.");
          
          // Chave do CPF/CNPJ (geralmente tem 'cpf' ou 'cnpj' no nome)
          } else if (erroMsgLower.includes("cpf") || erroMsgLower.includes("cnpj") || erroMsg.includes(cliente.cpfCnpj)) {
              toast.error("Erro: O CPF/CNPJ '" + cliente.cpfCnpj + "' já está cadastrado.");
          
          } else {
              // Fallback se a mensagem não incluir o valor
              toast.error("Erro de duplicidade: E-mail, Telefone ou CPF/CNPJ já cadastrado.");
          }

      } else {
          // Mostra a mensagem genérica se não for um erro de duplicidade
          toast.error("Erro ao cadastrar: " + erroMsg);
      }
      // --- FIM DO TRATAMENTO DE ERRO ---
    } finally {
        setLoading(false);
    }
  };


  const limparCampos = () => {
    setCliente({
      nome: "",
      razaoSocial: "",
      tipoCliente: "",
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
      dadosComerciais: {
        limiteCredito: "",
        prazoVencimento: "",
        desconto: "",
        vendedor: "",
        observacoes: ""
      },
      status: "ativo"
    });
  };

  const formatarCpfCnpj = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    
    // Se for CPF (ou digitando)
    if (cliente.tipoCliente === "Pessoa Física") {
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
    // A formatação agora depende do tipoCliente, então chamamos a função direto
    setCliente(prev => ({ ...prev, cpfCnpj: formatarCpfCnpj(valor) }));
  };

  // Handler para o evento onBlur do campo CNPJ
  const handleCnpjBlur = (e) => {
    // Apenas busca se for Pessoa Jurídica ou MEI
    if (cliente.tipoCliente.includes("Jurídica") || cliente.tipoCliente.includes("MEI")) {
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
    setCliente(prev => ({ ...prev, telefone: valorFormatado }));
  };

  const formatarCep = (valor) => {
    if (!valor) return "";
    const numeros = valor.replace(/\D/g, '');
    return numeros.slice(0, 8).replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handleCepChange = (e) => {
    const valor = e.target.value;
    const valorFormatado = formatarCep(valor);
    setCliente(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        cep: valorFormatado
      }
    }));

    if (valor.replace(/\D/g, '').length === 8) {
      buscarCep(valor);
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
                <h1 className="text-3xl font-bold text-cordes-blue">Cadastro de Clientes</h1>
                <p className="text-gray-600 mt-2">Cadastre novos clientes e mantenha os dados atualizados</p>
              </div>
              <div className="text-right">
                <label className="block text-sm text-gray-500 mb-1">Status</label>
                 <select
                      name="status"
                      value={cliente.status}
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
                    <label className="block text-gray-700 font-medium mb-2">Tipo de Cliente *</label>
                    <select
                      name="tipoCliente"
                      value={cliente.tipoCliente}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    >
                      <option value="">Selecione o tipo</option>
                      {tiposCliente.map(tipo => (
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
                        value={cliente.cpfCnpj}
                        onChange={handleCpfCnpjChange}
                        onBlur={handleCnpjBlur}
                        placeholder={cliente.tipoCliente === 'Pessoa Física' ? '000.000.000-00' : '00.000.000/0000-00'}
                        className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                        maxLength="18"
                        disabled={!cliente.tipoCliente || cnpjLoading}
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
                      value={cliente.nome}
                      onChange={handleChange}
                      placeholder="Ex: João Silva ou Construtora ABC"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  {(cliente.tipoCliente === "Pessoa Jurídica" || cliente.tipoCliente === "Microempreendedor Individual (MEI)") && (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 font-medium mb-2">Razão Social</label>
                        <input
                          type="text"
                          name="razaoSocial"
                          value={cliente.razaoSocial}
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
                          value={cliente.inscricaoEstadual}
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
                      value={cliente.telefone}
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
                      value={cliente.email}
                      onChange={handleChange}
                      placeholder="cliente@email.com"
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
                        value={cliente.endereco.cep}
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
                      value={cliente.endereco.rua}
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
                      value={cliente.endereco.numero}
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
                      value={cliente.endereco.complemento}
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
                      value={cliente.endereco.bairro}
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
                      value={cliente.endereco.cidade}
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
                      value={cliente.endereco.estado}
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
                  className="flex-1 bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Cadastrando...</>
                  ) : (
                    <><i className="fas fa-check mr-2"></i>Cadastrar Cliente</>
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
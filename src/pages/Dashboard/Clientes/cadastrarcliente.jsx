import { useState } from "react";
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";
import { toast } from 'react-toastify';
import { api } from "../../../services/api";


export default function CadastrarCliente() {
  const [cliente, setCliente] = useState({
    nome: "",
    razaoSocial: "",
    tipoCliente: "",
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
    dadosComerciais: {
      limiteCredito: "",
      prazoVencimento: "",
      desconto: "",
      vendedor: "",
      observacoes: ""
    },
    status: "ativo"
  });

  const buscarCnpj = async (cnpj) => {
    const numeros = cnpj.replace(/\D/g, '');
    if (numeros.length !== 14) return;

    try {
      const response = await fetch(`https://minhareceita.org/${numeros}`);
      
      if (!response.ok) {
        throw new Error('CNPJ não encontrado ou API indisponível.');
      }

      const data = await response.json();

      setCliente(prev => ({
        ...prev,
        nome: data.nome_fantasia || "",
        razaoSocial: data.razao_social || "",
        email: data.email || prev.email,
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

      toast.success("Dados do CNPJ carregados com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      toast.error("Erro ao consultar o CNPJ. Verifique o número e tente novamente.");
    }
  };

  const buscarCep = async (cep) => {
    const numeros = cep.replace(/\D/g, '');
    if (numeros.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      setCliente(prev => ({
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
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP. Tente novamente.");
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

  const limparMascara = (valor) => valor.replace(/\D/g, "");

  const handleSubmit = async () => {
    if (!cliente.nome || !cliente.cpfCnpj || !cliente.telefone) {
      toast.warn("Por favor, preencha os campos obrigatórios.");
      return;
    }

    let payload = {
      nome: cliente.nome,
      email: cliente.email,
      senha: "123456",
      telefone: cliente.telefone,
      status: cliente.status === "ativo" ? "STATUS_ATIVO" : "STATUS_INATIVO",
      role: "ROLE_CLIENTE",
      tipoPessoa: cliente.tipoCliente === "Pessoa Física" ? "FISICA" : "JURIDICA",
      endereco: {
        rua: cliente.endereco.rua,
        numero: cliente.endereco.numero,
        complemento: cliente.endereco.complemento,
        bairro: cliente.endereco.bairro,
        cidade: cliente.endereco.cidade,
        estado: cliente.endereco.estado,
        cep: cliente.endereco.cep
      }
    };

    if (cliente.tipoCliente === "Pessoa Física") {
      payload.cpf = limparMascara(cliente.cpfCnpj);
      payload.rg = cliente.rg || "";
      payload.dataNascimento = cliente.dataNascimento || null;
    } else {
      payload.cnpj = limparMascara(cliente.cpfCnpj);
      payload.razaoSocial = cliente.razaoSocial;
      payload.nomeFantasia = cliente.nome;
      payload.inscricaoEstadual = cliente.inscricaoEstadual;
    }

    try {
      const response = await api.post("/cliente/cadastrar", payload, { withCredentials: true });
      toast.success("Cliente cadastrado com sucesso!");
      console.log("Resposta do servidor:", response.data);
      limparCampos();
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.response?.data || "Erro ao cadastrar cliente. Tente novamente.";
      toast.error(errorMessage);
    }
  };

  const limparCampos = () => {
    setCliente({
      nome: "",
      razaoSocial: "",
      tipoCliente: "",
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
    if (numeros.length <= 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const handleCpfCnpjChange = (e) => {
    const valor = e.target.value;
    const valorFormatado = formatarCpfCnpj(valor);
    setCliente(prev => ({ ...prev, cpfCnpj: valorFormatado }));
  };

  const handleCnpjBlur = (e) => {
    if (cliente.tipoCliente === "Pessoa Jurídica" || cliente.tipoCliente === "Microempreendedor Individual (MEI)") {
      buscarCnpj(e.target.value);
    }
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
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
    if (numeros.length !== 8) return numeros;
    return numeros.replace(/(\d{5})(\d{3})/, '$1-$2');
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
                <div className="text-sm text-gray-500">Status</div>
                <div className="text-2xl font-bold text-green-600">{cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}</div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Informações Básicas */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informações Básicas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <input
                      type="text"
                      name="cpfCnpj"
                      value={cliente.cpfCnpj}
                      onChange={handleCpfCnpjChange}
                      onBlur={handleCnpjBlur}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      maxLength="18"
                    />
                  </div>

                  {(cliente.tipoCliente === "Pessoa Jurídica" || cliente.tipoCliente === "Microempreendedor Individual (MEI)") && (
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
                  )}

                  {(cliente.tipoCliente === "Pessoa Jurídica" || cliente.tipoCliente === "Microempreendedor Individual (MEI)") && (
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
                  )}

                  {cliente.tipoCliente === "Pessoa Física" && (
                    <>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">RG</label>
                        <input
                          type="text"
                          name="rg"
                          value={cliente.rg}
                          onChange={handleChange}
                          placeholder="00.000.000-0"
                          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Data de Nascimento</label>
                        <input
                          type="date"
                          name="dataNascimento"
                          value={cliente.dataNascimento}
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
                      value={cliente.telefone}
                      onChange={handleTelefoneChange}
                      placeholder="(00) 00000-0000"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      maxLength="15"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">E-mail</label>
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
                    <input
                      type="text"
                      name="endereco.cep"
                      value={cliente.endereco.cep}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      maxLength="9"
                    />
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
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Estado</label>
                    <select
                      name="endereco.estado"
                      value={cliente.endereco.estado}
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

              {/* Botões de Ação */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md hover:shadow-lg"
                >
                  Cadastrar Cliente
                </button>
                <button
                  onClick={limparCampos}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300"
                >
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
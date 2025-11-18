import { useState } from "react";

import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";

import { toast } from 'react-toastify';
import { api } from "../../../services/api.js";

// Lista de Roles (baseada na sua Role.java)
const ROLES_FUNCIONARIO = [
  "ROLE_FUNC_ADM",
  "ROLE_FUNC_FINANCEIRO",
  "ROLE_FUNC_GERENTE",
  "ROLE_FUNC_GESTOR",
  "ROLE_FUNC_RH",
  "ROLE_FUNC_CONST"
];

const TIPOS_PESSOA = [
  "Pessoa Física",
  "Pessoa Jurídica",
];

export default function CadastrarFuncionario() {

  const [funcionario, setFuncionario] = useState({
    nome: "",
    razaoSocial: "",
    tipoPessoa: "Pessoa Física",
    cpfCnpj: "",
    inscricaoEstadual: "",
    rg: "",
    dataNascimento: "",
    telefone: "",
    email: "",
    status: "STATUS_ATIVO",
    role: "ROLE_FUNC_CONST",
    cargo: "",
    salario: "",
    dataAdmissao: ""
  });

  const [loading, setLoading] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);

  // ------------------------
  // FORMATAÇÕES
  // ------------------------

    const capitalizar = (texto = "") => {
    return texto
      .toLowerCase()
      .replace(/(?:^|\s)\S/g, (letra) => letra.toUpperCase());
  };

  const normalizarEmail = (email = "") => email.trim().toLowerCase();

  const normalizarFuncionario = (c) => {
  return {
    ...c,
    nome: capitalizar(c.nome),
    razaoSocial: capitalizar(c.razaoSocial),
    email: normalizarEmail(c.email),
  };
};

  const limparMascara = (valor) => (valor || "").replace(/\D/g, "");

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 10) {
      return numeros
        .slice(0, 10)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return numeros
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const formatarCpfCnpj = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (funcionario.tipoPessoa === "Pessoa Física") {
      return numeros
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return numeros
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const handleCpfCnpjChange = (e) => {
    const valor = e.target.value;
    setFuncionario(prev => ({
      ...prev,
      cpfCnpj: formatarCpfCnpj(valor)
    }));
  };

  const handleTelefoneChange = (e) => {
    const valor = e.target.value;
    setFuncionario(prev => ({
      ...prev,
      telefone: formatarTelefone(valor)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFuncionario(prev => ({ ...prev, [name]: value }));
  };

  // ------------------------
  // CNPJ API
  // ------------------------

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
      const empresa = data;
      const est = data.estabelecimento;

      const telefoneCompleto =
        est.ddd1 && est.telefone1
          ? formatarTelefone(`${est.ddd1}${est.telefone1}`)
          : funcionario.telefone;

      setFuncionario((prev) => ({
        ...prev,
        nome: est.nome_fantasia || prev.nome,
        razaoSocial: empresa.razao_social || prev.razaoSocial,
        email: est.email || prev.email,
        telefone: telefoneCompleto
      }));

      toast.success("Dados do CNPJ carregados com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      toast.error("Erro ao consultar o CNPJ.");
    } finally {
      setCnpjLoading(false);
    }
  };

  const handleCnpjBlur = (e) => {
    if (funcionario.tipoPessoa === "Pessoa Jurídica") {
      buscarCnpj(e.target.value);
    }
  };

  // ------------------------
  // SUBMIT
  // ------------------------

  const handleSubmit = async () => {
    setLoading(true);

    if (!funcionario.nome ||
        !funcionario.cpfCnpj ||
        !funcionario.telefone ||
        !funcionario.email ||
        !funcionario.tipoPessoa ||
        !funcionario.cargo ||
        !funcionario.dataAdmissao ||
        !funcionario.salario) {
      toast.warn("Por favor, preencha todos os campos obrigatórios (*).");
      setLoading(false);
      return;
    }

    const cpfCnpjSemMascara = limparMascara(funcionario.cpfCnpj);

    if (cpfCnpjSemMascara.length < 8) {
      toast.warn("O CPF/CNPJ deve ter pelo menos 8 dígitos para gerar a senha.");
      setLoading(false);
      return;
    }

    const senhaProvisoria = cpfCnpjSemMascara.substring(0, 8);

    const funcionarioNormalizado = normalizarFuncionario(funcionario);

    const payload = {
      nome: funcionarioNormalizado.nome,
      email: funcionarioNormalizado.email,
      senha: senhaProvisoria,
      telefone: funcionarioNormalizado.telefone,
      status: funcionarioNormalizado.status,
      role: funcionarioNormalizado.role,
      tipoPessoa: funcionarioNormalizado.tipoPessoa === "Pessoa Física" ? "FISICA" : "JURIDICA",

      cargo: funcionarioNormalizado.cargo,
      salario: parseFloat(funcionarioNormalizado.salario) || 0,
      dataAdmissao: funcionarioNormalizado.dataAdmissao,

      cpf: null,
      rg: null,
      dataNascimento: null,
      cnpj: null,
      razaoSocial: null,
      nomeFantasia: null,
      inscricaoEstadual: null
    };

    if (payload.tipoPessoa === "FISICA") {
      payload.cpf = cpfCnpjSemMascara;
      payload.rg = funcionario.rg || null;
      payload.dataNascimento = funcionario.dataNascimento || null;
    } else {
      payload.cnpj = cpfCnpjSemMascara;
      payload.razaoSocial = funcionario.razaoSocial;
      payload.nomeFantasia = funcionario.nome;
      payload.inscricaoEstadual = funcionario.inscricaoEstadual || null;
    }

    try {
      console.log("Enviando payload:", payload);
      const response = await api.post("/funcionario/cadastrar", payload);
      toast.success("Funcionário cadastrado com sucesso!");
      console.log("Resposta do servidor:", response.data);
      limparCampos();
    } catch (error) {
      console.error("Erro ao cadastrar funcionário:", error.response?.data || error.message);
      let erroMsg = error.response?.data?.message || "Erro desconhecido. Tente novamente.";
      toast.error("Erro ao cadastrar: " + erroMsg);
    } finally {
      setLoading(false);
    }
  };

  const limparCampos = () => {
    setFuncionario({
      nome: "",
      razaoSocial: "",
      tipoPessoa: "Pessoa Física",
      cpfCnpj: "",
      inscricaoEstadual: "",
      rg: "",
      dataNascimento: "",
      telefone: "",
      email: "",
      status: "STATUS_ATIVO",
      role: "ROLE_FUNC_CONST",
      cargo: "",
      salario: "",
      dataAdmissao: ""
    });
  };

  // ------------------------
  // JSX
  // ------------------------

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-md p-8">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-cordes-blue">
                  Cadastro de Funcionários
                </h1>
                <p className="text-gray-600 mt-2">
                  Cadastre novos membros da equipe
                </p>
              </div>

              <div className="text-right">
                <label className="block text-sm text-gray-500 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={funcionario.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-cordes-blue"
                >
                  <option value="STATUS_ATIVO">Ativo</option>
                  <option value="STATUS_INATIVO">Inativo</option>
                </select>
              </div>
            </div>

            <div className="space-y-8">

              {/* PESSOAL / EMPRESARIAL */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Informações Pessoais/Empresariais
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Tipo de Pessoa *
                    </label>
                    <select
                      name="tipoPessoa"
                      value={funcionario.tipoPessoa}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    >
                      {TIPOS_PESSOA.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      CPF/CNPJ *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cpfCnpj"
                        value={funcionario.cpfCnpj}
                        onChange={handleCpfCnpjChange}
                        onBlur={handleCnpjBlur}
                        placeholder={
                          funcionario.tipoPessoa === 'Pessoa Física'
                            ? '000.000.000-00'
                            : '00.000.000/0000-00'
                        }
                        className="w-full border border-gray-300 rounded-lg p-3 pr-10"
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
                    <label className="block text-gray-700 font-medium mb-2">
                      Nome / Nome Fantasia *
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={funcionario.nome}
                      onChange={handleChange}
                      placeholder="Nome completo ou fantasia"
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>

                  {funcionario.tipoPessoa === "Pessoa Jurídica" ? (
                    <>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Razão Social
                        </label>
                        <input
                          type="text"
                          name="razaoSocial"
                          value={funcionario.razaoSocial}
                          onChange={handleChange}
                          placeholder="Razão Social da empresa"
                          className="w-full border border-gray-300 rounded-lg p-3"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Inscrição Estadual
                        </label>
                        <input
                          type="text"
                          name="inscricaoEstadual"
                          value={funcionario.inscricaoEstadual}
                          onChange={handleChange}
                          placeholder="Inscrição Estadual"
                          className="w-full border border-gray-300 rounded-lg p-3"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          RG
                        </label>
                        <input
                          type="text"
                          name="rg"
                          value={funcionario.rg}
                          onChange={handleChange}
                          placeholder="00.000.000-0"
                          className="w-full border border-gray-300 rounded-lg p-3"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          Data de Nascimento
                        </label>
                        <input
                          type="date"
                          name="dataNascimento"
                          value={funcionario.dataNascimento}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg p-3"
                        />
                      </div>
                    </>
                  )}

                </div>
              </div>

              {/* CONTATO */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Contato e Acesso
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Celular *
                    </label>
                    <input
                      type="text"
                      name="telefone"
                      value={funcionario.telefone}
                      onChange={handleTelefoneChange}
                      placeholder="(00) 00000-0000"
                      className="w-full border border-gray-300 rounded-lg p-3"
                      maxLength="15"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={funcionario.email}
                      onChange={handleChange}
                      placeholder="funcionario@engecore.com"
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>

                </div>
              </div>

              {/* INFORMAÇÕES PROFISSIONAIS */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Informações Profissionais
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Cargo *
                    </label>
                    <input
                      type="text"
                      name="cargo"
                      value={funcionario.cargo}
                      onChange={handleChange}
                      placeholder="Ex: Engenheiro Civil"
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Salário (R$) *
                    </label>
                    <input
                      type="number"
                      name="salario"
                      value={funcionario.salario}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Data de Admissão *
                    </label>
                    <input
                      type="date"
                      name="dataAdmissao"
                      value={funcionario.dataAdmissao}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">
                      Permissão (Role) *
                    </label>
                    <select
                      name="role"
                      value={funcionario.role}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    >
                      {ROLES_FUNCIONARIO.map(role => (
                        <option key={role} value={role}>
                          {role.replace("ROLE_FUNC_", "")}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
              </div>

              {/* BOTÕES */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={handleSubmit}
                  disabled={loading || cnpjLoading}
                  className="flex-1 bg-blue-700 text-white font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-600 transition shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Cadastrar Funcionário
                    </>
                  )}
                </button>

                <button
                  onClick={limparCampos}
                  disabled={loading || cnpjLoading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition disabled:opacity-50"
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

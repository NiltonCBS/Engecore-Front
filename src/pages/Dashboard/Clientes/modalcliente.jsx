import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { api } from "../../../services/api.js";

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
    // Adicionado para compatibilidade com a nova função handleChange
    dadosComerciais: {
      limiteCredito: "",
      prazoVencimento: "",
      desconto: "",
      vendedor: "",
      observacoes: ""
    },
    status: "ativo"
  });

  const [loading, setLoading] = useState(false);
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [cepLoading, setCepLoading] = useState(false); // Novo estado necessário para buscarCep
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState({});
   const [novaSenha, setNovaSenha] = useState(""); 
    const [alterarSenhaChecked, setAlterarSenhaChecked] = useState(false);

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

  // --- Helpers necessários para as novas funções ---
  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 10) { // Fixo
      return numeros.slice(0, 10).replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    } else { // Celular
      return numeros.slice(0, 11).replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
    }
  };

  const formatarCep = (valor) => {
    if (!valor) return "";
    const numeros = valor.replace(/\D/g, '');
    return numeros.slice(0, 8).replace(/(\d{5})(\d{3})/, '$1-$2');
  };
  // ------------------------------------------------

  // Carregar dados do cliente quando o modal abrir
  useEffect(() => {
    if (isOpen && cliente) {
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
        dadosComerciais: cliente.dadosComerciais || {
          limiteCredito: "",
          prazoVencimento: "",
          desconto: "",
          vendedor: "",
          observacoes: ""
        },
        status: cliente.status || "ativo"
      });
      setErro("");
      setErros({});
    }
  }, [isOpen, cliente]);


  // --- NOVAS FUNÇÕES INTEGRADAS (Adaptadas para usar setFormData) ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('endereco.')) {
      // Suporta tanto "endereco.rua" quanto inputs que usam name="rua" mas lógica manual
      const campo = name.includes('.') ? name.split('.')[1] : name; 
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [campo]: value
        }
      }));
    } else if (name.includes('dadosComerciais.')) {
      const campo = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dadosComerciais: {
          ...prev.dadosComerciais,
          [campo]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Limpa erro do campo ao digitar
    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: "" }));
    }
  };

  const buscarCnpj = async (cnpj) => {
    const numeros = cnpj.replace(/\D/g, '');
    if (numeros.length !== 14) return;

    setLoadingCnpj(true);
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
          : formData.telefone;

      // CEP formatado
      const cepFormatado = est.cep ? formatarCep(est.cep) : formData?.endereco?.cep;

      setFormData((prev) => ({
        ...prev,

        nome: est.nome_fantasia || "",
        razaoSocial: empresa.razao_social || "",
        email: est.email || prev.email,

        telefone: telefoneCompleto,

        endereco: {
          ...prev.endereco,
          rua: est.logradouro || "",
          numero: est.numero || "",
          complemento: est.complemento || "",
          bairro: est.bairro || "",
          cidade: est.cidade?.nome || "",
          estado: est.estado?.sigla || "",
          cep: cepFormatado || "",
        },
      }));

      toast.success("Dados do CNPJ carregados com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      toast.error("Erro ao consultar o CNPJ. Verifique o número e tente novamente.");
    } finally {
      setLoadingCnpj(false);
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
        setFormData(prev => ({
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

      setFormData(prev => ({
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
      // Foca no campo "número" se existir
      document.getElementsByName("endereco.numero")[0]?.focus();
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };

  // --- FIM DAS NOVAS FUNÇÕES ---

  const handleCepChange = (e) => {
    const { value } = e.target;
    const cepFormatado = formatarCep(value);
    
    setFormData(prev => ({
      ...prev,
      endereco: { ...prev.endereco, cep: cepFormatado }
    }));

    if (value.replace(/\D/g, '').length === 8) {
      buscarCep(value);
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
      cpfCnpj: formatarCpfCnpj(value, prev.tipoCliente)
    }));
  };
  
  const handleCnpjBlur = (e) => {
    if (formData.tipoCliente !== "Pessoa Física") {
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
    
    const clienteId = cliente?.id || cliente?.idUsuario;
    if (!cliente || !clienteId) {
      setErro("ID do cliente não encontrado. Tente novamente.");
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
      role: "ROLE_CLIENTE",
      tipoPessoa: formData.tipoCliente === "Pessoa Física" ? "FISICA" : "JURIDICA",
      endereco: {
        rua: formData.endereco.rua.trim(),
        numero: formData.endereco.numero.trim(),
        complemento: formData.endereco.complemento.trim(),
        bairro: formData.endereco.bairro.trim(),
        cidade: formData.endereco.cidade.trim(),
        estado: formData.endereco.estado.trim(),
        cep: (formData.endereco.cep || "").replace(/\D/g, "")
      },
      obrasIds: [],
      cpf: null,
      rg: null,
      dataNascimento: null,
      cnpj: null,
      razaoSocial: null,
      nomeFantasia: null,
      inscricaoEstadual: null,
    };

    // --- CORREÇÃO AQUI: Adiciona a senha se o checkbox estiver marcado ---
    if (alterarSenhaChecked && novaSenha.trim()) {
        dadosParaEnvio.senha = novaSenha.trim();
    }
    // ---------------------------------------------------------------------

    if (formData.tipoCliente === "Pessoa Física") {
      dadosParaEnvio.cpf = (formData.cpfCnpj || "").replace(/\D/g, "");
    } else {
      dadosParaEnvio.cnpj = (formData.cpfCnpj || "").replace(/\D/g, "");
      dadosParaEnvio.razaoSocial = formData.razaoSocial.trim();
      dadosParaEnvio.nomeFantasia = formData.nome.trim();
      dadosParaEnvio.inscricaoEstadual = formData.inscricaoEstadual.trim();
    }
    
    try {
      console.log("Dados para envio:", JSON.stringify(dadosParaEnvio, null, 2));

      await api.put(`/cliente/alterar/${clienteId}`, dadosParaEnvio);

      const clienteAtualizado = {
        ...cliente,
        ...formData
      };

      onClienteAtualizado(clienteAtualizado);
      onClose();
      toast.success("Cliente atualizado com sucesso!");
      
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      const msg = error.response?.data?.message || error.message || "Erro desconhecido";
      setErro(`Erro ao conectar com o servidor: ${msg}`);
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
                  placeholder="Nome do cliente ou fantasia"
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
                <div className="relative">
                  <input
                    type="text"
                    name="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={handleCpfCnpjChange}
                    onBlur={handleCnpjBlur}
                    maxLength={formData.tipoCliente === "Pessoa Física" ? 14 : 18}
                    className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${erros.cpfCnpj ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder={formData.tipoCliente === "Pessoa Física" ? "000.000.000-00" : "00.000.000/0000-00"}
                  />
                  {loadingCnpj && <i className="fas fa-spinner fa-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>}
                </div>
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
              {/* CAMPO DE NOVA SENHA MODIFICADO */}
                  <div className="md:col-span-2">
                    {/* Checkbox para habilitar a alteração */}
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="alterarSenhaCheck"
                        checked={alterarSenhaChecked}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setAlterarSenhaChecked(isChecked);
                          if (!isChecked) {
                            setNovaSenha(""); // Limpa a senha se desmarcar
                          }
                        }}
                        className="h-4 w-4 text-cordes-blue border-gray-300 rounded focus:ring-cordes-blue"
                      />
                      <label htmlFor="alterarSenhaCheck" className="ml-2 block text-sm font-medium text-gray-700">
                        Alterar Senha
                      </label>
                    </div>

                    {/* Input de Senha */}
                    <input
                      type="password"
                      name="novaSenha"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Digite a nova senha"
                      className="w-full border border-gray-300 rounded-lg p-3 disabled:bg-gray-200 disabled:cursor-not-allowed"
                      autoComplete="new-password"
                      disabled={!alterarSenhaChecked} // Desabilitado se o checkbox não estiver marcado
                    />
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
                  onChange={handleInputChange} // Atualizado para usar a função correta que pode ter máscara se quiser, ou manter inputChange
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
          
          <div className="mb-8">
             <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
               Endereço
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                <div className="relative">
                  <input
                    type="text"
                    name="endereco.cep"
                    value={formData.endereco.cep}
                    onChange={handleCepChange}
                    maxLength={9}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="00000-000"
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
                 <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
                 <input
                   type="text"
                   name="endereco.rua"
                   value={formData.endereco.rua}
                   onChange={handleInputChange}
                   className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="Nome da rua"
                   disabled={cepLoading}
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
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
                 <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
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
                 <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
                 <input
                   type="text"
                   name="endereco.bairro"
                   value={formData.endereco.bairro}
                   onChange={handleInputChange}
                   className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="Nome do bairro"
                   disabled={cepLoading}
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                 <input
                   type="text"
                   name="endereco.cidade"
                   value={formData.endereco.cidade}
                   onChange={handleInputChange}
                   className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="Nome da cidade"
                   disabled={cepLoading}
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                 <select
                   name="endereco.estado"
                   value={formData.endereco.estado}
                   onChange={handleInputChange}
                   className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                   disabled={cepLoading}
                 >
                   <option value="">Selecione...</option>
                   {estados.map(estado => (
                     <option key={estado} value={estado}>{estado}</option>
                   ))}
                 </select>
               </div>
             </div>
           </div>

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
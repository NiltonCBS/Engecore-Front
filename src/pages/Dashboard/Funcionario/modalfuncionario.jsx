import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { api } from "../../../services/api.js";

// Mesmas listas do cadastrar
const ROLES_FUNCIONARIO = [
  "ROLE_FUNC_ADM", "ROLE_FUNC_FINANCEIRO", "ROLE_FUNC_GERENTE",
  "ROLE_FUNC_GESTOR", "ROLE_FUNC_RH", "ROLE_FUNC_CONST"
];
const TIPOS_PESSOA = ["Pessoa Física", "Pessoa Jurídica"];

export default function ModalEditarFuncionario({ funcionarioId, isOpen, onClose, onFuncionarioAtualizado }) {
  
  // O formData começa nulo
  const [formData, setFormData] = useState(null); 
  const [novaSenha, setNovaSenha] = useState(""); 
  const [alterarSenhaChecked, setAlterarSenhaChecked] = useState(false);
  
  const [loading, setLoading] = useState(false); // Loading geral do modal (busca)
  const [loadingSubmit, setLoadingSubmit] = useState(false); // Loading do botão salvar
  const [cnpjLoading, setCnpjLoading] = useState(false); // <<< ADICIONADO
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState({});

  // Efeito para buscar os dados completos do funcionário quando o modal abre
  useEffect(() => {
    if (isOpen && funcionarioId) {
      const fetchFuncionarioDetails = async () => {
        setLoading(true);
        setErro("");
        setFormData(null); // Limpa dados antigos
        setNovaSenha(""); // Limpa o campo senha ao abrir
        setAlterarSenhaChecked(false); // Limpa o checkbox
        try {
          // Busca o FuncionarioDTO completo
          const response = await api.get(`/funcionario/${funcionarioId}`);
          if (response.data.success) {
            const dto = response.data.data;
            // Mapeia o DTO para o estado do formulário
            setFormData({
              nome: dto.nome || "",
              razaoSocial: dto.razaoSocial || "",
              tipoPessoa: dto.tipoPessoa === "FISICA" ? "Pessoa Física" : "Pessoa Jurídica",
              cpfCnpj: dto.cpf || dto.cnpj || "",
              inscricaoEstadual: dto.inscricaoEstadual || "",
              rg: dto.rg || "",
              dataNascimento: dto.dataNascimento || "",
              telefone: dto.telefone || "",
              email: dto.email || "",
              status: dto.status || "STATUS_ATIVO",
              role: dto.role || "ROLE_FUNC_CONST",
              cargo: dto.cargo || "",
              salario: dto.salario || "",
              dataAdmissao: dto.dataAdmissao || ""
            });
          } else {
            throw new Error(response.data.message);
          }
        } catch (error) {
          console.error("Erro ao buscar detalhes do funcionário:", error);
          setErro("Erro ao carregar dados do funcionário. Tente fechar e abrir novamente.");
          toast.error("Erro ao carregar dados do funcionário.");
        } finally {
          setLoading(false);
        }
      };
      fetchFuncionarioDetails();
    }
  }, [isOpen, funcionarioId]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (erros[name]) setErros(prev => ({ ...prev, [name]: "" }));
  };

  const validarFormulario = () => {
    // Validação da nova senha (opcional)
    if (novaSenha && (novaSenha.length < 6 || novaSenha.length > 20)) {
       toast.warn("A nova senha deve ter entre 6 e 20 caracteres.");
       return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setLoadingSubmit(true);
    setErro("");

    const cpfCnpjSemMascara = limparMascara(formData.cpfCnpj);

    // Monta o payload (FuncionarioDTO)
    let payload = {
      nome: formData.nome,
      email: formData.email,
      // CORREÇÃO: Envia a nova senha (ou nulo se estiver em branco)
      senha: novaSenha.trim() || null, 
      telefone: formData.telefone,
      status: formData.status,
      role: formData.role,
      tipoPessoa: formData.tipoPessoa === "Pessoa Física" ? "FISICA" : "JURIDICA",
      
      cargo: formData.cargo,
      salario: parseFloat(formData.salario) || 0,
      dataAdmissao: formData.dataAdmissao,

      cpf: null, rg: null, dataNascimento: null,
      cnpj: null, razaoSocial: null, nomeFantasia: null, inscricaoEstadual: null
    };

    if (payload.tipoPessoa === "FISICA") {
      payload.cpf = cpfCnpjSemMascara;
      payload.rg = formData.rg || null;
      payload.dataNascimento = formData.dataNascimento || null;
    } else { 
      payload.cnpj = cpfCnpjSemMascara;
      payload.razaoSocial = formData.razaoSocial;
      payload.nomeFantasia = formData.nome;
      payload.inscricaoEstadual = formData.inscricaoEstadual || null;
    }
    
    try {
      console.log("Atualizando payload:", payload);
      const response = await api.put(`/funcionario/alterar/${funcionarioId}`, payload);

      if (response.data.success) {
        onFuncionarioAtualizado(response.data.data); // Retorna o DTO atualizado
        toast.success("Funcionário atualizado com sucesso!");
        handleClose(); // Fecha o modal
      } else {
        throw new Error(response.data.message);
      }
      
    } catch (error) {
      console.error("Erro ao atualizar funcionário:", error);
      const msg = error.response?.data?.message || error.message || "Erro desconhecido";
      setErro(`Erro ao salvar: ${msg}`);
      toast.error(`Erro ao salvar: ${msg}`);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleClose = () => {
    if (!loadingSubmit) {
      onClose();
    }
  };

  // --- Funções de Formatação (copiadas) ---
  const limparMascara = (valor) => (valor || "").replace(/\D/g, "");
  
  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
   if (numeros.length <= 10) { 
     return numeros.slice(0, 10).replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
   } else { 
     return numeros.slice(0, 11).replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
   }
 };
 
  // ADICIONADO - Função para buscar CNPJ
  const buscarCnpj = async (cnpj) => {
    const numeros = cnpj.replace(/\D/g, '');
    if (numeros.length !== 14) return;

    setCnpjLoading(true);
    try {
      const response = await fetch(`https://minhareceita.org/${numeros}`);
      if (!response.ok) throw new Error('CNPJ não encontrado.');
      const data = await response.json();
      // Atualiza o formData com os dados da API
      setFormData(prev => ({
        ...prev,
        nome: data.nome_fantasia || prev.nome, // Usa o nome fantasia
        razaoSocial: data.razao_social || prev.razaoSocial,
        email: data.email || prev.email, // Mantém o email se a API não retornar
        telefone: data.ddd_telefone_1 ? formatarTelefone(data.ddd_telefone_1) : prev.telefone,
      }));
      toast.success("Dados do CNPJ atualizados.");
    } catch (error) {
      toast.error("Erro ao consultar o CNPJ.");
    } finally {
      setCnpjLoading(false);
    }
  };

  const formatarCpfCnpj = (valor, tipo) => {
    const apenasNumeros = (valor || "").replace(/\D/g, "");
    if (tipo === "Pessoa Física") {
      return apenasNumeros.slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      return apenasNumeros.slice(0, 14).replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    }
  };

  const handleCpfCnpjChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, cpfCnpj: formatarCpfCnpj(value, prev.tipoPessoa) }));
  };

  // ADICIONADO - Handler onBlur para o CNPJ
  const handleCnpjBlur = (e) => {
    // Só busca se for Pessoa Jurídica
    if (formData.tipoPessoa.includes("Jurídica")) {
      buscarCnpj(e.target.value);
    }
  };

   const handleTelefoneChange = (e) => {
    const valor = e.target.value;
    const valorFormatado = formatarTelefone(valor);
    setFormData(prev => ({ ...prev, telefone: valorFormatado }));
  };


  // --- Renderização do Modal ---

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b bg-gray-50 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Editar Funcionário</h2>
            <button
              onClick={handleClose}
              disabled={loadingSubmit}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Exibe loading enquanto busca dados */}
        {loading && (
          <div className="p-12 text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-cordes-blue"></i>
            <p className="mt-2 text-gray-600">Carregando dados do funcionário...</p>
          </div>
        )}

        {/* Exibe erro de carregamento */}
        {erro && !loading && (
          <div className="p-12 text-center text-red-600">
            <p>{erro}</p>
          </div>
        )}

        {/* Exibe o formulário quando os dados (formData) estiverem prontos */}
        {!loading && !erro && formData && (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-8">
              {/* Informações Pessoais */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informações Pessoais/Empresariais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Tipo de Pessoa *</label>
                    <select
                      name="tipoPessoa"
                      value={formData.tipoPessoa}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    >
                      {TIPOS_PESSOA.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">CPF/CNPJ *</label>
                    {/* CAMPO ATUALIZADO com onBlur e ícone de loading */}
                    <div className="relative">
                      <input
                        type="text"
                        name="cpfCnpj"
                        value={formData.cpfCnpj}
                        onChange={handleCpfCnpjChange}
                        onBlur={handleCnpjBlur} // Adicionado onBlur
                        placeholder={formData.tipoPessoa === 'Pessoa Física' ? '000.000.000-00' : '00.000.000/0000-00'}
                        className="w-full border border-gray-300 rounded-lg p-3 pr-10" // Adicionado pr-10
                        maxLength="18"
                        disabled={loadingSubmit || cnpjLoading} // Adicionado cnpjLoading
                      />
                      {/* ÍCONE DE LOADING ADICIONADO */}
                      {cnpjLoading && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <i className="fas fa-spinner fa-spin text-gray-500"></i>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Nome / Nome Fantasia *</label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>

                  {formData.tipoPessoa === "Pessoa Jurídica" ? (
                    <>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Razão Social</label>
                        <input
                          type="text"
                          name="razaoSocial"
                          value={formData.razaoSocial}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg p-3"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Inscrição Estadual</label>
                        <input
                          type="text"
                          name="inscricaoEstadual"
                          value={formData.inscricaoEstadual}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg p-3"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">RG</label>
                        <input
                          type="text"
                          name="rg"
                          value={formData.rg}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg p-3"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Data de Nascimento</label>
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
                </div>
              </div>

              {/* Contato */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Contato e Acesso</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Celular *</label>
                    <input
                      type="text"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleTelefoneChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                      maxLength="15"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">E-mail *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
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

              {/* Informações Profissionais */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informações Profissionais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Cargo *</label>
                    <input
                      type="text"
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Salário (R$) *</label>
                    <input
                      type="number"
                      name="salario"
                      value={formData.salario}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Data de Admissão *</label>
                    <input
                      type="date"
                      name="dataAdmissao"
                      value={formData.dataAdmissao}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">Permissão (Role) *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    >
                      {ROLES_FUNCIONARIO.map(role => (
                        <option key={role} value={role}>{role.replace("ROLE_FUNC_", "")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    >
                      <option value="STATUS_ATIVO">Ativo</option>
                      <option value="STATUS_INATIVO">Inativo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end border-t pt-6 sticky bottom-0 bg-white pb-6 px-6 -mx-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={loadingSubmit || cnpjLoading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loadingSubmit || cnpjLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingSubmit ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Salvando...</>
                ) : (
                  <><i className="fas fa-save mr-2"></i>Salvar Alterações</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
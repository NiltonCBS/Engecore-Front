import React, { useState, useEffect } from "react";
// CORREÇÃO: Adicionando .jsx às importações de componentes
import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";
import { NavLink } from "react-router-dom";
import { api } from "../../../services/api";
import ModalEditarCliente from "./modalcliente.jsx"; // .jsx adicionado
import { toast } from 'react-toastify';

function formatarCpfCnpj(valor) {
  if (!valor) return "";

  // Remove tudo que não seja número
  const num = valor.replace(/\D/g, "");

  // CPF -> 11 dígitos
  if (num.length === 11) {
    return num.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  // CNPJ -> 14 dígitos
  if (num.length === 14) {
    return num.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }

  // Se não for nenhum dos dois, retorna como está
  return valor;
}

export default function ListarClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [filtros, setFiltros] = useState({
    busca: "",
    status: "",
    tipoCliente: "",
  });

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [clientesPorPagina] = useState(10);
  const [clienteSelecionado, setClienteSelecionado] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  const [clienteParaEdicao, setClienteParaEdicao] = useState(false);

  const tiposCliente = [
    "Pessoa Física",
    "Pessoa Jurídica",
    "Microempreendedor Individual (MEI)"
  ];

  // Buscar clientes do backend
  useEffect(() => {
    buscarClientes();
  }, []);

  const buscarClientes = async () => {
    try {
      setLoading(true);
      setErro("");

      const response = await api.get("/cliente/listar", { withCredentials: true });

      if (response.data.success) {
        const clientesMapeados = response.data.data.map(cliente => ({
          id: cliente.id,
          nome: cliente.nome,
          razaoSocial: cliente.razaoSocial || "",
          tipoCliente: cliente.tipoPessoa === "FISICA" ? "Pessoa Física" : "Pessoa Jurídica",
          cpfCnpj: formatarCpfCnpj(cliente.cpf || cliente.cnpj || ""),
          inscricaoEstadual: cliente.usuarioJuridico?.inscricaoEstadual || "",
          telefone: cliente.telefone,
          email: cliente.email,
          endereco: {
            rua: cliente.endereco?.rua || "",
            numero: cliente.endereco?.numero || "",
            complemento: cliente.endereco?.complemento || "",
            bairro: cliente.endereco?.bairro || "",
            cidade: cliente.endereco?.cidade || "",
            estado: cliente.endereco?.estado || "",
            cep: cliente.endereco?.cep || ""
          },
          status: cliente.status === "STATUS_ATIVO" ? "ativo" : "inativo", // Mapeamento
          dataCadastro: cliente.dataCadastro || new Date().toISOString().split('T')[0]
        }));

        setClientes(clientesMapeados);
      } else {
        toast.error("Erro ao carregar clientes");
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setErro("Erro ao conectar com o servidor: " + (error.response?.data?.message || "Tente novamente"));
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente => {
    const matchBusca = cliente.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      (cliente.cpfCnpj && cliente.cpfCnpj.includes(filtros.busca)) ||
      cliente.email.toLowerCase().includes(filtros.busca.toLowerCase());

    const matchStatus = filtros.status === "" || cliente.status === filtros.status;
    const matchTipo = filtros.tipoCliente === "" || cliente.tipoCliente === filtros.tipoCliente;

    return matchBusca && matchStatus && matchTipo;
  });

  // Paginação
  const indexUltimoCliente = paginaAtual * clientesPorPagina;
  const indexPrimeiroCliente = indexUltimoCliente - clientesPorPagina;
  const clientesAtuais = clientesFiltrados.slice(indexPrimeiroCliente, indexUltimoCliente);
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPaginaAtual(1); // Reset para primeira página ao filtrar
  };

  const formatarData = (data) => {
    if (!data) return "N/A";
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const alternarStatus = async (id) => {
    try {
      const response = await api.put(`/usuarios/${id}/alterar-status`);

      const statusRetornadoPelaApi = response.data?.data;

      if (!statusRetornadoPelaApi) {
        throw new Error("A API não retornou o novo status do cliente.");
      }

      // --- ESTA É A CORREÇÃO ---
      // Mapeia a resposta da API (ex: "STATUS_ATIVO") para o padrão do estado (ex: "ativo")
      // Exatamente como é feito na função buscarClientes()
      const novoStatus = statusRetornadoPelaApi === "STATUS_ATIVO" ? "ativo" : "inativo";
      // -------------------------

      // Atualiza a lista *principal* de clientes
      // Renomeei a variável do map para 'listaCompleta' para evitar confusão
      setClientes(listaCompleta =>
        listaCompleta.map(cliente =>
          cliente.id === id ? { ...cliente, status: novoStatus } : cliente
        )
      );

      // Agora o toast também exibe a mensagem correta
      toast.success(`Cliente ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`);

    } catch (error) {
      console.error("Erro ao alterar status do cliente:", error);
      const mensagemDeErro = error.response?.data?.message || error.message || "Ocorreu um erro inesperado.";
      toast.error(`Não foi possível alterar o status: ${mensagemDeErro}`);
    }
  };

  const excluirCliente = async (id) => {
    // Usando o toast de confirmação
    toast.warn(
      ({ closeToast }) => (
        <div>
          <p className="font-semibold">Confirmar Exclusão</p>
          <p className="text-sm">Tem certeza que deseja excluir este cliente?</p>
          <div className="flex gap-2 mt-3">
            <button
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
              onClick={() => {
                _confirmarExclusao(id);
                closeToast();
              }}
            >
              Sim, Excluir
            </button>
            <button
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm"
              onClick={closeToast}
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false, draggable: false }
    );
  };

  // Função interna para ser chamada pelo toast
  const _confirmarExclusao = async (id) => {
    try {
      console.log("Excluindo cliente com ID:", id); // Debug
      await api.delete(`/cliente/deletar/${id}`, { withCredentials: true });
      setClientes(prev => prev.filter(cliente => cliente.id !== id));
      toast.success("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast.error("Erro ao excluir cliente: " + (error.response?.data?.message || "Tente novamente"));
    }
  };


  const visualizarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setMostrarModal(true);
  };

  const editarCliente = (cliente) => {
    setClienteParaEdicao(cliente);
    setMostrarModalEdicao(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setClienteSelecionado(null);
  };

  const fecharModalEdicao = () => {
    setMostrarModalEdicao(false);
    setClienteParaEdicao(null);
  };

  const handleClienteAtualizado = () => {
    buscarClientes();
    fecharModalEdicao();
  };

const limparFiltros = () => {
  setFiltros({
    busca: "",
    status: "",
    tipoCliente: "",
  });
  setPaginaAtual(1);
};

if (loading) {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center">
              <div className="text-gray-600 text-xl">Carregando clientes...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}          

if (erro) {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-4">{erro}</div>
              <button
                onClick={buscarClientes}
                className="bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-2 px-4 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

return (
  <div className="bg-gray-100 min-h-screen">
    <Sidebar />
    <div className="ml-64">
      <Header />
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-md">
          {/* Cabeçalho */}
          <div className="p-8 border-b">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-cordes-blue">Lista de Clientes</h1>
                <p className="text-gray-600 mt-2">Gerencie todos os clientes cadastrados</p>
              </div>
              <NavLink
                to="/users/adicionar"
                className="bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md hover:shadow-lg"
              >
                <i className="fas fa-plus mr-2"></i>
                Novo Cliente
              </NavLink>
            </div>

            {/* Estatísticas (agora usam a lista 'clientes' completa) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 text-2xl font-bold">{clientes.length}</div>
                <div className="text-blue-600 text-sm">Total de Clientes</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-2xl font-bold">
                  {clientes.filter(c => c.status === 'ativo').length}
                </div>
                <div className="text-green-600 text-sm">Clientes Ativos</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-red-600 text-2xl font-bold">
                  {clientes.filter(c => c.status === 'inativo').length}
                </div>
                <div className="text-red-600 text-sm">Clientes Inativos</div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Buscar</label>
                <input
                  type="text"
                  name="busca"
                  value={filtros.busca}
                  onChange={handleFiltroChange}
                  placeholder="Nome, CPF/CNPJ ou email..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Status</label>
                <select
                  name="status"
                  value={filtros.status}
                  onChange={handleFiltroChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Tipo de Cliente</label>
                <select
                  name="tipoCliente"
                  value={filtros.tipoCliente}
                  onChange={handleFiltroChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {tiposCliente.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={limparFiltros}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300"
              >
                <i className="fas fa-eraser mr-2"></i>
                Limpar Filtros
              </button>
              <button
                onClick={buscarClientes}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Atualizar
              </button>
              <div className="text-sm text-gray-600 flex items-center">
                Mostrando {clientesAtuais.length} de {clientesFiltrados.length} clientes
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientesAtuais.map((cliente, index) => (
                  <tr key={cliente.id || `cliente-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{cliente.nome}</div>
                        <div className="text-sm text-gray-500">{cliente.cpfCnpj}</div>
                        {cliente.razaoSocial && (
                          <div className="text-xs text-gray-400">{cliente.razaoSocial}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cliente.tipoCliente === 'Pessoa Física'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                        }`}>
                        {cliente.tipoCliente === 'Pessoa Física' ? 'PF' : 'PJ'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">{cliente.telefone}</div>
                        <div className="text-sm text-gray-500">{cliente.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {cliente.endereco.cidade && cliente.endereco.estado ?
                          `${cliente.endereco.cidade}, ${cliente.endereco.estado}` :
                          'Não informado'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cliente.status === 'ativo'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => visualizarCliente(cliente)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Visualizar"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => editarCliente(cliente)}
                          className="text-yellow-600 hover:text-yellow-800 transition-colors"
                          title="Editar"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => alternarStatus(cliente.id)}
                          className={`transition-colors ${cliente.status === 'ativo'
                            ? 'text-red-600 hover:text-red-800'
                            : 'text-green-600 hover:text-green-800'
                            }`}
                          title={cliente.status === 'ativo' ? 'Desativar' : 'Ativar'}
                        >
                          <i className={`fas ${cliente.status === 'ativo' ? 'fa-ban' : 'fa-check'}`}></i>
                        </button>
                        <button
                          onClick={() => excluirCliente(cliente.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Excluir"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clientesAtuais.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {filtros.busca || filtros.status || filtros.tipoCliente ?
                "Nenhum cliente encontrado com os filtros aplicados." :
                "Nenhum cliente cadastrado ainda."
              }
            </div>
          )}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Página {paginaAtual} de {totalPaginas}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaginaAtual(prev => Math.max(prev - 1, 1))}
                    disabled={paginaAtual === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Anterior
                  </button>

                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter(page =>
                      page === 1 ||
                      page === totalPaginas ||
                      (page >= paginaAtual - 2 && page <= paginaAtual + 2)
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={`page-${page}`}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => setPaginaAtual(page)}
                          className={`px-3 py-1 border rounded-md text-sm ${paginaAtual === page
                            ? 'bg-cordes-blue text-white border-cordes-blue'
                            : 'border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}

                  <button
                    onClick={() => setPaginaAtual(prev => Math.min(prev + 1, totalPaginas))}
                    disabled={paginaAtual === totalPaginas}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Modal de Visualização */}
    {mostrarModal && clienteSelecionado && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-cordes-blue">Detalhes do Cliente</h2>
              <button
                onClick={fecharModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Informações Básicas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Nome</label>
                  <div className="text-gray-900">{clienteSelecionado.nome}</div>
                </div>
                {clienteSelecionado.razaoSocial && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Razão Social</label>
                    <div className="text-gray-900">{clienteSelecionado.razaoSocial}</div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Tipo</label>
                  <div className="text-gray-900">{clienteSelecionado.tipoCliente}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">CPF/CNPJ</label>
                  <div className="text-gray-900">{clienteSelecionado.cpfCnpj}</div>
                </div>
                {clienteSelecionado.inscricaoEstadual && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Inscrição Estadual</label>
                    <div className="text-gray-900">{clienteSelecionado.inscricaoEstadual}</div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${clienteSelecionado.status === 'ativo'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {clienteSelecionado.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Data de Cadastro</label>
                  <div className="text-gray-900">{formatarData(clienteSelecionado.dataCadastro)}</div>
                </div>
              </div>
            </div>

            {/* Contato */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Contato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Telefone</label>
                  <div className="text-gray-900">{clienteSelecionado.telefone || "Não informado"}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <div className="text-gray-900">{clienteSelecionado.email || "Não informado"}</div>
                </div>
              </div>
            </div>

            {/* Endereço */}
            {(clienteSelecionado.endereco.rua || clienteSelecionado.endereco.cidade) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clienteSelecionado.endereco.rua && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Rua</label>
                      <div className="text-gray-900">{clienteSelecionado.endereco.rua}, {clienteSelecionado.endereco.numero}</div>
                    </div>
                  )}
                  {clienteSelecionado.endereco.bairro && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Bairro</label>
                      <div className="text-gray-900">{clienteSelecionado.endereco.bairro}</div>
                    </div>
                  )}
                  {clienteSelecionado.endereco.cidade && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Cidade/Estado</label>
                      <div className="text-gray-900">{clienteSelecionado.endereco.cidade}, {clienteSelecionado.endereco.estado}</div>
                    </div>
                  )}
                  {clienteSelecionado.endereco.cep && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">CEP</label>
                      <div className="text-gray-900">{clienteSelecionado.endereco.cep}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  fecharModal(); // Fechar modal de visualização primeiro
                  editarCliente(clienteSelecionado); // Depois abrir modal de edição
                }}
                className="bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-2 px-4 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300"
              >
                <i className="fas fa-edit mr-2"></i>
                Editar
              </button>
              <button
                onClick={fecharModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Modal de Edição */}
    <ModalEditarCliente
      cliente={clienteParaEdicao}
      isOpen={mostrarModalEdicao}
      onClose={fecharModalEdicao}
      onClienteAtualizado={handleClienteAtualizado}
    />
  </div>
);
}

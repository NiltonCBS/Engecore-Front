/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";
import { api } from "../../../services/api";
import { toast } from 'react-toastify';

export default function GerenciarMarcas() {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // Estado para o modal
  const [modalAberta, setModalAberta] = useState(false);
  const [marcaEmEdicao, setMarcaEmEdicao] = useState(null); // Se null, é "Novo", se tiver obj, é "Editar"
  const [nomeMarca, setNomeMarca] = useState(""); // Estado do input do modal
  const [loadingModal, setLoadingModal] = useState(false);

  // Função para buscar marcas
  const fetchMarcas = async () => {
    setLoading(true);
    try {
      const response = await api.get("/marca/listar");
      if (response.data.success) {
        setMarcas(response.data.data); // O backend retorna List<MarcaEntity>
      } else {
        toast.error("Erro ao carregar marcas.");
        setErro("Erro ao carregar marcas.");
      }
    } catch (error) {
      toast.error("Falha ao conectar com o servidor.");
      setErro("Falha ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Carregar marcas na inicialização
  useEffect(() => {
    fetchMarcas();
  }, []);

  // --- Funções do Modal ---

  const handleAbrirModalNovo = () => {
    setMarcaEmEdicao(null);
    setNomeMarca("");
    setModalAberta(true);
  };

  const handleAbrirModalEditar = (marca) => {
    setMarcaEmEdicao(marca);
    setNomeMarca(marca.nome);
    setModalAberta(true);
  };

  const handleFecharModal = () => {
    if (loadingModal) return; // Não deixa fechar se estiver salvando
    setModalAberta(false);
    setMarcaEmEdicao(null);
    setNomeMarca("");
  };

  const handleSalvar = async () => {
    if (!nomeMarca.trim()) {
      toast.warn("O nome da marca é obrigatório.");
      return;
    }

    setLoadingModal(true);
    const dto = { nome: nomeMarca.trim() };

    try {
      let promise;
      if (marcaEmEdicao) {
        // Modo Edição (PUT)
        promise = api.put(`/marca/alterar/${marcaEmEdicao.id}`, dto);
      } else {
        // Modo Cadastro (POST)
        promise = api.post("/marca/cadastrar", dto);
      }
      
      const response = await promise;

      if (response.data.success) {
        toast.success(marcaEmEdicao ? "Marca atualizada com sucesso!" : "Marca cadastrada com sucesso!");
        handleFecharModal();
        fetchMarcas(); // Recarrega a lista para pegar o ID/alteração
      } else {
        toast.error(response.data.message || "Erro ao salvar.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao salvar a marca.");
    } finally {
      setLoadingModal(false);
    }
  };

  // --- Função de Exclusão ---

  const handleExcluir = (id) => {
    toast.warn(
      ({ closeToast }) => (
        <div>
          <p className="font-semibold">Confirmar Exclusão</p>
          <p className="text-sm">Tem certeza que deseja excluir esta marca?</p>
          <p className="text-xs text-gray-500 mt-1">Isso pode falhar se a marca estiver em uso.</p>
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

  const _confirmarExclusao = async (id) => {
    try {
      await api.delete(`/marca/deletar/${id}`);
      setMarcas(prev => prev.filter(m => m.id !== id));
      toast.success("Marca excluída com sucesso!");
    } catch (error) {
      // O backend retorna um erro 409 (Conflict) se a marca estiver em uso
      if (error.response?.status === 409) {
        toast.error("Não é possível excluir: Esta marca já está sendo usada por produtos.");
      } else {
        toast.error(error.response?.data?.message || "Erro ao excluir marca.");
      }
    }
  };


  // Renderização
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="ml-64">
          <Header />
          <div className="p-6 text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-cordes-blue"></i>
            <p className="mt-2 text-gray-600">Carregando marcas...</p>
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
          <div className="p-6 text-center text-red-600">
            <p>{erro}</p>
            <button onClick={fetchMarcas} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Tentar Novamente</button>
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
          <div className="bg-white rounded-xl shadow-md p-8">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-cordes-blue">Gerenciar Marcas</h1>
                <p className="text-gray-600 mt-2">Adicione, edite ou remova marcas do sistema.</p>
              </div>
              <button
                onClick={handleAbrirModalNovo}
                className="bg-blue-700 text-white font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md hover:shadow-lg"
              >
                <i className="fas fa-plus mr-2"></i>
                Nova Marca
              </button>
            </div>

            {/* Tabela de Marcas */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome da Marca</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {marcas.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-10 text-gray-500">Nenhuma marca cadastrada.</td></tr>
                  ) : (
                    marcas.map((marca) => (
                      <tr key={marca.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">#{marca.id}</td>
                        <td className="px-4 py-3 text-sm">{marca.nome}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleAbrirModalEditar(marca)}
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Editar"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleExcluir(marca.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Excluir"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição/Criação */}
      {modalAberta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  {marcaEmEdicao ? "Editar Marca" : "Nova Marca"}
                </h2>
                <button
                  onClick={handleFecharModal}
                  disabled={loadingModal}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSalvar(); }}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Nome da Marca *</label>
                  <input
                    type="text"
                    name="nome"
                    value={nomeMarca}
                    onChange={(e) => setNomeMarca(e.target.value)}
                    placeholder="Ex: Votorantim, Gerdau, Tigre"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end border-t p-6">
                <button
                  type="button"
                  onClick={handleFecharModal}
                  disabled={loadingModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingModal}
                  className="px-6 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50 flex items-center"
                >
                  {loadingModal ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Salvando...</>
                  ) : (
                    <><i className="fas fa-save mr-2"></i>Salvar</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
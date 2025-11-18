/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar.jsx";
import Header from "../../../components/Header.jsx";
import { api } from "../../../services/api";
import { toast } from 'react-toastify';
import ModalEditarProdutoFornecedor from "./modalprodutofornecedor.jsx";

// Helper para formatar moeda
const formatarMoeda = (valor) => {
  if (typeof valor !== 'number') valor = 0;
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function ListarProdutosFornecedor() {
  // Listas de dados
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [marcas, setMarcas] = useState([]); // Para passar ao modal
  const [insumos, setInsumos] = useState([]); // Para passar ao modal

  // Controle de estado
  const [selectedFornecedorId, setSelectedFornecedorId] = useState("");
  const [loadingFornecedores, setLoadingFornecedores] = useState(true);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [erro, setErro] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  // Mapeia a entidade completa que vem da API para um objeto mais simples
  const mapProduto = (p) => ({
    id: p.id,
    insumoId: p.insumoId,
    fornecedorId: p.fornecedorId,
    marcaId: p.marcaId,
    insumoNome: p.insumoNome || 'N/A',
    marcaNome: p.marcaNome || 'N/A',
    modelo: p.modelo,
    valor: p.valor,
    prazoEntrega: p.prazoEntrega,
    condicaoPagamento: p.condicaoPagamento,
    observacoes: p.observacoes
  });

  // Carrega Fornecedores, Insumos e Marcas (dados de suporte)
  useEffect(() => {
    async function carregarDadosSuporte() {
      setLoadingFornecedores(true);
      setErro("");
      try {
        const [fornecedoresRes, insumosRes, marcasRes] = await Promise.all([
          api.get("/fornecedor/listar"),
          api.get("/insumo/listar"),
          api.get("/marca/listar")
        ]);

        if (fornecedoresRes.data.success) {
          setFornecedores(fornecedoresRes.data.data.map(f => ({ id: f.id, nome: f.nome || f.nomeFantasia })));
        } else {
          toast.error("Erro ao carregar fornecedores.");
        }

        if (insumosRes.data.success) {
          setInsumos(insumosRes.data.data);
        } else {
          toast.error("Erro ao carregar insumos.");
        }

        if (marcasRes.data.success) {
          setMarcas(marcasRes.data.data);
        } else {
          toast.error("Erro ao carregar marcas.");
        }

      } catch (error) {
        console.error("Erro ao buscar dados de suporte:", error);
        setErro("Erro ao conectar com o servidor.");
      } finally {
        setLoadingFornecedores(false);
      }
    }
    carregarDadosSuporte();
  }, []);

  // Busca produtos quando o fornecedor é selecionado
  const buscarProdutos = async () => {
    if (!selectedFornecedorId) {
      setProdutos([]); // Limpa a tabela se nenhum fornecedor for selecionado
      return;
    }

    setLoadingProdutos(true);
    setErro("");
    try {
      const response = await api.get(`/produtos-fornecedor/listar/${selectedFornecedorId}`);
      if (response.data.success) {
        const produtosMapeados = response.data.data.map(mapProduto);
        setProdutos(produtosMapeados);
        console.log("Produtos carregados:", produtosMapeados);
      } else {
        toast.error(response.data.message);
        setProdutos([]);
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setErro("Erro ao buscar produtos do fornecedor.");
      setProdutos([]);
    } finally {
      setLoadingProdutos(false);
    }
  };

  // 3. useEffect agora só chama a função
  useEffect(() => {
    buscarProdutos();
  }, [selectedFornecedorId]);


  const handleEditar = (produto) => {
    setProdutoSelecionado(produto);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProdutoSelecionado(null);
  };

  const handleProdutoAtualizado = (produtoAtualizado) => {
    // A API de "upsert" não retorna o ID, ela retorna a entidade.
    // O backend service (`ProdutoFornecedorService`) atualiza baseado em `insumoId` e `fornecedorId`.
    // Precisamos recarregar a lista para ver as mudanças.
    toast.success("Produto atualizado! Recarregando lista...");
    handleCloseModal();
    
    // Força o useEffect de produtos a rodar novamente
    const currentId = selectedFornecedorId;
    setSelectedFornecedorId(""); // Limpa
    setTimeout(() => setSelectedFornecedorId(currentId), 100); // Recoloca
  };

  // Função de Deletar (NOVO)
  const handleDeletar = (idProduto) => {
    toast.warn(
        ({ closeToast }) => (
            <div>
                <p className="font-semibold">Confirmar Exclusão</p>
                <p className="text-sm">Tem certeza que deseja desvincular este produto do fornecedor?</p>
                <div className="flex gap-2 mt-3">
                    <button
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                        onClick={() => {
                            _confirmarExclusao(idProduto);
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
        ), { autoClose: false }
    );
  };

  const _confirmarExclusao = async (idProduto) => {
    try {
        // Endpoint alterado para o correto de deleção
        await api.delete(`/produtos-fornecedor/deletar/${idProduto}`);
        
        // Remove da lista local
        setProdutos(prev => prev.filter(p => p.id !== idProduto));
        toast.success("Produto desvinculado com sucesso!");
    } catch (error) {
        console.error("Erro ao excluir produto:", error);
        toast.error(error.response?.data?.message || "Erro ao excluir produto.");
    }
  };


  if (loadingFornecedores) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="ml-64">
          <Header />
          <div className="p-6 text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-cordes-blue"></i>
            <p className="mt-2 text-gray-600">Carregando dados...</p>
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
                <h1 className="text-3xl font-bold text-cordes-blue">Produtos por Fornecedor</h1>
                <p className="text-gray-600 mt-2">Visualize os produtos e preços de cada fornecedor</p>
              </div>
            </div>

            {/* Filtro de Fornecedor */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecione um Fornecedor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Fornecedor *</label>
                  <select
                    name="fornecedorId"
                    value={selectedFornecedorId}
                    onChange={(e) => setSelectedFornecedorId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                  >
                    <option value="">Selecione para carregar os produtos</option>
                    {fornecedores.map(f => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tabela de Produtos */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Insumo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Marca</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Modelo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Valor (R$)</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Prazo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Pagamento</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingProdutos ? (
                    <tr><td colSpan="7" className="text-center py-10"><i className="fas fa-spinner fa-spin text-2xl text-cordes-blue"></i></td></tr>
                  ) : !selectedFornecedorId ? (
                     <tr><td colSpan="7" className="text-center py-10 text-gray-500">Selecione um fornecedor acima.</td></tr>
                  ) : produtos.length === 0 ? (
                    <tr><td colSpan="7" className="text-center py-10 text-gray-500">Nenhum produto cadastrado para este fornecedor.</td></tr>
                  ) : (
                    produtos.map((produto) => (
                      <tr key={produto.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{produto.insumoNome}</td>
                        <td className="px-4 py-3 text-sm">{produto.marcaNome}</td>
                        <td className="px-4 py-3 text-sm">{produto.modelo}</td>
                        <td className="px-4 py-3 text-sm font-bold text-green-700">{formatarMoeda(produto.valor)}</td>
                        <td className="px-4 py-3 text-sm">{produto.prazoEntrega || '-'}</td>
                        <td className="px-4 py-3 text-sm">{produto.condicaoPagamento || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleEditar(produto)}
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Editar"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleDeletar(produto.id)}
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

      {isModalOpen && (
        <ModalEditarProdutoFornecedor
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          produto={produtoSelecionado}
          // Passa as listas de dados para o modal
          listaInsumos={insumos}
          listaFornecedores={fornecedores}
          listaMarcas={marcas}
          onProdutoAtualizado={handleProdutoAtualizado}
        />
      )}
    </div>
  );
}
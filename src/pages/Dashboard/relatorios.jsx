import React, { useState, useEffect } from "react";
import Sidebar from "../../components/SideBar.jsx";
import Header from "../../components/Header.jsx";
import { api } from "../../services/api";
import { toast } from 'react-toastify';

// Helper para baixar o PDF
const handleDownloadPdf = async (url, filename, setLoadingState) => {
  setLoadingState(true);
  try {
    const response = await api.get(url, {
      responseType: 'blob', // Importante para receber o arquivo
    });

    const href = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(href);
    
  } catch (error) {
    toast.error("Erro ao gerar o PDF.");
    console.error("Erro ao exportar PDF:", error);
  } finally {
    setLoadingState(false);
  }
};

export default function RelatoriosPage() {
  const [obras, setObras] = useState([]);
  const [loadingObras, setLoadingObras] = useState(true);

  // ID selecionado no dropdown
  const [selectedObraId, setSelectedObraId] = useState("");

  // Loading para cada botão
  const [loadingDRE, setLoadingDRE] = useState(false);
  const [loadingFases, setLoadingFases] = useState(false);
  const [loadingEstoque, setLoadingEstoque] = useState(false);
  const [loadingCurvaAbc, setLoadingCurvaAbc] = useState(false);

  // Carrega as obras para o dropdown
  useEffect(() => {
    async function carregarObras() {
      setLoadingObras(true);
      try {
        const response = await api.get("/obras/listar");
        if (response.data.success) {
          // Mapeia para um formato simples de { id, nome }
          const obrasMapeadas = response.data.data.map(o => ({
            id: o.idObra || o.id,
            nome: o.nomeObra || o.nome
          }));
          setObras(obrasMapeadas);
        } else {
          toast.error("Erro ao carregar lista de obras.");
        }
      } catch (error) {
        toast.error("Falha ao buscar obras.");
      } finally {
        setLoadingObras(false);
      }
    }
    carregarObras();
  }, []);

  // --- Funções de Geração ---

  const gerarDRE = () => {
    if (!selectedObraId) {
      toast.warn("Por favor, selecione uma obra.");
      return;
    }
    handleDownloadPdf(
      `/relatorios/obra/${selectedObraId}/dre/pdf`,
      `DRE_Obra_${selectedObraId}.pdf`,
      setLoadingDRE
    );
  };

  const gerarAcompanhamentoFases = () => {
    if (!selectedObraId) {
      toast.warn("Por favor, selecione uma obra.");
      return;
    }
    handleDownloadPdf(
      `/relatorios/obra/${selectedObraId}/fases-acompanhamento/pdf`,
      `Fases_Obra_${selectedObraId}.pdf`,
      setLoadingFases
    );
  };

  const gerarEstoqueCritico = () => {
    handleDownloadPdf(
      `/relatorios/estoque/critico/pdf`,
      `Relatorio_Estoque_Critico.pdf`,
      setLoadingEstoque
    );
  };

  const gerarCurvaAbc = () => {
    handleDownloadPdf(
      `/relatorios/insumos/curva-abc/pdf`,
      `Relatorio_Curva_ABC.pdf`,
      setLoadingCurvaAbc
    );
  };


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
                <h1 className="text-3xl font-bold text-cordes-blue">Central de Relatórios</h1>
                <p className="text-gray-600 mt-2">Gere relatórios gerenciais e de acompanhamento.</p>
              </div>
            </div>

            {loadingObras ? (
              <div className="text-center p-10">
                <i className="fas fa-spinner fa-spin text-4xl text-cordes-blue"></i>
                <p className="text-gray-600 mt-2">Carregando dados...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Card 1: Relatórios por Obra */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Relatórios por Obra</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Seletor de Obra */}
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-medium mb-2">Selecione a Obra *</label>
                      <select
                        value={selectedObraId}
                        onChange={(e) => setSelectedObraId(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                      >
                        <option value="">Selecione uma obra...</option>
                        {obras.map(obra => (
                          <option key={obra.id} value={obra.id}>{obra.nome}</option>
                        ))}
                      </select>
                    </div>

                    {/* Botão DRE com Descrição */}
                    <div>
                      <button
                        onClick={gerarDRE}
                        disabled={!selectedObraId || loadingDRE}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                      >
                        <i className={`fas ${loadingDRE ? 'fa-spinner fa-spin' : 'fa-file-invoice-dollar'}`}></i>
                        {loadingDRE ? "Gerando..." : "Gerar DRE da Obra"}
                      </button>
                      <p className="text-xs text-gray-8000 mt-2 text-center">
                        Demonstrativo de Resultado: compara o valor contratado com os custos já realizados.
                      </p>
                    </div>

                    {/* Botão Fases com Descrição */}
                    <div>
                      <button
                        onClick={gerarAcompanhamentoFases}
                        disabled={!selectedObraId || loadingFases}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                      >
                        <i className={`fas ${loadingFases ? 'fa-spinner fa-spin' : 'fa-tasks'}`}></i>
                        {loadingFases ? "Gerando..." : "Relatório de Fases"}
                      </button>
                      <p className="text-xs  text-gray-8000  mt-2 text-center">
                        Acompanha o status de progresso (Em Dia, Atrasada) de cada fase da obra.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Relatórios Gerais */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Relatórios Gerais</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Botão Estoque Crítico com Descrição */}
                    <div>
                      <button
                        onClick={gerarEstoqueCritico}
                        disabled={loadingEstoque}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                      >
                        <i className={`fas ${loadingEstoque ? 'fa-spinner fa-spin' : 'fa-exclamation-triangle'}`}></i>
                        {loadingEstoque ? "Gerando..." : "Relatório de Estoque Crítico"}
                      </button>
                      <p className="text-xs  text-gray-8000  mt-2 text-center">
                        Lista todos os materiais com quantidade atual abaixo do estoque mínimo.
                      </p>
                    </div>

                    {/* Botão Curva ABC com Descrição */}
                    <div>
                      <button
                        onClick={gerarCurvaAbc}
                        disabled={loadingCurvaAbc}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                      >
                        <i className={`fas ${loadingCurvaAbc ? 'fa-spinner fa-spin' : 'fa-chart-bar'}`}></i>
                        {loadingCurvaAbc ? "Gerando..." : "Gerar Curva ABC de Insumos"}
                      </button>
                      <p className="text-xs  text-gray-8000  mt-2 text-center">
                        Rankeia os insumos pelo seu impacto no custo total (Classe A, B, C).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
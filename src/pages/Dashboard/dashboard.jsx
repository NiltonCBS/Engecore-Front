import Sidebar from "../../components/SideBar";
import Header from "../../components/Header";
import StatCard from "../../components/StatCard";
import RevenueChart from "../../components/RevenueChart";
import OrdersTable from "../../components/OrdersTable";
import Footer from "../../components/Footer";
import dashboardService from "../../services/dashboardService";
import { useState, useEffect } from "react";
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [clientesStatus, setClientesStatus] = useState({ ativos: 0, inativos: 0 });
  const [obras, setObras] = useState([]);
  const [obrasConcluidas, setObrasConcluidas] = useState([]);
  const [cotacoesAbertas, setCotacoesAbertas] = useState([]);
  const [estoqueCritico, setEstoqueCritico] = useState([]);
  const [produtosCadastrados, setProdutosCadastrados] = useState(0);
  const [movimentacoesEstoque, setMovimentacoesEstoque] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // Carrega todos os dados em paralelo para melhor performance
        const [
          movData, 
          clientesData, 
          obrasData, 
          obrasConcluidasData, 
          cotacoesAbertasData, 
          estoqueCriticoData,
          estoqueData,
          movEstoqueData
        ] = await Promise.all([
          dashboardService.getMovimentacoes().catch(err => {
            console.error("Erro ao carregar movimentações:", err);
            return [];
          }),
          dashboardService.getClientesStatus().catch(err => {
            console.error("Erro ao carregar clientes:", err);
            return { ativos: 0, inativos: 0, total: 0 };
          }),
          dashboardService.getObras().catch(err => {
            console.error("Erro ao carregar obras:", err);
            return [];
          }),
          dashboardService.getObrasConcluidas().catch(err => {
            console.error("Erro ao carregar obras concluídas:", err);
            return [];
          }),
          dashboardService.getCotacoesAbertas().catch(err => {
            console.error("Erro ao carregar cotações abertas:", err);
            return [];
          }),
          dashboardService.getEstoqueCritico().catch(err => {
            console.error("Erro ao carregar estoque crítico:", err);
            return [];
          }),
          dashboardService.getEstoque().catch(err => {
            console.error("Erro ao carregar estoque:", err);
            return { quantidade: 0, produtos: [] };
          }),
          dashboardService.getMovimentacoesEstoque().catch(err => {
            console.error("Erro ao carregar movimentações de estoque:", err);
            return [];
          })
        ]);

        // Processa movimentações - garante array de 12 meses
        const movimentacoesArray = Array.isArray(movData) ? movData : [];
        const movimentacoesFormatadas = Array.from({ length: 12 }, (_, i) => {
          const mes = i + 1;
          const dado = movimentacoesArray.find(m => Number(m.mes) === mes);
          return {
            mes,
            receita: dado ? Number(dado.receita) || 0 : 0,
            despesa: dado ? Number(dado.despesa) || 0 : 0
          };
        });

        // Processa clientes - garante números válidos
        const clientesProcessados = {
          ativos: Number(clientesData?.ativos) || 0,
          inativos: Number(clientesData?.inativos) || 0
        };

        // Processa obras - garante array
        const obrasProcessadas = Array.isArray(obrasData) ? obrasData : [];

        const obrasConcluidasProcessadas = Array.isArray(obrasConcluidasData?.obras)
                                          ? obrasConcluidasData.obras
                                          : [];

        const cotacoesAbertasProcessadas = Array.isArray(cotacoesAbertasData?.cotacoes)
                                          ? cotacoesAbertasData.cotacoes
                                          : [];

        const estoqueCriticoProcessados = Array.isArray(estoqueCriticoData)
                                          ? estoqueCriticoData
                                          : [];

        // Processa produtos cadastrados
        const quantidadeProdutos = Number(estoqueData?.quantidade) || 0;

        // Processa movimentações de estoque - garante array de 12 meses
        const movEstoqueArray = Array.isArray(movEstoqueData) ? movEstoqueData : [];
        const movEstoqueFormatadas = Array.from({ length: 12 }, (_, i) => {
          const mes = i + 1;
          const dado = movEstoqueArray.find(m => Number(m.mes) === mes);
          return {
            mes,
            entradas: dado ? Number(dado.entradas) || 0 : 0,
            saidas: dado ? Number(dado.saidas) || 0 : 0
          };
        });

        // Atualiza estados
        setMovimentacoes(movimentacoesFormatadas);
        setClientesStatus(clientesProcessados);
        setObras(obrasProcessadas);
        setObrasConcluidas(obrasConcluidasProcessadas);
        setCotacoesAbertas(cotacoesAbertasProcessadas);
        setEstoqueCritico(estoqueCriticoProcessados);
        setProdutosCadastrados(quantidadeProdutos);
        setMovimentacoesEstoque(movEstoqueFormatadas);
      } catch (error) {
        console.error("Erro crítico ao carregar dados do dashboard:", error);
        setError("Erro ao carregar dados. Por favor, recarregue a página.");
        
        // Define valores padrão em caso de erro
        setMovimentacoes(Array.from({ length: 12 }, (_, i) => ({
          mes: i + 1,
          receita: 0,
          despesa: 0
        })));
        setClientesStatus({ ativos: 0, inativos: 0 });
        setObras([]);
        setObrasConcluidas([]);
        setCotacoesAbertas([]);
        setEstoqueCritico([]);
        setProdutosCadastrados(0);
        setMovimentacoesEstoque(Array.from({ length: 12 }, (_, i) => ({
          mes: i + 1,
          entradas: 0,
          saidas: 0
        })));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Cálculos derivados
  const totalClientes = clientesStatus.ativos + clientesStatus.inativos;
  const percentualClientesAtivos = totalClientes > 0 
    ? ((clientesStatus.ativos / totalClientes) * 100).toFixed(1) 
    : 0;
    
  const totalObras = obras.length;
  const ObrasConcluidas = obrasConcluidas.length;
  const cotacoesAbertasDados = cotacoesAbertas.length;
  const estoqueCriticoDados = estoqueCritico.length;
  
  // Calcula receita e despesa total
  const receitaTotal = movimentacoes.reduce((acc, m) => acc + m.receita, 0);
  const despesaTotal = movimentacoes.reduce((acc, m) => acc + m.despesa, 0);
  const saldoTotal = receitaTotal - despesaTotal;

  // Calcula totais de movimentações de estoque
  const totalEntradas = movimentacoesEstoque.reduce((acc, m) => acc + m.entradas, 0);
  const totalSaidas = movimentacoesEstoque.reduce((acc, m) => acc + m.saidas, 0);
  const saldoEstoque = totalEntradas - totalSaidas;

  // Dados para gráfico de Movimentações Financeiras
  const movimentacoesData = {
    labels: movimentacoes.map(m => `Mês ${m.mes}`),
    datasets: [
      {
        label: 'Receitas',
        data: movimentacoes.map(m => m.receita),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Despesas',
        data: movimentacoes.map(m => m.despesa),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Dados para gráfico de Status de Clientes
  const clientesStatusData = {
    labels: ['Ativos', 'Inativos'],
    datasets: [
      {
        data: [clientesStatus.ativos, clientesStatus.inativos],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // NOVO: Dados para gráfico de Movimentações de Estoque
  const movimentacoesEstoqueData = {
    labels: movimentacoesEstoque.map(m => `Mês ${m.mes}`),
    datasets: [
      {
        label: 'Entradas',
        data: movimentacoesEstoque.map(m => m.entradas),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Saídas',
        data: movimentacoesEstoque.map(m => m.saidas),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Opções dos gráficos
  const movimentacoesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += 'R$ ' + context.parsed.y.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'R$ ' + value.toLocaleString('pt-BR');
          }
        }
      },
    },
  };

  const clientesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 13,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const value = context.parsed;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return context.label + ': ' + value + ' (' + percentage + '%)';
          }
        }
      },
    },
  };

  // NOVO: Opções para gráfico de estoque
  const estoqueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y.toLocaleString('pt-BR') + ' unidades';
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString('pt-BR') + ' un';
          }
        }
      },
    },
  };

  // Componente de Loading
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="ml-64">
          <Header />
          <main className="p-6">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-5xl text-blue-600 mb-4"></i>
                <p className="text-xl text-gray-600">Carregando dashboard...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6 space-y-6">
          {/* Alerta de Erro */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle text-red-500 text-xl mr-3"></i>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Cabeçalho do Dashboard */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-cordes-blue mb-2">Dashboard Executivo</h1>
            <p className="text-gray-600">Visão geral do desempenho da construtora</p>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Receita Total" 
              value={`R$ ${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon="fa-dollar-sign" 
              percent={saldoTotal >= 0 ? `+${((saldoTotal / (despesaTotal || 1)) * 100).toFixed(1)}%` : `-${Math.abs((saldoTotal / (despesaTotal || 1)) * 100).toFixed(1)}%`}
              color="bg-green-50 text-green-600 border-green-200" 
            />
            <StatCard 
              title="Clientes Ativos" 
              value={clientesStatus.ativos} 
              icon="fa-users" 
              percent={`${percentualClientesAtivos}%`}
              color="bg-blue-50 text-blue-600 border-blue-200" 
            />
            <StatCard 
              title="Obras Ativas" 
              value={totalObras} 
              icon="fa-hard-hat" 
              percent="100%" 
              color="bg-orange-50 text-orange-600 border-orange-200" 
            />
            <StatCard 
              title="Produtos Cadastrados" 
              value={produtosCadastrados} 
              icon="fa-box" 
              percent="100%" 
              color="bg-purple-50 text-purple-600 border-purple-200" 
            />
          </div>

          {/* Gráficos Principais */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de Movimentações Financeiras */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Movimentações Financeiras</h3>
                  <p className="text-sm text-gray-500">Receitas vs Despesas (2024)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    saldoTotal >= 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    Saldo: {saldoTotal >= 0 ? '+' : ''}R$ {saldoTotal.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
              </div>
              <div style={{ height: '320px' }}>
                <Line data={movimentacoesData} options={movimentacoesOptions} />
              </div>
            </div>

            {/* Gráfico de Status dos Clientes */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">Status dos Clientes</h3>
                <p className="text-sm text-gray-500">Distribuição atual</p>
              </div>
              <div style={{ height: '320px' }} className="flex items-center justify-center">
                {totalClientes === 0 ? (
                  <div className="text-center text-gray-400">
                    <i className="fas fa-users text-3xl mb-2"></i>
                    <p className="text-sm">Nenhum cliente cadastrado</p>
                  </div>
                ) : (
                  <Doughnut 
                    key={`clientes-${clientesStatus.ativos}-${clientesStatus.inativos}`}
                    data={clientesStatusData} 
                    options={clientesOptions} 
                  />
                )}
              </div>
            </div>
          </div>

          {/* Segunda Linha de Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* NOVO: Gráfico de Movimentações de Estoque */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Movimentações de Estoque</h3>
                  <p className="text-sm text-gray-500">Entradas vs Saídas (2024)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    saldoEstoque >= 0 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    Saldo: {saldoEstoque >= 0 ? '+' : ''}{saldoEstoque.toLocaleString('pt-BR')} un
                  </span>
                </div>
              </div>
              <div style={{ height: '280px' }}>
                {totalEntradas === 0 && totalSaidas === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <i className="fas fa-boxes text-3xl mb-2"></i>
                      <p className="text-sm">Nenhuma movimentação registrada</p>
                    </div>
                  </div>
                ) : (
                  <Line data={movimentacoesEstoqueData} options={estoqueOptions} />
                )}
              </div>
            </div>

            {/* Gráfico de Obras por Mês */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">Evolução de Obras</h3>
                <p className="text-sm text-gray-500">Quantidade de obras iniciadas por mês</p>
              </div>
              <div style={{ height: '280px' }}>
                <RevenueChart />
              </div>
            </div>
          </div>

          {/* Tabela de Pedidos */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Últimas Movimentações</h3>
              <p className="text-sm text-gray-500">Acompanhe as transações recentes</p>
            </div>
            <OrdersTable />
          </div>

          {/* Cards Informativos Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md border border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Cotações Abertas</p>
                  <p className="text-3xl font-bold text-blue-900">{cotacoesAbertasDados}</p>
                  <p className="text-xs text-blue-700 mt-2">Aguardando aprovação</p>
                </div>
                <div className="bg-blue-200 p-4 rounded-full">
                  <i className="fas fa-file-invoice-dollar text-2xl text-blue-700"></i>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-md border border-amber-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">Estoque Crítico</p>
                  <p className="text-3xl font-bold text-amber-900">{estoqueCriticoDados}</p>
                  <p className="text-xs text-amber-700 mt-2">Produtos abaixo do mínimo</p>
                </div>
                <div className="bg-amber-200 p-4 rounded-full">
                  <i className="fas fa-exclamation-triangle text-2xl text-amber-700"></i>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-md border border-emerald-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600 mb-1">Obras Concluídas</p>
                  <p className="text-3xl font-bold text-emerald-900">{ObrasConcluidas}</p>
                  <p className="text-xs text-emerald-700 mt-2">No último ano</p>
                </div>
                <div className="bg-emerald-200 p-4 rounded-full">
                  <i className="fas fa-check-circle text-2xl text-emerald-700"></i>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
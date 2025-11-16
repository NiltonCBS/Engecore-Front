import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import dashboardService from "../services/dashboardService";

export default function RevenueChart() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [obrasPorMes, setObrasPorMes] = useState([]);

  useEffect(() => {
    async function loadObrasPorMes() {
      try {
        setLoading(true);
        const data = await dashboardService.getObrasPorMes();
        setObrasPorMes(data);
      } catch (error) {
        console.error("Erro ao carregar obras por mês:", error);
        // Define array vazio em caso de erro
        setObrasPorMes(Array.from({ length: 12 }, (_, i) => ({
          mes: i + 1,
          quantidade: 0
        })));
      } finally {
        setLoading(false);
      }
    }

    loadObrasPorMes();
  }, []);

  useEffect(() => {
    if (loading || !chartRef.current || obrasPorMes.length === 0) return;

    const ctx = chartRef.current.getContext("2d");

    // Destruir gráfico antigo antes de criar outro
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        datasets: [
          {
            label: "Obras Iniciadas",
            data: obrasPorMes.map(o => o.quantidade),
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 159, 64)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)',
              'rgb(153, 102, 255)',
              'rgb(201, 203, 207)',
              'rgb(255, 99, 132)',
              'rgb(255, 159, 64)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)'
            ],
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 159, 64, 0.5)',
              'rgba(255, 205, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(153, 102, 255, 0.5)',
              'rgba(201, 203, 207, 0.5)',
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 159, 64, 0.5)',
              'rgba(255, 205, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(54, 162, 235, 0.5)'
            ],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
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
                const quantidade = context.parsed.y;
                return quantidade === 1 
                  ? '1 obra iniciada' 
                  : quantidade + ' obras iniciadas';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: function(value) {
                return Number.isInteger(value) ? value : '';
              }
            }
          }
        }
      },
    });

    // Cleanup -> destruir o gráfico quando o componente for desmontado
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [loading, obrasPorMes]);

  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-gray-400 mb-2"></i>
          <p className="text-sm text-gray-500">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const totalObras = obrasPorMes.reduce((acc, o) => acc + o.quantidade, 0);

  if (totalObras === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <i className="fas fa-hard-hat text-4xl mb-3"></i>
          <p className="text-sm">Nenhuma obra cadastrada</p>
        </div>
      </div>
    );
  }

  return <canvas ref={chartRef} className="w-full h-80"></canvas>;
}
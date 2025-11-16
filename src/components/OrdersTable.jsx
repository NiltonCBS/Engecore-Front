import { useState, useEffect } from "react";
import dashboardService from "../services/dashboardService";

export default function OrdersTable() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadObras() {
      try {
        setLoading(true);
        const data = await dashboardService.getObras();
        
        // Ordena por data de início (mais recente primeiro)
        const obrasOrdenadas = data.sort((a, b) => {
          const dataA = new Date(a.dataInicio);
          const dataB = new Date(b.dataInicio);
          return dataB - dataA;
        });

        // Pega apenas as 5 mais recentes
        setObras(obrasOrdenadas.slice(0, 5));
      } catch (error) {
        console.error("Erro ao carregar obras:", error);
        setObras([]);
      } finally {
        setLoading(false);
      }
    }

    loadObras();
  }, []);

  const formatarData = (data) => {
    if (!data) return '-';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatarValor = (valor) => {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'EM_ANDAMENTO': { color: 'bg-blue-100 text-blue-800', label: 'Em Andamento' },
      'CONCLUIDA': { color: 'bg-green-100 text-green-800', label: 'Concluída' },
      'PAUSADA': { color: 'bg-yellow-100 text-yellow-800', label: 'Pausada' },
      'CANCELADA': { color: 'bg-red-100 text-red-800', label: 'Cancelada' },
      'PLANEJAMENTO': { color: 'bg-purple-100 text-purple-800', label: 'Planejamento' },
      'INICIADA': { color: 'bg-cyan-100 text-cyan-800', label: 'Iniciada' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTipoObraLabel = (tipo) => {
    const tipos = {
      'RESIDENCIAL': 'Residencial',
      'COMERCIAL': 'Comercial',
      'INFRAESTRUTURA': 'Infraestrutura',
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Obras Recentes</h3>
          <p className="text-gray-600 text-sm">Últimas obras cadastradas no sistema</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <i className="fas fa-download mr-2"></i>Exportar
          </button>
          <button className="px-4 py-2 bg-cordes-blue text-white rounded-lg hover:bg-cordes-dark transition-colors">
            <i className="fas fa-plus mr-2"></i>Nova Obra
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-gray-400 mb-2"></i>
            <p className="text-sm text-gray-500">Carregando obras...</p>
          </div>
        </div>
      ) : obras.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-gray-400">
            <i className="fas fa-hard-hat text-4xl mb-3"></i>
            <p className="text-sm">Nenhuma obra cadastrada</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                
                <th className="px-6 py-3 text-left">Nome da Obra</th>
                <th className="px-6 py-3 text-left">Cliente</th>
                <th className="px-6 py-3 text-left">Tipo</th>
                <th className="px-6 py-3 text-left">Valor Total</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Data Início</th>
              </tr>
            </thead>
            <tbody>
              {obras.map((obra, index) => (
                <tr 
                  key={obra.id || `obra-${index}`} 
                  className="hover:bg-gray-50 border-b border-gray-100"
                >
                  
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{obra.nomeObra}</p>
                      {obra.endereco?.cidade && (
                        <p className="text-xs text-gray-500">
                          {obra.endereco.cidade}, {obra.endereco.estado}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900">
                        {obra.cliente?.nome || obra.clienteNome || 'Cliente não informado'}
                      </p>
                      {obra.cliente?.telefone || obra.clienteTelefone && (
                        <p className="text-xs text-gray-500">
                          {obra.clienteTelefone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">
                      {getTipoObraLabel(obra.tipo)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {formatarValor(obra.valorTotal)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(obra.status)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatarData(obra.dataInicio)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && obras.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {obras.length} de {obras.length} obras recentes
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
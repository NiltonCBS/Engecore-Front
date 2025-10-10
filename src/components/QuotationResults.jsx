// src/pages/Dashboard/Cotacoes/QuotationResults.jsx
import PropTypes from 'prop-types';

export default function QuotationResults({ mockFornecedores }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <div className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Fornecedores e Cotações</div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fornecedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Unitário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prazo de Entrega</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condição de Pagamento</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockFornecedores.map(fornecedor => (
              <tr key={fornecedor.id} className={`${fornecedor.isBestPrice ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'}`}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${fornecedor.isBestPrice ? 'text-green-800 font-semibold' : 'text-gray-900'}`}>{fornecedor.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fornecedor.cnpj}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${fornecedor.isBestPrice ? 'text-green-800 font-bold' : 'text-gray-900'}`}>R$ {fornecedor.valorUnitario.toFixed(2).replace('.', ',')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fornecedor.prazoEntrega}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fornecedor.condicaoPagamento}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${fornecedor.isBestPrice ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                      {fornecedor.isBestPrice ? 'Melhor Preço' : 'Selecionar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

QuotationResults.propTypes = {
    mockFornecedores: PropTypes.array.isRequired,
};
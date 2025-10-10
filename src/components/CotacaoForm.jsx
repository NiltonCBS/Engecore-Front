// src/pages/Dashboard/Cotacoes/CotacaoForm.jsx
import PropTypes from 'prop-types';

export default function CotacaoForm({ cotacao, handleChange, mockObras, mockUnidadesMedida }) {
  return (
    <>
      {/* Informações da Cotação Card */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informações da Cotação</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Obra */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Obra <span className="text-red-500">*</span></label>
            <select
              name="obra"
              value={cotacao.obra}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
            >
              <option value="">Selecione a obra</option>
              {mockObras.map(obra => (
                <option key={obra} value={obra}>{obra}</option>
              ))}
            </select>
          </div>
          
          {/* Data de Necessidade */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Data de Necessidade <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="dataNecessidade"
              value={cotacao.dataNecessidade}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
            />
          </div>
          
          {/* Prioridade */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Prioridade</label>
            <select
              name="prioridade"
              value={cotacao.prioridade}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
            >
              <option value="Normal">Normal</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Produto para Cotação Card */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Produto para Cotação</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Nome do Produto */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Nome do Produto <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="produto"
              value={cotacao.produto}
              onChange={handleChange}
              placeholder="Ex: Cimento CP-II 50kg"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
            />
          </div>
          
          {/* Quantidade */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Quantidade <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="quantidade"
              value={cotacao.quantidade}
              onChange={handleChange}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
            />
          </div>
          
          {/* Unidade de Medida */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Unidade de Medida <span className="text-red-500">*</span></label>
            <select
              name="unidadeMedida"
              value={cotacao.unidadeMedida}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
            >
              <option value="">Selecione</option>
              {mockUnidadesMedida.map(unidade => (
                <option key={unidade} value={unidade}>{unidade}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

CotacaoForm.propTypes = {
    cotacao: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    mockObras: PropTypes.array.isRequired,
    mockUnidadesMedida: PropTypes.array.isRequired,
};
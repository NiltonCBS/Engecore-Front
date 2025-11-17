// src/components/CotacaoForm.jsx
import PropTypes from 'prop-types';

export default function CotacaoForm({ cotacao, handleChange, listaObras, listaFuncionarios }) {
  
  // Nenhuma lógica de insumo é necessária aqui
  
  return (
    <>
      {/* Obra */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Obra <span className="text-red-500">*</span></label>
        <select
          name="obraId" 
          value={cotacao.obraId}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
        >
          <option value="">Selecione a obra</option>
          {listaObras.map(obra => (
            <option key={obra.id} value={obra.id}>{obra.nome}</option>
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

      {/* Funcionário Solicitante */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">Funcionário Solicitante <span className="text-red-500">*</span></label>
        <select
          name="funcionarioId"
          value={cotacao.funcionarioId}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
        >
          <option value="">Selecione o funcionário</option>
          {listaFuncionarios.map(func => (
            <option key={func.id} value={func.id}>{func.nome} ({func.cargo})</option>
          ))}
        </select>
      </div>
    </>
  );
}

CotacaoForm.propTypes = {
    cotacao: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    listaObras: PropTypes.array.isRequired,
    listaFuncionarios: PropTypes.array.isRequired,
};
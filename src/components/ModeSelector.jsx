// src/pages/Dashboard/Cotacoes/ModeSelector.jsx
import PropTypes from 'prop-types';

export default function ModeSelector({ mode, onModeChange }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <div className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Modo de Cotação</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className={`p-4 rounded-lg cursor-pointer transition-all border-2 text-center ${
            mode === 'manual' 
              ? 'border-cordes-blue bg-blue-50' 
              : 'border-gray-200 hover:border-cordes-blue'
          }`}
          onClick={() => onModeChange('manual')}
        >
          <div className="text-lg font-semibold text-gray-800">✋ Manual</div>
          <div className="text-sm text-gray-600">Escolha os fornecedores manualmente</div>
        </div>
        
        <div 
          className={`p-4 rounded-lg cursor-pointer transition-all border-2 text-center ${
            mode === 'auto' 
              ? 'border-cordes-blue bg-blue-50' 
              : 'border-gray-200 hover:border-cordes-blue'
          }`}
          onClick={() => onModeChange('auto')}
        >
          <div className="text-lg font-semibold text-gray-800">⚡ Automático</div>
          <div className="text-sm text-gray-600">Sistema gera cotações com base em regras</div>
        </div>
      </div>
    </div>
  );
}

ModeSelector.propTypes = {
    mode: PropTypes.string.isRequired,
    onModeChange: PropTypes.func.isRequired,
};
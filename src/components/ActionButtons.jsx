import React from 'react';

export default function ActionButtons({ onSave, onClear, isLoading }) {
    return (
        <div className="flex gap-4 pt-6 border-t">
            <button 
                onClick={onSave} 
                disabled={isLoading} 
                className="flex-1 bg-cordes-blue text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md disabled:bg-gray-400"
            >
                <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-check'} mr-2`}></i>
                {isLoading ? 'Registrando...' : 'Registrar Movimentação'}
            </button>
            <button 
                onClick={onClear} 
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition duration-300"
            >
                <i className="fas fa-eraser mr-2"></i>
                Limpar
            </button>
        </div>
    );
}
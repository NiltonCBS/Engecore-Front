import { useState, useEffect } from "react";
import { toast } from 'react-toastify';

export default function ModalEditarMovimentacao({ movimentacao, onClose, onSave }) {
  const [formData, setFormData] = useState({
    idMovFin: "",
    valor: "",
    tipo: "",
    categoriaFinanceira: "",
    obraRelacionada: "",
    idInsumo: "",
    funcionarioResponsavel: "",
    data: "",
    desc: "",
    clienteReferente: ""
  });

  useEffect(() => {
    if (movimentacao) {
      setFormData(movimentacao);
    }
  }, [movimentacao]);

  const tiposMovimentacao = [
    "Receita",
    "Despesa",
    "Transferência"
  ];

  const categoriasFinanceiras = [
    "Material de Construção",
    "Mão de Obra",
    "Equipamentos",
    "Transporte",
    "Alimentação",
    "Serviços Terceirizados",
    "Administrativo",
    "Impostos e Taxas",
    "Outros"
  ];

  const obras = [
    "Edifício Residencial ABC",
    "Reforma Comercial XYZ",
    "Construção Galpão Industrial",
    "Ampliação Residencial Silva",
    "Obra Condomínio Premium"
  ];

  const funcionarios = [
    "João Silva",
    "Maria Santos",
    "Pedro Oliveira",
    "Ana Costa",
    "Carlos Ferreira"
  ];

  const clientes = [
    "João Silva",
    "Maria Santos",
    "Construtora ABC Ltda",
    "Pedro Oliveira",
    "Incorporadora XYZ S/A"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.valor || !formData.tipo || !formData.categoriaFinanceira || !formData.data) {
     toast.warn("Por favor, preencha os campos obrigatórios.");
      return;
    }

    onSave(formData);
  };

  const getTipoColor = () => {
    switch(formData.tipo) {
      case 'Receita': return 'text-green-600';
      case 'Despesa': return 'text-red-600';
      case 'Transferência': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getTipoIcon = () => {
    switch(formData.tipo) {
      case 'Receita': return 'fa-arrow-up';
      case 'Despesa': return 'fa-arrow-down';
      case 'Transferência': return 'fa-exchange-alt';
      default: return 'fa-dollar-sign';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header do Modal */}
        <div className="sticky top-0 bg-cordes-blue text-white p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fas fa-edit text-2xl"></i>
            <div>
              <h2 className="text-2xl font-bold">Editar Movimentação</h2>
              <p className="text-sm text-blue-100">ID: #{formData.idMovFin}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition"
          >
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        {/* Corpo do Modal */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-info-circle text-cordes-blue"></i>
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Valor *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">R$</span>
                    <input
                      type="number"
                      name="valor"
                      value={formData.valor}
                      onChange={handleChange}
                      step="0.01"
                      required
                      className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Tipo *</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  >
                    <option value="">Selecione o tipo</option>
                    {tiposMovimentacao.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Data *</label>
                  <input
                    type="date"
                    name="data"
                    value={formData.data}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Categoria Financeira *</label>
                  <select
                    name="categoriaFinanceira"
                    value={formData.categoriaFinanceira}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  >
                    <option value="">Selecione a categoria</option>
                    {categoriasFinanceiras.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Obra Relacionada</label>
                  <select
                    name="obraRelacionada"
                    value={formData.obraRelacionada}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  >
                    <option value="">Selecione a obra</option>
                    {obras.map(obra => (
                      <option key={obra} value={obra}>{obra}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Funcionário Responsável</label>
                  <select
                    name="funcionarioResponsavel"
                    value={formData.funcionarioResponsavel}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  >
                    <option value="">Selecione o funcionário</option>
                    {funcionarios.map(funcionario => (
                      <option key={funcionario} value={funcionario}>{funcionario}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Informações Complementares */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-clipboard-list text-cordes-blue"></i>
                Informações Complementares
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Cliente Referente</label>
                  <select
                    name="clienteReferente"
                    value={formData.clienteReferente}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  >
                    <option value="">Selecione o cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente} value={cliente}>{cliente}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">ID Insumo</label>
                  <input
                    type="text"
                    name="idInsumo"
                    value={formData.idInsumo}
                    onChange={handleChange}
                    placeholder="Código do insumo relacionado"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 font-medium mb-2">Descrição</label>
                <textarea
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  placeholder="Descreva detalhes sobre esta movimentação..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                  rows="3"
                ></textarea>
              </div>
            </div>

            {/* Preview da Movimentação */}
            {formData.valor && formData.tipo && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview da Movimentação</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Valor</p>
                    <p className="text-lg font-bold text-gray-800">
                      R$ {parseFloat(formData.valor || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Tipo</p>
                    <p className={`text-sm font-bold ${getTipoColor()} flex items-center gap-1`}>
                      <i className={`fas ${getTipoIcon()}`}></i>
                      {formData.tipo}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Categoria</p>
                    <p className="text-sm font-bold text-gray-800">
                      {formData.categoriaFinanceira || "-"}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Data</p>
                    <p className="text-sm font-bold text-gray-800">
                      {formData.data ? new Date(formData.data).toLocaleDateString('pt-BR') : "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4 mt-6 pt-6 border-t">
            <button
              type="submit"
              className="flex-1 bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md hover:shadow-lg"
            >
              <i className="fas fa-save mr-2"></i>
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition duration-300"
            >
              <i className="fas fa-times mr-2"></i>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
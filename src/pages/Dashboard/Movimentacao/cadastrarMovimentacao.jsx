import { useState } from "react";
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";

export default function CadastrarMovimentacao() {
  const [movimentacao, setMovimentacao] = useState({
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
    setMovimentacao(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Validações básicas
    if (!movimentacao.valor || !movimentacao.tipo || !movimentacao.categoriaFinanceira || !movimentacao.data) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    console.log("Movimentação cadastrada:", movimentacao);
    alert("Movimentação cadastrada com sucesso!");
    limparCampos();
  };

  const limparCampos = () => {
    setMovimentacao({
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
  };

  const getTipoColor = () => {
    switch(movimentacao.tipo) {
      case 'Receita': return 'text-green-600';
      case 'Despesa': return 'text-red-600';
      case 'Transferência': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getTipoIcon = () => {
    switch(movimentacao.tipo) {
      case 'Receita': return 'fa-arrow-up';
      case 'Despesa': return 'fa-arrow-down';
      case 'Transferência': return 'fa-exchange-alt';
      default: return 'fa-dollar-sign';
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-cordes-blue">Cadastro de Movimentação Financeira</h1>
                <p className="text-gray-600 mt-2">Registre receitas, despesas e transferências</p>
              </div>
              {movimentacao.tipo && (
                <div className="text-right">
                  <div className="text-sm text-gray-500">Tipo de Movimentação</div>
                  <div className={`text-2xl font-bold ${getTipoColor()} flex items-center gap-2`}>
                    <i className={`fas ${getTipoIcon()}`}></i>
                    {movimentacao.tipo}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {/* Informações Básicas */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informações Básicas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Valor *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">R$</span>
                      <input
                        type="number"
                        name="valor"
                        value={movimentacao.valor}
                        onChange={handleChange}
                        step="0.01"
                        placeholder="0,00"
                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Tipo *</label>
                    <select
                      name="tipo"
                      value={movimentacao.tipo}
                      onChange={handleChange}
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
                      value={movimentacao.data}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Categoria Financeira *</label>
                    <select
                      name="categoriaFinanceira"
                      value={movimentacao.categoriaFinanceira}
                      onChange={handleChange}
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
                      value={movimentacao.obraRelacionada}
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
                      value={movimentacao.funcionarioResponsavel}
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
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informações Complementares</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Cliente Referente</label>
                    <select
                      name="clienteReferente"
                      value={movimentacao.clienteReferente}
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
                      value={movimentacao.idInsumo}
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
                    value={movimentacao.desc}
                    onChange={handleChange}
                    placeholder="Descreva detalhes sobre esta movimentação..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    rows="4"
                  ></textarea>
                </div>
              </div>

              {/* Resumo da Movimentação */}
              {movimentacao.valor && movimentacao.tipo && (
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Resumo da Movimentação</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Valor</p>
                      <p className="text-lg font-bold text-gray-800">
                        R$ {parseFloat(movimentacao.valor || 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tipo</p>
                      <p className={`text-lg font-bold ${getTipoColor()}`}>
                        {movimentacao.tipo}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Categoria</p>
                      <p className="text-lg font-bold text-gray-800">
                        {movimentacao.categoriaFinanceira || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data</p>
                      <p className="text-lg font-bold text-gray-800">
                        {movimentacao.data ? new Date(movimentacao.data).toLocaleDateString('pt-BR') : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md hover:shadow-lg"
                >
                  <i className="fas fa-check mr-2"></i>
                  Cadastrar Movimentação
                </button>
                <button
                  onClick={limparCampos}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300"
                >
                  <i className="fas fa-eraser mr-2"></i>
                  Limpar Campos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
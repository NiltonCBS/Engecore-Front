import { useState } from "react";
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";

export default function Produtos() {
  const [produto, setProduto] = useState({
    nome: "",
    categoria: "",
    subcategoria: "",
    marca: "",
    modelo: "",
    unidadeMedida: "",
    preco: "",
    precoCusto: "",
    descricao: "",
    especificacoes: "",
    estoque: "",
    estoqueMinimo: "",
    fornecedor: "",
    codigoFornecedor: "",
    localizacao: "",
    peso: "",
    dimensoes: {
      comprimento: "",
      largura: "",
      altura: ""
    },
    certificacoes: "",
    dataValidade: "",
    observacoes: ""
  });

  const categorias = [
    "Cimento e Argamassa",
    "Tijolos e Blocos",
    "Areia e Brita",
    "Ferro e Aço",
    "Madeira",
    "Tintas e Vernizes",
    "Hidráulica",
    "Elétrica",
    "Cerâmica e Revestimentos",
    "Vidros",
    "Ferramentas",
    "EPIs",
    "Outros"
  ];

  const unidadesMedida = [
    "kg", "ton", "m", "m²", "m³", "un", "cx", "sc", "pç", "par", "dz", "l"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('dimensoes.')) {
      const dimensao = name.split('.')[1];
      setProduto(prev => ({
        ...prev,
        dimensoes: {
          ...prev.dimensoes,
          [dimensao]: value
        }
      }));
    } else {
      setProduto(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    console.log("Produto cadastrado:", produto);
    alert("Produto cadastrado com sucesso!");
    setProduto({
      nome: "",
      categoria: "",
      subcategoria: "",
      marca: "",
      modelo: "",
      unidadeMedida: "",
      preco: "",
      precoCusto: "",
      descricao: "",
      especificacoes: "",
      estoque: "",
      estoqueMinimo: "",
      fornecedor: "",
      codigoFornecedor: "",
      localizacao: "",
      peso: "",
      dimensoes: {
        comprimento: "",
        largura: "",
        altura: ""
      },
      certificacoes: "",
      dataValidade: "",
      observacoes: ""
    });
  };

  const calcularMargem = () => {
    if (produto.preco && produto.precoCusto) {
      const margem = ((produto.preco - produto.precoCusto) / produto.precoCusto * 100).toFixed(2);
      return margem;
    }
    return "0";
  };

  const limparCampos = () => {
    setProduto({
      nome: "",
      categoria: "",
      subcategoria: "",
      marca: "",
      modelo: "",
      unidadeMedida: "",
      preco: "",
      precoCusto: "",
      descricao: "",
      especificacoes: "",
      estoque: "",
      estoqueMinimo: "",
      fornecedor: "",
      codigoFornecedor: "",
      localizacao: "",
      peso: "",
      dimensoes: {
        comprimento: "",
        largura: "",
        altura: ""
      },
      certificacoes: "",
      dataValidade: "",
      observacoes: ""
    });
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
                <h1 className="text-3xl font-bold text-cordes-blue">Cadastro de Produtos</h1>
                <p className="text-gray-600 mt-2">Cadastre materiais de construção e equipamentos</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Margem de Lucro</div>
                <div className="text-2xl font-bold text-green-600">{calcularMargem()}%</div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Informações Básicas */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informações Básicas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Nome do Produto *</label>
                    <input
                      type="text"
                      name="nome"
                      value={produto.nome}
                      onChange={handleChange}
                      placeholder="Ex: Cimento Portland CP II-E-32"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Categoria *</label>
                    <select
                      name="categoria"
                      value={produto.categoria}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Subcategoria</label>
                    <input
                      type="text"
                      name="subcategoria"
                      value={produto.subcategoria}
                      onChange={handleChange}
                      placeholder="Ex: Cimento Estrutural"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Marca</label>
                    <input
                      type="text"
                      name="marca"
                      value={produto.marca}
                      onChange={handleChange}
                      placeholder="Ex: Votorantim"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Modelo/Código</label>
                    <input
                      type="text"
                      name="modelo"
                      value={produto.modelo}
                      onChange={handleChange}
                      placeholder="Ex: CP II-E-32"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Unidade de Medida *</label>
                    <select
                      name="unidadeMedida"
                      value={produto.unidadeMedida}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    >
                      <option value="">Selecione</option>
                      {unidadesMedida.map(unidade => (
                        <option key={unidade} value={unidade}>{unidade}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Preços e Estoque */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Preços e Estoque</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Preço de Custo *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">R$</span>
                      <input
                        type="number"
                        name="precoCusto"
                        value={produto.precoCusto}
                        onChange={handleChange}
                        step="0.01"
                        placeholder="0,00"
                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Preço de Venda *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">R$</span>
                      <input
                        type="number"
                        name="preco"
                        value={produto.preco}
                        onChange={handleChange}
                        step="0.01"
                        placeholder="0,00"
                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Estoque Atual *</label>
                    <input
                      type="number"
                      name="estoque"
                      value={produto.estoque}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Estoque Mínimo</label>
                    <input
                      type="number"
                      name="estoqueMinimo"
                      value={produto.estoqueMinimo}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Especificações Técnicas */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Especificações Técnicas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Peso (kg)</label>
                    <input
                      type="number"
                      name="peso"
                      value={produto.peso}
                      onChange={handleChange}
                      step="0.01"
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Certificações</label>
                    <input
                      type="text"
                      name="certificacoes"
                      value={produto.certificacoes}
                      onChange={handleChange}
                      placeholder="Ex: ABNT, INMETRO"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Dimensões (cm)</label>
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="number"
                      name="dimensoes.comprimento"
                      value={produto.dimensoes.comprimento}
                      onChange={handleChange}
                      placeholder="Comprimento"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                    <input
                      type="number"
                      name="dimensoes.largura"
                      value={produto.dimensoes.largura}
                      onChange={handleChange}
                      placeholder="Largura"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                    <input
                      type="number"
                      name="dimensoes.altura"
                      value={produto.dimensoes.altura}
                      onChange={handleChange}
                      placeholder="Altura"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Especificações Técnicas</label>
                  <textarea
                    name="especificacoes"
                    value={produto.especificacoes}
                    onChange={handleChange}
                    placeholder="Descreva as especificações técnicas do produto..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              {/* Fornecedor e Localização */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Fornecedor e Localização</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Fornecedor</label>
                    <input
                      type="text"
                      name="fornecedor"
                      value={produto.fornecedor}
                      onChange={handleChange}
                      placeholder="Nome do fornecedor"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Código do Fornecedor</label>
                    <input
                      type="text"
                      name="codigoFornecedor"
                      value={produto.codigoFornecedor}
                      onChange={handleChange}
                      placeholder="Código/SKU do fornecedor"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Localização no Estoque</label>
                    <input
                      type="text"
                      name="localizacao"
                      value={produto.localizacao}
                      onChange={handleChange}
                      placeholder="Ex: Galpão A - Prateleira 2"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Data de Validade</label>
                    <input
                      type="date"
                      name="dataValidade"
                      value={produto.dataValidade}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Descrição e Observações */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Descrição e Observações</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Descrição do Produto</label>
                    <textarea
                      name="descricao"
                      value={produto.descricao}
                      onChange={handleChange}
                      placeholder="Descreva o produto de forma clara e objetiva..."
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      rows="3"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Observações Adicionais</label>
                    <textarea
                      name="observacoes"
                      value={produto.observacoes}
                      onChange={handleChange}
                      placeholder="Observações importantes sobre o produto..."
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md hover:shadow-lg"
                >
                  Cadastrar Produto
                </button>
                <button
                  onClick={limparCampos}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300"
                >
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
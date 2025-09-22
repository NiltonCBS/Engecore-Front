import { useState } from "react";
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";

export default function CadastrarObra() {
  const [obra, setObra] = useState({
    nome: "",
    cliente: "",
    endereco: {
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: ""
    },
    dadosTecnicos: {
      categoria: "",
      tipoObra: "",
      areaConstruida: "",
      dataInicio: "",
      dataPrevisaoTermino: "",
      valorOrcado: "",
      responsavelTecnico: "",
      alvara: ""
    },
    dadosComerciais: {
      vendedor: "",
      desconto: "",
      observacoes: ""
    },
    andamento: "inicial",
    status: "ativo"
  });

  const clientes = [
    "João Silva",
    "Maria Santos",
    "Construtora ABC Ltda",
    "Pedro Oliveira",
    "Incorporadora XYZ S/A"
  ];

  const categorias = [
    "Residencial",
    "Comercial",
    "Industrial",
    "Institucional",
    "Infraestrutura"
  ];

  const tiposObra = [
    "Construção Nova",
    "Reforma",
    "Ampliação",
    "Restauração",
    "Demolição"
  ];

  const estados = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  const vendedores = [
    "João Silva",
    "Maria Santos",
    "Pedro Oliveira",
    "Ana Costa",
    "Carlos Ferreira"
  ];

  const responsaveisTecnicos = [
    "Eng. Roberto Silva - CREA 12345",
    "Eng. Ana Costa - CREA 67890",
    "Arq. Carlos Mendes - CAU 11111",
    "Eng. Lucia Santos - CREA 22222"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('endereco.')) {
      const campo = name.split('.')[1];
      setObra(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [campo]: value
        }
      }));
    } else if (name.includes('dadosTecnicos.')) {
      const campo = name.split('.')[1];
      setObra(prev => ({
        ...prev,
        dadosTecnicos: {
          ...prev.dadosTecnicos,
          [campo]: value
        }
      }));
    } else if (name.includes('dadosComerciais.')) {
      const campo = name.split('.')[1];
      setObra(prev => ({
        ...prev,
        dadosComerciais: {
          ...prev.dadosComerciais,
          [campo]: value
        }
      }));
    } else {
      setObra(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    // Validações básicas
    if (!obra.nome || !obra.cliente || !obra.dadosTecnicos.categoria) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    console.log("Obra cadastrada:", obra);
    alert("Obra cadastrada com sucesso!");
    limparCampos();
  };

  const limparCampos = () => {
    setObra({
      nome: "",
      cliente: "",
      endereco: {
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: ""
      },
      dadosTecnicos: {
        categoria: "",
        tipoObra: "",
        areaConstruida: "",
        dataInicio: "",
        dataPrevisaoTermino: "",
        valorOrcado: "",
        responsavelTecnico: "",
        alvara: ""
      },
      dadosComerciais: {
        vendedor: "",
        desconto: "",
        observacoes: ""
      },
      andamento: "inicial",
      status: "ativo"
    });
  };

  const formatarCep = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    return numeros.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handleCepChange = (e) => {
    const valor = e.target.value;
    const valorFormatado = formatarCep(valor);
    setObra(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        cep: valorFormatado
      }
    }));
  };

  const getStatusColor = () => {
    switch(obra.andamento) {
      case 'inicial': return 'text-blue-600';
      case 'medio': return 'text-yellow-600';
      case 'finalizado': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  const getStatusText = () => {
    switch(obra.andamento) {
      case 'inicial': return 'Inicial';
      case 'medio': return 'Em Andamento';
      case 'finalizado': return 'Finalizado';
      default: return 'Inicial';
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
                <h1 className="text-3xl font-bold text-cordes-blue">Cadastro de Obras</h1>
                <p className="text-gray-600 mt-2">Cadastre novas obras e mantenha o controle de projetos</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Andamento</div>
                <div className={`text-2xl font-bold ${getStatusColor()}`}>{getStatusText()}</div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Informações Básicas */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informações Básicas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Nome da Obra *</label>
                    <input
                      type="text"
                      name="nome"
                      value={obra.nome}
                      onChange={handleChange}
                      placeholder="Ex: Edifício Residencial ABC"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Cliente *</label>
                    <select
                      name="cliente"
                      value={obra.cliente}
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
                    <label className="block text-gray-700 font-medium mb-2">Andamento</label>
                    <select
                      name="andamento"
                      value={obra.andamento}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    >
                      <option value="inicial">Inicial</option>
                      <option value="medio">Em Andamento</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Endereço da Obra */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Endereço da Obra</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">CEP</label>
                    <input
                      type="text"
                      name="endereco.cep"
                      value={obra.endereco.cep}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      maxLength="9"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-medium mb-2">Logradouro</label>
                    <input
                      type="text"
                      name="endereco.logradouro"
                      value={obra.endereco.logradouro}
                      onChange={handleChange}
                      placeholder="Rua, Avenida, etc."
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Número</label>
                    <input
                      type="text"
                      name="endereco.numero"
                      value={obra.endereco.numero}
                      onChange={handleChange}
                      placeholder="123"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Complemento</label>
                    <input
                      type="text"
                      name="endereco.complemento"
                      value={obra.endereco.complemento}
                      onChange={handleChange}
                      placeholder="Lote, Quadra, etc."
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Bairro</label>
                    <input
                      type="text"
                      name="endereco.bairro"
                      value={obra.endereco.bairro}
                      onChange={handleChange}
                      placeholder="Nome do bairro"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Cidade</label>
                    <input
                      type="text"
                      name="endereco.cidade"
                      value={obra.endereco.cidade}
                      onChange={handleChange}
                      placeholder="Nome da cidade"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Estado</label>
                    <select
                      name="endereco.estado"
                      value={obra.endereco.estado}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    >
                      <option value="">Selecione</option>
                      {estados.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Dados Técnicos */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Dados Técnicos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Categoria *</label>
                    <select
                      name="dadosTecnicos.categoria"
                      value={obra.dadosTecnicos.categoria}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    >
                      <option value="">Selecione a categoria</option>
                      {categorias.map(categoria => (
                        <option key={categoria} value={categoria}>{categoria}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Tipo de Obra</label>
                    <select
                      name="dadosTecnicos.tipoObra"
                      value={obra.dadosTecnicos.tipoObra}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    >
                      <option value="">Selecione o tipo</option>
                      {tiposObra.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Área Construída (m²)</label>
                    <input
                      type="number"
                      name="dadosTecnicos.areaConstruida"
                      value={obra.dadosTecnicos.areaConstruida}
                      onChange={handleChange}
                      step="0.01"
                      placeholder="Ex: 150.50"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Data de Início</label>
                    <input
                      type="date"
                      name="dadosTecnicos.dataInicio"
                      value={obra.dadosTecnicos.dataInicio}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Previsão de Término</label>
                    <input
                      type="date"
                      name="dadosTecnicos.dataPrevisaoTermino"
                      value={obra.dadosTecnicos.dataPrevisaoTermino}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Valor Orçado</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">R$</span>
                      <input
                        type="number"
                        name="dadosTecnicos.valorOrcado"
                        value={obra.dadosTecnicos.valorOrcado}
                        onChange={handleChange}
                        step="0.01"
                        placeholder="0,00"
                        className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Responsável Técnico</label>
                    <select
                      name="dadosTecnicos.responsavelTecnico"
                      value={obra.dadosTecnicos.responsavelTecnico}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    >
                      <option value="">Selecione o responsável</option>
                      {responsaveisTecnicos.map(responsavel => (
                        <option key={responsavel} value={responsavel}>{responsavel}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Nº Alvará</label>
                    <input
                      type="text"
                      name="dadosTecnicos.alvara"
                      value={obra.dadosTecnicos.alvara}
                      onChange={handleChange}
                      placeholder="Número do alvará"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Status</label>
                    <select
                      name="status"
                      value={obra.status}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="suspenso">Suspenso</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dados Comerciais */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Dados Comerciais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Vendedor Responsável</label>
                    <select
                      name="dadosComerciais.vendedor"
                      value={obra.dadosComerciais.vendedor}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    >
                      <option value="">Selecione um vendedor</option>
                      {vendedores.map(vendedor => (
                        <option key={vendedor} value={vendedor}>{vendedor}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Desconto (%)</label>
                    <input
                      type="number"
                      name="dadosComerciais.desconto"
                      value={obra.dadosComerciais.desconto}
                      onChange={handleChange}
                      step="0.01"
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 font-medium mb-2">Observações</label>
                  <textarea
                    name="dadosComerciais.observacoes"
                    value={obra.dadosComerciais.observacoes}
                    onChange={handleChange}
                    placeholder="Observações importantes sobre a obra..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue focus:border-transparent"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-cordes-blue text-gray-700 font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md hover:shadow-lg"
                >
                  Cadastrar Obra
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
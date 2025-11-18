import { useState, useEffect } from "react";
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";
import { toast } from 'react-toastify';
import { api } from "../../../services/api"; 
import financeiroService from "../../../services/financeiroService";

export default function CadastrarMovimentacao() {
  const [movimentacao, setMovimentacao] = useState({
    valor: "",
    tipo: "", 
    categoriaFinanceira: "",
    obraId: "",
    insumoId: "",
    funcionarioResponsavelId: "",
    dataMovimento: "",
    descricao: "",
    clienteId: ""
  });

  const [obras, setObras] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const categoriasFinanceiras = [
    "COMPRA_MATERIAL", "FOLHA_PAGAMENTO", "DESPESA_ADMINISTRATIVA", "RECEITA_CLIENTE", "OUTROS"
  ];

  useEffect(() => {
      async function carregarDados() {
          try {
            const [obrasRes, clientesRes, funcRes, insumosRes] = await Promise.all([
                api.get("/obras/listar"),
                api.get("/cliente/listar"),
                api.get("/funcionario/listar"),
                api.get("/insumo/listar")
            ]);
            
            if(obrasRes.data.success) setObras(obrasRes.data.data);
            if(clientesRes.data.success) setClientes(clientesRes.data.data);
            if(funcRes.data.success) setFuncionarios(funcRes.data.data);
            if(insumosRes.data.success) setInsumos(insumosRes.data.data);

          } catch (error) {
              toast.error("Erro ao carregar dados auxiliares.");
          } finally {
              setLoadingData(false);
          }
      }
      carregarDados();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // --- LÓGICA DE AUTO-PREENCHIMENTO DO CLIENTE ---
    if (name === 'obraId') {
        // Encontra a obra selecionada na lista
        // (Nota: verifique se o ID vem como 'id' ou 'idObra' no seu objeto, ajustei para ambos)
        const obraSelecionada = obras.find(o => String(o.idObra || o.id) === String(value));

        if (obraSelecionada && obraSelecionada.clienteId) {
            // Se a obra tem cliente, atualiza a obra E o cliente
            setMovimentacao(prev => ({ 
                ...prev, 
                [name]: value,
                clienteId: obraSelecionada.clienteId 
            }));
            
            // Opcional: Avisar o usuário visualmente
            toast.info(`Cliente "${obraSelecionada.clienteNome || 'vinculado'}" selecionado automaticamente.`);
            return;
        }
    }
    // -----------------------------------------------

    setMovimentacao(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!movimentacao.valor || !movimentacao.tipo || !movimentacao.categoriaFinanceira || !movimentacao.dataMovimento || !movimentacao.funcionarioResponsavelId) {
       toast.warn("Por favor, preencha os campos obrigatórios (*).");
      return;
    }

    try {
        const payload = {
            valor: parseFloat(movimentacao.valor),
            tipo: movimentacao.tipo,
            categoriaFinanceira: movimentacao.categoriaFinanceira,
            dataMovimento: movimentacao.dataMovimento,
            descricao: movimentacao.descricao,
            funcionarioResponsavelId: Number(movimentacao.funcionarioResponsavelId),
            obraId: movimentacao.obraId ? Number(movimentacao.obraId) : null,
            clienteId: movimentacao.clienteId ? Number(movimentacao.clienteId) : null,
            insumoId: movimentacao.insumoId ? Number(movimentacao.insumoId) : null,
        };

        await financeiroService.cadastrar(payload);
        toast.success("Movimentação cadastrada com sucesso!");
        limparCampos();
    } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Erro ao cadastrar.");
    }
  };

  const limparCampos = () => {
    setMovimentacao({
      valor: "",
      tipo: "",
      categoriaFinanceira: "",
      obraId: "",
      insumoId: "",
      funcionarioResponsavelId: "",
      dataMovimento: "",
      descricao: "",
      clienteId: ""
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
              <h1 className="text-3xl font-bold text-cordes-blue">Cadastro Financeiro</h1>
            </div>

            {loadingData ? <p>Carregando...</p> : (
            <div className="space-y-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Dados Principais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Valor *</label>
                    <input type="number" name="valor" value={movimentacao.valor} onChange={handleChange} className="w-full border p-3 rounded-lg" placeholder="0.00" />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Tipo *</label>
                    <select name="tipo" value={movimentacao.tipo} onChange={handleChange} className="w-full border p-3 rounded-lg">
                        <option value="">Selecione...</option>
                        <option value="RECEITA">Receita</option>
                        <option value="DESPESA">Despesa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Categoria *</label>
                    <select name="categoriaFinanceira" value={movimentacao.categoriaFinanceira} onChange={handleChange} className="w-full border p-3 rounded-lg">
                        <option value="">Selecione...</option>
                        {categoriasFinanceiras.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Data *</label>
                    <input type="date" name="dataMovimento" value={movimentacao.dataMovimento} onChange={handleChange} className="w-full border p-3 rounded-lg" />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Responsável *</label>
                    <select name="funcionarioResponsavelId" value={movimentacao.funcionarioResponsavelId} onChange={handleChange} className="w-full border p-3 rounded-lg">
                        <option value="">Selecione...</option>
                        {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Vínculos */}
              <div className="bg-gray-50 p-6 rounded-lg">
                 <div className="flex items-center justify-between mb-4 border-b pb-2">
                    <h2 className="text-xl font-semibold text-gray-800">Vínculos (Opcional)</h2>
                 </div>
                 
                 {/* Mensagem Informativa sobre a Empresa */}
                 <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded shadow-sm">
                    <div className="flex items-start">
                        <i className="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
                        <div>
                            <p className="text-sm text-blue-900 font-semibold">
                                Movimentação da Empresa
                            </p>
                            <p className="text-sm text-blue-700">
                                Se você <strong>não selecionar</strong> uma Obra nem um Cliente, esta movimentação será registrada automaticamente como uma despesa ou receita <strong>da Empresa</strong> (Custo Administrativo).
                            </p>
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Obra</label>
                        <select name="obraId" value={movimentacao.obraId} onChange={handleChange} className="w-full border p-3 rounded-lg">
                            <option value="">Nenhuma (Empresa)</option>
                            {obras.map(o => <option key={o.idObra || o.id} value={o.idObra || o.id}>{o.nomeObra || o.nome}</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Selecionar a obra preencherá o cliente automaticamente.</p>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Cliente</label>
                        <select name="clienteId" value={movimentacao.clienteId} onChange={handleChange} className="w-full border p-3 rounded-lg">
                            <option value="">Nenhum (Empresa)</option>
                            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                         <label className="block text-gray-700 font-medium mb-2">Descrição</label>
                         <textarea name="descricao" value={movimentacao.descricao} onChange={handleChange} rows="3" className="w-full border p-3 rounded-lg" placeholder="Detalhes sobre a movimentação..."></textarea>
                    </div>
                 </div>
              </div>
              
              <div className="flex gap-4 pt-6 border-t">
                <button onClick={handleSubmit} className="flex-1 bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700">
                  Salvar Movimentação
                </button>
                <button onClick={limparCampos} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100">
                  Limpar
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
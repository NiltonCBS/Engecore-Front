import { useState } from "react";
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";
import { toast } from 'react-toastify';
import { api } from "../../../services/api"; // Importe sua API

// Lista de unidades vem do Enum do backend 'Unidade.java'
const unidadesMedida = [
  "UN", "KG", "G", "L", "ML", "M", "CM", "MM", 
  "PACOTE", "JOGO", "ROLO", "M2", "M3"
];

export default function CadastrarInsumo() { // Renomeie o componente para clareza
  const [nome, setNome] = useState("");
  const [unidade, setUnidade] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!nome.trim() || !unidade) {
      toast.warn("Nome e Unidade de Medida são obrigatórios.");
      return;
    }

    setLoading(true);
    const insumoDTO = { nome, unidade };

    try {
      // A API correta é a de Insumo
      await api.post("/insumo/cadastrar", insumoDTO);
      toast.success("Insumo cadastrado com sucesso no catálogo!");
      limparCampos();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao cadastrar insumo.");
    } finally {
      setLoading(false);
    }
  };

  const limparCampos = () => {
    setNome("");
    setUnidade("");
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-3xl font-bold text-cordes-blue">Cadastrar Novo Insumo (Produto Mestre)</h1>
            <p className="text-gray-600 mt-2 mb-8">Cadastre um novo item no catálogo geral da empresa.</p>
            
            <div className="space-y-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Identificação do Insumo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Nome do Insumo *</label>
                    <input
                      type="text"
                      name="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Cimento Portland CP II-E-32"
                      className="w-full border border-gray-300 rounded-lg p-3"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Unidade de Medida *</label>
                    <select
                      name="unidade"
                      value={unidade}
                      onChange={(e) => setUnidade(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3"
                    >
                      <option value="">Selecione a unidade</option>
                      {unidadesMedida.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Todos os outros campos (preço, estoque, etc.) foram REMOVIDOS daqui */}

              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-cordes-blue text-gray-700 font-semibold border..."
                >
                  {loading ? "Salvando..." : "Cadastrar Insumo"}
                </button>
                <button
                  onClick={limparCampos}
                  className="px-6 py-3 border border-gray-300..."
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from 'react-toastify';
import Sidebar from "../../../components/SideBar";
import Header from "../../../components/Header";
import { api } from "../../../services/api";

// Formata número para moeda BRL
const formatarMoeda = (valor) => {
    if (typeof valor !== 'number') valor = 0;
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
// Formata data para dd/mm/aaaa
const formatarData = (data) => {
    if (!data) return "-";
    const dataObj = new Date(data);
    dataObj.setMinutes(dataObj.getMinutes() + dataObj.getTimezoneOffset());
    return dataObj.toLocaleDateString('pt-BR');
};


export default function ListarCotacoes() {
    
    // Estado para armazenar as cotações
    const [cotacoes, setCotacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState("");
    const navigate = useNavigate();


    // Função para buscar cotações
    const fetchCotacoes = async () => {
        setLoading(true);
        try {
            const response = await api.get("/cotacoes/listar");
            if (response.data.success) {
                setCotacoes(response.data.data);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao buscar cotações.");
        } finally {
            setLoading(false);
        }
    };

    // Carrega as cotações ao montar o componente
    useEffect(() => {
        fetchCotacoes();
    }, []);

    // Lógica de deleção
    const handleDeletar = async (id) => {
        confirmarExclusao(async () => {
            try {
                console.log("Deletando cotação com ID:", id);
                await api.delete(`/cotacoes/deletar/${id}`);
                toast.success("Cotação deletada com sucesso!");
                fetchCotacoes(); // Recarrega a lista
            } catch (error) {
                toast.error(error.response?.data?.message || "Erro ao deletar cotação.");
            }
        });
    };

    // Navega para a página de detalhes
    const handleDetalhes = (id) => {
        navigate(`/cotacoes/detalhes/${id}`);
    };

    // Confirmação de exclusão
    const confirmarExclusao = (callback) => {
        toast(
            ({ closeToast }) => (
                <div>
                    <p>Tem certeza que deseja excluir esta cotação?</p>
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        <button
                            onClick={() => {
                                callback();
                                closeToast();
                            }}
                            style={{ background: "red", color: "white", padding: "5px 10px", borderRadius: "5px" }}
                        >
                            Excluir
                        </button>
                        <button
                            onClick={closeToast}
                            style={{ padding: "5px 10px", border: "1px solid #ccc", borderRadius: "5px" }}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ),
            { closeOnClick: false, autoClose: false }
        );
    };

    // Define a cor do status
    const getStatusColor = (status) => {
        if (status === 'ABERTA') return 'bg-yellow-100 text-yellow-800';
        if (status === 'CONCLUIDA') return 'bg-green-100 text-green-800';
        if (status === 'CANCELADA') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    // Filtra as cotações com base no status selecionado
    const cotacoesFiltradas = cotacoes.filter(c =>
        !filtroStatus || c.status === filtroStatus
    );

    return (
        <div className="bg-gray-100 min-h-screen">
            <Sidebar />
            <div className="ml-64">
                <Header />
                <div className="p-6">
                    <div className="bg-white rounded-xl shadow-md p-8">
                        { }
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-cordes-blue">Lista de Cotações</h1>
                                <p className="text-gray-600 mt-2">Visualize e gerencie todas as cotações solicitadas</p>
                            </div>
                            <NavLink
                                to="/cotacoes/nova"
                                className="bg-blue-700 text-white font-semibold border border-gray-300 py-3 px-6 rounded-lg hover:bg-blue-gray-400 hover:text-white transition duration-300 shadow-md hover:shadow-lg"
                            >
                                <i className="fas fa-plus mr-2"></i>
                                Nova Cotação
                            </NavLink>
                        </div>
                        { }
                        <div className="mb-4 w-full md:w-1/3">
                            <label className="block text-gray-700 font-medium mb-2">Filtrar por Status</label>
                            <select
                                value={filtroStatus}
                                onChange={(e) => setFiltroStatus(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cordes-blue"
                            >
                                <option value="">Todos</option>
                                <option value="ABERTA">Abertas</option>
                                <option value="CONCLUIDA">Concluídas</option>
                            </select>
                        </div>
                        { }
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b-2 border-gray-300">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Obra</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Insumo</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Necessidade</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Melhor Valor</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7" className="text-center py-10"><i className="fas fa-spinner fa-spin text-2xl text-cordes-blue"></i></td></tr>
                                    ) : cotacoesFiltradas.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-10 text-gray-500">Nenhuma cotação encontrada.</td></tr>
                                    ) : (
                                        cotacoesFiltradas.map((cot) => (
                                            <tr key={cot.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">#{cot.id}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(cot.status)}`}>
                                                        {cot.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">{cot.nomeObra}</td>
                                                <td className="px-4 py-3 text-sm">{cot.nomeInsumo} ({cot.quantidade})</td>
                                                <td className="px-4 py-3 text-sm">{formatarData(cot.dataNecessidade)}</td>
                                                <td className="px-4 py-3 text-sm font-bold text-green-700">{formatarMoeda(cot.melhorValorUnitario)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => handleDetalhes(cot.id)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                            title="Ver Detalhes / Confirmar"
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletar(cot.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Excluir Cotação"
                                                            disabled={cot.status === 'CONCLUIDA'}
                                                            hidden={cot.status === 'CONCLUIDA'}
                                                        >
                                                            <i className="fas fa-trash-alt"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
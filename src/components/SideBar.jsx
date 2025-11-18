/* eslint-disable no-unused-vars */
import { NavLink, useLocation, useNavigate, BrowserRouter } from "react-router-dom";
import { useState, useEffect } from "react";
// import authService from "../services/authService"; // Descomente no seu projeto real
import { toast } from 'react-toastify';
import  authService  from '../services/authService'; // Ajuste o caminho conforme necessário

// --- MOCKS PARA VISUALIZAÇÃO (Mantenha ou remova conforme necessário no projeto real) ---
const LogoEngecore = "/src/assets/images/logo engecore branca.svg"; // Substitua pelo caminho correto da sua logo



// -------------------------------------------------------------------------

// import LogoEngecore from "/src/assets/images/logo engecore branca.svg"; // Descomente no seu projeto real

function SidebarContent() {
    // Estados para controlar menus expandidos
    const location = useLocation();
    const navigate = useNavigate();
    const [isProdutosOpen, setIsProdutosOpen] = useState(false);
    const [isUsersOpen, setIsUsersOpen] = useState(false);
    const [isFuncOpen, setIsFuncOpen] = useState(false);
    const [isObrasOpen, setIsObrasOpen] = useState(false);
    const [isFornecedoresOpen, setIsFornecedoresOpen] = useState(false);
    const [isEstoqueOpen, setIsEstoqueOpen] = useState(false);
    const [isFinanceiroOpen, setIsFinanceiroOpen] = useState(false);
    const [isCotacoesOpen, setIsCotacoesOpen] = useState(false);

    // Atualiza o estado dos menus com base na rota atual
    useEffect(() => {
        const path = location.pathname;

        setIsProdutosOpen(
            path.includes('/produtos') ||
            path.includes('/marcas')
        );

        setIsUsersOpen(
            path.includes('/users')
        );

        // ⭐ CORREÇÃO PRINCIPAL: Funcionários devem abrir com rotas /funcionario
        setIsFuncOpen(
            path.includes('/funcionario')
        );

        setIsObrasOpen(
            path.includes('/obras')
        );

        setIsFornecedoresOpen(
            path.includes('/fornecedores')
        );

        // Mantém estoque aberto para ambas rotas
        setIsEstoqueOpen(
            path.includes('/estoque') ||
            path.includes('/movimentacao')
        );

        setIsFinanceiroOpen(
            path.includes('/financeiro')
        );

        setIsCotacoesOpen(
            path.includes('/cotacoes')
        );

    }, [location.pathname]);

    // Funções para alternar menus
    const toggleProdutos = () => setIsProdutosOpen(!isProdutosOpen);
    const toggleUsers = () => setIsUsersOpen(!isUsersOpen);
    const toggleFunc = () => setIsFuncOpen(!isFuncOpen);
    const toggleObras = () => setIsObrasOpen(!isObrasOpen);
    const toggleFornecedores = () => setIsFornecedoresOpen(!isFornecedoresOpen);
    const toggleCotacoes = () => setIsCotacoesOpen(!isCotacoesOpen);
    const toggleEstoque = () => setIsEstoqueOpen(!isEstoqueOpen);
    const toggleFinanceiro = () => setIsFinanceiroOpen(!isFinanceiroOpen);

    // Função de logout
    const handleLogout = async () => {
        try {
            // Agora isso chama a função logout() definida em src/services/authService.jsx
            await authService.logout();

            toast.success("Logout realizado com sucesso!");
            navigate("/"); // Redireciona para o login
        } catch (error) {
            console.error(error);
            toast.error("Erro ao fazer logout.");
        }
    };

    return (
        <div className="fixed inset-y-0 left-0 w-64 bg-black shadow-xl z-50 flex flex-col h-full">
            {/* Logo */}
            <div className="flex px-4 h-16 bg-cordes-blue shrink-0 items-center justify-center">
                <img
                    src={LogoEngecore}
                    alt="Logo Engecore"
                    className="w-20 h-auto object-contain rounded-lg mt-6"
                />
            </div>

            {/* Navegação com scroll */}
            <nav className="mt-8 px-4 flex-1 overflow-y-auto scrollbar-hide pb-20">
                <div className="space-y-2">
                    {/* Menu Dashboard */}
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-lg transition-colors group ${isActive
                                ? "bg-gray-700 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`
                        }
                    >
                        <i className="fas fa-home mr-3 group-hover:text-white"></i>
                        Dashboard
                    </NavLink>

                    {/* Menu Clientes */}
                    <div>
                        <button
                            type="button"
                            onClick={toggleUsers}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            <div className="flex items-center">
                                <i className="fas fa-users mr-3 group-hover:text-white"></i>
                                Clientes
                            </div>
                            <i className={`fas fa-chevron-down transition-transform duration-200 ${isUsersOpen ? "rotate-180" : ""}`}></i>
                        </button>
                        <div className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${isUsersOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                            <NavLink to="/users/listar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-list mr-3"></i>
                                Lista de Clientes
                            </NavLink>
                            <NavLink to="/users/adicionar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-plus mr-3"></i>
                                Adicionar Cliente
                            </NavLink>
                        </div>
                    </div>

                    {/* Menu Funcionarios */}
                    <div>
                        <button
                            type="button"
                            onClick={toggleFunc}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            <div className="flex items-center">
                                <i className="fas fa-user-tie mr-3 group-hover:text-white"></i>
                                Funcionarios
                            </div>
                            <i className={`fas fa-chevron-down transition-transform duration-200 ${isFuncOpen ? "rotate-180" : ""}`}></i>
                        </button>
                        <div className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${isFuncOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                            <NavLink to="/funcionario/listar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-list mr-3"></i>
                                Lista de Funcionarios
                            </NavLink>
                            <NavLink to="/funcionario/adicionar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-plus mr-3"></i>
                                Adicionar Funcionario
                            </NavLink>
                        </div>
                    </div>


                    {/* Menu Produtos (Catálogo) */}
                    <div>
                        <button
                            type="button"
                            onClick={toggleProdutos}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            <div className="flex items-center">
                                <i className="fas fa-box mr-3 group-hover:text-white"></i>
                                Catálogo (Insumos)
                            </div>
                            <i className={`fas fa-chevron-down transition-transform duration-200 ${isProdutosOpen ? "rotate-180" : ""}`}></i>
                        </button>
                        <div className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${isProdutosOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                            <NavLink to="/produtos/listar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-list mr-3"></i>
                                Lista de Insumos
                            </NavLink>
                            <NavLink to="/produtos/adicionar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-plus mr-3"></i>
                                Adicionar Insumo
                            </NavLink>
                            <NavLink to="/marcas" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-bookmark mr-3"></i>
                                Gerenciar Marcas
                            </NavLink>
                        </div>
                    </div>

                    {/* Menu Fornecedores */}
                    <div>
                        <button
                            type="button"
                            onClick={toggleFornecedores}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            <div className="flex items-center">
                                <i className="fas fa-truck mr-3 group-hover:text-white"></i>
                                Fornecedores
                            </div>
                            <i className={`fas fa-chevron-down transition-transform duration-200 ${isFornecedoresOpen ? "rotate-180" : ""}`}></i>
                        </button>
                        <div className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${isFornecedoresOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                            <NavLink to="/fornecedores/listar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-list mr-3"></i>
                                Lista de Fornecedores
                            </NavLink>
                            <NavLink to="/fornecedores/adicionar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-plus mr-3"></i>
                                Adicionar Fornecedor
                            </NavLink>
                            <NavLink to="/fornecedores/produtos/vincular" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-link mr-3"></i>
                                Vincular Produto
                            </NavLink>
                            <NavLink to="/fornecedores/produtos/listar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-tags mr-3"></i>
                                Listar Produtos
                            </NavLink>
                        </div>
                    </div>

                    {/* Menu Obras */}
                    <div>
                        <button
                            type="button"
                            onClick={toggleObras}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            <div className="flex items-center">
                                <i className="fas fa-building mr-3 group-hover:text-white"></i>
                                Obras
                            </div>
                            <i className={`fas fa-chevron-down transition-transform duration-200 ${isObrasOpen ? "rotate-180" : ""}`}></i>
                        </button>
                        <div className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${isObrasOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                            <NavLink to="/obras/listar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-list mr-3"></i>
                                Lista de Obras
                            </NavLink>
                            <NavLink to="/obras/adicionar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-plus mr-3"></i>
                                Adicionar Obra
                            </NavLink>
                            <NavLink to="/obras/fases" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-stream mr-3"></i>
                                Gerenciar Fases
                            </NavLink>
                        </div>
                    </div>


                    {/* Menu Cotações */}
                    <div>
                        <button
                            type="button"
                            onClick={toggleCotacoes}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            <div className="flex items-center">
                                <i className="fas fa-comments-dollar mr-3 group-hover:text-white"></i>
                                Cotações
                            </div>
                            <i className={`fas fa-chevron-down transition-transform duration-200 ${isCotacoesOpen ? "rotate-180" : ""}`}></i>
                        </button>
                        <div className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${isCotacoesOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                            <NavLink to="/cotacoes" end className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-list-alt mr-3"></i>
                                Listar Cotações
                            </NavLink>
                            <NavLink to="/cotacoes/nova" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-plus mr-3"></i>
                                Nova Cotação
                            </NavLink>
                        </div>
                    </div>


                    {/* Menu Estoque (ATUALIZADO COM LINKS E LÓGICA) */}
                    <div>
                        <button
                            type="button"
                            onClick={toggleEstoque}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            <div className="flex items-center">
                                <i className="fas fa-boxes-stacked mr-3 group-hover:text-white"></i>
                                Estoque
                            </div>
                            <i className={`fas fa-chevron-down transition-transform duration-200 ${isEstoqueOpen ? "rotate-180" : ""}`}></i>
                        </button>
                        {/* Usei max-h-[500px] aqui apenas por precaução caso o menu fique grande, sem afetar o design visual */}
                        <div className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${isEstoqueOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>

                            <NavLink to="/movimentacao/listar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-list-ul mr-3"></i>
                                Listar Movimentações
                            </NavLink>

                            <NavLink to="/movimentacao/adicionar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-exchange-alt mr-3"></i>
                                Nova Movimentação
                            </NavLink>

                            <NavLink to="/estoque/listar-estoques" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-warehouse mr-3"></i>
                                Listar Estoques
                            </NavLink>

                            <NavLink to="/estoque/cadastrar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-map-marker-alt mr-3"></i>
                                Cadastrar Estoque
                            </NavLink>

                            <NavLink to="/estoque/produtos-por-estoque" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-dolly mr-3"></i>
                                Produtos por Estoque
                            </NavLink>

                        </div>
                    </div>

                    {/* Menu Financeiro */}
                    <div>
                        <button
                            type="button"
                            onClick={toggleFinanceiro}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            <div className="flex items-center">
                                <i className="fas fa-brazilian-real-sign mr-3 group-hover:text-white"></i>
                                Financeiro
                            </div>
                            <i className={`fas fa-chevron-down transition-transform duration-200 ${isFinanceiroOpen ? "rotate-180" : ""}`}></i>
                        </button>
                        <div className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${isFinanceiroOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                            <NavLink to="/financeiro/listar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-list mr-3"></i>
                                Lançamentos
                            </NavLink>
                            <NavLink to="/financeiro/adicionar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-plus mr-3"></i>
                                Novo Lançamento
                            </NavLink>
                        </div>
                    </div>

                    {/* Menu Relatorios */}
                    <NavLink
                        to="/relatorios"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-lg transition-colors group ${isActive
                                ? "bg-gray-700 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`
                        }
                    >
                        <i className="fas fa-file-pdf mr-3 group-hover:text-white"></i>
                        Relatórios
                    </NavLink>
                </div>
            </nav>

            {/* Rodapé do Sidebar com Logout */}
            <div className="p-4 bg-gray-800 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <i className="fas fa-user-circle text-white text-3xl"></i>
                    <div>
                        <p className="text-white text-sm font-medium">John Admin</p>
                        <p className="text-gray-400 text-xs">Administrator</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors group text-gray-300 hover:bg-red-700 hover:text-white"
                >
                    <i className="fas fa-sign-out-alt"></i>
                    Sair
                </button>
            </div>
        </div>
    );
}
export default SidebarContent;
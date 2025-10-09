import LogoEngecore from "/src/assets/images/engecore.svg";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const location = useLocation();
  const [isProdutosOpen, setIsProdutosOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isObrasOpen, setIsObrasOpen] = useState(false);
  const [isMovimentacaoOpen, setIsMovimentacaoOpen] = useState(false);

  // Sempre que mudar de rota, verifica se está em /produtos
useEffect(() => {
  const path = location.pathname;

  setIsProdutosOpen(path.startsWith('/produtos'));
  setIsUsersOpen(path.startsWith('/users'));
  setIsObrasOpen(path.startsWith('/obras'));
  setIsMovimentacaoOpen(path.startsWith('/movimentacao'));
}, [location.pathname]);


  const toggleProdutos = () => {
    setIsProdutosOpen(!isProdutosOpen);
  };

  const toggleMovimentacao = () => {
    setIsMovimentacaoOpen(!isMovimentacaoOpen);
  }

  const toggleUsers = () => {
    setIsUsersOpen(!isUsersOpen);
  }

  const toggleObras = () => {
    setIsObrasOpen(!isObrasOpen);
  }

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-black shadow-xl z-50 flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-cordes-blue">
        <img
          src={LogoEngecore}
          alt="Logo Engecore"
          className="w-36 h-auto object-contain rounded-lg mt-6"
        />
      </div>

      {/* Navegação com scroll */}
      <nav className="mt-8 px-4 flex-1 overflow-y-auto scrollbar-hide">
        <div className="space-y-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors group ${
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <i className="fas fa-home mr-3 group-hover:text-white"></i>
            Dashboard
          </NavLink>

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
              <i
                className={`fas fa-chevron-down transition-transform duration-200 ${
                  isUsersOpen ? "rotate-180" : ""
                }`}
              ></i>
            </button>

            {/* Submenu */}
            <div
              className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${
                isUsersOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <NavLink
                to="/users/listar"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? "bg-gray-600 text-white"
                      : "text-gray-400 hover:bg-gray-600 hover:text-white"
                  }`
                }
              >
                <i className="fas fa-list mr-3"></i>
                Lista de Clientes
              </NavLink>

              <NavLink
                to="/users/adicionar"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? "bg-gray-600 text-white"
                      : "text-gray-400 hover:bg-gray-600 hover:text-white"
                  }`
                }
              >
                <i className="fas fa-plus mr-3"></i>
                Adicionar Cliente
              </NavLink>
            {/*  
              <NavLink
                to="/clientes/estoque"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? "bg-gray-600 text-white"
                      : "text-gray-400 hover:bg-gray-600 hover:text-white"
                  }`
                }
              >
                <i className="fas fa-warehouse mr-3"></i>
                Estoque
              </NavLink>
              */}
            </div>
          </div>

          {/* Produtos com Dropdown */}
          <div>
            <button
              type="button"
              onClick={toggleObras}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <div className="flex items-center">
                <i className="fas fa-clipboard mr-3 group-hover:text-white"></i>
                Obras
              </div>
              <i
                className={`fas fa-chevron-down transition-transform duration-200 ${
                  isObrasOpen ? "rotate-180" : ""
                }`}
              ></i>
            </button>

            {/* Submenu */}
            <div
              className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${
                isObrasOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <NavLink
                to="/obras/listar"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? "bg-gray-600 text-white"
                      : "text-gray-400 hover:bg-gray-600 hover:text-white"
                  }`
                }
              >
                <i className="fas fa-list mr-3"></i>
                Lista de Obras
              </NavLink>

              <NavLink
                to="/obras/adicionar"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? "bg-gray-600 text-white"
                      : "text-gray-400 hover:bg-gray-600 hover:text-white"
                  }`
                }
              >
                <i className="fas fa-plus mr-3"></i>
                Adicionar Obra
              </NavLink>

              <NavLink
                to="/obras/categorias"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? "bg-gray-600 text-white"
                      : "text-gray-400 hover:bg-gray-600 hover:text-white"
                  }`
                }
              >
                <i className="fas fa-tags mr-3"></i>
                Categorias Obras
              </NavLink>
            {/* 
              <NavLink
                to="/obras/estoque"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? "bg-gray-600 text-white"
                      : "text-gray-400 hover:bg-gray-600 hover:text-white"
                  }`
                }
              >
                <i className="fas fa-warehouse mr-3"></i>
                Estoque
              </NavLink>
            */}
            </div>
          </div>

          

          {/* Produtos com Dropdown */}
          <div>
            <button
              type="button"
              onClick={toggleProdutos}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <div className="flex items-center">
                <i className="fas fa-box mr-3 group-hover:text-white"></i>
                Produtos
              </div>
              <i
                className={`fas fa-chevron-down transition-transform duration-200 ${
                  isProdutosOpen ? "rotate-180" : ""
                }`}
              ></i>
            </button>

            {/* Submenu */}
            <div
              className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${
                isProdutosOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <NavLink
                to="/produtos/listar"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? "bg-gray-600 text-white"
                      : "text-gray-400 hover:bg-gray-600 hover:text-white"
                  }`
                }
              >
                <i className="fas fa-list mr-3"></i>
                Lista de Produtos
              </NavLink>

              <NavLink
                to="/produtos/adicionar"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? "bg-gray-600 text-white"
                      : "text-gray-400 hover:bg-gray-600 hover:text-white"
                  }`
                }
              >
                <i className="fas fa-plus mr-3"></i>
                Adicionar Produto
              </NavLink>

              <NavLink
                to="/produtos/categorias"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? "bg-gray-600 text-white"
                      : "text-gray-400 hover:bg-gray-600 hover:text-white"
                  }`
                }
              >
                <i className="fas fa-tags mr-3"></i>
                Categorias
              </NavLink>

              <NavLink
                to="/produtos/estoque"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? "bg-gray-600 text-white"
                      : "text-gray-400 hover:bg-gray-600 hover:text-white"
                  }`
                }
              >
                <i className="fas fa-warehouse mr-3"></i>
                Estoque
              </NavLink>
            </div>
          </div>

          {/* Produtos com Dropdown */}
          <div>
            <button
              type="button"
              onClick={toggleMovimentacao}
              className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <div className="flex items-center">
                <i className="fas fa-box mr-3 group-hover:text-white"></i>
                Movimentacao
              </div>
              <i
                className={`fas fa-chevron-down transition-transform duration-200 ${
                  isMovimentacaoOpen ? "rotate-180" : ""
                }`}
              ></i>
            </button>

            {/* Submenu */}
            <div
              className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${
                isMovimentacaoOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <NavLink
                to="/movimentacao/listar"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? "bg-gray-600 text-white"
                      : "text-gray-400 hover:bg-gray-600 hover:text-white"
                  }`
                }
              >
                <i className="fas fa-list mr-3"></i>
                Lista de Movimentação
              </NavLink>

              <NavLink
                to="/movimentacao/adicionar"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? "bg-gray-600 text-white"
                      : "text-gray-400 hover:bg-gray-600 hover:text-white"
                  }`
                }
              >
                <i className="fas fa-plus mr-3"></i>
                Adicionar Movimentação
              </NavLink>
            </div>
          </div>
          
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors group ${
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <i className="fas fa-shopping-cart mr-3 group-hover:text-white"></i>
            Orders
          </NavLink>

          <NavLink
            to="/configuracao"
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors group ${
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            <i className="fas fa-cog mr-3 group-hover:text-white"></i>
            Configurações
          </NavLink>
        </div>
      </nav>

      {/* Usuário */}
      <div className="p-4 bg-gray-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <i className="fas fa-user-circle text-white text-3xl"></i>
          <div>
            <p className="text-white text-sm font-medium">John Admin</p>
            <p className="text-gray-400 text-xs">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}

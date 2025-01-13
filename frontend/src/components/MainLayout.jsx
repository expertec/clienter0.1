import { Link, Outlet, useNavigate } from "react-router-dom";
import { FaHome, FaCog, FaComments, FaSearch, FaBullhorn, FaChevronDown, FaChevronUp, FaAddressBook, FaBell, FaSignOutAlt } from "react-icons/fa";
import { getAuth, signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import logo from "../assets/logo.png"; // Importa el logo

const MainLayout = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [isMarketingOpen, setIsMarketingOpen] = useState(false); // Estado para el menú desplegable

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirige al login después del cierre de sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleMarketingMenu = () => {
    setIsMarketingOpen((prev) => !prev);
  };

  const closeMarketingMenu = () => {
    setIsMarketingOpen(false);
  };

  // Cierra el menú al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".marketing-menu") && !event.target.closest(".marketing-trigger")) {
        closeMarketingMenu();
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar con degradado */}
      <nav className="w-20 lg:w-24 p-4 flex flex-col items-center fixed left-0 top-0 h-screen shadow-lg" style={{ background: "linear-gradient(to top, #9AE26E, white)" }}>
        {/* Logo */}
        <div className="mb-8">
          <Link to="/">
            <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className="space-y-4 text-sm text-[#083416]">
          <li className="flex flex-col items-center group">
            <Link
              to="/admin"
              className="flex flex-col items-center p-3 hover:bg-[#083416]/10 rounded-md transition-all"
              title="Dashboard"
            >
              <FaHome className="text-2xl" />
              <span className="mt-1 text-xs">Dashboard</span>
            </Link>
          </li>
          <li className="flex flex-col items-center group">
            <Link
              to="/admin/conversations"
              className="flex flex-col items-center p-3 hover:bg-[#083416]/10 rounded-md transition-all"
              title="Conversaciones"
            >
              <FaComments className="text-2xl" />
              <span className="mt-1 text-xs">Conversaciones</span>
            </Link>
          </li>

          {/* Menú de Marketing */}
          <li className="w-full relative group">
            <div
              className="flex flex-col items-center p-3 hover:bg-[#083416]/10 rounded-md cursor-pointer transition-all marketing-trigger"
              onClick={toggleMarketingMenu}
              title="Marketing"
            >
              <FaBullhorn className="text-2xl" />
              <span className="mt-1 text-xs">Marketing</span>
            </div>
            {isMarketingOpen && (
              <div className="absolute left-20 top-0 bg-white text-gray-800 rounded-lg shadow-lg p-4 z-50 w-60 marketing-menu">
                <h3 className="font-bold mb-2 text-center">Menú Marketing</h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/admin/marketing/campaigns"
                      className="block p-2 hover:bg-gray-100 rounded-md transition-all"
                      onClick={closeMarketingMenu} // Cierra el menú al seleccionar una opción
                    >
                      Campañas
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/marketing/sequences"
                      className="block p-2 hover:bg-gray-100 rounded-md transition-all"
                      onClick={closeMarketingMenu} // Cierra el menú al seleccionar una opción
                    >
                      Secuencias
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/marketing/mass-sending"
                      className="block p-2 hover:bg-gray-100 rounded-md transition-all"
                      onClick={closeMarketingMenu} // Cierra el menú al seleccionar una opción
                    >
                      Envío Masivo
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </li>

          {/* Contactos */}
          <li className="flex flex-col items-center group">
            <Link
              to="/admin/contacts"
              className="flex flex-col items-center p-3 hover:bg-[#083416]/10 rounded-md transition-all"
              title="Contactos"
            >
              <FaAddressBook className="text-2xl" />
              <span className="mt-1 text-xs">Contactos</span>
            </Link>
          </li>

          {/* Settings */}
          <li className="flex flex-col items-center group">
            <Link
              to="/admin/settings"
              className="flex flex-col items-center p-3 hover:bg-[#083416]/10 rounded-md transition-all"
              title="Configuración"
            >
              <FaCog className="text-2xl" />
              <span className="mt-1 text-xs">Configuración</span>
            </Link>
          </li>
        </ul>

        {/* Botón de logout */}
        <div className="mt-auto mb-4">
          <button
            onClick={handleLogout}
           
            className="px-5 py-3 bg-primary text-white rounded-lg shadow hover:bg-secondary transition duration-300"

            title="Salir"
          >
            <FaSignOutAlt className="text-2xl" />
            <span className="text-xs mt-1"></span>
          </button>
        </div>
      </nav>

      {/* Content Area */}
      <div className="flex-1 flex flex-col ml-20 lg:ml-24">
        {/* Top Navbar */}
        <header className="bg-white shadow-lg p-4 flex justify-between items-center sticky top-0 z-10">
          {/* Search Bar */}
          <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 shadow-inner w-2/5">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent outline-none text-gray-700 w-full"
            />
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-6">
            <FaBell className="text-[#083416] text-2xl cursor-pointer hover:text-green-600" title="Notificaciones" />
            <div className="flex items-center space-x-3">
              <img
                src="https://via.placeholder.com/40"
                alt="User Avatar"
                className="w-12 h-12 rounded-full"
              />
              <div className="text-gray-700">
                <p className="text-sm font-semibold">John Doe</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
            
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8 flex-grow bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

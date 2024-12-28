import { Link, Outlet, useNavigate } from "react-router-dom";
import { FaHome, FaUser, FaCog, FaComments, FaSearch } from "react-icons/fa";
import { getAuth, signOut } from "firebase/auth";

const MainLayout = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirige al login después del cierre de sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <nav className="bg-gray-900 text-white w-64 p-4 flex flex-col">
        {/* Logo */}
        <div className="text-2xl font-bold mb-6 text-center">
          <Link to="/">Clienter</Link>
        </div>

        {/* Navigation Links */}
        <ul className="space-y-4">
          <li>
            <Link
              to="/admin"
              className="flex items-center space-x-2 p-3 hover:bg-gray-800 rounded-md"
            >
              <FaHome />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/users"
              className="flex items-center space-x-2 p-3 hover:bg-gray-800 rounded-md"
            >
              <FaUser />
              <span>Users</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/conversations"
              className="flex items-center space-x-2 p-3 hover:bg-gray-800 rounded-md"
            >
              <FaComments />
              <span>Conversations</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/settings"
              className="flex items-center space-x-2 p-3 hover:bg-gray-800 rounded-md"
            >
              <FaCog />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          {/* Search Bar */}
          <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none text-gray-700"
            />
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <img
              src="https://via.placeholder.com/40"
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="text-gray-700">
              <p className="text-sm font-semibold">John Doe</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-200 px-3 py-2 rounded-md hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 flex-grow bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

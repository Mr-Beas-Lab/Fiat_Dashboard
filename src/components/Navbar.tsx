import { useAuth } from "../context/AuthContext";  
import { LogOut } from "lucide-react";  

const Navbar = () => {
  const { logout, currentUser } = useAuth();  

  return (
    <nav className="bg-(--color-primary) p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">MRB Fiat Dashboard</h1>
        <div className="space-x-4">
          {/* Conditionally render the Logout Button if the user is logged in */}
          {currentUser && (
            <button
              onClick={logout}  
              className="flex items-center text-white cursor-pointer"
            >
              <LogOut className="w-5 h-5 text-red-600 mr-2" />  
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
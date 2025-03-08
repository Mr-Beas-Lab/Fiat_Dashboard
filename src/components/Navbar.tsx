import { Link } from "react-router-dom"

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">Admin & Ambassador Dashboard</h1>
        <div className="space-x-4">
          <Link to="/admin" className="text-white hover:text-gray-200">
            Admin
          </Link>
          <Link to="/ambassador" className="text-white hover:text-gray-200">
            Ambassador
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar


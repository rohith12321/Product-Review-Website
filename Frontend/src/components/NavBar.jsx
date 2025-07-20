import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.svg';


const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">
          <img src={logo} alt="Logo" className="logo-img" />
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/your-reviews">Your Reviews</Link>
        <Link to="/auth">Login / Signup</Link>
      </div>
    </nav>
  );
};

export default Navbar;

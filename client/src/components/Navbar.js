import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaTrophy, FaBars, FaTimes, FaUser, FaChartBar, FaGamepad, FaSignOutAlt, FaUserShield, FaHome } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAdmin = user?.isAdmin;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    navigate('/');
    window.location.reload();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <FaTrophy className="brand-icon" />
            <span>Tennis Club</span>
          </Link>

          <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>

          <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              <FaHome /> Home
            </Link>

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  // Admin Navigation
                  <>
                    <Link to="/admin" className="nav-link admin-link" onClick={() => setMobileMenuOpen(false)}>
                      <FaUserShield /> Admin Panel
                    </Link>
                  </>
                ) : (
                  // Regular User Navigation
                  <>
                    <Link to="/dashboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <FaChartBar /> Dashboard
                    </Link>
                    <Link to="/challenge" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <FaGamepad /> Challenge
                    </Link>
                    <Link to="/matches" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <FaTrophy /> Matches
                    </Link>
                  </>
                )}

                {/* User Avatar Dropdown */}
                <div className="navbar-user">
                  <div className="user-dropdown">
                    <button className="user-avatar-btn" onClick={toggleUserDropdown}>
                      <img
                        src={user?.MPID || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.UserName}`}
                        alt={user?.UserName}
                        className="user-avatar-img"
                      />
                      <span className="user-name">{user?.UserName}</span>
                    </button>

                    {userDropdownOpen && (
                      <div className="dropdown-menu">
                        <Link
                          to={isAdmin ? "/admin" : "/dashboard"}
                          className="dropdown-item"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <FaUser /> {isAdmin ? "Admin Panel" : "Dashboard"}
                        </Link>
                        <button onClick={handleLogout} className="dropdown-item logout">
                          <FaSignOutAlt /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // Not Authenticated - Show Sign Up and Login
              <div className="auth-buttons">
                <Link to="/register" className="btn-signup" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
                <Link to="/login" className="btn-login" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

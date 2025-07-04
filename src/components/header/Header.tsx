import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { RootState } from "../../store";
import { TLink } from "../../types";

const Header: React.FC = () => {
  const headerData = useSelector((state: RootState) => state.main.headerData);
  const { logo, navigation_links } = headerData;
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`header ${isOpen ? "open" : ""}`}>
      {/* <div className="logo-menu">
        <Link to="/">
          <img src={logo?.url} alt="Logo" />
        </Link>
      </div> */}
      <nav className={`nav ${isOpen ? "active" : ""}`}>
        {navigation_links?.link.map((link: TLink, index: number) => (
          <Link
            key={`key-${index}`}
            to={link.href}
            className={location.pathname === link.href ? "active" : ""}
            onClick={() => setIsOpen(false)}
          >
            {link.title}
          </Link>
        ))}
      </nav>
      <div className="menu-toggle" onClick={handleToggleMenu}>
        <div className="icon-bar"></div>
        <div className="icon-bar"></div>
        <div className="icon-bar"></div>
      </div>
    </div>
  );
};

export default Header;

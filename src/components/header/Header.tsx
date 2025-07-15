import React, { useState } from "react";
import { Button } from '@contentstack/venus-components';
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
          <img src={logo?.url} alt={logo?.title} />
        </Link>
      </div> */}
      <nav className="nav">
        {navigation_links?.link?.map((navLink: TLink, index: number) => (
          <Link
            key={index}
            to={navLink.href}
            className={`nav-link ${location.pathname === navLink.href ? 'active' : ''}`}
          >
            {navLink.title}
          </Link>
        ))}
      </nav>
      <Button
        buttonType="tertiary"
        className="menu-toggle"
        onClick={handleToggleMenu}
        aria-label="Toggle menu"
      >
        <span className="icon-bar"></span>
        <span className="icon-bar"></span>
        <span className="icon-bar"></span>
      </Button>
    </div>
  );
};

export default Header;

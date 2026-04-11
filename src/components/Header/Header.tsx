import { NavLink } from 'react-router-dom';
import './Header.scss';

interface HeaderProps {
  variant?: 'dark' | 'transparent';
}

const Header = ({ variant = 'dark' }: HeaderProps) => {
  const isTransparent = variant === 'transparent';

  return (
    <header className={`header ${isTransparent ? 'header--transparent' : 'header--dark'}`}>
  
    </header>
  );
};

export default Header;
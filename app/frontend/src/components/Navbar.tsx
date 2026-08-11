import { Link } from "react-router-dom";
import './styles/Navbar.css'

function Navbar(){
  return (
    <nav className="site-nav" aria-label="Primary">
      <ul className="site-nav__list">
        <li className="site-nav__item"><Link className="site-nav__link" to="/">Home</Link></li>
        <li className="site-nav__item"><a className="site-nav__link" href="">News</a></li>
        <li className="site-nav__item"><a className="site-nav__link" href="">Sports</a></li>
        <li className="site-nav__item"><a className="site-nav__link" href="">Opinion</a></li>
      </ul>
    </nav>
  )

}

export default Navbar

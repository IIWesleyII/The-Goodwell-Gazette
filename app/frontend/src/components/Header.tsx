
import './styles/Header.css'

function Header(){
  return (
    <header className="header">
      <img
        className="header__mark"
        src="/tumbleweed_no_background.png"
        alt=""
        aria-hidden="true"
      />
      <h1>The Goodwell Gazette</h1>
    </header>
  )
}

export default Header

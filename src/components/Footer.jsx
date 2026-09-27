import '../style/Footer.css'

const Footer = () => (
  <footer className="footer">
    <div className="footer__inner">

      {/* Brand */}
      <div className="footer__brand">
        <img
          src="https://cdn-icons-png.flaticon.com/128/2451/2451474.png"
          alt="CityTour logo"
        />
        <span className="footer__brand-name">City Tour</span>
      </div>

      {/* Tagline */}
      <p className="footer__tagline">
        Discover cities through the eyes of real travellers
      </p>

      <div className="footer__divider" />

      {/* Social icons */}
      <nav className="footer__social" aria-label="Social links">
        <a href="#" className="footer__icon-link" aria-label="GitHub">
          <ion-icon name="logo-github" />
        </a>
        <a href="#" className="footer__icon-link" aria-label="LinkedIn">
          <ion-icon name="logo-linkedin" />
        </a>
        <a href="#" className="footer__icon-link" aria-label="Mastodon">
          <ion-icon name="logo-mastodon" />
        </a>
      </nav>

      {/* Copyright */}
      <p className="footer__copy">
        © {new Date().getFullYear()} City Tour — all rights reserved
      </p>

    </div>
  </footer>
)

export default Footer

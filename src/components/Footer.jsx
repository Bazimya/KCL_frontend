import { Link } from 'react-router-dom'
import { Coffee, Phone, MapPin, Mail, Instagram, Facebook, Twitter } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'

export default function Footer() {
  const { settings } = useSettings()
  const { isStaff } = useAuth()
  return (
    <footer className="bg-coffee-gradient text-cream-light pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      <div className="container-app py-8 md:py-14 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6 md:gap-10 [overflow-wrap:anywhere]">
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-espresso-900">
              <Coffee size={18} />
            </span>
            <span className="font-display font-extrabold text-lg">{settings.siteName}</span>
          </div>
          <p className="text-cream-light/70 text-sm leading-relaxed">{settings.tagline}</p>
          <div className="flex gap-3 mt-3 md:mt-4">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-espresso-900 transition">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold mb-3">Shop</h4>
          <ul className="space-y-1.5 md:space-y-2 text-sm text-cream-light/70">
            <li><Link to="/shop" className="hover:text-gold">Coffee Machines</Link></li>
            <li><Link to="/coffee" className="hover:text-gold">Drinks Menu</Link></li>
            <li><Link to="/course/training" className="hover:text-gold">Coffee Training</Link></li>
            <li><Link to="/book-table" className="hover:text-gold">Reserve a Table</Link></li>
            <li><Link to="/track" className="hover:text-gold">Track My Order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-3">Company</h4>
          <ul className="space-y-1.5 md:space-y-2 text-sm text-cream-light/70">
            <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/history" className="hover:text-gold">History</Link></li>
            <li><Link to="/mission-vision" className="hover:text-gold">Mission &amp; Vision</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
            <li><Link to={isStaff ? '/admin' : '/login'} className="hover:text-gold">{isStaff ? 'Staff Dashboard' : 'Staff Login'}</Link></li>
          </ul>
        </div>

        <div className="col-span-2 lg:col-span-1">
          <h4 className="font-display font-bold mb-3">Visit / Call Us</h4>
          <ul className="space-y-2 md:space-y-3 text-sm text-cream-light/70">
            <li className="flex items-center gap-2 min-w-0"><Phone size={15} className="text-gold shrink-0" /> {settings.phone}</li>
            <li className="flex items-center gap-2 min-w-0"><MapPin size={15} className="text-gold shrink-0" /> {settings.address}</li>
            <li className="flex items-center gap-2 min-w-0"><Mail size={15} className="text-gold shrink-0" /> admin@kigalicoffeelab.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 md:py-5 px-4 text-center text-xs text-cream-light/60">
        © {new Date().getFullYear()} {settings.siteName}. All rights reserved. Brewed in Kigali, Rwanda ☕
      </div>
    </footer>
  )
}

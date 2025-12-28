'use client'

import Link from 'next/link'
import { Brain, Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-secondary text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MediAnalytica</span>
            </div>
            <p className="text-sm text-gray-400">
              Yapay zeka destekli tıbbi görüntü analizi ve tele-tıp platformu
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/dashboard#analyze" className="hover:text-white transition-colors">
                  Analiz Yap
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Yardım
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Hakkımızda
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kaynaklar</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  SSS
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Giriş Yap
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">İletişim</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@medianaalytica.com" className="hover:text-white transition-colors">
                  info@medianaalytica.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+902121234567" className="hover:text-white transition-colors">
                  +90 (212) 123 45 67
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            © 2025 MediAnalytica. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}


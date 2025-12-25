import React from 'react'
import Logo from '../assets/logo.svg';
function Nav() {
    const links=[
        {name :"Home", href :"/"},
        {name :"About", href :"/about"},
        {name :"Timetables", href :"/timetable"}, // accessible to everyone 
    ]
  return (
   <nav className="bg-slate-50 border-b border-gray-100 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold text-green-600 tracking-tight font-Pacifico flex items-center">
          <img className="h-10 w-10 " src={Logo} alt="Logo" />
          LizardIo
        </div>

        <ul className="hidden md:flex space-x-8">
          {links.map((link) => (
            <li key={link.name}>
              <a 
                href={link.href} 
                className="text-gray-600 hover:text-green-600 transition-colors font-Lato"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center space-x-4">
          <button className="bg-green-600 text-white px-5 py-2 rounded-full font-Lato hover:bg-green-700 transition-all shadow-md">
            <a href="/login">Log in</a>
          </button>
        </div>

      </div>
    </nav>
  )
}

export default Nav
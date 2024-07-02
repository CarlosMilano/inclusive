import { auth } from '@/config/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/router'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  const [menu, setMenu] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }
  const toggleMenu = () => {
    setMenu(!menu)
  }

  const closeMenu = () => {
    setTimeout(() => {
      setMenu(false)
    }, 250)
  }
  return (
    <>
      <header>
        <div className='flex items-center fixed left-0 top-0 w-full bg-white h-[60px] z-40 shadow-sm'>
          <div className='justify-center lg:w-full flex'>
            <nav
              className={`menu-sidebar ${
                menu
                  ? 'translate-x-0'
                  : 'translate-x-full transition-transform duration-200'
              } lg:translate-x-0 lg:transition-transform duration-300 flex flex-col bg-white lg:bg-transparent w-60 fixed h-[94%] md:h-[96%] top-[55px] right-0 shadow-sm z-50 lg:w-auto lg:static lg:h-auto lg:shadow-none lg:z-auto lg:top-0`}
            >
              <div className='h-full'>
                <ul className='flex mt-14 flex-col font-medium items-start p-5 lg:p-0 lg:m-0 lg:flex-row text-xl md:text-xl space-y-4 lg:space-y-0 lg:space-x-8 text-black lg:items-center'>
                  <li>
                    <Link
                      className={`menu-item p-2 px-5 ${
                        pathname === '/inicio'
                          ? ' text-blue-600 rounded-md'
                          : ''
                      }
                    `}
                      href='/inicio'
                      onClick={closeMenu}
                    >
                      Inicio
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={`menu-item p-2 px-5 ${
                        pathname === '/historial'
                          ? ' text-blue-600 rounded-md'
                          : ''
                      }
                    `}
                      href='/historial'
                      onClick={closeMenu}
                    >
                      Historial
                    </Link>
                  </li>

                  <li>
                    <Link
                      className={`menu-item p-2 px-5 ${
                        pathname === '/reportes'
                          ? ' text-blue-600 rounded-md'
                          : ''
                      }
                    `}
                      href='/reportes'
                      onClick={closeMenu}
                    >
                      Reportes
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className='p-2 px-5'>
                      <ExitToAppIcon />
                    </button>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>
        <div className='flex fixed right-2 top-1 z-40'>
          <button
            onClick={toggleMenu}
            className={`lg:hidden p-4 flex flex-col justify-center w-14 h-14 border-0 text-transparent gap-[6.5px] ${
              menu ? 'active' : ''
            }`}
          >
            <div
              className={`bg-black h-0.5 w-full transition-all origin-left ${
                menu ? 'rotate-45' : ''
              }`}
            ></div>
            <div
              className={`bg-black h-0.5 w-full transition-all origin-left ${
                menu ? 'opacity-0' : ''
              }`}
            ></div>
            <div
              className={`bg-black h-0.5 w-full transition-all origin-left ${
                menu ? '-rotate-45' : ''
              }`}
            ></div>
          </button>
        </div>
      </header>
    </>
  )
}

import React, { useEffect, useState } from 'react'
import { MdClose, MdOutlineRemove, MdOutlineFlipToFront, MdOutlineFlipToBack } from 'react-icons/md'
import style from './NavBar.module.css'

const NavBar: React.FC<{ theme: string }> = ({ theme }) => {
  const [isMaxmized, setIsMaximized] = useState(false)

  useEffect(() => {
    
  })

  return (
    <div className="absolute drag-region flex items-center justify-between w-full h-10 bg-gray-200 dark:bg-gray-900 text-white top-0 left-0 border-b-1 border-gray-400 dark:border-b-1 dark:border-gray-700">
      <div className="flex items-center justify-center h-10 w-10 ml-0.5 overflow-hidden">
        <img src="/src/assets/Logo.svg" alt="Logo" className="w-7 h-7 object-contain" />
      </div>
      <div className="drag-no flex items-center justify-center border-b-1 border-gray-400 dark:border-b-1 dark:border-gray-700">
        <NavBarButton icon={<MdOutlineRemove />} message="Minimize" />
        <NavBarButton icon={<MdOutlineFlipToFront />} message="Close" />
        <NavBarButton icon={<MdOutlineFlipToBack />} message="Close" />
        <NavBarButton icon={<MdClose />} message="Close" />
      </div>
    </div>
  )
}

const NavBarButton = ({
  icon,
  message,
  onClick
}: {
  icon: React.ReactNode
  message?: string
  onClick?: () => void
}): JSX.Element => {
  return (
    <div className={`${style.NavBarButton} `} onClick={onClick}>
      {icon}
    </div>
  )
}
export default NavBar

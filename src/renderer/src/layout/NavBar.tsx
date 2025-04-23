import React from 'react'
import { MdClose, MdOutlineRemove, MdOutlineFlipToFront, MdOutlineFlipToBack } from 'react-icons/md'

const NavBar: React.FC<{ theme: string; platform: string }> = ({ theme, platform }) => {
  return (
    <div className="absolute drag-region flex items-center justify-between w-full h-10 bg-gray-200 dark:bg-gray-900 text-white top-0 left-0 border-b-1 border-gray-400 dark:border-b-1 dark:border-gray-700">
      <div className="flex items-center justify-center h-10 w-10 ml-0.5 overflow-hidden">
        {platform !== 'darwin' && (
          <img src="/src/assets/Logo.svg" alt="Logo" className="w-7 h-7 object-contain" />
        )}
      </div>
      <div className="drag-no flex items-center justify-center border-b-1 border-gray-400 dark:border-b-1 dark:border-gray-700">
        {platform !== 'darwin' && (
          <>
            <NavBarButton icon={<MdOutlineRemove />} message="Minimize" onClick={() => {}} />
            <NavBarButton icon={<MdOutlineFlipToFront />} message="Maximize" onClick={() => {}} />
            <NavBarButton icon={<MdOutlineFlipToBack />} message="Restore" onClick={() => {}} />
            <NavBarButton icon={<MdClose />} message="Close" onClick={() => {}} />
          </>
        )}
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
  message: string
  onClick: () => void
}): JSX.Element => {
  return (
    <div
      className="flex items-center justify-center h-10 w-10 bg-gray-300 text-blue-400 cursor-pointer ease-linear transition-colors hover:bg-blue-400 hover:text-white dark:bg-gray-900 dark:text-blue-300 dark:hover:bg-blue-500 dark:hover:text-white"
      onClick={onClick}
    >
      {icon}
    </div>
  )
}

export default NavBar

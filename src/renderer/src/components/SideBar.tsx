import React from 'react'
import { MdAdd, MdSettings, MdDarkMode, MdOutlineDarkMode } from 'react-icons/md'
import styles from './SideBar.module.css'

const SideBar: React.FC<{ theme?: string; toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
  return (
    <div className="fixed flex flex-col items-center top-0 left-0 w-16 h-full bg-gray-200 dark:bg-gray-900 text-black dark:text-white shadow-lg">
      <div className="flex flex-col items-center justify-between h-full gap-4">
        <div>
          <SideBarIcon icon={<MdAdd size="28px" />} text="new file" />
        </div>
        <div>
          {theme === 'dark' ? (
            <SideBarIcon
              onClick={() => {
                toggleTheme()
              }}
              icon={<MdDarkMode size="28px" />}
              text="dark mode"
            />
          ) : (
            <SideBarIcon
              onClick={() => {
                toggleTheme()
              }}
              icon={<MdOutlineDarkMode size="28px" />}
              text="light mode"
            />
          )}
          <SideBarIcon icon={<MdSettings size="28px" />} text="settings" />
        </div>
      </div>
    </div>
  )
}

const SideBarIcon = ({
  icon,
  text,
  onClick
}: {
  icon: React.ReactNode
  text?: string
  onClick?: () => void
}): JSX.Element => {
  return (
    <div className={styles.SidebarIcon} onClick={onClick}>
      {icon}
      <span className={styles.SidebarTooltip}>{text}</span>
    </div>
  )
}

export default SideBar

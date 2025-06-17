import React from 'react'
import { MdAdd, MdSettings, MdDarkMode, MdOutlineDarkMode } from 'react-icons/md'

import {
  TbLayoutSidebarRightCollapseFilled,
  TbLayoutSidebarRightCollapse,
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarLeftCollapse,
  TbCardsFilled,
  TbCards
} from 'react-icons/tb'

/* eslint-disable react/prop-types */
interface SideBarProps {
  theme?: string
  toggleTheme: () => void
  isLeftPanelOpen: boolean
  toggleLeftPanel: () => void
  isRightPanelOpen: boolean
  toggleRightPanel: () => void
  isFlashcardsOpen: boolean
  toggleFlashcards: () => void
  isSettingsOpen?: boolean
  toggleSettings: () => void
}

const SideNavBar: React.FC<SideBarProps> = ({
  theme,
  toggleTheme,
  isLeftPanelOpen,
  toggleLeftPanel,
  isRightPanelOpen,
  toggleRightPanel,
  isFlashcardsOpen,
  toggleFlashcards,
  toggleSettings
}) => {
  return (
    <div className=" flex flex-col items-center  w-12 h-full border-r-1 border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-900 text-black dark:text-white shadow-lg">
      <div className="flex flex-col items-center justify-between h-full gap-4">
        {/* upsider icons */}
        <div>
          <SideBarIcon icon={<MdAdd size="25px" />} text="new file" />
          {/* {isFileExplorerOpen ? (
            <SideBarIcon
              onClick={() => {
                toggleLeftPanel()
              }}
              icon={<MdOutlineFolderOpen size="25px" />}
              text="file explorer"
            />
          ) : (
            <SideBarIcon
              onClick={() => {
                toggleFileExplorer()
              }}
              icon={<MdOutlineFolder size="25px" />}
              text="file explorer"
            />
          )} */}

          {isLeftPanelOpen ? (
            <SideBarIcon
              onClick={() => {
                toggleLeftPanel()
              }}
              icon={<TbLayoutSidebarLeftCollapseFilled size="25px" />}
              text="left side bar"
            />
          ) : (
            <SideBarIcon
              onClick={() => {
                toggleLeftPanel()
              }}
              icon={<TbLayoutSidebarLeftCollapse size="25px" />}
              text="left side bar"
            />
          )}

          {isRightPanelOpen ? (
            <SideBarIcon
              onClick={() => {
                toggleRightPanel()
              }}
              icon={<TbLayoutSidebarRightCollapseFilled size="25px" />}
              text="right side bar"
            />
          ) : (
            <SideBarIcon
              onClick={() => {
                toggleRightPanel()
              }}
              icon={<TbLayoutSidebarRightCollapse size="25px" />}
              text="right side bar"
            />
          )}
        </div>
        {/* bottom icons */}

        <div>
          {isFlashcardsOpen ? (
            <SideBarIcon
              onClick={() => {
                toggleFlashcards()
              }}
              icon={<TbCardsFilled size="25px" />}
              text="flashcards"
            />
          ) : (
            <SideBarIcon
              onClick={() => {
                toggleFlashcards()
              }}
              icon={<TbCards size="25px" />}
              text="flashcards"
            />
          )}

          {theme === 'dark' ? (
            <SideBarIcon
              onClick={() => {
                toggleTheme()
              }}
              icon={<MdDarkMode size="25px" />}
              text="dark mode"
            />
          ) : (
            <SideBarIcon
              onClick={() => {
                toggleTheme()
              }}
              icon={<MdOutlineDarkMode size="25px" />}
              text="light mode"
            />
          )}

          <SideBarIcon
            onClick={() => {
              toggleSettings()
            }}
            icon={<MdSettings size="25px" />}
            text="settings"
          />
        </div>
      </div>
    </div>
  )
}

interface SideBarIconProps {
  icon: React.ReactNode
  text?: string
  onClick?: () => void
}

const SideBarIcon: React.FC<SideBarIconProps> = ({ icon, text, onClick }) => {
  return (
    <div
      className="group relative flex items-center justify-center h-10 w-10 mt-2 mb-2 mx-auto bg-gray-400 dark:bg-gray-800 text-blue-400 hover:bg-blue-500 hover:text-white rounded-3xl hover:rounded-xl transition-all duration-300 ease-linear cursor-pointer"
      onClick={onClick}
    >
      {icon}
      {text && (
        <span className="absolute w-auto p-2 m-2 min-w-max left-14 rounded-md shadow-md text-white bg-gray-900 dark:bg-gray-300 dark:text-gray-900 text-xs font-bold transition-all duration-100 scale-0 opacity-0 origin-left group-hover:scale-100 group-hover:opacity-100">
          {text}
        </span>
      )}
    </div>
  )
}

export default SideNavBar

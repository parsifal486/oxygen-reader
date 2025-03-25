import { useEffect, useState } from 'react'
import SideBar from './components/SideBar/SideBar'
import { useSettings } from './hooks/useSettings'
import NavBar from './components/Navbar/NavBar'

function App(): JSX.Element {
  const { settings, loading, updateSetting } = useSettings()

  useEffect(() => {
    if (settings && !loading) {
      //Apply theme from settings
      console.log('get theme in renderer', settings.theme)
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [settings, loading])

  const toggleTheme = (): void => {
    const newTheme = settings?.theme === 'dark' ? 'light' : 'dark'
    console.log('toggle theme in renderer classlist', document.documentElement.classList)
    updateSetting('theme', newTheme)
  }

  return (
    <div className="relative">
      <NavBar theme={settings?.theme || 'light'} />
      <div className="absolute top-10 left-0 w-full h-[calc(100vh-40px)]">
        <SideBar theme={settings?.theme || 'light'} toggleTheme={toggleTheme} />
        <div className="flex flex-col items-center justify-center h-full text-black dark:text-white bg-gray-400 dark:bg-gray-800 top-0 left-0">
          <h1 className="text-4xl font-bold">Hello World!</h1>
          <span>Oxygen2</span>
        </div>
      </div>
    </div>
  )
}

export default App

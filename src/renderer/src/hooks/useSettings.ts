import { useState, useEffect, useCallback } from 'react'
import { Settings } from '@shared/types'

export const useSettings = (): {
  settings: Settings | null
  loading: boolean
  updateSetting: (key: keyof Settings, value: Settings[keyof Settings]) => Promise<boolean>
} => {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  //load settings on component mount
  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      try {
        const data = await window.settings.getSettings()
        setSettings(data)
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  //update a specific setting
  const updateSetting = useCallback(
    async <K extends keyof Settings>(key: K, value: Settings[K]) => {
      try {
        await window.settings.updateSetting(key, value)
        setSettings((prev) => (prev ? { ...prev, [key]: value } : null))
        return true
      } catch (error) {
        console.error(`Error updating ${String(key)}:`, error)
        return false
      }
    },
    []
  )

  return { settings, loading, updateSetting }
}

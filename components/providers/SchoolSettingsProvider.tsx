'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { SchoolSettings } from '@/types/admin'
import { api } from '@/lib/api'

interface SchoolSettingsContextType {
  settings: SchoolSettings | null
  loading: boolean
  refreshSettings: () => Promise<void>
}

const SchoolSettingsContext = createContext<SchoolSettingsContextType>({
  settings: null,
  loading: true,
  refreshSettings: async () => {},
})

export const useSchoolSettings = () => useContext(SchoolSettingsContext)

export const SchoolSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<SchoolSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const data = await api.admin.getSettings()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching school settings globally:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <SchoolSettingsContext.Provider 
      value={{ 
        settings, 
        loading, 
        refreshSettings: fetchSettings 
      }}
    >
      {children}
    </SchoolSettingsContext.Provider>
  )
}

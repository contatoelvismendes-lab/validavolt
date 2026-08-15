import { useState, useCallback } from 'react'

export const useBluetooth = () => {
  const [isSupported, setIsSupported] = useState(
    !!navigator?.bluetooth
  )
  const [isConnected, setIsConnected] = useState(false)
  const [device, setDevice] = useState(null)
  const [error, setError] = useState(null)

  const requestDevice = useCallback(async (filters = []) => {
    if (!isSupported) {
      setError('Web Bluetooth não é suportado neste navegador')
      return null
    }

    try {
      const requestFilters = filters.length > 0
        ? filters
        : [{ services: ['battery_service'] }]

      const selectedDevice = await navigator.bluetooth.requestDevice({
        filters: requestFilters,
        optionalServices: ['battery_service', 'device_information']
      })

      setDevice(selectedDevice)
      setIsConnected(true)
      setError(null)
      return selectedDevice
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        setError(err.message || 'Erro ao conectar ao dispositivo')
      }
      return null
    }
  }, [isSupported])

  const disconnect = useCallback(() => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect()
    }
    setIsConnected(false)
    setDevice(null)
  }, [device])

  return {
    isSupported,
    isConnected,
    device,
    error,
    requestDevice,
    disconnect
  }
}

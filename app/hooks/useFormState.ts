'use client'
import { useState, useCallback } from 'react'

type FormState<T extends object> = T & {
  [K in keyof T]?: T[K] extends object ? never : T[K]
}

interface UseFormStateOptions<T extends object> {
  initialValues: T
}

interface UseFormStateReturn<T extends object> {
  values: T
  setValues: React.Dispatch<React.SetStateAction<T>>
  setValue: <K extends keyof T>(key: K, value: T[K]) => void
  reset: () => void
  fill: (data: Partial<T>) => void
}

export function useFormState<T extends object>({
  initialValues,
}: UseFormStateOptions<T>): UseFormStateReturn<T> {
  const [values, setValues] = useState<T>(initialValues)

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
  }, [initialValues])

  const fill = useCallback((data: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...data }))
  }, [])

  return { values, setValues, setValue, reset, fill }
}

export function useListState<T>(): {
  items: T[]
  setItems: React.Dispatch<React.SetStateAction<T[]>>
  add: (item: T) => void
  remove: (id: string) => void
  update: (id: string, data: Partial<T>) => void
  clear: () => void
} {
  const [items, setItems] = useState<T[]>([])

  const add = useCallback((item: T) => {
    setItems((prev) => [...prev, item])
  }, [])

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item: any) => item.id !== id))
  }, [])

  const update = useCallback((id: string, data: Partial<T>) => {
    setItems((prev) =>
      prev.map((item: any) => (item.id === id ? { ...item, ...data } : item))
    )
  }, [])

  const clear = useCallback(() => {
    setItems([])
  }, [])

  return { items, setItems, add, remove, update, clear }
}

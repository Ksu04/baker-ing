'use client'
import { useState, useCallback } from 'react'

type FormState<T extends object> = T & {
  [K in keyof T]?: T[K] extends object ? never : T[K]
}

interface UseFormStateOptions<T extends object> {
  initialValues: T
}

export interface UseFormStateReturn<T extends object> {
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

export function useListState<T extends { id?: string; productId?: string; ingredientId?: string }>(): {
  items: T[]
  setItems: React.Dispatch<React.SetStateAction<T[]>>
  add: (item: T) => void
  remove: (id: string) => void
  update: (id: string, data: Partial<T>) => void
  clear: () => void
  toggle: (key: string, item: T) => void
} {
  const [items, setItems] = useState<T[]>([])

  const add = useCallback((item: T) => {
    setItems((prev) => [...prev, item])
  }, [])

  const matches = (item: any, key: string) =>
    item.id === key || item.productId === key || item.ingredientId === key

  const remove = useCallback((id: string) => {
    setItems((prev) =>
      prev.filter((item: any) => !matches(item, id))
    )
  }, [])

  const update = useCallback((id: string, data: Partial<T>) => {
    setItems((prev) =>
      prev.map((item: any) =>
        matches(item, id) ? { ...item, ...data } : item
      )
    )
  }, [])

  const clear = useCallback(() => {
    setItems([])
  }, [])

  const toggle = useCallback((key: string, item: T) => {
    setItems((prev) => {
      const exists = prev.some((x: any) => matches(x, key))
      if (exists) {
        return prev.filter((x: any) => !matches(x, key))
      }
      return [...prev, item]
    })
  }, [])

  return { items, setItems, add, remove, update, clear, toggle }
}

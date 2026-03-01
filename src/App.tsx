import { useEffect } from "react"
import { RouterProvider } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { router } from "./router"
import { useAuthStore } from "@/stores/authStore"
import { usePwaStore } from "@/stores/pwaStore"

const queryClient = new QueryClient()

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)
  const initializePwa = usePwaStore((s) => s.initialize)

  useEffect(() => {
    initialize()
    initializePwa()
  }, [initialize, initializePwa])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

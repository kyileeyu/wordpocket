import { useEffect } from "react"
import { RouterProvider } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
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
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            border: '1px solid var(--color-success)',
            borderRadius: '9999px',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-body-md)',
            fontWeight: 500,
            boxShadow: 'var(--shadow-md)',
            padding: '10px 20px',
          },
        }}
      />
    </QueryClientProvider>
  )
}

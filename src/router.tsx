import { createBrowserRouter } from "react-router"
import AuthGuard from "@/components/AuthGuard"
import GuestGuard from "@/components/GuestGuard"
import AuthShell from "@/components/layouts/AuthShell"
import AppShell from "@/components/layouts/AppShell"
import {
  WelcomePage,
  LoginPage,
  SignupPage,
  VerifyPage,
  HomePage,
  FolderPage,
  DeckPage,
  CardFormPage,
  CsvImportPage,
  PhotoImportPage,
  FolderCsvImportPage,
  StudyPage,
  CompletePage,
  StatsPage,
  SettingsPage,
} from "@/pages"

export const router = createBrowserRouter([
  // Guest-only routes (redirect to / if already logged in)
  {
    element: <GuestGuard />,
    children: [
      {
        element: <AuthShell />,
        children: [
          { path: "/welcome", element: <WelcomePage /> },
          { path: "/login", element: <LoginPage /> },
          { path: "/signup", element: <SignupPage /> },
          { path: "/verify", element: <VerifyPage /> },
        ],
      },
    ],
  },
  // Protected routes (redirect to /welcome if not logged in)
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/folder/:id", element: <FolderPage /> },
          { path: "/deck/:id", element: <DeckPage /> },
          { path: "/stats", element: <StatsPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
      // Standalone pages (AuthShell layout, no bottom nav)
      {
        element: <AuthShell />,
        children: [
          { path: "/deck/:id/add", element: <CardFormPage /> },
          { path: "/deck/:id/edit/:cardId", element: <CardFormPage /> },
          { path: "/deck/:id/import", element: <CsvImportPage /> },
          { path: "/deck/:id/photo-import", element: <PhotoImportPage /> },
          { path: "/folder/:id/import", element: <FolderCsvImportPage /> },
          { path: "/study/:deckId", element: <StudyPage /> },
          { path: "/study/complete", element: <CompletePage /> },
        ],
      },
    ],
  },
])

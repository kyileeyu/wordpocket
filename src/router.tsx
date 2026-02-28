import { createBrowserRouter } from "react-router"
import AuthGuard from "@/components/AuthGuard"
import GuestGuard from "@/components/GuestGuard"
import AuthShell from "@/components/layouts/AuthShell"
import AppShell from "@/components/layouts/AppShell"
import WelcomePage from "@/pages/WelcomePage"
import LoginPage from "@/pages/LoginPage"
import SignupPage from "@/pages/SignupPage"
import VerifyPage from "@/pages/VerifyPage"
import HomePage from "@/pages/HomePage"
import FolderPage from "@/pages/FolderPage"
import DeckPage from "@/pages/DeckPage"
import CardFormPage from "@/pages/CardFormPage"
import CsvImportPage from "@/pages/CsvImportPage"
import StudyPage from "@/pages/StudyPage"
import CompletePage from "@/pages/CompletePage"
import StatsPage from "@/pages/StatsPage"
import SettingsPage from "@/pages/SettingsPage"

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
      // Standalone pages (own shell, still protected)
      { path: "/deck/:id/add", element: <CardFormPage /> },
      { path: "/deck/:id/edit/:cardId", element: <CardFormPage /> },
      { path: "/deck/:id/import", element: <CsvImportPage /> },
      { path: "/study/:deckId", element: <StudyPage /> },
      { path: "/study/complete", element: <CompletePage /> },
    ],
  },
])

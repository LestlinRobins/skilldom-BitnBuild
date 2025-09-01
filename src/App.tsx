import { createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import CollaborationHub from "./pages/CollaborationHub";
import MyCoursesPage from "./pages/MyCoursesPage";
import ProfilePage from "./pages/ProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import AppContent from "./components/AppContent";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "collaborate",
        element: <CollaborationHub />,
      },
      {
        path: "courses",
        element: <MyCoursesPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "user/:userId",
        element: <UserProfilePage />,
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <AppContent router={router} />
    </AuthProvider>
  );
}

export default App;

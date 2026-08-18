import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CreditProvider } from './context/CreditContext'

// Páginas de Autenticação
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

// Páginas de Usuário (Lojista/Vistoriador)
import DashboardPage from './pages/dashboard/DashboardPage'
import DiagnosticPage from './pages/diagnostic/DiagnosticPage'
import ReportPage from './pages/report/ReportPage'
import PlansPage from './pages/plans/PlansPage'

// Páginas de Lojista (B2B)
import ShopOwnerDashboard from './pages/shopowner/ShopOwnerDashboard'
import EmployeeManagement from './pages/shopowner/EmployeeManagement'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLoginPage from './pages/admin/AdminLoginPage'

// Validação pública via QR Code
import ValidatePublicPage from './pages/public/ValidatePublicPage'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <CreditProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<SignupPage />} />
            </Route>

            {/* Admin Login (portal separado) */}
            <Route path="/admin-login" element={<AdminLoginPage />} />

            {/* Admin Dashboard (protegido) */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* Validação Pública (sem autenticação) */}
            <Route path="/v/:reportId" element={<ValidatePublicPage />} />

            {/* Rotas Protegidas - Usuário Comum (Car Hunter/Revenda/Vistoriadora) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/painel" element={<DashboardPage />} />
              <Route path="/diagnostico" element={<DiagnosticPage />} />
              <Route path="/laudo/:reportId" element={<ReportPage />} />
              <Route path="/planos" element={<PlansPage />} />
            </Route>

            {/* Rotas Protegidas - Lojista/Admin de Loja */}
            <Route element={<ProtectedRoute requiredRole="lojista" />}>
              <Route path="/lojista" element={<ShopOwnerDashboard />} />
              <Route path="/lojista/funcionarios" element={<EmployeeManagement />} />
            </Route>


            {/* Fallback */}
            <Route path="/" element={<LoginPage />} />
            <Route path="*" element={<div className="flex items-center justify-center min-h-screen text-white">Página não encontrada</div>} />
          </Routes>
        </CreditProvider>
      </AuthProvider>
    </Router>
  )
}

export default App

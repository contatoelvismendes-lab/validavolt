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
import CheckoutPage from './pages/checkout/CheckoutPage'

// Páginas de Lojista (B2B)
import ShopOwnerDashboard from './pages/shopowner/ShopOwnerDashboard'
import EmployeeManagement from './pages/shopowner/EmployeeManagement'

// Admin
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPlans from './pages/admin/AdminPlans'
import AdminUsers from './pages/admin/AdminUsers'
import AdminTransactions from './pages/admin/AdminTransactions'
import AdminReports from './pages/admin/AdminReports'
import AdminSettings from './pages/admin/AdminSettings'
import AdminProfile from './pages/admin/AdminProfile'

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

            {/* Admin Dashboard (protegido com múltiplas páginas) */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/planos" element={<AdminPlans />} />
                <Route path="/admin/usuarios" element={<AdminUsers />} />
                <Route path="/admin/transacoes" element={<AdminTransactions />} />
                <Route path="/admin/laudos" element={<AdminReports />} />
                <Route path="/admin/configuracoes" element={<AdminSettings />} />
                <Route path="/admin/perfil" element={<AdminProfile />} />
              </Route>
            </Route>

            {/* Validação Pública (sem autenticação) */}
            <Route path="/v/:reportId" element={<ValidatePublicPage />} />

            {/* Checkout (público) */}
            <Route path="/checkout/:planoId" element={<CheckoutPage />} />

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

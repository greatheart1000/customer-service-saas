import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';

import { store } from './store';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/AdminLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer Pages (用户端)
import ChatPage from './pages/customer/ChatPage';
import HistoryPage from './pages/customer/HistoryPage';
import ProfilePage from './pages/customer/ProfilePage';

// Admin Pages (管理端)
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminBotsPage from './pages/admin/AdminBotsPage';
import AdminKnowledgePage from './pages/admin/AdminKnowledgePage';
import AdminConversationsPage from './pages/admin/AdminConversationsPage';

// Embedded Pages (嵌入式/租户端)
import TenantChatPage from './pages/embedded/TenantChatPage';

// Agent Pages (客服工作台)
import AgentLayout from './components/AgentLayout';
import AgentInboxPage from './pages/agent/AgentInboxPage';
import AgentHistoryPage from './pages/agent/AgentHistoryPage';
import AgentUsersPage from './pages/agent/AgentUsersPage';
import AgentStatsPage from './pages/agent/AgentStatsPage';
import AgentSettingsPage from './pages/agent/AgentSettingsPage';

// Legacy Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import BillingPage from './pages/billing/BillingPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 租户嵌入式聊天路由 (无需认证) */}
          <Route path="/tenant/:tenantUuid/chat" element={<TenantChatPage />} />

          {/* 客服工作台路由 (需要认证) */}
          <Route
            path="/agent"
            element={
              <PrivateRoute>
                <AgentLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/agent/inbox" replace />} />
            <Route path="inbox" element={<AgentInboxPage />} />
            <Route path="history" element={<AgentHistoryPage />} />
            <Route path="users" element={<AgentUsersPage />} />
            <Route path="stats" element={<AgentStatsPage />} />
            <Route path="settings" element={<AgentSettingsPage />} />
            <Route path="bots" element={<div>机器人管理 - 开发中</div>} />
          </Route>

          {/* 用户端路由 (根路径) */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <CustomerLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/chat" replace />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="billing" element={<BillingPage />} />
          </Route>

          {/* 管理端路由 (/admin 前缀) */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="bots" element={<AdminBotsPage />} />
            <Route path="knowledge" element={<AdminKnowledgePage />} />
            <Route path="conversations" element={<AdminConversationsPage />} />
            <Route path="subscriptions" element={<div>订阅管理 - 开发中</div>} />
            <Route path="settings" element={<div>系统设置 - 开发中</div>} />
          </Route>

          {/* 404 - Not Found */}
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

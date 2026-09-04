import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TapItProvider } from './store';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { BackendSyncInit } from './components/sync/BackendSyncInit';

// Layouts
import { RootLayout } from './layouts/RootLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { QRSharePage } from './pages/public/QRSharePage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { InviteRegistrationPage } from './pages/auth/InviteRegistrationPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// NFC & Profile Pages
import { NFCTapHandler } from './pages/nfc/NFCTapHandler';
import { UnclaimedCardPage } from './pages/nfc/UnclaimedCardPage';
import { DisabledCardPage } from './pages/nfc/DisabledCardPage';
import { PublicProfilePage } from './pages/profile/PublicProfilePage';

// User Dashboard Pages
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { MyProfilesPage } from './pages/dashboard/MyProfilesPage';
import { ProfileEditorPage } from './pages/dashboard/ProfileEditorPage';
import { MyLinksPage } from './pages/dashboard/MyLinksPage';
import { MyCardsPage } from './pages/dashboard/MyCardsPage';
import { QRCodeStudioPage } from './pages/dashboard/QRCodeStudioPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { AppearancePage } from './pages/dashboard/AppearancePage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

// Admin Suite Pages
import { AdminOverview } from './pages/admin/AdminOverview';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ProfileDirectoryPage } from './pages/admin/ProfileDirectoryPage';
import { CardInventoryPage } from './pages/admin/CardInventoryPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage';

export const App: React.FC = () => {
  return (
    <TapItProvider>
      <BackendSyncInit />
      <BrowserRouter>
        <Routes>
          {/* Public Marketing Routes */}
          <Route element={<RootLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/qr-share" element={<QRSharePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/invite/:token" element={<InviteRegistrationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* NFC Hardware Interceptor & Card Routes */}
          <Route path="/t/:token" element={<NFCTapHandler />} />
          <Route path="/card/unclaimed" element={<UnclaimedCardPage cardToken="NEW_TAP_77" />} />
          <Route path="/card/disabled" element={<DisabledCardPage cardToken="LOST_CARD_09" />} />

          {/* Public Profile Mobile-First View */}
          <Route path="/p/:profileSlug" element={<PublicProfilePage />} />
          <Route path="/u/:username" element={<PublicProfilePage />} />
          <Route path="/@:username" element={<PublicProfilePage />} />
          <Route path="/:profileSlug" element={<PublicProfilePage />} />
          <Route path="/:username/:profileSlug" element={<PublicProfilePage />} />

          {/* User Dashboard Routes (Protected: User or Admin) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'user']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="profiles" element={<MyProfilesPage />} />
            <Route path="profiles/edit/:id" element={<ProfileEditorPage />} />
            <Route path="links" element={<MyLinksPage />} />
            <Route path="cards" element={<MyCardsPage />} />
            <Route path="qr" element={<QRCodeStudioPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="appearance" element={<AppearancePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Administrator Suite Routes (Protected: Admin Only) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="profiles" element={<ProfileDirectoryPage />} />
            <Route path="cards" element={<CardInventoryPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="settings" element={<SystemSettingsPage />} />
          </Route>

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TapItProvider>
  );
};

export default App;

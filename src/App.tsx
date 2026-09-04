import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TapItProvider } from './store';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { BackendSyncInit } from './components/sync/BackendSyncInit';

// Layouts
import { RootLayout } from './layouts/RootLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages (Code-split)
const LandingPage = lazy(() => import('./pages/public/LandingPage').then(m => ({ default: m.LandingPage })));
const FeaturesPage = lazy(() => import('./pages/public/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const HowItWorksPage = lazy(() => import('./pages/public/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const QRSharePage = lazy(() => import('./pages/public/QRSharePage').then(m => ({ default: m.QRSharePage })));

// Auth Pages (Code-split)
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const InviteRegistrationPage = lazy(() => import('./pages/auth/InviteRegistrationPage').then(m => ({ default: m.InviteRegistrationPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));

// NFC & Profile Pages (Code-split)
const NFCTapHandler = lazy(() => import('./pages/nfc/NFCTapHandler').then(m => ({ default: m.NFCTapHandler })));
const UnclaimedCardPage = lazy(() => import('./pages/nfc/UnclaimedCardPage').then(m => ({ default: m.UnclaimedCardPage })));
const DisabledCardPage = lazy(() => import('./pages/nfc/DisabledCardPage').then(m => ({ default: m.DisabledCardPage })));
const PublicProfilePage = lazy(() => import('./pages/profile/PublicProfilePage').then(m => ({ default: m.PublicProfilePage })));

// User Dashboard Pages (Code-split)
const DashboardOverview = lazy(() => import('./pages/dashboard/DashboardOverview').then(m => ({ default: m.DashboardOverview })));
const MyProfilesPage = lazy(() => import('./pages/dashboard/MyProfilesPage').then(m => ({ default: m.MyProfilesPage })));
const ProfileEditorPage = lazy(() => import('./pages/dashboard/ProfileEditorPage').then(m => ({ default: m.ProfileEditorPage })));
const MyLinksPage = lazy(() => import('./pages/dashboard/MyLinksPage').then(m => ({ default: m.MyLinksPage })));
const MyCardsPage = lazy(() => import('./pages/dashboard/MyCardsPage').then(m => ({ default: m.MyCardsPage })));
const QRCodeStudioPage = lazy(() => import('./pages/dashboard/QRCodeStudioPage').then(m => ({ default: m.QRCodeStudioPage })));
const AnalyticsPage = lazy(() => import('./pages/dashboard/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const AppearancePage = lazy(() => import('./pages/dashboard/AppearancePage').then(m => ({ default: m.AppearancePage })));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Admin Suite Pages (Code-split)
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview').then(m => ({ default: m.AdminOverview })));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage').then(m => ({ default: m.UserManagementPage })));
const ProfileDirectoryPage = lazy(() => import('./pages/admin/ProfileDirectoryPage').then(m => ({ default: m.ProfileDirectoryPage })));
const CardInventoryPage = lazy(() => import('./pages/admin/CardInventoryPage').then(m => ({ default: m.CardInventoryPage })));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));
const SystemSettingsPage = lazy(() => import('./pages/admin/SystemSettingsPage').then(m => ({ default: m.SystemSettingsPage })));

// Fallback Loading Screen
const RouteLoader = () => (
  <div className="min-h-screen bg-[#070a13] flex flex-col items-center justify-center p-4">
    <div className="relative">
      <div className="w-12 h-12 rounded-2xl border-2 border-cyan-400 border-t-transparent animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
      </div>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <TapItProvider>
      <BackendSyncInit />
      <BrowserRouter>
        <Suspense fallback={<RouteLoader />}>
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
              <Route path="/i/:token" element={<InviteRegistrationPage />} />
              <Route path="/inv/:token" element={<InviteRegistrationPage />} />
              <Route path="/INV-:token" element={<InviteRegistrationPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* NFC Hardware Interceptor & Card Routes */}
            <Route path="/t/:token" element={<NFCTapHandler />} />
            <Route path="/tap/:token" element={<NFCTapHandler />} />
            <Route path="/TAP-:token" element={<NFCTapHandler />} />
            <Route path="/card/unclaimed" element={<UnclaimedCardPage cardToken="NEW_TAP_77" />} />
            <Route path="/card/disabled" element={<DisabledCardPage cardToken="LOST_CARD_09" />} />

            {/* Public Profile Mobile-First View */}
            <Route path="/p/:profileSlug" element={<PublicProfilePage />} />
            <Route path="/u/:username" element={<PublicProfilePage />} />
            <Route path="/@:username" element={<PublicProfilePage />} />
            <Route path="/:profileSlug" element={<PublicProfilePage />} />
            <Route path="/:username/:profileSlug" element={<PublicProfilePage />} />

            {/* User Dashboard Routes (Protected: User Only) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['user']}>
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
        </Suspense>
      </BrowserRouter>
    </TapItProvider>
  );
};

export default App;

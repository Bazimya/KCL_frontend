import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BottomNav from './components/BottomNav'
import AdminFab from './components/AdminFab'
import DineInPromptModal from './components/DineInPromptModal'
import ScrollToTop from './components/ScrollToTop'
import useTrackVisit from './hooks/useTrackVisit'
import Loader from './components/Loader'

import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import MenuCategory from './pages/MenuCategory'
import CourseHub from './pages/CourseHub'
import CoffeeTherapy from './pages/CoffeeTherapy'
import CoffeeExperience from './pages/CoffeeExperience'
import TrainingHub from './pages/TrainingHub'
import TrainingCourseDetail from './pages/TrainingCourseDetail'
import TrainingApply from './pages/TrainingApply'
import History from './pages/History'
import TableScan from './pages/TableScan'
import BookTable from './pages/BookTable'
import MissionVision from './pages/MissionVision'
import Contact from './pages/Contact'
import About from './pages/About'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import TrackOrder from './pages/TrackOrder'
import Login from './pages/Login'
import Wishlist from './pages/Wishlist'
import NotFound from './pages/NotFound'

// Admin pages (and recharts, which only they use) are split into their own
// chunks so customers on mobile data never download the staff panel.
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/admin/Products'))
const AdminDrinks = lazy(() => import('./pages/admin/Drinks'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))
const AdminTraining = lazy(() => import('./pages/admin/Training'))
const AdminHistory = lazy(() => import('./pages/admin/History'))
const AdminReports = lazy(() => import('./pages/admin/Reports'))
const AdminTables = lazy(() => import('./pages/admin/Tables'))

import { RequireStaff } from './components/ProtectedRoute'

// Every customer-facing page gets the same shell: top bar, the page itself,
// footer, a persistent mobile-style bottom tab bar (Menu/Coffee/Course/
// Machine/More), and the small floating Staff/Admin entry point in the
// bottom-right corner. pb-20 keeps content clear of the fixed bottom bar.
function StorefrontLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <main className="flex-1 pb-20 lg:pb-0 bg-gray-200">{children}</main>
      {/* <Footer /> */}
      <div className="-mt-24">
        <Footer />
      </div>
      <BottomNav />
      <AdminFab />
      <DineInPromptModal />
    </div>
  )
}

export default function App() {
  useTrackVisit()

  return (
    <>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1d4ed8',
            color: '#ffffff',
            border: '1px solid #1e40af',
            borderRadius: '14px',
            padding: '12px 16px',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: '#ffffff', secondary: '#1d4ed8' } },
          error: { style: { background: '#1d4ed8', border: '1px solid #1e40af' }, iconTheme: { primary: '#ffffff', secondary: '#1d4ed8' } },
        }}
      />

      <Suspense fallback={<Loader />}>
      <Routes>
        {/* Storefront - fully guest, no registration needed anywhere here */}
        <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
        <Route path="/coffee" element={<StorefrontLayout><MenuCategory type="coffee" /></StorefrontLayout>} />
        <Route path="/food" element={<StorefrontLayout><MenuCategory type="food" /></StorefrontLayout>} />
        <Route path="/shop" element={<StorefrontLayout><Shop /></StorefrontLayout>} />
        <Route path="/product/:hash" element={<StorefrontLayout><ProductDetail /></StorefrontLayout>} />

        {/* Course section: Coffee Therapy, Coffee Experience, Coffee Training */}
        <Route path="/course" element={<StorefrontLayout><CourseHub /></StorefrontLayout>} />
        <Route path="/course/therapy" element={<StorefrontLayout><CoffeeTherapy /></StorefrontLayout>} />
        <Route path="/course/experience" element={<StorefrontLayout><CoffeeExperience /></StorefrontLayout>} />
        <Route path="/course/training" element={<StorefrontLayout><TrainingHub /></StorefrontLayout>} />
        <Route path="/course/training/apply" element={<StorefrontLayout><TrainingApply /></StorefrontLayout>} />
        <Route path="/course/training/:courseType" element={<StorefrontLayout><TrainingCourseDetail /></StorefrontLayout>} />

        <Route path="/history" element={<StorefrontLayout><History /></StorefrontLayout>} />

        {/* QR table ordering + reservations */}
        <Route path="/t/:qrToken" element={<StorefrontLayout><TableScan /></StorefrontLayout>} />
        <Route path="/book-table" element={<StorefrontLayout><BookTable /></StorefrontLayout>} />

        <Route path="/mission-vision" element={<StorefrontLayout><MissionVision /></StorefrontLayout>} />
        <Route path="/contact" element={<StorefrontLayout><Contact /></StorefrontLayout>} />
        <Route path="/about" element={<StorefrontLayout><About /></StorefrontLayout>} />
        <Route path="/cart" element={<StorefrontLayout><Cart /></StorefrontLayout>} />
        <Route path="/checkout" element={<StorefrontLayout><Checkout /></StorefrontLayout>} />
        <Route path="/track" element={<StorefrontLayout><TrackOrder /></StorefrontLayout>} />
        <Route path="/wishlist" element={<StorefrontLayout><Wishlist /></StorefrontLayout>} />

        {/* Staff / Admin only */}
        <Route path="/login" element={<StorefrontLayout><Login /></StorefrontLayout>} />

        {/* Admin / Manager panel */}
        <Route path="/admin" element={<RequireStaff><AdminLayout /></RequireStaff>}>
          <Route index element={<RequireStaff permission="viewDashboard"><Dashboard /></RequireStaff>} />
          <Route path="products" element={<RequireStaff permission="manageProducts"><AdminProducts /></RequireStaff>} />
          <Route path="drinks" element={<RequireStaff permission="manageDrinks"><AdminDrinks /></RequireStaff>} />
          <Route path="orders" element={<RequireStaff permission="manageOrders"><AdminOrders /></RequireStaff>} />
          <Route path="users" element={<RequireStaff permission="manageUsers"><AdminUsers /></RequireStaff>} />
          <Route path="training" element={<RequireStaff permission="manageTrainings"><AdminTraining /></RequireStaff>} />
          <Route path="history" element={<RequireStaff permission="manageHistory"><AdminHistory /></RequireStaff>} />
          <Route path="reports" element={<RequireStaff permission="manageReports"><AdminReports /></RequireStaff>} />
          <Route path="tables" element={<RequireStaff permission="manageTables"><AdminTables /></RequireStaff>} />
          <Route path="settings" element={<RequireStaff permission="manageSettings"><AdminSettings /></RequireStaff>} />
        </Route>

        <Route path="*" element={<StorefrontLayout><NotFound /></StorefrontLayout>} />
      </Routes>
      </Suspense>
    </>
  )
}

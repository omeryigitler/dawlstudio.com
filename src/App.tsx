import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { CartDrawer } from "./components/CartDrawer";

const Home = lazy(() => import("./pages/Home").then((module) => ({ default: module.Home })));
const Collections = lazy(() => import("./pages/Collections").then((module) => ({ default: module.Collections })));
const ProductDetail = lazy(() => import("./pages/ProductDetail").then((module) => ({ default: module.ProductDetail })));
const TheStudio = lazy(() => import("./pages/TheStudio").then((module) => ({ default: module.TheStudio })));
const ScentLibrary = lazy(() => import("./pages/ScentLibrary").then((module) => ({ default: module.ScentLibrary })));
const Gifting = lazy(() => import("./pages/Gifting").then((module) => ({ default: module.Gifting })));
const Contact = lazy(() => import("./pages/Contact").then((module) => ({ default: module.Contact })));
const Support = lazy(() => import("./pages/Support").then((module) => ({ default: module.Support })));
const Legal = lazy(() => import("./pages/Legal").then((module) => ({ default: module.Legal })));
const Stockists = lazy(() => import("./pages/Stockists").then((module) => ({ default: module.Stockists })));
const Checkout = lazy(() => import("./pages/Checkout").then((module) => ({ default: module.Checkout })));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess").then((module) => ({ default: module.CheckoutSuccess })));
const Login = lazy(() => import("./pages/Login").then((module) => ({ default: module.Login })));
const Register = lazy(() => import("./pages/Register").then((module) => ({ default: module.Register })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then((module) => ({ default: module.AdminDashboard })));
const OrderTracking = lazy(() => import("./pages/OrderTracking").then((module) => ({ default: module.OrderTracking })));
const MyOrders = lazy(() => import("./pages/MyOrders").then((module) => ({ default: module.MyOrders })));

function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="h-8 w-8 border border-gold/20 border-t-gold rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <CartDrawer />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="collections" element={<Collections />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="studio" element={<TheStudio />} />
                  <Route path="scents" element={<ScentLibrary />} />
                  <Route path="gifting" element={<Gifting />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="support" element={<Support />} />
                  <Route path="legal" element={<Legal />} />
                  <Route path="stockists" element={<Stockists />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="checkout/success" element={<CheckoutSuccess />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="track" element={<OrderTracking />} />
                  <Route path="track/:id" element={<OrderTracking />} />
                  <Route path="orders" element={<MyOrders />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

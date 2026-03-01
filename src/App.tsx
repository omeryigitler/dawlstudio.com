import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Collections } from "./pages/Collections";
import { ProductDetail } from "./pages/ProductDetail";
import { TheStudio } from "./pages/TheStudio";
import { ScentLibrary } from "./pages/ScentLibrary";
import { Gifting } from "./pages/Gifting";
import { Contact } from "./pages/Contact";
import { Support } from "./pages/Support";
import { Legal } from "./pages/Legal";
import { Stockists } from "./pages/Stockists";
import { Checkout } from "./pages/Checkout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { CartProvider } from "./context/CartContext";
import { CartDrawer } from "./components/CartDrawer";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <CartDrawer />
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
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

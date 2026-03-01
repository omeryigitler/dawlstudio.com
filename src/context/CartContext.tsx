import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "../constants/products";

export interface CartItem {
  id: string; // unique id for the cart item (product id + gift card details)
  product: Product;
  quantity: number;
  giftCard?: {
    to: string;
    from: string;
    message: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity: number, giftCard?: CartItem["giftCard"]) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, quantity: number, giftCard?: CartItem["giftCard"]) => {
    setCartItems((prev) => {
      // Create a unique ID based on product and gift card to allow multiple of same product with different gift cards
      const giftCardKey = giftCard ? `${giftCard.to}-${giftCard.from}-${giftCard.message}` : "no-gift";
      const cartItemId = `${product.id}-${giftCardKey}`;

      const existingItemIndex = prev.findIndex((item) => item.id === cartItemId);

      if (existingItemIndex >= 0) {
        const newItems = [...prev];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }

      return [...prev, { id: cartItemId, product, quantity, giftCard }];
    });
    openCart();
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => {
    const priceNum = parseFloat(item.product.price.replace("€", ""));
    return total + priceNum * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

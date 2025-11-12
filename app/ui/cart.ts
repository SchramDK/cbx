

export type CartItem = {
  id: string;
  title: string;
  thumb: string;
  price?: number;
};

const STORAGE_KEY = 'cbx_demo_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart:changed'));
}

export function addItem(item: CartItem) {
  const cart = getCart();
  if (!cart.find((it) => it.id === item.id)) {
    cart.push(item);
    saveCart(cart);
  }
}

export function removeItem(id: string) {
  const cart = getCart().filter((it) => it.id !== id);
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}

export function getCount(): number {
  return getCart().length;
}

// Listen to cross-tab updates
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      window.dispatchEvent(new CustomEvent('cart:changed'));
    }
  });
}
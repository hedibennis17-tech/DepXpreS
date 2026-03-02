export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  format: string;
  price: number;
  stock: 'in_stock' | 'low_stock' | 'out_of_stock';
  tags: ('popular' | 'promo' | 'age_required')[];
  imageId: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  status: 'pending' | 'preparing' | 'en_route' | 'delivered' | 'cancelled';
  items: CartItem[];
  total: number;
  createdAt: string;
  driver?: {
    name: string;
    avatarUrl: string;
  };
};

export type Driver = {
    id: string;
    name: string;
    status: 'En ligne' | 'Hors ligne' | 'En livraison';
    earnings: number;
    rating: number;
    deliveries: number;
    avatarUrl?: string;
};

export type SystemAlert = {
    id: string;
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    createdAt: string;
    entityType: string;
    entityId: string;
};

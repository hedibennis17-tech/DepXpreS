import type { Category, Product, Order, Driver, SystemAlert } from '@/lib/types';
import {
  Beer,
  Wine,
  GlassWater,
  Cigarette,
  Flame,
  Cookie,
  Coffee,
  Sandwich,
  Milk,
  Snowflake,
  Home,
  Bath,
  Ticket,
  Gift,
  Zap,
} from 'lucide-react';

export const CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Bière & alcool', slug: 'biere-alcool', icon: Beer },
  { id: 'cat2', name: 'Boissons', slug: 'boissons', icon: GlassWater },
  { id: 'cat3', name: 'Tabagisme', slug: 'tabagisme', icon: Cigarette },
  { id: 'cat4', name: 'Vapotage', slug: 'vapotage', icon: Flame },
  { id: 'cat5', name: 'Craquelins & chips', slug: 'chips', icon: Cookie },
  { id: 'cat6', name: 'Chocolat & bonbons', slug: 'chocolat', icon: Gift },
  { id: 'cat7', name: 'Café & boissons glacées', slug: 'cafe', icon: Coffee },
  { id: 'cat8', name: 'Pain & lait', slug: 'pain-lait', icon: Sandwich },
  { id: 'cat9', name: 'Produits laitiers', slug: 'produits-laitiers', icon: Milk },
  { id: 'cat10', name: 'Congelé', slug: 'congele', icon: Snowflake },
  { id: 'cat11', name: 'Articles ménagers', slug: 'menagers', icon: Home },
  { id: 'cat12', name: 'Hygiène & toilette', slug: 'hygiene', icon: Bath },
  { id: 'cat13', name: 'Lotto / billets', slug: 'lotto', icon: Ticket },
  { id: 'cat14', name: 'Dépannage express', slug: 'express', icon: Zap },
];

export const PRODUCTS: Product[] = [
  { id: 'prod1', name: 'Heineken 6 pack', categoryId: 'cat1', format: '6 x 330ml', price: 14.99, stock: 'in_stock', tags: ['popular', 'age_required'], imageId: 'heineken-6-pack' },
  { id: 'prod2', name: 'Corona 6 pack', categoryId: 'cat1', format: '6 x 355ml', price: 15.49, stock: 'in_stock', tags: ['age_required'], imageId: 'corona-6-pack' },
  { id: 'prod3', name: 'Vin rouge 750ml', categoryId: 'cat1', format: '750ml', price: 18.99, stock: 'low_stock', tags: ['age_required'], imageId: 'red-wine-750ml' },
  { id: 'prod4', name: 'Vodka mini format', categoryId: 'cat1', format: '50ml', price: 5.99, stock: 'in_stock', tags: ['age_required'], imageId: 'vodka-mini' },
  { id: 'prod5', name: 'Doritos', categoryId: 'cat5', format: '255g', price: 4.29, stock: 'in_stock', tags: ['popular', 'promo'], imageId: 'doritos-chips' },
  { id: 'prod6', name: 'Lays', categoryId: 'cat5', format: '235g', price: 3.99, stock: 'in_stock', tags: [], imageId: 'lays-chips' },
  { id: 'prod7', name: 'Coca-Cola', categoryId: 'cat2', format: '355ml', price: 1.79, stock: 'in_stock', tags: ['popular'], imageId: 'coca-cola-can' },
  { id: 'prod8', name: 'Red Bull', categoryId: 'cat2', format: '250ml', price: 3.49, stock: 'in_stock', tags: [], imageId: 'red-bull-can' },
  { id: 'prod9', name: 'Papier toilette', categoryId: 'cat11', format: '6 rouleaux', price: 8.99, stock: 'low_stock', tags: [], imageId: 'toilet-paper' },
  { id: 'prod10', name: 'Dentifrice', categoryId: 'cat12', format: '90ml', price: 3.29, stock: 'in_stock', tags: [], imageId: 'toothpaste' },
  { id: 'prod11', name: 'Vape jetable', categoryId: 'cat4', format: '1 unité', price: 12.99, stock: 'in_stock', tags: ['age_required'], imageId: 'vape-disposable' },
  { id: 'prod12', name: 'Paquet de cigarettes', categoryId: 'cat3', format: '20 unités', price: 16.50, stock: 'in_stock', tags: ['age_required'], imageId: 'cigarettes-pack' },
  { id: 'prod13', name: 'Billet de lotto', categoryId: 'cat13', format: '1 billet', price: 5.00, stock: 'in_stock', tags: [], imageId: 'lotto-ticket' },
  { id: 'prod14', name: 'Pain tranché', categoryId: 'cat8', format: '675g', price: 3.99, stock: 'in_stock', tags: [], imageId: 'bread' },
  { id: 'prod15', name: 'Lait 2%', categoryId: 'cat8', format: '2L', price: 5.49, stock: 'in_stock', tags: [], imageId: 'milk' },
  { id: 'prod16', name: 'Barre de chocolat', categoryId: 'cat6', format: '45g', price: 1.99, stock: 'in_stock', tags: ['popular'], imageId: 'chocolate-bar' }
];

export const MOCK_ORDERS: Order[] = [
    {
        id: 'FDC-12345',
        status: 'en_route',
        items: [
            { product: PRODUCTS[4], quantity: 2 },
            { product: PRODUCTS[6], quantity: 4 },
        ],
        total: 25.74,
        createdAt: '2024-07-28T14:30:00Z',
        driver: {
            name: 'Alex',
            avatarUrl: 'https://picsum.photos/seed/102/200/200',
        },
    },
    {
        id: 'FDC-12344',
        status: 'delivered',
        items: [
            { product: PRODUCTS[0], quantity: 1 },
        ],
        total: 23.98,
        createdAt: '2024-07-28T11:15:00Z',
        driver: {
            name: 'Sam',
            avatarUrl: 'https://picsum.photos/seed/103/200/200',
        },
    }
];

export const DRIVERS: Driver[] = [
  {
    id: "driver-1",
    name: "Marc-André",
    status: "En ligne",
    earnings: 125.50,
    rating: 4.9,
    deliveries: 12,
    avatarUrl: 'https://picsum.photos/seed/driver-marc/200/200'
  },
  {
    id: "driver-2",
    name: "Sophie",
    status: "Hors ligne",
    earnings: 88.00,
    rating: 4.7,
    deliveries: 8,
     avatarUrl: 'https://picsum.photos/seed/driver-sophie/200/200'
  },
  {
    id: "driver-3",
    name: "Jean-Philippe",
    status: "En livraison",
    earnings: 210.75,
    rating: 4.9,
    deliveries: 21,
     avatarUrl: 'https://picsum.photos/seed/driver-jp/200/200'
  },
   {
    id: "driver-4",
    name: "Amina",
    status: "En ligne",
    earnings: 95.00,
    rating: 4.8,
    deliveries: 10,
    avatarUrl: 'https://picsum.photos/seed/driver-amina/200/200'
  },
];


export const MOCK_ALERTS: SystemAlert[] = [
    {
        id: 'alert-1',
        title: 'Document chauffeur expiré',
        description: 'Le permis de conduire de Jean-Philippe a expiré hier.',
        severity: 'high',
        createdAt: '2024-07-29T09:00:00Z',
        entityType: 'driver',
        entityId: 'driver-3'
    },
    {
        id: 'alert-2',
        title: 'Dépanneur hors ligne',
        description: 'Le dépanneur "Chomedey Express" est hors ligne depuis 30 minutes.',
        severity: 'medium',
        createdAt: '2024-07-29T11:30:00Z',
        entityType: 'store',
        entityId: 'store_chomedey_1'
    },
    {
        id: 'alert-3',
        title: 'Paiement Stripe échoué',
        description: 'Paiement échoué pour la commande FDC-12344.',
        severity: 'high',
        createdAt: '2024-07-29T12:05:00Z',
        entityType: 'order',
        entityId: 'FDC-12344'
    },
     {
        id: 'alert-4',
        title: 'Basse disponibilité chauffeurs',
        description: 'Seulement 2 chauffeurs en ligne dans la zone Centre-Ville.',
        severity: 'low',
        createdAt: '2024-07-29T14:00:00Z',
        entityType: 'zone',
        entityId: 'zone-centre-ville'
    }
];
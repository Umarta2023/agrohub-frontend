
// types.ts
export interface Shop {
  id: number; // <--- ИЗМЕНЯЕМ ЗДЕСЬ
  name: string;
  description: string;
  logoUrl: string;
  rating: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  imageUrl: string;
  shopId: number;
  isNew: boolean;
  quantity: number;
}

export interface Ad {
  id:number;
  title: string;
  category: string;
  price: string;
  volume: string;
  location: string;
  imageUrl: string;
}

export interface ServiceProvider {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
  rating: number;
}

export interface Service {
  id: number;
  name:string;
  providerId: number;
  category: string;
  description: string;
  imageUrl: string;
  price?: number;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    imageUrl?: string;
}

export interface TelegramPost {
  id: string;
  channelName: string;
  channelLink: string;
  text: string;
  imageUrl?: string;
  date: string; // ISO string
}

export interface CommunityChannel {
  id: string;
  name: string;
  description: string;
  platform: 'telegram';
  iconName: keyof typeof import('./constants').ICONS;
  link: string;
  region: 'Татарстан' | 'Пермский край' | 'Чувашия' | 'Федеральные';
}

export interface Field {
  id: number;
  name: string;
  area: number; // in hectares
  currentCrop: string;
  imageUrl: string; // for map placeholder
  polygon?: [number, number][]; // Array of [longitude, latitude]
}

export interface FieldOperation {
  id: number;
  fieldId: number;
  type: string;
  date: string;
  notes: string;
  cost?: number;
  linkedPurchase?: {
    productId: string;
    productName: string;
    quantity: number;
  };
  linkedService?: {
    serviceId: string;
    serviceName: string;
  };
}

export interface CropHistory {
  id: number;
  fieldId: string;
  year: number;
  crop: string;
}

export interface ServiceRequestData {
  id: string;
  serviceId: number;
  providerId: number;
  userName: string;
  userPhone: string;
  notes: string;
  date: string;
  status: 'Открыта' | 'В работе' | 'Выполнена' | 'Отклонена';
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface PurchasedItem {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
  shopId: number; // <-- ИСПРАВЛЕНО
  quantity: number;
}

export interface Purchase {
  id: number;
  date: string; // ISO string
  totalAmount: number;
  items: PurchasedItem[];
}

export interface AgroNotification {
  id: number;
  type: 'info' | 'warning' | 'success' | 'task';
  title: string;
  message: string;
  date: string; // ISO string
  read: boolean;
  link?: string;
}

export interface NewsAPIArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}


// --- Payloads ---
export interface ShopUpdatePayload {
  name?: string;
  description?: string;
  logoUrl?: string;
}

export interface ServiceProviderUpdatePayload {
  name?: string;
  description?: string;
  logoUrl?: string;
}

export interface FieldOperationPayload {
  fieldId: number;
  type: string;
  date: string;
  notes: string;
  cost?: number;
  linkedPurchase?: {
    productId: string;
    productName: string;
    quantity: number;
  };
  linkedService?: {
    serviceId: string;
    serviceName: string;
  };
}

export interface FieldUpdatePayload {
  name?: string;
  area?: number;
  currentCrop?: string;
  polygon?: [number, number][];
}

export interface ServiceRequestPayload {
  serviceId: number;
  providerId: number;
  userName: string;
  userPhone: string;
  notes: string;
}
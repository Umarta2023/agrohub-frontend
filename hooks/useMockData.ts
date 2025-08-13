
import { useState, useEffect, useCallback } from 'react';
import type { 
    Product, 
    Ad, 
    Service, 
    Shop, 
    ServiceProvider, 
    CommunityChannel, 
    Field, 
    FieldOperation, 
    CropHistory, 
    FieldUpdatePayload, 
    ShopUpdatePayload, 
    ServiceProviderUpdatePayload, 
    FieldOperationPayload,
    ServiceRequestData,
    ServiceRequestPayload,
    Purchase,
    PurchasedItem,
    AgroNotification,
    TelegramPost
} from '../types';

// Raw Data
const initialShops: Shop[] = [
  { id: 'shop1', name: 'АгроТехСнаб', description: 'Надежный поставщик запчастей для отечественной и импортной сельхозтехники. Работаем с 2005 года.', logoUrl: 'https://picsum.photos/seed/shop1logo/200/200', rating: 4.8 },
  { id: 'shop2', name: 'Мир Техники', description: 'Официальный дилер ведущих мировых брендов. Новая и б/у техника в наличии и под заказ.', logoUrl: 'https://picsum.photos/seed/shop2logo/200/200', rating: 4.9 },
  { id: 'shop3', name: 'АгроХим', description: 'Все для защиты и питания ваших растений. Сертифицированные удобрения и СЗР.', logoUrl: 'https://picsum.photos/seed/shop3logo/200/200', rating: 4.7 },
  { id: 'shop4', name: 'Частник Иван', description: 'Продаю запчасти со своего склада. Выгодные цены.', logoUrl: 'https://picsum.photos/seed/shop4logo/200/200', rating: 4.5 },
];

const initialProducts: Product[] = [
  { id: '1', name: 'Трактор МТЗ-82', category: 'Сельхозтехника', price: '1 500 000 ₽', imageUrl: 'https://picsum.photos/seed/tractor1/400/300', shopId: 'shop1', isNew: false, quantity: 1 },
  { id: '2', name: 'Комбайн John Deere S760', category: 'Сельхозтехника', price: '25 000 000 ₽', imageUrl: 'https://picsum.photos/seed/harvester2/400/300', shopId: 'shop2', isNew: true, quantity: 2 },
  { id: '3', name: 'Масло моторное G-Profi', category: 'Запчасти', price: '5 500 ₽', imageUrl: 'https://picsum.photos/seed/oil3/400/300', shopId: 'shop4', isNew: true, quantity: 50 },
  { id: '4', name: 'Семена подсолнечника "Пионер"', category: 'СЗР и Удобрения', price: '12 000 ₽/мешок', imageUrl: 'https://picsum.photos/seed/seeds4/400/300', shopId: 'shop3', isNew: true, quantity: 120 },
  { id: '5', name: 'Шина для трактора', category: 'Запчасти', price: '25 000 ₽', imageUrl: 'https://picsum.photos/seed/tire5/400/300', shopId: 'shop1', isNew: false, quantity: 15 },
  { id: '6', name: 'Система полива "AquaField"', category: 'Оборудование', price: '150 000 ₽', imageUrl: 'https://picsum.photos/seed/irrigation6/400/300', shopId: 'shop2', isNew: true, quantity: 5 },
];

const initialAds: Ad[] = [
    { id: 'ad1', title: 'Пшеница 3 класс', category: 'Зерновые', price: '13 000 ₽/т', volume: '100 тонн', location: 'Краснодарский край', imageUrl: 'https://picsum.photos/seed/wheat1/400/300' },
    { id: 'ad2', title: 'Картофель "Гала"', category: 'Овощи', price: '25 ₽/кг', volume: '20 тонн', location: 'Брянская область', imageUrl: 'https://picsum.photos/seed/potato2/400/300' },
    { id: 'ad3', title: 'Молоко коровье', category: 'Молочная продукция', price: '45 ₽/л', volume: '500 литров/день', location: 'Московская область', imageUrl: 'https://picsum.photos/seed/milk3/400/300' },
    { id: 'ad4', title: 'Подсолнечник', category: 'Масличные', price: '28 000 ₽/т', volume: '50 тонн', location: 'Ростовская область', imageUrl: 'https://picsum.photos/seed/sunflower4/400/300' },
];

const initialServiceProviders: ServiceProvider[] = [
    { id: 'sp1', name: 'Сервис-Юг', description: 'Выездная бригада. Гарантия. Быстро и качественно.', logoUrl: 'https://picsum.photos/seed/sp1logo/200/200', rating: 4.9 },
    { id: 'sp2', name: 'АгроКонсалт', description: 'Полное сопровождение вашего хозяйства от посева до уборки.', logoUrl: 'https://picsum.photos/seed/sp2logo/200/200', rating: 5.0 },
    { id: 'sp3', name: 'ТрансАгро', description: 'Собственный парк зерновозов. Работаем по всему ЮФО.', logoUrl: 'https://picsum.photos/seed/sp3logo/200/200', rating: 4.7 },
    { id: 'sp4', name: 'AeroDrones', description: 'Внесение СЗР с помощью агродронов. Экономия до 30%.', logoUrl: 'https://picsum.photos/seed/sp4logo/200/200', rating: 4.8 },
];

const initialServices: Service[] = [
    { id: 'srv1', name: 'Ремонт тракторов МТЗ', providerId: 'sp1', category: 'Ремонт техники', description: 'Ремонтируем двигатели, коробки передач, гидравлику. Оригинальные запчасти.', imageUrl: 'https://picsum.photos/seed/repair1/400/300' },
    { id: 'srv2', name: 'Агрономическое сопровождение', providerId: 'sp2', category: 'Агро-консультации', description: 'Составление технологических карт, анализ почвы, подбор СЗР.', imageUrl: 'https://picsum.photos/seed/agronom2/400/300' },
    { id: 'srv3', name: 'Перевозка зерна', providerId: 'sp3', category: 'Транспорт', description: 'Доставка вашего урожая на элеваторы и перерабатывающие предприятия.', imageUrl: 'https://picsum.photos/seed/transport3/400/300' },
    { id: 'srv4', name: 'Обработка полей дронами', providerId: 'sp4', category: 'Обработка полей', description: 'Быстрое и точное внесение средств защиты растений.', imageUrl: 'https://picsum.photos/seed/drones4/400/300' },
    { id: 'srv5', name: 'Капитальный ремонт двигателей', providerId: 'sp1', category: 'Ремонт техники', description: 'Полная переборка двигателей Cummins, ЯМЗ, ММЗ.', imageUrl: 'https://picsum.photos/seed/engine-repair/400/300' },
];

const initialCommunityChannels: CommunityChannel[] = [
    { id: 'tc_rb_1', name: 'МСХ Республики Башкортостан', description: 'Главные новости АПК региона', platform: 'telegram', iconName: 'telegram', link: 'https://t.me/mcx_rb', region: 'Татарстан' },
    { id: 'tc_tatar_1', name: 'Новости АПК Татарстана', description: 'Обсуждаем местные проблемы и успехи', platform: 'telegram', iconName: 'telegram', link: 'https://t.me/mcx_rt', region: 'Татарстан' },
    { id: 'tc_perm_1', name: 'Пермский Аграрий', description: 'Общение фермеров Пермского края', platform: 'telegram', iconName: 'telegram', link: 'https://t.me/agropermkrai', region: 'Пермский край' },
    { id: 'tc_chuv_1', name: 'Агро-Чувашия', description: 'Цены, техника и технологии в Чувашии', platform: 'telegram', iconName: 'telegram', link: 'https://t.me/mcx_cr', region: 'Чувашия' },
    { id: 'tg1', name: 'АгроХаб | Федеральный Канал', description: 'Новости приложения и важные обновления.', platform: 'telegram', iconName: 'telegram', link: 'https://t.me/agronomy_drones', region: 'Федеральные' },
    { id: 'tg2', name: 'Рынок Зерна РФ', description: 'Актуальные цены и аналитика по РФ.', platform: 'telegram', iconName: 'telegram', link: 'https://t.me/pro_kombikorm', region: 'Федеральные' },
];

const SATELLITE_IMAGE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/9/188/321';

const initialFields: Field[] = [
    { id: 'field1', name: 'Поле у лесополосы', area: 120, currentCrop: 'Озимая пшеница', imageUrl: SATELLITE_IMAGE_URL },
    { id: 'field2', name: 'Дальнее поле', area: 85, currentCrop: 'Подсолнечник', imageUrl: SATELLITE_IMAGE_URL },
    { id: 'field3', name: 'Паровое поле', area: 150, currentCrop: 'Пар', imageUrl: SATELLITE_IMAGE_URL },
];

const initialFieldOperations: FieldOperation[] = [
    { id: 'op1', fieldId: 'field1', type: 'Вспашка', date: '2024-08-15', notes: 'Глубина 25 см.', cost: 25000 },
    { id: 'op2', fieldId: 'field1', type: 'Посев', date: '2024-09-20', notes: 'Норма высева 220 кг/га.', cost: 310000 },
    { id: 'op3', fieldId: 'field2', type: 'Дискование', date: '2024-04-10', notes: 'В два следа.', cost: 18000 },
    { id: 'op4', fieldId: 'field2', type: 'Посев', date: '2024-05-05', notes: 'С удобрениями.', cost: 150000 },
    { id: 'op5', fieldId: 'field2', type: 'Гербицидная обработка', date: '2024-06-01', notes: 'Препарат "Экспресс".', cost: 45000 },
];

const initialCropHistory: CropHistory[] = [
    { id: 'ch1', fieldId: 'field1', year: 2023, crop: 'Подсолнечник' },
    { id: 'ch2', fieldId: 'field1', year: 2022, crop: 'Ячмень' },
    { id: 'ch3', fieldId: 'field2', year: 2023, crop: 'Кукуруза' },
];

const initialServiceRequests: ServiceRequestData[] = [
    { id: 'req1', serviceId: 'srv1', providerId: 'sp1', userName: 'Алексей', userPhone: '+79181234567', notes: 'Трактор не заводится, стартер не крутит.', date: '2024-07-14', status: 'Выполнена' },
    { id: 'req2', serviceId: 'srv3', providerId: 'sp3', userName: 'Мария', userPhone: '+79287654321', notes: 'Нужно перевезти 30 тонн пшеницы из ст. Каневская на элеватор в Тимашевске.', date: '2024-07-20', status: 'В работе' },
];

const initialPurchases: Purchase[] = [];

const initialNotifications: AgroNotification[] = [
    { id: 'notif1', type: 'warning', title: 'Риск заморозков', message: 'Прогноз погоды показывает температуру -2°C ночью 19 июля. Рекомендуется защитить теплолюбивые культуры.', date: '2024-07-17T10:00:00Z', read: false, link: '/agro-weather' },
    { id: 'notif2', type: 'task', title: 'Нарушение севооборота', message: "На 'Поле у лесополосы' вы два года подряд сеяли подсолнечник. Рассмотрите смену культуры.", date: '2024-07-16T14:30:00Z', read: false, link: '/field/field1' },
    { id: 'notif3', type: 'info', title: 'Выгодная цена на пшеницу', message: 'Цена на пшеницу 3 класса в вашем регионе выросла на 5% за неделю. Возможно, сейчас выгодное время для продажи.', date: '2024-07-15T09:00:00Z', read: true, link: '/ads' },
];

const initialTelegramPosts: TelegramPost[] = [
  { id: 'tg_post_1', channelName: 'Новости и анонсы АгроХаб', channelLink: 'https://t.me/agrohub_app_news', text: '🎉 Выпущена новая версия "АгроХаб"! Мы добавили модуль "Центр Сообщества" с региональными чатами. Теперь вы можете общаться с фермерами из своего региона, делиться опытом и задавать вопросы. Присоединяйтесь!', date: '2024-07-22T12:00:00Z', imageUrl: 'https://picsum.photos/seed/community_update/800/600' },
  { id: 'tg_post_2', channelName: 'Новости и анонсы АгроХаб', channelLink: 'https://t.me/agrohub_app_news', text: '📈 Обновление в "Маркете"! Добавлены сотни новых запчастей для тракторов МТЗ и комбайнов Ростсельмаш от нашего партнера "АгроТехСнаб". Заходите и проверяйте!', date: '2024-07-21T15:00:00Z' },
  { id: 'tg_post_3', channelName: 'Новости и анонсы АгроХаб', channelLink: 'https://t.me/agrohub_app_news', text: '🤖 AI-Ассистент стал еще умнее! Теперь он использует актуальные данные о погоде для ваших консультаций по полевым работам. Спросите его, стоит ли завтра выходить в поле, и получите развернутый совет!', date: '2024-07-20T11:00:00Z', imageUrl: 'https://picsum.photos/seed/ai_weather_update/800/600' },
];


// In-memory state
let shops = [...initialShops];
let products = [...initialProducts];
let ads = [...initialAds];
let serviceProviders = [...initialServiceProviders];
let services = [...initialServices];
let communityChannels = [...initialCommunityChannels];
let fields = [...initialFields];
let fieldOperations = [...initialFieldOperations];
let cropHistory = [...initialCropHistory];
let serviceRequests = [...initialServiceRequests];
let purchases = [...initialPurchases];
let notifications = [...initialNotifications];
let telegramPosts = [...initialTelegramPosts];

const useMockData = () => {
  const [data, setData] = useState({
    shops,
    products,
    ads,
    serviceProviders,
    services,
    communityChannels,
    fields,
    fieldOperations,
    cropHistory,
    serviceRequests,
    purchases,
    notifications,
    telegramPosts,
    loading: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(prev => ({ ...prev, loading: false }));
    }, 500); // Simulate network delay
    return () => clearTimeout(timer);
  }, []);

  const addProductsFromPricelist = useCallback((shopId: string) => {
    // This simulates parsing a file and returning new products.
    const newProducts: Product[] = [
        { id: `prod_${Date.now()}_1`, name: 'Фильтр масляный', category: 'Запчасти', price: '850 ₽', imageUrl: 'https://picsum.photos/seed/newfilter/400/300', shopId: shopId, isNew: true, quantity: 100 },
        { id: `prod_${Date.now()}_2`, name: 'Ремень генератора', category: 'Запчасти', price: '1 200 ₽', imageUrl: 'https://picsum.photos/seed/newbelt/400/300', shopId: shopId, isNew: true, quantity: 75 },
        { id: `prod_${Date.now()}_3`, name: 'Подшипник ступицы', category: 'Запчасти', price: '2 500 ₽', imageUrl: 'https://picsum.photos/seed/newbearing/400/300', shopId: shopId, isNew: true, quantity: 40 },
    ];
    
    products = [...products, ...newProducts];
    setData(prev => ({...prev, products: [...products]}));
    return newProducts.length;
  }, []);

  const addProductManually = useCallback((productData: Omit<Product, 'id' | 'shopId'>, shopId: string) => {
    const newProduct: Product = {
        ...productData,
        id: `prod_manual_${Date.now()}`,
        shopId: shopId,
    };
    products = [newProduct, ...products]; // Add to the beginning to see it first
    setData(prev => ({...prev, products: [...products]}));
  }, []);

  const updateShopDetails = useCallback((shopId: string, updates: ShopUpdatePayload) => {
      shops = shops.map(shop => {
          if (shop.id === shopId) {
              return { ...shop, ...updates };
          }
          return shop;
      });
      setData(prev => ({...prev, shops: [...shops]}));
  }, []);
  
  const addServiceManually = useCallback((serviceData: Omit<Service, 'id' | 'providerId'>, providerId: string) => {
    const newService: Service = {
        ...serviceData,
        id: `srv_manual_${Date.now()}`,
        providerId: providerId,
    };
    services = [newService, ...services];
    setData(prev => ({...prev, services: [...services]}));
  }, []);
  
  const updateServiceProviderDetails = useCallback((providerId: string, updates: ServiceProviderUpdatePayload) => {
      serviceProviders = serviceProviders.map(provider => {
          if (provider.id === providerId) {
              return { ...provider, ...updates };
          }
          return provider;
      });
      setData(prev => ({...prev, serviceProviders: [...serviceProviders]}));
  }, []);

  const addField = useCallback((fieldData: Omit<Field, 'id' | 'imageUrl'>) => {
    const newField: Field = {
      ...fieldData,
      id: `field_${Date.now()}`,
      imageUrl: SATELLITE_IMAGE_URL
    };
    fields = [newField, ...fields];
    setData(prev => ({...prev, fields: [...fields]}));
  }, []);
  
  const addFieldOperation = useCallback((operationData: FieldOperationPayload) => {
    const newOperation: FieldOperation = {
      ...operationData,
      id: `op_${Date.now()}`
    };
    fieldOperations = [newOperation, ...fieldOperations];
    setData(prev => ({...prev, fieldOperations: [...fieldOperations]}));
  }, []);
  
  const updateField = useCallback((fieldId: string, updates: FieldUpdatePayload) => {
      fields = fields.map(field => {
          if (field.id === fieldId) {
              return { ...field, ...updates };
          }
          return field;
      });
      setData(prev => ({...prev, fields: [...fields]}));
  }, []);
  
  const addServiceRequest = useCallback((requestData: ServiceRequestPayload) => {
    const newRequest: ServiceRequestData = {
        ...requestData,
        id: `req_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        status: 'Открыта',
    };
    serviceRequests = [newRequest, ...serviceRequests];
    setData(prev => ({...prev, serviceRequests: [...serviceRequests]}));
  }, []);

  const addPurchase = useCallback((items: PurchasedItem[], totalAmount: number) => {
      const newPurchase: Purchase = {
          id: `purchase_${Date.now()}`,
          date: new Date().toISOString(),
          totalAmount: totalAmount,
          items: items
      };
      purchases = [newPurchase, ...purchases];
      setData(prev => ({...prev, purchases: [...purchases]}));
  }, []);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    notifications = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
    );
    setData(prev => ({...prev, notifications: [...notifications]}));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    notifications = notifications.map(n => ({ ...n, read: true }));
    setData(prev => ({...prev, notifications: [...notifications]}));
  }, []);


  return { ...data, addProductsFromPricelist, addProductManually, updateShopDetails, addServiceManually, updateServiceProviderDetails, addField, addFieldOperation, updateField, addServiceRequest, addPurchase, markNotificationAsRead, markAllNotificationsAsRead };
};

export default useMockData;
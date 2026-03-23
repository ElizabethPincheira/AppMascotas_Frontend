import { DeliveryStore } from './delivery-store.model';

export const DELIVERY_STORES: DeliveryStore[] = [
  {
    id: 1,
    slug: 'patitas-express',
    name: 'Patitas Express',
    slogan: 'Despacho premium para quienes no quieren esperar.',
    region: 'Region Metropolitana',
    provincia: 'Santiago',
    comuna: 'Las Condes',
    address: 'Av. Apoquindo 4120',
    eta: '45 a 70 min',
    schedule: 'Lun a Sab 09:00 - 20:30',
    deliveryFee: '$2.990',
    rating: 4.8,
    coverage: ['Las Condes', 'Vitacura', 'Providencia'],
    categories: ['Alimento premium', 'Gatos', 'Despacho rapido'],
    highlight: 'Especialistas en alimento premium y entregas durante el mismo dia.',
    description: 'Patitas Express selecciona productos de alta rotacion para perros y gatos, con foco en alimentos premium, snacks funcionales y accesorios utiles para el dia a dia. Su propuesta mezcla rapidez, buena curatoria y atencion cercana.',
    heroImage: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=900&q=80'
    ],
    products: [
      {
        id: 101,
        name: 'Alimento Premium Adulto Salmon 10 kg',
        category: 'Alimentos',
        price: '$48.990',
        image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=900&q=80',
        description: 'Formula balanceada para perros adultos con proteina de salmon y soporte digestivo.',
        tags: ['Top ventas', 'Despacho hoy']
      },
      {
        id: 102,
        name: 'Arena aglomerante carbon activo 12 kg',
        category: 'Gatos',
        price: '$13.490',
        image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
        description: 'Control de olor reforzado y granulometria fina para uso diario.',
        tags: ['Cat lovers', 'Control olor']
      },
      {
        id: 103,
        name: 'Pack snacks dentales x 7',
        category: 'Snacks',
        price: '$8.990',
        image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=900&q=80',
        description: 'Premios funcionales para higiene oral y entrenamiento positivo.',
        tags: ['Promo', 'Mascotas felices']
      }
    ]
  },
  {
    id: 2,
    slug: 'ruta-animal-sur',
    name: 'Ruta Animal Sur',
    slogan: 'Compras grandes, entregas claras y stock para familias perrunas.',
    region: 'Region Metropolitana',
    provincia: 'Santiago',
    comuna: 'La Florida',
    address: 'Walker Martinez 1784',
    eta: '60 a 90 min',
    schedule: 'Lun a Dom 10:00 - 21:00',
    deliveryFee: '$3.490',
    rating: 4.7,
    coverage: ['La Florida', 'Macul', 'Penalolen'],
    categories: ['Perros', 'Sacos grandes', 'Reparto local'],
    highlight: 'Muy buscada por hogares con varios perros y compras de volumen.',
    description: 'Ruta Animal Sur esta pensada para quienes compran en formato ahorro. Combina sacos de gran tamano, suplementos, juguetes resistentes y una cobertura fuerte en el sector suroriente.',
    heroImage: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1598137260847-405f0fbcbbd6?auto=format&fit=crop&w=900&q=80'
    ],
    products: [
      {
        id: 201,
        name: 'Saco cachorro raza mediana 15 kg',
        category: 'Alimentos',
        price: '$39.990',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80',
        description: 'Nutricion de crecimiento con DHA, calcio y croqueta de facil masticacion.',
        tags: ['Cachorros', 'Formato ahorro']
      },
      {
        id: 202,
        name: 'Juguete mordedor ultra resistente',
        category: 'Accesorios',
        price: '$11.990',
        image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=900&q=80',
        description: 'Pensado para perros con energia alta y sesiones largas de juego.',
        tags: ['Durable', 'Recomendado']
      },
      {
        id: 203,
        name: 'Suplemento articular senior 90 tabs',
        category: 'Bienestar',
        price: '$22.490',
        image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=900&q=80',
        description: 'Apoyo para movilidad y comodidad diaria en perros senior.',
        tags: ['Senior', 'Cuidado diario']
      }
    ]
  },
  {
    id: 3,
    slug: 'puerto-mascota',
    name: 'Puerto Mascota',
    slogan: 'Seleccion costera para gatos exigentes y compras programadas.',
    region: 'Region de Valparaiso',
    provincia: 'Valparaiso',
    comuna: 'Vina del Mar',
    address: '1 Norte 940',
    eta: '50 a 80 min',
    schedule: 'Lun a Sab 09:30 - 20:00',
    deliveryFee: '$2.490',
    rating: 4.9,
    coverage: ['Vina del Mar', 'Valparaiso', 'Quilpue'],
    categories: ['Gatos', 'Snacks', 'Entrega programada'],
    highlight: 'Ideal para compras mensuales y pedidos programados en la zona costera.',
    description: 'Puerto Mascota mezcla surtido felino, snackeria especializada y despachos organizados para compras del mes. Tambien suma lineas de cuidado e higiene para hogares con varios gatos.',
    heroImage: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=900&q=80'
    ],
    products: [
      {
        id: 301,
        name: 'Lata humeda gourmet atun y salmon',
        category: 'Gatos',
        price: '$2.190',
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=900&q=80',
        description: 'Textura suave y alto porcentaje de proteina animal.',
        tags: ['Humedo', 'Favorito']
      },
      {
        id: 302,
        name: 'Rascador torre compacta',
        category: 'Accesorios',
        price: '$27.990',
        image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=900&q=80',
        description: 'Ideal para departamentos y rutinas de enriquecimiento ambiental.',
        tags: ['Indoor', 'Ahorra espacio']
      },
      {
        id: 303,
        name: 'Snack cremita pack mixto x 20',
        category: 'Snacks',
        price: '$10.990',
        image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80',
        description: 'Perfecto para reforzamiento, medicacion o momentos de apego.',
        tags: ['Pack ahorro', 'Cat snack']
      }
    ]
  },
  {
    id: 4,
    slug: 'compania-perruna',
    name: 'Compania Perruna',
    slogan: 'Lo esencial del barrio, con foco en precio y cercania.',
    region: 'Region de Valparaiso',
    provincia: 'Marga Marga',
    comuna: 'Quilpue',
    address: 'Freire 622',
    eta: '35 a 60 min',
    schedule: 'Lun a Vie 10:00 - 19:30',
    deliveryFee: '$1.990',
    rating: 4.6,
    coverage: ['Quilpue', 'Villa Alemana', 'Olmue'],
    categories: ['Economico', 'Alimento cachorro', 'Reparto barrial'],
    highlight: 'Opcion cercana y economica con foco en barrios residenciales.',
    description: 'Compania Perruna ofrece una vitrina simple y util, con productos de buena relacion precio calidad para hogares que priorizan continuidad y cercania en sus compras.',
    heroImage: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1560743641-3914f2c45636?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80'
    ],
    products: [
      {
        id: 401,
        name: 'Alimento economico adulto 18 kg',
        category: 'Alimentos',
        price: '$27.990',
        image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=900&q=80',
        description: 'Formato familiar para compra mensual con envio local.',
        tags: ['Economico', 'Rinde mas']
      },
      {
        id: 402,
        name: 'Shampoo hipoalergenico avena',
        category: 'Higiene',
        price: '$6.490',
        image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=80',
        description: 'Limpieza suave para pieles sensibles y uso frecuente.',
        tags: ['Higiene', 'Suave']
      },
      {
        id: 403,
        name: 'Plato doble antiderrame',
        category: 'Accesorios',
        price: '$5.990',
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=80',
        description: 'Solucion practica para agua y alimento en espacios pequenos.',
        tags: ['Casa', 'Util']
      }
    ]
  },
  {
    id: 5,
    slug: 'norte-mascotero',
    name: 'Norte Mascotero',
    slogan: 'Nutricion especializada y despacho zonal para el norte.',
    region: 'Region de Antofagasta',
    provincia: 'Antofagasta',
    comuna: 'Antofagasta',
    address: 'Av. Argentina 1260',
    eta: '60 a 100 min',
    schedule: 'Lun a Sab 09:00 - 20:00',
    deliveryFee: '$3.990',
    rating: 4.7,
    coverage: ['Antofagasta', 'Mejillones'],
    categories: ['Perros grandes', 'Alimento veterinario', 'Despacho zonal'],
    highlight: 'Trabaja con lineas veterinarias y productos de soporte nutricional.',
    description: 'Norte Mascotero se especializa en soluciones nutricionales y productos de apoyo para perros de razas grandes o con requerimientos especiales, sumando una logistica pensada para trayectos extensos.',
    heroImage: 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=900&q=80'
    ],
    products: [
      {
        id: 501,
        name: 'Alimento veterinario gastrointestinal 8 kg',
        category: 'Veterinario',
        price: '$56.990',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80',
        description: 'Dieta formulada para soporte digestivo bajo recomendacion profesional.',
        tags: ['Vet', 'Especial']
      },
      {
        id: 502,
        name: 'Cama XL lavable',
        category: 'Descanso',
        price: '$34.990',
        image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
        description: 'Base amplia y acolchada para perros grandes o senior.',
        tags: ['XL', 'Confort']
      },
      {
        id: 503,
        name: 'Snacks liofilizados proteina pura',
        category: 'Snacks',
        price: '$9.990',
        image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=900&q=80',
        description: 'Premios altos en proteina y faciles de porcionar.',
        tags: ['Entrenamiento', 'Natural']
      }
    ]
  },
  {
    id: 6,
    slug: 'huellitas-serena',
    name: 'Huellitas Serena',
    slogan: 'Rapidez, surtido mixto y buena cobertura entre comunas vecinas.',
    region: 'Region de Coquimbo',
    provincia: 'Elqui',
    comuna: 'La Serena',
    address: 'Balmaceda 2150',
    eta: '40 a 75 min',
    schedule: 'Lun a Dom 09:30 - 21:00',
    deliveryFee: '$2.490',
    rating: 4.8,
    coverage: ['La Serena', 'Coquimbo'],
    categories: ['Gatos', 'Perros', 'Despacho en el dia'],
    highlight: 'Muy valorada por rapidez y cobertura entre La Serena y Coquimbo.',
    description: 'Huellitas Serena mezcla productos para perros y gatos con despacho dinamico, lo que la vuelve muy practica para familias que resuelven todo en un mismo pedido.',
    heroImage: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80'
    ],
    products: [
      {
        id: 601,
        name: 'Pack mixto perro + gato hogar multiespecie',
        category: 'Combos',
        price: '$29.990',
        image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=900&q=80',
        description: 'Incluye alimento seco, snack y accesorio util para ambos perfiles.',
        tags: ['Combo', 'Multimascota']
      },
      {
        id: 602,
        name: 'Arnes reflectante paseo urbano',
        category: 'Accesorios',
        price: '$12.990',
        image: 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=900&q=80',
        description: 'Comodo, ajustable y visible para paseos al atardecer.',
        tags: ['Paseo', 'Seguridad']
      },
      {
        id: 603,
        name: 'Snack mix mariscos para gato',
        category: 'Gatos',
        price: '$4.990',
        image: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80',
        description: 'Bocados pequenos con aroma intenso y textura crocante.',
        tags: ['Felino', 'Snack']
      }
    ]
  }
];

export function getStoreById(storeId: number): DeliveryStore | undefined {
  return DELIVERY_STORES.find((store) => store.id === storeId);
}

import type { TechMartProduct } from '../types';

export const initialProducts: TechMartProduct[] = [
  // LAPTOPS (6)
  {
    sku: 'TM-LAP-101',
    item_title: 'Predator Helios RTX 4070 Gaming Laptop',
    department: 'Laptops',
    unit_price: 139999,
    available_units: 18,
    brand_name: 'ApexTech',
    product_specifications: {
      'Processor': 'Intel Core i9-13900HX',
      'GPU': 'NVIDIA GeForce RTX 4070 8GB',
      'RAM': '32 GB DDR5 5600MHz',
      'Storage': '1 TB Gen4 NVMe SSD',
      'Display': '16.0" QHD+ 240Hz IPS',
      'Weight': '2.6 kg'
    },
    warranty_months: 24,
    rating_score: 4.8,
    total_reviews: 142,
    image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    discount_percent: 12,
    is_featured: true,
    is_trending: true
  },
  {
    sku: 'TM-LAP-102',
    item_title: 'ZenBook Pro 14 OLED Creator Laptop',
    department: 'Laptops',
    unit_price: 114990,
    available_units: 25,
    brand_name: 'Vortex',
    product_specifications: {
      'Processor': 'AMD Ryzen 9 7940HS',
      'GPU': 'RTX 4050 6GB',
      'RAM': '16 GB LPDDR5X',
      'Storage': '1 TB SSD',
      'Display': '14.5" 2.8K 120Hz OLED Touch',
      'Weight': '1.65 kg'
    },
    warranty_months: 12,
    rating_score: 4.7,
    total_reviews: 89,
    image_url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
    discount_percent: 8,
    is_featured: true
  },
  {
    sku: 'TM-LAP-103',
    item_title: 'SlimBook Air M3 Ultrabook',
    department: 'Laptops',
    unit_price: 94900,
    available_units: 40,
    brand_name: 'ByteCraft',
    product_specifications: {
      'Processor': 'Byte Octa-Core M3',
      'RAM': '16 GB Unified Memory',
      'Storage': '512 GB High Speed SSD',
      'Display': '13.6" Liquid Retina Display',
      'Battery Life': 'Up to 18 Hours',
      'Weight': '1.24 kg'
    },
    warranty_months: 12,
    rating_score: 4.9,
    total_reviews: 310,
    image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
    discount_percent: 5,
    is_trending: true
  },
  {
    sku: 'TM-LAP-104',
    item_title: 'ThinkPro Executive Business Laptop',
    department: 'Laptops',
    unit_price: 78500,
    available_units: 32,
    brand_name: 'CyberMax',
    product_specifications: {
      'Processor': 'Intel Core i7-1365U',
      'RAM': '16 GB DDR4',
      'Storage': '512 GB NVMe SSD',
      'Display': '14.0" FHD IPS Anti-Glare',
      'Security': 'Fingerprint + IR Camera',
      'Weight': '1.38 kg'
    },
    warranty_months: 36,
    rating_score: 4.5,
    total_reviews: 64,
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'TM-LAP-105',
    item_title: 'TitanWorkstation Pro 17 Laptop',
    department: 'Laptops',
    unit_price: 189990,
    available_units: 8,
    brand_name: 'ApexTech',
    product_specifications: {
      'Processor': 'Intel Xeon W-13900',
      'GPU': 'NVIDIA RTX 4090 16GB VRAM',
      'RAM': '64 GB DDR5 ECC',
      'Storage': '2 TB NVMe RAID 0 SSD',
      'Display': '17.3" 4K Mini-LED 144Hz',
      'Weight': '3.1 kg'
    },
    warranty_months: 36,
    rating_score: 4.9,
    total_reviews: 29,
    image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    discount_percent: 10
  },
  {
    sku: 'TM-LAP-106',
    item_title: 'FlexBook 360 Convertible 2-in-1',
    department: 'Laptops',
    unit_price: 64990,
    available_units: 21,
    brand_name: 'Vortex',
    product_specifications: {
      'Processor': 'Intel Core i5-1335U',
      'RAM': '16 GB LPDDR5',
      'Storage': '512 GB SSD',
      'Display': '14.0" FHD Touch + Active Pen',
      'Weight': '1.5 kg'
    },
    warranty_months: 12,
    rating_score: 4.4,
    total_reviews: 77,
    image_url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80'
  },

  // SMARTPHONES (6)
  {
    sku: 'TM-PHN-201',
    item_title: 'UltraPhone 15 Pro Max 5G (256GB)',
    department: 'Smartphones',
    unit_price: 129900,
    available_units: 45,
    brand_name: 'ByteCraft',
    product_specifications: {
      'Display': '6.7" Super Retina OLED 120Hz',
      'Processor': 'Bionic A17 Pro Chip',
      'Camera': '48MP Main + 12MP Telephoto 5x',
      'Battery': '4422 mAh',
      'Build': 'Titanium Frame'
    },
    warranty_months: 12,
    rating_score: 4.9,
    total_reviews: 520,
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    discount_percent: 6,
    is_featured: true,
    is_trending: true
  },
  {
    sku: 'TM-PHN-202',
    item_title: 'Galaxy Nova S24 Ultra AI Smartphone',
    department: 'Smartphones',
    unit_price: 119999,
    available_units: 38,
    brand_name: 'NovaTech',
    product_specifications: {
      'Display': '6.8" Dynamic AMOLED 2X 120Hz',
      'Processor': 'Snapdragon 8 Gen 3',
      'Camera': '200MP Quad Camera + 100x Zoom',
      'RAM / Storage': '12GB / 512GB',
      'S-Pen': 'Included Built-in'
    },
    warranty_months: 12,
    rating_score: 4.8,
    total_reviews: 380,
    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    discount_percent: 10,
    is_featured: true
  },
  {
    sku: 'TM-PHN-203',
    item_title: 'Pixel Vision 8 Pro Pure Android',
    department: 'Smartphones',
    unit_price: 82990,
    available_units: 29,
    brand_name: 'CyberMax',
    product_specifications: {
      'Display': '6.7" LTPO OLED 2400 nits',
      'Processor': 'Tensor G3 NPU',
      'Camera': '50MP + 48MP UltraWide + 48MP Tele',
      'RAM / Storage': '12GB / 256GB'
    },
    warranty_months: 12,
    rating_score: 4.6,
    total_reviews: 195,
    image_url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80',
    discount_percent: 15
  },
  {
    sku: 'TM-PHN-204',
    item_title: 'FoldZ Pro Dual Screen 5G',
    department: 'Smartphones',
    unit_price: 144990,
    available_units: 12,
    brand_name: 'NovaTech',
    product_specifications: {
      'Main Screen': '7.6" Foldable AMOLED 120Hz',
      'Cover Screen': '6.2" HD+ AMOLED',
      'Processor': 'Snapdragon 8 Gen 3',
      'RAM / Storage': '16GB / 512GB'
    },
    warranty_months: 12,
    rating_score: 4.7,
    total_reviews: 82,
    image_url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
    discount_percent: 5
  },
  {
    sku: 'TM-PHN-205',
    item_title: 'SpeedDemon 11 G-Series Gaming Phone',
    department: 'Smartphones',
    unit_price: 58990,
    available_units: 30,
    brand_name: 'ApexTech',
    product_specifications: {
      'Display': '6.78" 165Hz Gaming AMOLED',
      'Cooling': 'ICE 12.0 Vapor Chamber',
      'Processor': 'Snapdragon 8 Gen 2',
      'Triggers': 'AirTrigger 7 Touch Triggers',
      'Battery': '6000 mAh + 65W Fast Charge'
    },
    warranty_months: 12,
    rating_score: 4.7,
    total_reviews: 114,
    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    is_trending: true
  },
  {
    sku: 'TM-PHN-206',
    item_title: 'LiteTouch 5G Budget Smartphone',
    department: 'Smartphones',
    unit_price: 16999,
    available_units: 75,
    brand_name: 'Vortex',
    product_specifications: {
      'Display': '6.6" 90Hz FHD+ IPS',
      'Processor': 'Dimensity 7020 5G',
      'Camera': '50MP Dual Camera',
      'Battery': '5000 mAh + 33W Fast Charge',
      'RAM / Storage': '6GB / 128GB'
    },
    warranty_months: 12,
    rating_score: 4.3,
    total_reviews: 412,
    image_url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80',
    discount_percent: 20
  },

  // AUDIO (5)
  {
    sku: 'TM-AUD-301',
    item_title: 'SonicBlast ANC Over-Ear Wireless Headphones',
    department: 'Audio',
    unit_price: 24990,
    available_units: 50,
    brand_name: 'AcousticLab',
    product_specifications: {
      'Noise Cancellation': 'Active Noise Cancelling (ANC) -38dB',
      'Battery Life': '40 Hours ANC On',
      'Drivers': '40mm Titanium Drivers',
      'Codec': 'LDAC / AAC / SBC',
      'Fast Charging': '10 min charge = 5 hours play'
    },
    warranty_months: 12,
    rating_score: 4.8,
    total_reviews: 230,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    discount_percent: 15,
    is_featured: true,
    is_trending: true
  },
  {
    sku: 'TM-AUD-302',
    item_title: 'AirPulse Pro Wireless TWS Earbuds',
    department: 'Audio',
    unit_price: 14990,
    available_units: 80,
    brand_name: 'AcousticLab',
    product_specifications: {
      'Audio Technology': 'Adaptive Spatial Audio with Head Tracking',
      'ANC': 'Dual Mic ANC',
      'Battery': '6 hours + 24 hours charging case',
      'Water Resistance': 'IPX4 Water & Sweat Proof'
    },
    warranty_months: 12,
    rating_score: 4.7,
    total_reviews: 450,
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    discount_percent: 10,
    is_featured: true
  },
  {
    sku: 'TM-AUD-303',
    item_title: 'BoomBox Max 60W Bluetooth Portable Speaker',
    department: 'Audio',
    unit_price: 11990,
    available_units: 42,
    brand_name: 'SoundWave',
    product_specifications: {
      'Output Power': '60W RMS Peak',
      'Battery Life': '24 Hours Playtime',
      'Waterproof': 'IP67 Dust & Water Proof',
      'Features': 'Party Sync Dual Speaker Pairing'
    },
    warranty_months: 12,
    rating_score: 4.6,
    total_reviews: 188,
    image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
    discount_percent: 12
  },
  {
    sku: 'TM-AUD-304',
    item_title: 'StudioReference HD 650 Wired Headphones',
    department: 'Audio',
    unit_price: 18490,
    available_units: 15,
    brand_name: 'AcousticLab',
    product_specifications: {
      'Design': 'Open-Back Studio Monitor',
      'Impedance': '300 Ohms',
      'Frequency Response': '10 Hz - 41,000 Hz',
      'Cable': 'Detachable Oxygen-Free Copper'
    },
    warranty_months: 24,
    rating_score: 4.9,
    total_reviews: 94,
    image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'TM-AUD-305',
    item_title: 'CinemaSurround 300W Soundbar + Subwoofer',
    department: 'Audio',
    unit_price: 29990,
    available_units: 20,
    brand_name: 'SoundWave',
    product_specifications: {
      'Channels': '5.1 Dolby Atmos Surround',
      'Total Output': '300W RMS',
      'Subwoofer': '6.5" Wireless Subwoofer',
      'Connectivity': 'HDMI eARC, Optical, Bluetooth 5.3'
    },
    warranty_months: 12,
    rating_score: 4.7,
    total_reviews: 112,
    image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    discount_percent: 18
  },

  // GAMING (6)
  {
    sku: 'TM-GAM-401',
    item_title: 'Nexus X Next-Gen Gaming Console 1TB',
    department: 'Gaming',
    unit_price: 54990,
    available_units: 22,
    brand_name: 'ApexTech',
    product_specifications: {
      'GPU': 'Custom RDNA 2 10.28 TFLOPs',
      'Storage': '1 TB Custom NVMe SSD',
      'Output': '4K @ 120Hz & 8K HDR Support',
      'Audio': '3D Spatial Audio Engine'
    },
    warranty_months: 12,
    rating_score: 4.9,
    total_reviews: 620,
    image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    is_featured: true,
    is_trending: true
  },
  {
    sku: 'TM-GAM-402',
    item_title: 'StrikePro RGB Mechanical Gaming Keyboard',
    department: 'Gaming',
    unit_price: 8990,
    available_units: 65,
    brand_name: 'CyberMax',
    product_specifications: {
      'Switch Type': 'Hot-swappable Mechanical Linear Red',
      'Keycaps': 'Double-shot PBT Keycaps',
      'Lighting': 'Per-Key Per-LED RGB Lighting',
      'Connectivity': 'Tri-Mode (Bluetooth, 2.4GHz, USB-C)'
    },
    warranty_months: 24,
    rating_score: 4.8,
    total_reviews: 310,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    discount_percent: 15,
    is_featured: true
  },
  {
    sku: 'TM-GAM-403',
    item_title: 'ViperX Wireless Ultra-Light Gaming Mouse',
    department: 'Gaming',
    unit_price: 6490,
    available_units: 90,
    brand_name: 'CyberMax',
    product_specifications: {
      'Sensor': '30,000 DPI Optical Sensor',
      'Weight': '49 grams Ultra Lightweight',
      'Polling Rate': 'Up to 4000Hz Polling',
      'Battery Life': 'Up to 90 Hours'
    },
    warranty_months: 24,
    rating_score: 4.7,
    total_reviews: 240,
    image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    discount_percent: 10
  },
  {
    sku: 'TM-GAM-404',
    item_title: 'Curved Vision 34" WQHD 240Hz Gaming Monitor',
    department: 'Gaming',
    unit_price: 48990,
    available_units: 16,
    brand_name: 'Vortex',
    product_specifications: {
      'Display': '34" WQHD (3440 x 1440) 1000R Curved',
      'Refresh Rate': '240Hz Response Time 0.03ms',
      'Panel': 'Quantum Dot OLED',
      'G-Sync / FreeSync': 'NVIDIA G-Sync Compatible'
    },
    warranty_months: 36,
    rating_score: 4.9,
    total_reviews: 135,
    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    discount_percent: 12
  },
  {
    sku: 'TM-GAM-405',
    item_title: 'ProGrip Wireless Haptic Gamepad',
    department: 'Gaming',
    unit_price: 4990,
    available_units: 55,
    brand_name: 'ApexTech',
    product_specifications: {
      'Haptics': 'Dual Actuator Haptic Feedback',
      'Triggers': 'Adaptive Dynamic Resistance Triggers',
      'Compatibility': 'PC, Console, Android, iOS',
      'Battery': '15 Hours Rechargeable'
    },
    warranty_months: 12,
    rating_score: 4.6,
    total_reviews: 178,
    image_url: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'TM-GAM-406',
    item_title: '7.1 Surround Gaming Headset with Mic',
    department: 'Gaming',
    unit_price: 5990,
    available_units: 48,
    brand_name: 'SoundWave',
    product_specifications: {
      'Audio': 'Virtual 7.1 Surround Sound',
      'Microphone': 'Detachable Noise-Cancelling Mic',
      'Earcups': 'Memory Foam Breathable Fabric',
      'Weight': '275 grams'
    },
    warranty_months: 12,
    rating_score: 4.5,
    total_reviews: 162,
    image_url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
    discount_percent: 25
  },

  // COMPUTER ACCESSORIES (5)
  {
    sku: 'TM-ACC-501',
    item_title: 'ThunderHub 10-in-1 USB-C Docking Station',
    department: 'Computer Accessories',
    unit_price: 4990,
    available_units: 85,
    brand_name: 'ByteCraft',
    product_specifications: {
      'Ports': 'Dual 4K HDMI, 100W PD Charging, 3x USB 3.2, SD/TF, Ethernet',
      'Data Speed': '10 Gbps Transfer Rate',
      'Material': 'Anodized Aluminum Alloy'
    },
    warranty_months: 12,
    rating_score: 4.7,
    total_reviews: 215,
    image_url: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=800&q=80',
    is_trending: true
  },
  {
    sku: 'TM-ACC-502',
    item_title: '4K Ultra HD Pro Streamer Webcam',
    department: 'Computer Accessories',
    unit_price: 9990,
    available_units: 40,
    brand_name: 'CyberMax',
    product_specifications: {
      'Resolution': '4K @ 30fps / 1080p @ 60fps',
      'Autofocus': 'AI Powered Face Tracking Autofocus',
      'Microphone': 'Dual Omni-directional Mics with Noise Reduction',
      'Privacy Shutter': 'Built-in Magnetic Cover'
    },
    warranty_months: 12,
    rating_score: 4.6,
    total_reviews: 140,
    image_url: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=800&q=80',
    discount_percent: 10
  },
  {
    sku: 'TM-ACC-503',
    item_title: 'Extreme 2TB NVMe Portable External SSD',
    department: 'Computer Accessories',
    unit_price: 15490,
    available_units: 60,
    brand_name: 'ByteCraft',
    product_specifications: {
      'Read Speed': 'Up to 2000 MB/s',
      'Interface': 'USB 3.2 Gen 2x2 Type-C',
      'Durability': 'IP65 Dust & Water Resistant, 3-meter Drop Proof',
      'Encryption': '256-bit AES Hardware Encryption'
    },
    warranty_months: 60,
    rating_score: 4.9,
    total_reviews: 380,
    image_url: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=800&q=80',
    is_featured: true
  },
  {
    sku: 'TM-ACC-504',
    item_title: 'Ergonomic Aluminum Adjustable Laptop Stand',
    department: 'Computer Accessories',
    unit_price: 2490,
    available_units: 110,
    brand_name: 'Vortex',
    product_specifications: {
      'Material': 'Premium Aluminum Alloy',
      'Compatibility': '10" to 17.3" Laptops',
      'Adjustability': 'Multi-angle Height & Tilt adjustment',
      'Cooling': 'Open Ventilation Heat Dissipation'
    },
    warranty_months: 12,
    rating_score: 4.5,
    total_reviews: 290,
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    discount_percent: 20
  },
  {
    sku: 'TM-ACC-505',
    item_title: 'ErgoVertical Wireless Ergonomic Mouse',
    department: 'Computer Accessories',
    unit_price: 3290,
    available_units: 70,
    brand_name: 'CyberMax',
    product_specifications: {
      'Angle': '57-degree Natural Ergonomic Wrist Position',
      'DPI': 'Adjustable 800 - 4000 DPI',
      'Connectivity': 'Bluetooth + 2.4GHz USB Dongle',
      'Battery': 'Rechargeable USB-C 500mAh'
    },
    warranty_months: 12,
    rating_score: 4.4,
    total_reviews: 165,
    image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80'
  },

  // SMART HOME (5)
  {
    sku: 'TM-SMH-601',
    item_title: 'Aura Voice AI Smart Speaker Hub',
    department: 'Smart Home',
    unit_price: 7990,
    available_units: 50,
    brand_name: 'NovaTech',
    product_specifications: {
      'Audio': '360-degree High-Excursion Woofer + Dual Tweeters',
      'AI Assistant': 'Voice AI Multi-Room Assistant',
      'Smart Hub': 'Built-in Zigbee & Matter Smart Home Controller',
      'Privacy': 'Hardware Microphone Off Switch'
    },
    warranty_months: 12,
    rating_score: 4.7,
    total_reviews: 340,
    image_url: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80',
    is_featured: true
  },
  {
    sku: 'TM-SMH-602',
    item_title: 'GuardCam 2K Indoor Smart Security Camera',
    department: 'Smart Home',
    unit_price: 3490,
    available_units: 95,
    brand_name: 'NovaTech',
    product_specifications: {
      'Resolution': '2K Quad HD 360-degree Pan & Tilt',
      'Night Vision': 'Color Night Vision + Infrared LEDs',
      'AI Detection': 'Human & Pet AI Motion Detection',
      'Storage': 'MicroSD up to 256GB / Encrypted Cloud'
    },
    warranty_months: 12,
    rating_score: 4.6,
    total_reviews: 280,
    image_url: 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&w=800&q=80',
    discount_percent: 15,
    is_trending: true
  },
  {
    sku: 'TM-SMH-603',
    item_title: 'LumiGlow RGB Smart LED Bulb Pack (4 Bulbs)',
    department: 'Smart Home',
    unit_price: 2190,
    available_units: 140,
    brand_name: 'NovaTech',
    product_specifications: {
      'Brightness': '825 Lumens (9W Equivalent to 60W)',
      'Colors': '16 Million Colors + Tunable White (2000K-6500K)',
      'Control': 'App Control + Alexa / Google Home Voice Sync',
      'Lifespan': '25,000 Hours'
    },
    warranty_months: 24,
    rating_score: 4.5,
    total_reviews: 512,
    image_url: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=800&q=80',
    discount_percent: 20
  },
  {
    sku: 'TM-SMH-604',
    item_title: 'SmartPlug Pro Wi-Fi Energy Monitor (Pack of 2)',
    department: 'Smart Home',
    unit_price: 1790,
    available_units: 120,
    brand_name: 'NovaTech',
    product_specifications: {
      'Rating': '16A High Power (Suitable for AC / Geyser)',
      'Energy Tracking': 'Real-time Power Consumption Monitor',
      'Scheduling': 'Timer & Sunrise/Sunset Automation',
      'Protection': 'Surge & Overload Auto Shut-off'
    },
    warranty_months: 12,
    rating_score: 4.4,
    total_reviews: 230,
    image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'
  },
  {
    sku: 'TM-SMH-605',
    item_title: 'VideoDoorbell Pro 2K HDR Wireless Doorbell',
    department: 'Smart Home',
    unit_price: 8990,
    available_units: 35,
    brand_name: 'NovaTech',
    product_specifications: {
      'Camera': '2K HDR 160-degree Ultra Wide Angle',
      'Audio': 'Two-Way Audio with Noise Cancellation',
      'Battery': 'Rechargeable 6500mAh (6 Months battery life)',
      'Chime': 'Wireless Indoor Chime Included'
    },
    warranty_months: 12,
    rating_score: 4.7,
    total_reviews: 98,
    image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
    discount_percent: 10
  },

  // WEARABLES (5)
  {
    sku: 'TM-WER-701',
    item_title: 'WatchUltra Pro GPS Cellular Smartwatch',
    department: 'Wearables',
    unit_price: 38990,
    available_units: 40,
    brand_name: 'ByteCraft',
    product_specifications: {
      'Display': '1.96" Sapphire Crystal OLED 3000 nits',
      'Sensors': 'ECG, SpO2, Heart Rate, Temperature, Dual-band GPS',
      'Water Resistance': '100m Water Resistant + Diving Computer',
      'Battery': 'Up to 60 Hours in Low Power Mode'
    },
    warranty_months: 12,
    rating_score: 4.9,
    total_reviews: 410,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    discount_percent: 10,
    is_featured: true,
    is_trending: true
  },
  {
    sku: 'TM-WER-702',
    item_title: 'FitBand X Pro AMOLED Health Tracker',
    department: 'Wearables',
    unit_price: 3990,
    available_units: 110,
    brand_name: 'Vortex',
    product_specifications: {
      'Display': '1.62" Full Touch AMOLED',
      'Sports Modes': '120+ Fitness Workout Modes',
      'Health Tracking': '24/7 Heart Rate, Sleep Analyzer, Stress Level',
      'Battery Life': 'Up to 14 Days Typical Use'
    },
    warranty_months: 12,
    rating_score: 4.5,
    total_reviews: 620,
    image_url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80',
    discount_percent: 20
  },
  {
    sku: 'TM-WER-703',
    item_title: 'SmartRing Bio 3 Titan Health Ring',
    department: 'Wearables',
    unit_price: 21990,
    available_units: 25,
    brand_name: 'AcousticLab',
    product_specifications: {
      'Material': 'Medical Grade Titanium Shell',
      'Sensors': 'Optical Blood Oxygen, Skin Temp, Heart Rate Variability',
      'Weight': 'Lightweight 4 grams',
      'Battery': '7 Days Battery + Portable Charging Case'
    },
    warranty_months: 12,
    rating_score: 4.8,
    total_reviews: 145,
    image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    is_trending: true
  },
  {
    sku: 'TM-WER-704',
    item_title: 'ApexRugged Outdoor Tactical GPS Watch',
    department: 'Wearables',
    unit_price: 27990,
    available_units: 28,
    brand_name: 'ApexTech',
    product_specifications: {
      'Standard': 'MIL-STD-810G Military Toughness',
      'Navigation': 'Multi-GNSS Satellite Topo Maps',
      'Solar Charge': 'Power Glass Solar Charging Lens',
      'Battery Life': 'Up to 28 Days in Smartwatch Mode'
    },
    warranty_months: 24,
    rating_score: 4.7,
    total_reviews: 88,
    image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    discount_percent: 8
  },
  {
    sku: 'TM-WER-705',
    item_title: 'KidSafe 4G Smart Watch with SOS Button',
    department: 'Wearables',
    unit_price: 4490,
    available_units: 60,
    brand_name: 'CyberMax',
    product_specifications: {
      'Connectivity': '4G Voice/Video Calling + Geofence GPS',
      'Safety': 'One-Touch Physical SOS Alarm Button',
      'Camera': '2MP Front Camera for Video Calls',
      'Waterproof': 'IP67 Splash Resistant'
    },
    warranty_months: 12,
    rating_score: 4.4,
    total_reviews: 130,
    image_url: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80'
  }
];

import dotenv from 'dotenv';

dotenv.config();

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
} from '@apollo/client';

import {
  GET_BUSINESS_TYPES,
  CREATE_CATEGORY,
  CREATE_SUBCATEGORY,
} from './src/graphql/queries';

// ============================================================
// TYPES
// ============================================================

type Audience =
  | 'FEMALE'
  | 'MALE'
  | 'KIDS';

type BusinessTypeKey =
  | 'BEAUTY_SALON'
  | 'BARBER'
  | 'SPA_WELLNESS';

type BusinessType = {
  businessTypeId: string;
  name: string;
  description?: string | null;
  status: string;
};

type BusinessTypeMap = {
  BEAUTY_SALON: string;
  BARBER: string;
  SPA_WELLNESS: string;
};

type SeedSubcategory = {
  name: string;
  description?: string;
  audiences: Audience[];
  businessTypes: BusinessTypeKey[];
};

type SeedCategory = {
  name: string;
  description?: string;
  businessTypes: BusinessTypeKey[];
  subcategories: SeedSubcategory[];
};

// ============================================================
// ENVIRONMENT
// ============================================================

const GRAPHQL_URL =
  process.env.VITE_APP_GRAPHQL_URL;

const GRAPHQL_API_KEY =
  process.env.VITE_APP_GRAPHQL_API_KEY;

if (!GRAPHQL_URL) {
  throw new Error(
    'VITE_APP_GRAPHQL_URL is not configured in .env'
  );
}

if (!GRAPHQL_API_KEY) {
  throw new Error(
    'VITE_APP_GRAPHQL_API_KEY is not configured in .env'
  );
}

// ============================================================
// APOLLO CLIENT
// ============================================================

const client =
  new ApolloClient({
    link:
      new HttpLink({
        uri: GRAPHQL_URL,
        headers: {
          'x-api-key': GRAPHQL_API_KEY,
        },
      }),

    cache:
      new InMemoryCache(),
  });

// ============================================================
// HELPERS
// ============================================================

function normalizeName(
  value: unknown
): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

// ============================================================
// BUSINESS TYPE RESOLUTION
// ============================================================

function resolveBusinessTypeIds(
  businessTypes: BusinessType[]
): BusinessTypeMap {

  const beautySalon =
    businessTypes.find(
      (item) =>
        normalizeName(item.name) ===
        'salon'
    );

  const barber =
    businessTypes.find(
      (item) =>
        normalizeName(item.name) ===
        'barber'
    );

  const spaWellness =
    businessTypes.find(
      (item) =>
        normalizeName(item.name) ===
        'spa & wellness'
    );

  if (!beautySalon) {
    throw new Error(
      'Business type "Beauty Salon" was not found.'
    );
  }

  if (!barber) {
    throw new Error(
      'Business type "Barber" was not found.'
    );
  }

  if (!spaWellness) {
    throw new Error(
      'Business type "Spa & Wellness" was not found.'
    );
  }

  return {
    BEAUTY_SALON:
      beautySalon.businessTypeId,

    BARBER:
      barber.businessTypeId,

    SPA_WELLNESS:
      spaWellness.businessTypeId,
  };
}

// ============================================================
// CATALOG
// ============================================================

const CATALOG: SeedCategory[] = [

  // ==========================================================
  // HAIR
  // ==========================================================

  {
    name: 'Hair',
    description:
      'Hair cutting, styling, coloring, treatment and hair care services.',
    businessTypes: [
      'BEAUTY_SALON',
      'BARBER',
    ],

    subcategories: [

      {
        name: 'Hair Cut',
        audiences: [
          'FEMALE',
          'MALE',
          'KIDS',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Hair Trim',
        audiences: [
          'FEMALE',
          'MALE',
          'KIDS',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Hair Styling',
        audiences: [
          'FEMALE',
          'MALE',
          'KIDS',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Hair Wash',
        audiences: [
          'FEMALE',
          'MALE',
          'KIDS',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Hair Color',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Highlights',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Balayage',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Hair Treatment',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Hair Smoothening',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Hair Straightening',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Hair Spa',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Scalp Treatment',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Hair Extensions',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Hair Consultation',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },
    ],
  },

  // ==========================================================
  // BEARD & SHAVING
  // ==========================================================

  {
    name: 'Beard & Shaving',
    description:
      'Beard grooming, shaving and moustache services.',
    businessTypes: [
      'BEAUTY_SALON',
      'BARBER',
    ],

    subcategories: [

      {
        name: 'Beard Trim',
        audiences: ['MALE'],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Beard Styling',
        audiences: ['MALE'],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Beard Coloring',
        audiences: ['MALE'],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Beard Treatment',
        audiences: ['MALE'],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Shaving',
        audiences: ['MALE'],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Head Shave',
        audiences: ['MALE'],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Moustache',
        audiences: ['MALE'],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },
    ],
  },

  // ==========================================================
  // FACIAL
  // ==========================================================

  {
    name: 'Facial',
    description:
      'Facial treatments for cleansing, hydration, brightening and skin care.',
    businessTypes: [
      'BEAUTY_SALON',
      'SPA_WELLNESS',
    ],

    subcategories: [

      {
        name: 'Basic Facial',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Fruit Facial',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Herbal Facial',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Gold Facial',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Diamond Facial',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Pearl Facial',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Brightening Facial',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Hydrating Facial',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Anti-Aging Facial',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Acne Facial',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'De-Tan Facial',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Bridal Facial',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Premium Facial',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },
    ],
  },

  // ==========================================================
  // SKIN CARE
  // ==========================================================

  {
    name: 'Skin Care',
    description:
      'Skin cleansing, hydration, brightening and specialized skin care services.',
    businessTypes: [
      'BEAUTY_SALON',
      'SPA_WELLNESS',
    ],

    subcategories: [

      {
        name: 'Cleanup',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'De-Tan',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Skin Polishing',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Skin Brightening',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Skin Hydration',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Acne Care',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Anti-Aging',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Skin Consultation',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },
    ],
  },

  // ==========================================================
  // MAKEUP
  // ==========================================================

  {
    name: 'Makeup',
    description:
      'Professional makeup services for events, weddings and special occasions.',
    businessTypes: [
      'BEAUTY_SALON',
    ],

    subcategories: [

      {
        name: 'Party Makeup',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Bridal Makeup',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Engagement Makeup',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Reception Makeup',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'HD Makeup',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Airbrush Makeup',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Eye Makeup',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Makeup Consultation',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },
    ],
  },

  // ==========================================================
  // THREADING
  // ==========================================================

  {
    name: 'Threading',
    description:
      'Threading services for facial hair and eyebrow shaping.',
    businessTypes: [
      'BEAUTY_SALON',
    ],

    subcategories: [

      {
        name: 'Eyebrow',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Upper Lip',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Lower Lip',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Chin',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Forehead',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Full Face',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },
    ],
  },

  // ==========================================================
  // WAXING
  // ==========================================================

  {
    name: 'Waxing',
    description:
      'Body waxing and hair removal services.',
    businessTypes: [
      'BEAUTY_SALON',
      'SPA_WELLNESS',
    ],

    subcategories: [

      {
        name: 'Face Waxing',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Underarm Waxing',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Hand Waxing',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Leg Waxing',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Back Waxing',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Chest Waxing',
        audiences: ['MALE'],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Stomach Waxing',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Full Body Waxing',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Bikini Waxing',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Premium Waxing',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },
    ],
  },

  // ==========================================================
  // MANICURE
  // ==========================================================

  {
    name: 'Manicure',
    description:
      'Hand and nail care services.',
    businessTypes: [
      'BEAUTY_SALON',
      'SPA_WELLNESS',
    ],

    subcategories: [

      {
        name: 'Basic Manicure',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Spa Manicure',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Gel Manicure',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'French Manicure',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Premium Manicure',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Nail Art',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },
    ],
  },

  // ==========================================================
  // PEDICURE
  // ==========================================================

  {
    name: 'Pedicure',
    description:
      'Foot and nail care services.',
    businessTypes: [
      'BEAUTY_SALON',
      'SPA_WELLNESS',
    ],

    subcategories: [

      {
        name: 'Basic Pedicure',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Spa Pedicure',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Gel Pedicure',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'French Pedicure',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Foot Spa',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Premium Pedicure',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },
    ],
  },

  // ==========================================================
  // NAIL EXTENSIONS
  // ==========================================================

  {
    name: 'Nail Extensions',
    description:
      'Nail extension, repair and nail art services.',
    businessTypes: [
      'BEAUTY_SALON',
    ],

    subcategories: [

      {
        name: 'Acrylic Nails',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Gel Nails',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Polygel Nails',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Nail Tips',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Nail Art',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Nail Removal',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Nail Repair',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },
    ],
  },

  // ==========================================================
  // SPA & MASSAGE
  // ==========================================================

  {
    name: 'Spa & Massage',
    description:
      'Massage, relaxation and wellness services.',
    businessTypes: [
      'SPA_WELLNESS',
    ],

    subcategories: [

      {
        name: 'Full Body Massage',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Swedish Massage',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Deep Tissue Massage',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Thai Massage',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Aromatherapy',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Hot Stone Massage',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Head Massage',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Back Massage',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Foot Massage',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Couple Massage',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Relaxation Massage',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },
    ],
  },

  // ==========================================================
  // BODY CARE
  // ==========================================================

  {
    name: 'Body Care',
    description:
      'Body exfoliation, hydration and wellness services.',
    businessTypes: [
      'SPA_WELLNESS',
    ],

    subcategories: [

      {
        name: 'Body Scrub',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Body Polish',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Body Wrap',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Body De-Tan',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Body Hydration',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Steam',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Sauna',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Jacuzzi',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'SPA_WELLNESS',
        ],
      },
    ],
  },

  // ==========================================================
  // HAIR REMOVAL
  // ==========================================================

  {
    name: 'Hair Removal',
    description:
      'Hair removal services including waxing and advanced hair removal.',
    businessTypes: [
      'BEAUTY_SALON',
      'SPA_WELLNESS',
    ],

    subcategories: [

      {
        name: 'Face Hair Removal',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Underarm Hair Removal',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Hand Hair Removal',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Leg Hair Removal',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Back Hair Removal',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Chest Hair Removal',
        audiences: ['MALE'],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Full Body Hair Removal',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },

      {
        name: 'Laser Hair Removal',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
          'SPA_WELLNESS',
        ],
      },
    ],
  },

  // ==========================================================
  // BRIDAL
  // ==========================================================

  {
    name: 'Bridal',
    description:
      'Bridal beauty, makeup, hair and pre-bridal services.',
    businessTypes: [
      'BEAUTY_SALON',
    ],

    subcategories: [

      {
        name: 'Bridal Makeup',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Bridal Hair',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Pre-Bridal',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Bridal Facial',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Bridal Waxing',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Bridal Package',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Bridal Consultation',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },
    ],
  },

  // ==========================================================
  // GROOM
  // ==========================================================

  {
    name: 'Groom',
    description:
      'Grooming, styling and pre-groom services for men.',
    businessTypes: [
      'BEAUTY_SALON',
      'BARBER',
    ],

    subcategories: [

      {
        name: 'Groom Hair',
        audiences: ['MALE'],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Groom Facial',
        audiences: ['MALE'],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Groom Beard',
        audiences: ['MALE'],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Pre-Groom',
        audiences: ['MALE'],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Groom Package',
        audiences: ['MALE'],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Groom Consultation',
        audiences: ['MALE'],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },
    ],
  },

  // ==========================================================
  // KIDS
  // ==========================================================

  {
    name: 'Kids',
    description:
      'Beauty and grooming services designed for children.',
    businessTypes: [
      'BEAUTY_SALON',
      'BARBER',
    ],

    subcategories: [

      {
        name: 'Kids Hair Cut',
        audiences: ['KIDS'],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Kids Hair Styling',
        audiences: ['KIDS'],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Kids Hair Wash',
        audiences: ['KIDS'],
        businessTypes: [
          'BEAUTY_SALON',
          'BARBER',
        ],
      },

      {
        name: 'Kids Manicure',
        audiences: ['KIDS'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Kids Pedicure',
        audiences: ['KIDS'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Kids Basic Facial',
        audiences: ['KIDS'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },
    ],
  },

  // ==========================================================
  // LASHES & BROWS
  // ==========================================================

  {
    name: 'Lashes & Brows',
    description:
      'Eyelash and eyebrow styling services.',
    businessTypes: [
      'BEAUTY_SALON',
    ],

    subcategories: [

      {
        name: 'Eyelash Extensions',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Lash Lift',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Lash Tint',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Brow Shaping',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Brow Tint',
        audiences: [
          'FEMALE',
          'MALE',
        ],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Brow Lamination',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },
    ],
  },

  // ==========================================================
  // PERMANENT BEAUTY
  // ==========================================================

  {
    name: 'Permanent Beauty',
    description:
      'Semi-permanent and permanent beauty enhancement services.',
    businessTypes: [
      'BEAUTY_SALON',
    ],

    subcategories: [

      {
        name: 'Microblading',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Powder Brows',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Lip Blush',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Permanent Eyeliner',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },

      {
        name: 'Permanent Makeup Consultation',
        audiences: ['FEMALE'],
        businessTypes: [
          'BEAUTY_SALON',
        ],
      },
    ],
  },
];

// ============================================================
// RESOLVE BUSINESS TYPE IDs
// ============================================================

function mapBusinessTypes(
  businessTypes: BusinessType[],
  keys: BusinessTypeKey[]
): string[] {

  const map =
    resolveBusinessTypeIds(
      businessTypes
    );

  return Array.from(
    new Set(
      keys.map(
        (key) => map[key]
      )
    )
  );
}

// ============================================================
// CREATE CATEGORY
// ============================================================

async function createCategory(
  category: SeedCategory,
  businessTypes: BusinessType[]
): Promise<string> {

  console.log('');
  console.log(
    `📁 Category: ${category.name}`
  );

  const businessTypeIds =
    mapBusinessTypes(
      businessTypes,
      category.businessTypes
    );

  try {

    const response =
      await client.mutate({
        mutation:
          CREATE_CATEGORY,

        variables: {
          input: {
            name:
              category.name,

            description:
              category.description ||
              '',

            status:
              'ACTIVE',

            businessTypeIds,
          },
        },

        fetchPolicy:
          'no-cache',
      });

    const result =
      response.data?.createCategory;

    if (!result) {
      throw new Error(
        'No response received from createCategory'
      );
    }

    if (
      result.success &&
      result.category
    ) {

      console.log(
        `   ✅ Created category: ${category.name}`
      );

      console.log(
        `   ID: ${result.category.categoryId}`
      );

      return result.category.categoryId;
    }

    if (
      !result.success &&
      result.category
    ) {

      console.log(
        `   ℹ️ Category already exists: ${category.name}`
      );

      console.log(
        `   ID: ${result.category.categoryId}`
      );

      return result.category.categoryId;
    }

    throw new Error(
      result.message ||
      `Failed to create category "${category.name}"`
    );

  } catch (error: any) {

    console.error(
      `   ❌ Category failed: ${category.name}`
    );

    console.error(
      `   ${error?.message || error}`
    );

    throw error;
  }
}

// ============================================================
// CREATE SUBCATEGORY
// ============================================================

async function createSubcategory(
  category: SeedCategory,
  subcategory: SeedSubcategory,
  categoryId: string,
  businessTypes: BusinessType[]
): Promise<void> {

  const businessTypeIds =
    mapBusinessTypes(
      businessTypes,
      subcategory.businessTypes
    );

  try {

    const response =
      await client.mutate({
        mutation:
          CREATE_SUBCATEGORY,

        variables: {
          input: {

            categoryId,

            name:
              subcategory.name,

            description:
              subcategory.description ||
              '',

            status:
              'ACTIVE',

            audiences:
              subcategory.audiences,

            businessTypeIds,
          },
        },

        fetchPolicy:
          'no-cache',
      });

    const result =
      response.data?.createSubcategory;

    if (!result) {
      throw new Error(
        'No response received from createSubcategory'
      );
    }

    if (
      result.success &&
      result.subcategory
    ) {

      console.log(
        `      ✅ ${subcategory.name}`
      );

      return;
    }

    if (
      !result.success &&
      result.subcategory
    ) {

      console.log(
        `      ℹ️ ${subcategory.name} already exists`
      );

      return;
    }

    throw new Error(
      result.message ||
      `Failed to create subcategory "${subcategory.name}"`
    );

  } catch (error: any) {

    console.error(
      `      ❌ ${subcategory.name}`
    );

    console.error(
      `         ${error?.message || error}`
    );

    throw error;
  }
}

// ============================================================
// FETCH ACTIVE BUSINESS TYPES
// ============================================================

async function getActiveBusinessTypes(): Promise<
  BusinessType[]
> {

  console.log('');
  console.log(
    '=============================================='
  );
  console.log(
    'FETCHING ACTIVE BUSINESS TYPES'
  );
  console.log(
    '=============================================='
  );

  const response =
    await client.query({
      query:
        GET_BUSINESS_TYPES,

      variables: {
        status:
          'ACTIVE',
      },

      fetchPolicy:
        'network-only',
    });

  const result =
    response.data?.businessTypes;

  if (!result) {

    throw new Error(
      'No response received from businessTypes query'
    );
  }

  if (!result.success) {

    throw new Error(
      result.message ||
      'Failed to fetch business types'
    );
  }

  const businessTypes =
    Array.isArray(
      result.businessTypes
    )
      ? result.businessTypes
      : [];

  if (
    businessTypes.length === 0
  ) {

    throw new Error(
      'No ACTIVE business types were found'
    );
  }

  console.log('');

  businessTypes.forEach(
    (businessType: BusinessType) => {

      console.log(
        `   ${businessType.name}`
      );

      console.log(
        `      ID: ${businessType.businessTypeId}`
      );
    }
  );

  return businessTypes;
}

// ============================================================
// VALIDATE REQUIRED BUSINESS TYPES
// ============================================================

function validateRequiredBusinessTypes(
  businessTypes: BusinessType[]
): void {

  const required = [
    'salon',
    'barber',
    'spa & wellness',
  ];

  const available =
    businessTypes.map(
      (item) =>
        normalizeName(item.name)
    );

  const missing =
    required.filter(
      (name) =>
        !available.includes(name)
    );

  if (missing.length > 0) {

    throw new Error(
      `Required business types are missing: ${missing.join(', ')}`
    );
  }
}

// ============================================================
// SEED CATALOG
// ============================================================

async function seedClavataCatalog(): Promise<void> {

  console.log('');
  console.log(
    '============================================================'
  );
  console.log(
    '              CLAVATA CATALOG SEED'
  );
  console.log(
    '============================================================'
  );

  console.log('');
  console.log(
    `GraphQL URL: ${GRAPHQL_URL}`
  );

  // ----------------------------------------------------------
  // BUSINESS TYPES
  // ----------------------------------------------------------

  const businessTypes =
    await getActiveBusinessTypes();

  validateRequiredBusinessTypes(
    businessTypes
  );

  // Force resolution now so the script fails early
  // if one of the required business types is missing.
  const businessTypeIds =
    resolveBusinessTypeIds(
      businessTypes
    );

  console.log('');
  console.log(
    '=============================================='
  );
  console.log(
    'BUSINESS TYPE IDS'
  );
  console.log(
    '=============================================='
  );

  console.log(
    `Beauty Salon: ${businessTypeIds.BEAUTY_SALON}`
  );

  console.log(
    `Barber: ${businessTypeIds.BARBER}`
  );

  console.log(
    `Spa & Wellness: ${businessTypeIds.SPA_WELLNESS}`
  );

  // ----------------------------------------------------------
  // COUNTERS
  // ----------------------------------------------------------

  let categoriesCreated = 0;
  let categoriesExisting = 0;

  let subcategoriesCreated = 0;
  let subcategoriesExisting = 0;

  let failedCategories = 0;
  let failedSubcategories = 0;

  // ----------------------------------------------------------
  // CATEGORY LOOP
  // ----------------------------------------------------------

  for (
    const category of CATALOG
  ) {

    let categoryId: string;

    try {

      // Determine whether this category already exists
      // based on the response from createCategory.

      const businessTypeIdsForCategory =
        mapBusinessTypes(
          businessTypes,
          category.businessTypes
        );

      console.log('');
      console.log(
        '----------------------------------------------'
      );

      console.log(
        `CATEGORY: ${category.name}`
      );

      console.log(
        `Business Types: ${category.businessTypes.join(', ')}`
      );

      console.log(
        `Business Type IDs: ${businessTypeIdsForCategory.join(', ')}`
      );

      const categoryResponse =
        await client.mutate({
          mutation:
            CREATE_CATEGORY,

          variables: {
            input: {

              name:
                category.name,

              description:
                category.description ||
                '',

              status:
                'ACTIVE',

              businessTypeIds:
                businessTypeIdsForCategory,
            },
          },

          fetchPolicy:
            'no-cache',
        });

      const result =
        categoryResponse.data?.createCategory;

      if (!result) {

        throw new Error(
          'No response received from createCategory'
        );
      }

      if (
        result.success &&
        result.category
      ) {

        categoriesCreated++;

        categoryId =
          result.category.categoryId;

        console.log(
          `✅ Category created`
        );

        console.log(
          `   ID: ${categoryId}`
        );

      } else if (
        !result.success &&
        result.category
      ) {

        categoriesExisting++;

        categoryId =
          result.category.categoryId;

        console.log(
          `ℹ️ Category already exists`
        );

        console.log(
          `   ID: ${categoryId}`
        );

      } else {

        throw new Error(
          result.message ||
          `Failed to create category "${category.name}"`
        );
      }

    } catch (error: any) {

      failedCategories++;

      console.error('');
      console.error(
        `❌ CATEGORY FAILED: ${category.name}`
      );

      console.error(
        error?.message || error
      );

      // Continue with the next category
      // instead of terminating the entire seed.
      continue;
    }

    // --------------------------------------------------------
    // SUBCATEGORIES
    // --------------------------------------------------------

    console.log(
      `   Subcategories: ${category.subcategories.length}`
    );

    for (
      const subcategory of category.subcategories
    ) {

      try {

        const businessTypeIdsForSubcategory =
          mapBusinessTypes(
            businessTypes,
            subcategory.businessTypes
          );

        const response =
          await client.mutate({
            mutation:
              CREATE_SUBCATEGORY,

            variables: {
              input: {

                categoryId,

                name:
                  subcategory.name,

                description:
                  subcategory.description ||
                  '',

                status:
                  'ACTIVE',

                audiences:
                  subcategory.audiences,

                businessTypeIds:
                  businessTypeIdsForSubcategory,
              },
            },

            fetchPolicy:
              'no-cache',
          });

        const result =
          response.data?.createSubcategory;

        if (!result) {

          throw new Error(
            'No response received from createSubcategory'
          );
        }

        if (
          result.success &&
          result.subcategory
        ) {

          subcategoriesCreated++;

          console.log(
            `   ✅ ${subcategory.name}`
          );

        } else if (
          !result.success &&
          result.subcategory
        ) {

          subcategoriesExisting++;

          console.log(
            `   ℹ️ ${subcategory.name} already exists`
          );

        } else {

          throw new Error(
            result.message ||
            `Failed to create subcategory "${subcategory.name}"`
          );
        }

      } catch (error: any) {

        failedSubcategories++;

        console.error(
          `   ❌ ${subcategory.name}`
        );

        console.error(
          `      ${error?.message || error}`
        );

        // Continue to next subcategory
        // rather than stopping the entire seed.
        continue;
      }
    }
  }

  // ----------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------

  console.log('');
  console.log('');
  console.log(
    '============================================================'
  );

  console.log(
    '                 SEED COMPLETED'
  );

  console.log(
    '============================================================'
  );

  console.log('');

  console.log(
    `Categories created:       ${categoriesCreated}`
  );

  console.log(
    `Categories already exist: ${categoriesExisting}`
  );

  console.log(
    `Categories failed:        ${failedCategories}`
  );

  console.log('');

  console.log(
    `Subcategories created:       ${subcategoriesCreated}`
  );

  console.log(
    `Subcategories already exist: ${subcategoriesExisting}`
  );

  console.log(
    `Subcategories failed:        ${failedSubcategories}`
  );

  console.log('');

  console.log(
    `Total categories: ${CATALOG.length}`
  );

  console.log(
    `Total subcategories: ${
      CATALOG.reduce(
        (total, category) =>
          total +
          category.subcategories.length,
        0
      )
    }`
  );

  console.log('');

  if (
    failedCategories === 0 &&
    failedSubcategories === 0
  ) {

    console.log(
      '🎉 All catalog records processed successfully.'
    );

  } else {

    console.log(
      '⚠️ Seed completed with some errors.'
    );

    console.log(
      'Review the errors printed above.'
    );
  }

  console.log('');
  console.log(
    '============================================================'
  );
}

// ============================================================
// RUN
// ============================================================

seedClavataCatalog()
  .then(() => {

    console.log('');
    console.log(
      'Catalog seed process finished.'
    );

    process.exit(0);
  })
  .catch((error: any) => {

    console.error('');
    console.error(
      '============================================================'
    );

    console.error(
      '                 SEED FAILED'
    );

    console.error(
      '============================================================'
    );

    console.error('');

    console.error(
      error?.message ||
      error
    );

    console.error('');

    process.exit(1);
  });
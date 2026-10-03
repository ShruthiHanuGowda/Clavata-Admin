import dotenv from 'dotenv';

dotenv.config();

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
} from '@apollo/client';

import {
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

type SeedSubcategory = {
  name: string;
  description: string;
  audiences: Audience[];
};

type SeedCategory = {
  name: string;
  description: string;
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
// AUDIENCE HELPERS
// ============================================================

const FEMALE: Audience[] = [
  'FEMALE',
];

const MALE: Audience[] = [
  'MALE',
];

const FEMALE_MALE: Audience[] = [
  'FEMALE',
  'MALE',
];

const ALL_AUDIENCES: Audience[] = [
  'FEMALE',
  'MALE',
  'KIDS',
];

const KIDS: Audience[] = [
  'KIDS',
];

// ============================================================
// SUBCATEGORY HELPER
// ============================================================

function sub(
  name: string,
  audiences: Audience[],
  description: string
): SeedSubcategory {
  return {
    name,
    audiences,
    description,
  };
}

// ============================================================
// MASTER CATALOG
// ============================================================
//
// Category
//      ↓
// Subcategory
//      ↓
// Provider-created Service
//
// IMPORTANT:
//
// 1. Business type is NOT part of the catalog.
//
// 2. Category/subcategory are standardized by Clavata.
//
// 3. Provider creates the actual service.
//
// 4. Provider enters:
//      - Service Name
//      - Price
//      - Duration
//      - Audience
//      - Popular
//      - Active
//
// Example:
//
// Facial & Skin Care
//      ↓
// Facial
//      ↓
// Service Name: Gold Facial
// Price: ₹800
// Duration: 60 minutes
// Audience: FEMALE
//
// Another salon can create:
//
// Facial & Skin Care
//      ↓
// Facial
//      ↓
// Service Name: Premium Hydrating Facial
// Price: ₹1,200
// Duration: 75 minutes
// Audience: FEMALE
//
// ============================================================

const CATALOG: SeedCategory[] = [

  // ==========================================================
  // 1. HAIR
  // ==========================================================

  {
    name: 'Hair',

    description:
      'Hair cutting, styling, coloring, treatment and hair care services.',

    subcategories: [

      sub(
        'Hair Cut',
        ALL_AUDIENCES,
        'Hair cutting services tailored to the customer’s preferred length, shape and style.'
      ),

      sub(
        'Hair Styling',
        ALL_AUDIENCES,
        'Professional hair styling services for everyday looks, occasions and special events.'
      ),

      sub(
        'Hair Wash',
        ALL_AUDIENCES,
        'Professional hair washing and cleansing services.'
      ),

      sub(
        'Hair Color',
        FEMALE_MALE,
        'Professional hair coloring services for full or partial hair coloring and color changes.'
      ),

      sub(
        'Hair Treatment',
        FEMALE_MALE,
        'Professional hair treatments designed to improve hair condition, texture, appearance and manageability.'
      ),

      sub(
        'Hair Care',
        FEMALE_MALE,
        'General hair and scalp care services focused on maintaining healthy-looking hair.'
      ),
    ],
  },

  // ==========================================================
  // 2. BEARD & GROOMING
  // ==========================================================

  {
    name: 'Beard & Grooming',

    description:
      'Beard grooming, shaving, moustache styling and men’s grooming services.',

    subcategories: [

      sub(
        'Beard Grooming',
        MALE,
        'Beard trimming, shaping, styling and general beard grooming services.'
      ),

      sub(
        'Shaving',
        MALE,
        'Professional facial and head shaving services for a clean and groomed appearance.'
      ),

      sub(
        'Moustache',
        MALE,
        'Moustache trimming, shaping and styling services.'
      ),

      sub(
        'Men’s Grooming',
        MALE,
        'General grooming services for men including hair, beard and personal grooming.'
      ),
    ],
  },

  // ==========================================================
  // 3. FACIAL & SKIN CARE
  // ==========================================================

  {
    name: 'Facial & Skin Care',

    description:
      'Facial treatments, skin cleansing, hydration, brightening and specialized skin care services.',

    subcategories: [

      sub(
        'Facial',
        FEMALE_MALE,
        'Professional facial treatments for cleansing, exfoliation, hydration and overall skin care.'
      ),

      sub(
        'Skin Care',
        FEMALE_MALE,
        'Professional skin care services tailored to different skin needs and concerns.'
      ),

      sub(
        'Cleanup',
        FEMALE_MALE,
        'Basic skin cleansing services designed to remove impurities and refresh the skin.'
      ),

      sub(
        'De-Tan',
        FEMALE_MALE,
        'Skin care services focused on reducing the appearance of tanning and uneven skin tone.'
      ),
    ],
  },

  // ==========================================================
  // 4. MAKEUP & BRIDAL
  // ==========================================================

  {
    name: 'Makeup & Bridal',

    description:
      'Professional makeup, bridal beauty, wedding hair and pre-wedding preparation services.',

    subcategories: [

      sub(
        'Makeup',
        FEMALE,
        'Professional makeup services for celebrations, events, photography and special occasions.'
      ),

      sub(
        'Bridal',
        FEMALE,
        'Bridal beauty services including makeup, hair and wedding-day preparation.'
      ),

      sub(
        'Pre-Bridal',
        FEMALE,
        'Beauty and grooming services designed for preparation before the wedding.'
      ),
    ],
  },

  // ==========================================================
  // 5. THREADING & HAIR REMOVAL
  // ==========================================================

  {
    name: 'Threading & Hair Removal',

    description:
      'Threading, waxing and other facial and body hair removal services.',

    subcategories: [

      sub(
        'Threading',
        FEMALE_MALE,
        'Threading services for facial hair grooming and shaping.'
      ),

      sub(
        'Waxing',
        FEMALE_MALE,
        'Professional waxing services for facial and body hair removal.'
      ),

      sub(
        'Hair Removal',
        FEMALE_MALE,
        'Facial and body hair removal services using suitable professional techniques.'
      ),
    ],
  },

  // ==========================================================
  // 6. NAILS
  // ==========================================================

  {
    name: 'Nails',

    description:
      'Manicure, pedicure, nail enhancement, nail art and nail care services.',

    subcategories: [

      sub(
        'Manicure',
        FEMALE_MALE,
        'Hand and nail grooming services including nail shaping, cleaning and care.'
      ),

      sub(
        'Pedicure',
        FEMALE_MALE,
        'Foot and nail grooming services including cleaning, shaping and foot care.'
      ),

      sub(
        'Nail Extensions',
        FEMALE_MALE,
        'Professional nail enhancement and extension services for length, shape and appearance.'
      ),

      sub(
        'Nail Art',
        FEMALE_MALE,
        'Decorative nail styling services using professional nail art techniques and designs.'
      ),

      sub(
        'Nail Care',
        FEMALE_MALE,
        'General nail care, maintenance, repair and enhancement services.'
      ),
    ],
  },

  // ==========================================================
  // 7. SPA & MASSAGE
  // ==========================================================

  {
    name: 'Spa & Massage',

    description:
      'Massage, relaxation and wellness services for physical comfort and relaxation.',

    subcategories: [

      sub(
        'Massage',
        FEMALE_MALE,
        'Professional massage services using different techniques based on customer needs.'
      ),

      sub(
        'Spa',
        FEMALE_MALE,
        'Relaxation and wellness treatments provided in a spa environment.'
      ),
    ],
  },

  // ==========================================================
  // 8. BODY CARE & WELLNESS
  // ==========================================================

  {
    name: 'Body Care & Wellness',

    description:
      'Body exfoliation, hydration, heat-based relaxation and wellness services.',

    subcategories: [

      sub(
        'Body Care',
        FEMALE_MALE,
        'Professional body care services focused on cleansing, exfoliation, hydration and skin care.'
      ),

      sub(
        'Body Treatment',
        FEMALE_MALE,
        'Specialized body treatments designed to improve skin appearance, hydration and overall care.'
      ),

      sub(
        'Wellness',
        FEMALE_MALE,
        'Relaxation and wellness services designed to support comfort and overall well-being.'
      ),
    ],
  },

  // ==========================================================
  // 9. LASHES & BROWS
  // ==========================================================

  {
    name: 'Lashes & Brows',

    description:
      'Eyelash and eyebrow styling, enhancement and grooming services.',

    subcategories: [

      sub(
        'Lashes',
        FEMALE,
        'Eyelash grooming, enhancement and styling services.'
      ),

      sub(
        'Brows',
        FEMALE_MALE,
        'Eyebrow shaping, grooming, tinting and enhancement services.'
      ),
    ],
  },

  // ==========================================================
  // 10. KIDS
  // ==========================================================

  {
    name: 'Kids',

    description:
      'Beauty and grooming services designed specifically for children.',

    subcategories: [

      sub(
        'Kids Hair',
        KIDS,
        'Hair cutting, washing and styling services designed specifically for children.'
      ),

      sub(
        'Kids Nails',
        KIDS,
        'Gentle manicure and pedicure services designed specifically for children.'
      ),

      sub(
        'Kids Skin Care',
        KIDS,
        'Gentle basic skin care and facial services designed specifically for children.'
      ),
    ],
  },
];

// ============================================================
// CATALOG VALIDATION
// ============================================================

function validateCatalog(): void {

  console.log('');
  console.log(
    '============================================================'
  );
  console.log(
    'CATALOG VALIDATION'
  );
  console.log(
    '============================================================'
  );

  // ----------------------------------------------------------
  // Category count
  // ----------------------------------------------------------

  if (CATALOG.length !== 10) {
    throw new Error(
      `Expected 10 categories, found ${CATALOG.length}.`
    );
  }

  // ----------------------------------------------------------
  // Category duplicate validation
  // ----------------------------------------------------------

  const categoryNames =
    CATALOG.map(
      category =>
        category.name.trim().toLowerCase()
    );

  const duplicateCategories =
    categoryNames.filter(
      (name, index) =>
        categoryNames.indexOf(name) !== index
    );

  if (
    duplicateCategories.length > 0
  ) {
    throw new Error(
      `Duplicate categories found: ${[
        ...new Set(duplicateCategories),
      ].join(', ')}`
    );
  }

  // ----------------------------------------------------------
  // Forbidden old categories
  // ----------------------------------------------------------

  const forbiddenCategories = [
    'Permanent Beauty',
    'Tattoo & Piercing',
  ];

  for (
    const category of CATALOG
  ) {

    if (
      forbiddenCategories.some(
        forbidden =>
          category.name
            .trim()
            .toLowerCase() ===
          forbidden.toLowerCase()
      )
    ) {
      throw new Error(
        `Forbidden category found: ${category.name}`
      );
    }
  }

  // ----------------------------------------------------------
  // Subcategory validation
  // ----------------------------------------------------------

  let totalSubcategories = 0;

  for (
    const category of CATALOG
  ) {

    if (
      !category.name.trim()
    ) {
      throw new Error(
        'A category contains an empty name.'
      );
    }

    if (
      !category.description.trim()
    ) {
      throw new Error(
        `Category "${category.name}" has no description.`
      );
    }

    if (
      category.subcategories.length === 0
    ) {
      throw new Error(
        `Category "${category.name}" has no subcategories.`
      );
    }

    const names =
      category.subcategories.map(
        item =>
          item.name.trim().toLowerCase()
      );

    const duplicates =
      names.filter(
        (name, index) =>
          names.indexOf(name) !== index
      );

    if (
      duplicates.length > 0
    ) {
      throw new Error(
        `Duplicate subcategories in "${category.name}": ${[
          ...new Set(duplicates),
        ].join(', ')}`
      );
    }

    for (
      const subcategory of
      category.subcategories
    ) {

      totalSubcategories++;

      if (
        !subcategory.name.trim()
      ) {
        throw new Error(
          `Empty subcategory in "${category.name}".`
        );
      }

      if (
        !subcategory.description.trim()
      ) {
        throw new Error(
          `Missing description for "${category.name} > ${subcategory.name}".`
        );
      }

      if (
        subcategory.audiences.length === 0
      ) {
        throw new Error(
          `No audience configured for "${category.name} > ${subcategory.name}".`
        );
      }

      const uniqueAudiences =
        new Set(
          subcategory.audiences
        );

      if (
        uniqueAudiences.size !==
        subcategory.audiences.length
      ) {
        throw new Error(
          `Duplicate audiences found for "${category.name} > ${subcategory.name}".`
        );
      }
    }
  }

  // ----------------------------------------------------------
  // Expected simplified catalog
  // ----------------------------------------------------------

  const EXPECTED_SUBCATEGORY_COUNT = 35;

  if (
    totalSubcategories !==
    EXPECTED_SUBCATEGORY_COUNT
  ) {
    throw new Error(
      `Expected ${EXPECTED_SUBCATEGORY_COUNT} subcategories, found ${totalSubcategories}.`
    );
  }

  console.log('');
  console.log(
    '✓ Category count: 10'
  );

  console.log(
    `✓ Subcategory count: ${totalSubcategories}`
  );

  console.log(
    '✓ Duplicate category validation passed'
  );

  console.log(
    '✓ Duplicate subcategory validation passed'
  );

  console.log(
    '✓ Description validation passed'
  );

  console.log(
    '✓ Audience validation passed'
  );

  console.log(
    '✓ Old catalog validation passed'
  );

  console.log('');
  console.log(
    '✓ CATALOG VALIDATION PASSED'
  );

  console.log(
    '============================================================'
  );
}

// ============================================================
// CREATE CATEGORY
// ============================================================

async function createCategory(
  category: SeedCategory
): Promise<{
  categoryId: string;
  existed: boolean;
}> {

  console.log('');
  console.log(
    '------------------------------------------------------------'
  );

  console.log(
    `CATEGORY: ${category.name}`
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
              category.description,

            status:
              'ACTIVE',
          },
        },

        fetchPolicy:
          'no-cache',
      });

    const result =
      response.data?.createCategory;

    if (!result) {
      throw new Error(
        'No response received from createCategory.'
      );
    }

    // --------------------------------------------------------
    // Created
    // --------------------------------------------------------

    if (
      result.success === true &&
      result.category
    ) {

      console.log(
        '   ✓ Category created'
      );

      console.log(
        `   ID: ${result.category.categoryId}`
      );

      return {
        categoryId:
          result.category.categoryId,

        existed:
          false,
      };
    }

    // --------------------------------------------------------
    // Existing
    // --------------------------------------------------------

    if (
      result.success === false &&
      result.category
    ) {

      console.log(
        '   ℹ Category already exists'
      );

      console.log(
        `   ID: ${result.category.categoryId}`
      );

      return {
        categoryId:
          result.category.categoryId,

        existed:
          true,
      };
    }

    throw new Error(
      result.message ||
      `Failed to create category "${category.name}".`
    );

  } catch (error: any) {

    console.error(
      `   ✗ Category failed: ${category.name}`
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
  subcategory: SeedSubcategory,
  categoryId: string
): Promise<{
  existed: boolean;
}> {

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
              subcategory.description,

            status:
              'ACTIVE',

            audiences:
              subcategory.audiences,
          },
        },

        fetchPolicy:
          'no-cache',
      });

    const result =
      response.data?.createSubcategory;

    if (!result) {
      throw new Error(
        'No response received from createSubcategory.'
      );
    }

    // --------------------------------------------------------
    // Created
    // --------------------------------------------------------

    if (
      result.success === true &&
      result.subcategory
    ) {

      console.log(
        `   ✓ ${subcategory.name}`
      );

      return {
        existed:
          false,
      };
    }

    // --------------------------------------------------------
    // Existing
    // --------------------------------------------------------

    if (
      result.success === false &&
      result.subcategory
    ) {

      console.log(
        `   ℹ ${subcategory.name} already exists`
      );

      return {
        existed:
          true,
      };
    }

    throw new Error(
      result.message ||
      `Failed to create subcategory "${subcategory.name}".`
    );

  } catch (error: any) {

    console.error(
      `   ✗ ${subcategory.name}`
    );

    console.error(
      `      ${error?.message || error}`
    );

    throw error;
  }
}

// ============================================================
// SEED CATALOG
// ============================================================

async function seedClavataCatalog(): Promise<void> {

  // ----------------------------------------------------------
  // Validate everything BEFORE making mutations
  // ----------------------------------------------------------

  validateCatalog();

  console.log('');
  console.log('');
  console.log(
    '============================================================'
  );

  console.log(
    '             CLAVATA MASTER CATALOG SEED'
  );

  console.log(
    '============================================================'
  );

  console.log('');

  console.log(
    `GraphQL URL: ${GRAPHQL_URL}`
  );

  console.log('');

  console.log(
    'Catalog structure:'
  );

  console.log(
    '   Category'
  );

  console.log(
    '      ↓'
  );

  console.log(
    '   Subcategory'
  );

  console.log(
    '      ↓'
  );

  console.log(
    '   Provider-created Service'
  );

  console.log('');

  console.log(
    'Business types: NOT USED'
  );

  console.log(
    'Service names: NOT SEEDED'
  );

  console.log(
    'Prices: NOT SEEDED'
  );

  console.log(
    'Durations: NOT SEEDED'
  );

  console.log('');

  // ----------------------------------------------------------
  // Counters
  // ----------------------------------------------------------

  let categoriesCreated = 0;
  let categoriesExisting = 0;
  let categoriesFailed = 0;

  let subcategoriesCreated = 0;
  let subcategoriesExisting = 0;
  let subcategoriesFailed = 0;

  // ----------------------------------------------------------
  // Seed categories
  // ----------------------------------------------------------

  for (
    const category of CATALOG
  ) {

    let categoryResult: {
      categoryId: string;
      existed: boolean;
    };

    try {

      categoryResult =
        await createCategory(
          category
        );

      if (
        categoryResult.existed
      ) {

        categoriesExisting++;

      } else {

        categoriesCreated++;
      }

    } catch {

      categoriesFailed++;

      /*
       * Cannot safely create subcategories without
       * a valid category ID.
       */
      continue;
    }

    console.log('');

    console.log(
      `   Subcategories: ${category.subcategories.length}`
    );

    // --------------------------------------------------------
    // Seed subcategories
    // --------------------------------------------------------

    for (
      const subcategory of
      category.subcategories
    ) {

      try {

        const result =
          await createSubcategory(
            subcategory,
            categoryResult.categoryId
          );

        if (
          result.existed
        ) {

          subcategoriesExisting++;

        } else {

          subcategoriesCreated++;
        }

      } catch {

        subcategoriesFailed++;

        /*
         * Continue with next subcategory.
         */
        continue;
      }
    }
  }

  // ----------------------------------------------------------
  // Summary
  // ----------------------------------------------------------

  const totalSubcategories =
    CATALOG.reduce(
      (
        total,
        category
      ) =>
        total +
        category.subcategories.length,
      0
    );

  console.log('');
  console.log('');
  console.log(
    '============================================================'
  );

  console.log(
    '                  SEED SUMMARY'
  );

  console.log(
    '============================================================'
  );

  console.log('');

  console.log(
    'CATEGORIES'
  );

  console.log(
    `   Expected : ${CATALOG.length}`
  );

  console.log(
    `   Created  : ${categoriesCreated}`
  );

  console.log(
    `   Existing : ${categoriesExisting}`
  );

  console.log(
    `   Failed   : ${categoriesFailed}`
  );

  console.log('');

  console.log(
    'SUBCATEGORIES'
  );

  console.log(
    `   Expected : ${totalSubcategories}`
  );

  console.log(
    `   Created  : ${subcategoriesCreated}`
  );

  console.log(
    `   Existing : ${subcategoriesExisting}`
  );

  console.log(
    `   Failed   : ${subcategoriesFailed}`
  );

  console.log('');

  console.log(
    'SERVICE CREATION'
  );

  console.log(
    '   Services created by provider during onboarding/configuration.'
  );

  console.log(
    '   This seed does NOT create service records.'
  );

  console.log('');

  if (
    categoriesFailed === 0 &&
    subcategoriesFailed === 0
  ) {

    console.log(
      '✓ CLAVATA CATALOG SEED COMPLETED SUCCESSFULLY'
    );

  } else {

    console.log(
      '⚠ CLAVATA CATALOG SEED COMPLETED WITH ERRORS'
    );

    console.log(
      'Review the errors above.'
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
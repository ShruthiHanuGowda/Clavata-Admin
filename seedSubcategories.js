const {
  DynamoDBClient
} = require('@aws-sdk/client-dynamodb');

const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand
} = require('@aws-sdk/lib-dynamodb');

const crypto = require('crypto');

// =========================================================
// CONFIG
// =========================================================

const REGION =
  process.env.AWS_REGION ||
  'ap-south-2';

const CATEGORY_TABLE =
  process.argv[2];

const SUBCATEGORY_TABLE =
  process.argv[3];

if (!CATEGORY_TABLE) {
  console.error('');
  console.error(
    'ERROR: Category table name is required.'
  );
  console.error(
    'Usage: node seedSubcategories.js <CategoryTable> <SubcategoryTable>'
  );
  console.error('');
  process.exit(1);
}

if (!SUBCATEGORY_TABLE) {
  console.error('');
  console.error(
    'ERROR: Subcategory table name is required.'
  );
  console.error(
    'Usage: node seedSubcategories.js <CategoryTable> <SubcategoryTable>'
  );
  console.error('');
  process.exit(1);
}

// =========================================================
// DYNAMODB
// =========================================================

const client =
  new DynamoDBClient({
    region: REGION
  });

const dynamoDB =
  DynamoDBDocumentClient.from(
    client
  );

// =========================================================
// BUSINESS TYPE IDS
// =========================================================

const BUSINESS_TYPES = {

  'Spa & Wellness':
    'BT#a21d10d6-3f7b-4c20-9589-49f79387f55b',

  'Beauty Salon':
    'BT#977cd410-88ee-4c69-af3d-457c98dba8e3',

  'Barber':
    'BT#b4f2a582-fda5-471b-a887-3be7ab9458ec'

};

// =========================================================
// AUDIENCES
// =========================================================

const FEMALE =
  'FEMALE';

const MALE =
  'MALE';

const KIDS =
  'KIDS';

const ALL_AUDIENCES = [
  FEMALE,
  MALE,
  KIDS
];

const FEMALE_MALE = [
  FEMALE,
  MALE
];

// =========================================================
// HELPERS
// =========================================================

const normalize =
  value =>
    String(
      value ?? ''
    )
      .trim()
      .toLowerCase();

const sleep =
  ms =>
    new Promise(
      resolve =>
        setTimeout(
          resolve,
          ms
        )
    );

// =========================================================
// VALID VALUES
// =========================================================

const VALID_AUDIENCES = new Set([
  FEMALE,
  MALE,
  KIDS
]);

const VALID_BUSINESS_TYPES =
  new Set(
    Object.keys(
      BUSINESS_TYPES
    )
  );

// =========================================================
// SCAN ALL
// =========================================================

const scanAll =
  async tableName => {

    let items = [];

    let ExclusiveStartKey =
      undefined;

    do {

      const response =
        await dynamoDB.send(
          new ScanCommand({

            TableName:
              tableName,

            ExclusiveStartKey

          })
        );

      if (
        Array.isArray(
          response.Items
        )
      ) {

        items.push(
          ...response.Items
        );

      }

      ExclusiveStartKey =
        response.LastEvaluatedKey;

    } while (
      ExclusiveStartKey
    );

    return items;

  };

// =========================================================
// FIND EXISTING SUBCATEGORY
// =========================================================

const findExistingSubcategory =
  (
    subcategories,
    categoryId,
    name
  ) => {

    return subcategories.find(
      subcategory =>
        String(
          subcategory.categoryId ?? ''
        ).trim() === categoryId &&
        normalize(
          subcategory.name
        ) === normalize(name)
    );

  };

// =========================================================
// SUBCATEGORY MASTER DATA
// =========================================================

const SUBCATEGORIES = {

  // =======================================================
  // HAIR
  // =======================================================

  'Hair': [

    {
      name: 'Hair Cut',
      description:
        'Hair cutting and trimming services.',
      audiences:
        ALL_AUDIENCES,
      businessTypes: [
        'Beauty Salon',
        'Barber'
      ]
    },

    {
      name: 'Hair Styling',
      description:
        'Hair styling and finishing services.',
      audiences:
        ALL_AUDIENCES,
      businessTypes: [
        'Beauty Salon',
        'Barber'
      ]
    },

    {
      name: 'Hair Wash',
      description:
        'Hair washing and cleansing services.',
      audiences:
        ALL_AUDIENCES,
      businessTypes: [
        'Beauty Salon',
        'Barber'
      ]
    },

    {
      name: 'Blow Dry',
      description:
        'Professional blow-drying and hair finishing services.',
      audiences:
        ALL_AUDIENCES,
      businessTypes: [
        'Beauty Salon',
        'Barber'
      ]
    },

    {
      name: 'Hair Color',
      description:
        'Full hair colouring and colour application services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon',
        'Barber'
      ]
    },

    {
      name: 'Hair Highlights',
      description:
        'Hair highlighting and colour highlighting services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Hair Balayage',
      description:
        'Balayage and blended hair colouring services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Hair Straightening',
      description:
        'Hair straightening and smoothing treatments.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Hair Smoothening',
      description:
        'Hair smoothening treatments for reducing frizz and improving manageability.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Keratin Treatment',
      description:
        'Keratin-based hair smoothing and treatment services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Hair Spa',
      description:
        'Hair spa and nourishing scalp and hair treatments.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon',
        'Spa & Wellness'
      ]
    },

    {
      name: 'Scalp Treatment',
      description:
        'Scalp cleansing, nourishment and care treatments.',
      audiences:
        ALL_AUDIENCES,
      businessTypes: [
        'Beauty Salon',
        'Spa & Wellness'
      ]
    },

    {
      name: 'Hair Extensions',
      description:
        'Hair extension application and maintenance services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    }

  ],

  // =======================================================
  // SKIN & FACIAL
  // =======================================================

  'Skin & Facial': [

    {
      name: 'Basic Facial',
      description:
        'Basic facial cleansing and skincare treatment.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon',
        'Spa & Wellness'
      ]
    },

    {
      name: 'Deep Cleansing Facial',
      description:
        'Deep cleansing facial treatment for removing impurities.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon',
        'Spa & Wellness'
      ]
    },

    {
      name: 'Fruit Facial',
      description:
        'Fruit-based facial skincare treatments.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Gold Facial',
      description:
        'Gold facial and glow-enhancing skincare treatment.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Hydrating Facial',
      description:
        'Facial treatments focused on hydration and skin nourishment.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon',
        'Spa & Wellness'
      ]
    },

    {
      name: 'Anti-Aging Facial',
      description:
        'Facial treatments focused on skin rejuvenation and appearance.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon',
        'Spa & Wellness'
      ]
    },

    {
      name: 'Cleanup',
      description:
        'Basic skin cleansing and cleanup services.',
      audiences:
        ALL_AUDIENCES,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Blackhead Removal',
      description:
        'Blackhead and pore cleansing services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'De-Tan',
      description:
        'De-tan skincare treatments.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Face Bleach',
      description:
        'Facial bleaching services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Face Mask',
      description:
        'Professional facial mask and skin treatment services.',
      audiences:
        ALL_AUDIENCES,
      businessTypes: [
        'Beauty Salon',
        'Spa & Wellness'
      ]
    }

  ],

  // =======================================================
  // MAKEUP
  // =======================================================

  'Makeup': [

    {
      name: 'Party Makeup',
      description:
        'Makeup services for parties and social occasions.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    // {
    //   name: 'Engagement Makeup',
    //   description:
    //     'Makeup services for engagement ceremonies.',
    //   audiences:
    //     FEMALE,
    //   businessTypes: [
    //     'Beauty Salon'
    //   ]
    // },

{
  name: 'Bridal Makeup',
  description: 'Professional bridal makeup services.',
  audiences: [FEMALE],
  businessTypes: ['Beauty Salon']
},

    // {
    //   name: 'Reception Makeup',
    //   description:
    //     'Makeup services for wedding reception events.',
    //   audiences:
    //     FEMALE_MALE,
    //   businessTypes: [
    //     'Beauty Salon'
    //   ]
    // },

    {
      name: 'HD Makeup',
      description:
        'High-definition makeup services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Airbrush Makeup',
      description:
        'Airbrush makeup application services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Makeup Consultation',
      description:
        'Professional makeup consultation and look planning.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Makeup for Kids',
      description:
        'Light makeup and grooming for children for special occasions.',
      audiences:
        [KIDS],
      businessTypes: [
        'Beauty Salon'
      ]
    }

  ],

  // =======================================================
  // NAILS
  // =======================================================

  'Nails': [

    {
      name: 'Manicure',
      description:
        'Hand and nail care including cleaning, shaping and finishing.',
      audiences:
        ALL_AUDIENCES,
      businessTypes: [
        'Beauty Salon',
        'Spa & Wellness'
      ]
    },

    {
      name: 'Pedicure',
      description:
        'Foot and toenail care services.',
      audiences:
        ALL_AUDIENCES,
      businessTypes: [
        'Beauty Salon',
        'Spa & Wellness'
      ]
    },

    {
      name: 'Nail Polish',
      description:
        'Nail polish application services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Gel Nails',
      description:
        'Gel nail application services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Nail Extensions',
      description:
        'Artificial nail extension services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Nail Art',
      description:
        'Decorative nail art and design services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'French Manicure',
      description:
        'French manicure and nail finishing services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    // {
    //   name: 'Kids Manicure',
    //   description:
    //     'Gentle manicure services for children.',
    //   audiences:
    //     KIDS,
    //   businessTypes: [
    //     'Beauty Salon'
    //   ]
    // },

    // {
    //   name: 'Kids Pedicure',
    //   description:
    //     'Gentle pedicure services for children.',
    //   audiences:
    //     KIDS,
    //   businessTypes: [
    //     'Beauty Salon'
    //   ]
    // }

  ],

  // =======================================================
  // BRIDAL & WEDDING
  // =======================================================

  'Bridal & Wedding': [

    {
      name: 'Bridal Makeup',
      description:
        'Complete bridal makeup services.',
      audiences:
        [FEMALE],
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Bridal Hair Styling',
      description:
        'Bridal hairstyle and hair styling services.',
      audiences:
        [FEMALE],
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Bridal Facial',
      description:
        'Pre-bridal and bridal facial skincare treatments.',
      audiences:
        [FEMALE],
      businessTypes: [
        'Beauty Salon',
        'Spa & Wellness'
      ]
    },

    {
      name: 'Pre-Bridal Package',
      description:
        'Combined beauty and grooming services before the wedding.',
      audiences:
        [FEMALE],
      businessTypes: [
        'Beauty Salon',
        'Spa & Wellness'
      ]
    },

    {
      name: 'Groom Package',
      description:
        'Grooming packages designed for grooms before the wedding.',
      audiences:
        [MALE],
      businessTypes: [
        'Beauty Salon',
        'Barber',
        'Spa & Wellness'
      ]
    },

    // {
    //   name: 'Bridesmaid Makeup',
    //   description:
    //     'Makeup services for bridesmaids and wedding guests.',
    //   audiences:
    //     FEMALE,
    //   businessTypes: [
    //     'Beauty Salon'
    //   ]
    // },

    {
      name: 'Wedding Guest Makeup',
      description:
        'Makeup services for wedding guests.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Wedding Hair Styling',
      description:
        'Hair styling services for wedding events.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon',
        'Barber'
      ]
    }

  ],

  // =======================================================
  // SPA & MASSAGE
  // =======================================================

  'Spa & Massage': [

    {
      name: 'Full Body Massage',
      description:
        'Full body massage and relaxation services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness'
      ]
    },

    {
      name: 'Head Massage',
      description:
        'Relaxing head and scalp massage services.',
      audiences:
        ALL_AUDIENCES,
      businessTypes: [
        'Spa & Wellness',
        'Beauty Salon',
        'Barber'
      ]
    },

    {
      name: 'Foot Massage',
      description:
        'Foot massage and relaxation services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness'
      ]
    },

    {
      name: 'Back Massage',
      description:
        'Back-focused massage services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness'
      ]
    },

    {
      name: 'Aromatherapy Massage',
      description:
        'Massage using aromatherapy techniques.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness'
      ]
    },

    {
      name: 'Deep Tissue Massage',
      description:
        'Deep tissue massage services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness'
      ]
    },

    {
      name: 'Swedish Massage',
      description:
        'Swedish-style relaxation massage services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness'
      ]
    },

    {
      name: 'Couples Massage',
      description:
        'Massage services designed for couples.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness'
      ]
    }

  ],

  // =======================================================
  // BODY CARE
  // =======================================================

  'Body Care': [

    {
      name: 'Body Scrub',
      description:
        'Body exfoliation and scrub treatments.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness',
        'Beauty Salon'
      ]
    },

    {
      name: 'Body Polish',
      description:
        'Body polishing and exfoliation treatments.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness',
        'Beauty Salon'
      ]
    },

    {
      name: 'Body Wrap',
      description:
        'Body wrap and body treatment services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness'
      ]
    },

    {
      name: 'Back Scrub',
      description:
        'Back exfoliation and cleansing treatment.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness',
        'Beauty Salon'
      ]
    },

    {
      name: 'Foot Care',
      description:
        'Professional foot care and relaxation services.',
      audiences:
        ALL_AUDIENCES,
      businessTypes: [
        'Spa & Wellness',
        'Beauty Salon'
      ]
    },

    {
      name: 'Hand Care',
      description:
        'Professional hand care and relaxation services.',
      audiences:
        ALL_AUDIENCES,
      businessTypes: [
        'Spa & Wellness',
        'Beauty Salon'
      ]
    }

  ],

  // =======================================================
  // HAIR REMOVAL
  // =======================================================

  'Hair Removal': [

    {
      name: 'Eyebrow Waxing',
      description:
        'Eyebrow hair removal using waxing techniques.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Upper Lip Waxing',
      description:
        'Upper lip hair removal services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Full Face Waxing',
      description:
        'Full facial hair removal using waxing.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Underarm Waxing',
      description:
        'Underarm hair removal services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Half Leg Waxing',
      description:
        'Hair removal from the lower or upper leg area.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Full Leg Waxing',
      description:
        'Full leg hair removal services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Full Arm Waxing',
      description:
        'Full arm hair removal services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Back Waxing',
      description:
        'Back hair removal services.',
      audiences:
        [MALE],
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Chest Waxing',
      description:
        'Chest hair removal services.',
      audiences:
        [MALE],
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Threading',
      description:
        'Thread-based facial hair removal services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Laser Hair Removal',
      description:
        'Laser-based hair reduction services where offered.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    }

  ],

  // =======================================================
  // BEAUTY & GROOMING
  // =======================================================

  'Beauty & Grooming': [

    {
      name: 'Eyebrow Threading',
      description:
        'Eyebrow shaping and threading services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Eyelash Styling',
      description:
        'Eyelash grooming and styling services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Eyelash Extensions',
      description:
        'Eyelash extension application services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Lash Lift',
      description:
        'Lash lifting and styling services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Brow Tinting',
      description:
        'Eyebrow tinting and colour services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Beauty Salon'
      ]
    },

    {
      name: 'Basic Grooming',
      description:
        'General personal grooming services.',
      audiences:
        ALL_AUDIENCES,
      businessTypes: [
        'Beauty Salon',
        'Barber'
      ]
    }

  ],

  // =======================================================
  // MEN'S GROOMING
  // =======================================================

  "Men's Grooming": [

    {
      name: 'Men Hair Cut',
      description:
        'Hair cutting and trimming services for men.',
      audiences:
        [MALE],
      businessTypes: [
        'Barber',
        'Beauty Salon'
      ]
    },

    {
      name: 'Beard Trim',
      description:
        'Beard trimming and shaping services.',
      audiences:
        [MALE],
      businessTypes: [
        'Barber',
        'Beauty Salon'
      ]
    },

    {
      name: 'Beard Styling',
      description:
        'Professional beard styling and shaping.',
      audiences:
        [MALE],
      businessTypes: [
        'Barber',
        'Beauty Salon'
      ]
    },

    {
      name: 'Clean Shave',
      description:
        'Traditional and professional shaving services.',
      audiences:
        [MALE],
      businessTypes: [
        'Barber',
        'Beauty Salon'
      ]
    },

    {
      name: 'Head Shave',
      description:
        'Professional head shaving services.',
      audiences:
        [MALE],
      businessTypes: [
        'Barber'
      ]
    },

    {
      name: 'Moustache Trim',
      description:
        'Moustache trimming and shaping.',
      audiences:
        [MALE],
      businessTypes: [
        'Barber'
      ]
    },

    {
      name: 'Grey Coverage',
      description:
        'Hair and beard grey coverage colour services.',
      audiences:
        [MALE],
      businessTypes: [
        'Barber',
        'Beauty Salon'
      ]
    },

    {
      name: 'Men Facial',
      description:
        'Facial skincare and grooming treatments for men.',
      audiences:
        [MALE],
      businessTypes: [
        'Beauty Salon',
        'Spa & Wellness'
      ]
    },

    // {
    //   name: 'Men Manicure',
    //   description:
    //     'Manicure and nail care services for men.',
    //   audiences:
    //     MALE,
    //   businessTypes: [
    //     'Beauty Salon',
    //     'Spa & Wellness'
    //   ]
    // },

    // {
    //   name: 'Men Pedicure',
    //   description:
    //     'Pedicure and foot care services for men.',
    //   audiences:
    //     MALE,
    //   businessTypes: [
    //     'Beauty Salon',
    //     'Spa & Wellness'
    //   ]
    // }

  ],

  // =======================================================
  // KIDS GROOMING
  // =======================================================

  'Kids Grooming': [

    {
      name: 'Kids Hair Cut',
      description:
        'Haircut services designed for children.',
      audiences:
       [KIDS],
      businessTypes: [
        'Beauty Salon',
        'Barber'
      ]
    },

    // {
    //   name: 'Kids Hair Styling',
    //   description:
    //     'Hair styling services designed for children.',
    //   audiences:
    //     KIDS,
    //   businessTypes: [
    //     'Beauty Salon',
    //     'Barber'
    //   ]
    // },

    // {
    //   name: 'Kids Hair Wash',
    //   description:
    //     'Gentle hair washing services for children.',
    //   audiences:
    //     KIDS,
    //   businessTypes: [
    //     'Beauty Salon',
    //     'Barber'
    //   ]
    // },

    // {
    //   name: 'Kids Facial',
    //   description:
    //     'Gentle skincare services designed for children.',
    //   audiences:
    //     KIDS,
    //   businessTypes: [
    //     'Beauty Salon'
    //   ]
    // },

    // {
    //   name: 'Kids Manicure',
    //   description:
    //     'Gentle manicure services for children.',
    //   audiences:
    //     KIDS,
    //   businessTypes: [
    //     'Beauty Salon'
    //   ]
    // },

    // {
    //   name: 'Kids Pedicure',
    //   description:
    //     'Gentle pedicure services for children.',
    //   audiences:
    //     KIDS,
    //   businessTypes: [
    //     'Beauty Salon'
    //   ]
    // },

    // {
    //   name: 'Kids Party Grooming',
    //   description:
    //     'Grooming services for children attending special occasions.',
    //   audiences:
    //     KIDS,
    //   businessTypes: [
    //     'Beauty Salon',
    //     'Barber'
    //   ]
    // }

  ],

  // =======================================================
  // WELLNESS
  // =======================================================

  'Wellness': [

    {
      name: 'Relaxation Massage',
      description:
        'Relaxation-focused massage services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness'
      ]
    },

    {
      name: 'Aromatherapy',
      description:
        'Wellness treatments incorporating aromatherapy.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness'
      ]
    },

    {
      name: 'Meditation Session',
      description:
        'Guided meditation and relaxation sessions.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness'
      ]
    },

    {
      name: 'Wellness Consultation',
      description:
        'General wellness and wellbeing consultation services.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness'
      ]
    },

    {
      name: 'Stress Relief Treatment',
      description:
        'Relaxation-focused wellness treatments.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness'
      ]
    },

    {
      name: 'Body Relaxation',
      description:
        'Body relaxation and wellness treatments.',
      audiences:
        FEMALE_MALE,
      businessTypes: [
        'Spa & Wellness'
      ]
    }

  ]

};

// =========================================================
// VALIDATE MASTER DATA BEFORE WRITING ANYTHING
// =========================================================

const validateMasterData =
  () => {

    console.log(
      'Validating subcategory master data...'
    );

    let total =
      0;

    let validationErrors =
      0;

    for (
      const [
        categoryName,
        subcategories
      ]
      of Object.entries(
        SUBCATEGORIES
      )
    ) {

      if (
        !Array.isArray(
          subcategories
        )
      ) {

        console.error(
          `ERROR: ${categoryName} is not an array.`
        );

        validationErrors++;

        continue;

      }

      for (
        const subcategory
        of subcategories
      ) {

        total++;

        if (
          !subcategory.name ||
          !String(
            subcategory.name
          ).trim()
        ) {

          console.error(
            `ERROR: ${categoryName} contains a subcategory without a name.`
          );

          validationErrors++;

        }

        if (
          !Array.isArray(
            subcategory.audiences
          ) ||
          subcategory.audiences.length === 0
        ) {

          console.error(
            `ERROR: ${categoryName} > ${subcategory.name} has no audiences.`
          );

          validationErrors++;

        } else {

          for (
            const audience
            of subcategory.audiences
          ) {

            if (
              !VALID_AUDIENCES.has(
                audience
              )
            ) {

              console.error(
                `ERROR: ${categoryName} > ${subcategory.name} has invalid audience: ${audience}`
              );

              validationErrors++;

            }

          }

        }

        if (
          !Array.isArray(
            subcategory.businessTypes
          ) ||
          subcategory.businessTypes.length === 0
        ) {

          console.error(
            `ERROR: ${categoryName} > ${subcategory.name} has no business types.`
          );

          validationErrors++;

        } else {

          for (
            const businessType
            of subcategory.businessTypes
          ) {

            if (
              !VALID_BUSINESS_TYPES.has(
                businessType
              )
            ) {

              console.error(
                `ERROR: ${categoryName} > ${subcategory.name} has invalid business type: ${businessType}`
              );

              validationErrors++;

            }

          }

        }

      }

    }

    console.log(
      `Master records: ${total}`
    );

    if (
      validationErrors > 0
    ) {

      console.error('');
      console.error(
        `VALIDATION FAILED: ${validationErrors} error(s) found.`
      );
      console.error(
        'No records will be written to DynamoDB.'
      );
      console.error('');

      return false;

    }

    console.log(
      'Master data validation passed.'
    );

    return true;

  };

// =========================================================
// MAIN
// =========================================================

const main =
  async () => {

    console.log('');
    console.log('========================================');
    console.log('CLAVATA SUBCATEGORY SEED');
    console.log('========================================');
    console.log(
      'Region:',
      REGION
    );
    console.log(
      'Category table:',
      CATEGORY_TABLE
    );
    console.log(
      'Subcategory table:',
      SUBCATEGORY_TABLE
    );
    console.log('========================================');
    console.log('');

    // -------------------------------------------------------
    // VALIDATE MASTER DATA FIRST
    // -------------------------------------------------------

    const valid =
      validateMasterData();

    if (!valid) {
      process.exit(1);
    }

    console.log('');

    // -------------------------------------------------------
    // LOAD CATEGORIES
    // -------------------------------------------------------

    console.log(
      'Loading categories...'
    );

    const categories =
      await scanAll(
        CATEGORY_TABLE
      );

    console.log(
      `Found ${categories.length} categories.`
    );

    // -------------------------------------------------------
    // LOAD EXISTING SUBCATEGORIES
    // -------------------------------------------------------

    console.log(
      'Loading existing subcategories...'
    );

    const existingSubcategories =
      await scanAll(
        SUBCATEGORY_TABLE
      );

    console.log(
      `Found ${existingSubcategories.length} existing subcategories.`
    );

    // -------------------------------------------------------
    // BUILD CATEGORY MAP
    // -------------------------------------------------------

    const categoryMap =
      new Map();

    for (
      const category
      of categories
    ) {

      const categoryName =
        normalize(
          category.name
        );

      if (
        categoryName
      ) {

        categoryMap.set(
          categoryName,
          category
        );

      }

    }

    // -------------------------------------------------------
    // COUNTERS
    // -------------------------------------------------------

    let created =
      0;

    let skipped =
      0;

    let failed =
      0;

    let missingCategories =
      0;

    // -------------------------------------------------------
    // PROCESS CATEGORIES
    // -------------------------------------------------------

    for (
      const [
        categoryName,
        subcategories
      ]
      of Object.entries(
        SUBCATEGORIES
      )
    ) {

      const category =
        categoryMap.get(
          normalize(
            categoryName
          )
        );

      if (!category) {

        console.error('');
        console.error(
          `WARNING: Category "${categoryName}" was not found in ${CATEGORY_TABLE}.`
        );

        missingCategories++;

        continue;

      }

      const categoryId =
        String(
          category.categoryId ??
          ''
        ).trim();

      if (!categoryId) {

        console.error('');
        console.error(
          `WARNING: Category "${categoryName}" has no categoryId.`
        );

        missingCategories++;

        continue;

      }

      console.log('');
      console.log(
        '----------------------------------------'
      );
      console.log(
        `CATEGORY: ${category.name}`
      );
      console.log(
        `CATEGORY ID: ${categoryId}`
      );
      console.log(
        `SUBCATEGORIES: ${subcategories.length}`
      );
      console.log(
        '----------------------------------------'
      );

      // -----------------------------------------------------
      // PROCESS SUBCATEGORIES
      // -----------------------------------------------------

      for (
        const subcategory
        of subcategories
      ) {

        const existing =
          findExistingSubcategory(
            existingSubcategories,
            categoryId,
            subcategory.name
          );

        if (existing) {

          console.log(
            `SKIP: ${category.name} > ${subcategory.name} already exists`
          );

          skipped++;

          continue;

        }

        // ---------------------------------------------------
        // AUDIENCES
        // ---------------------------------------------------

        const audiences =
          [
            ...new Set(
              subcategory.audiences
            )
          ];

        // ---------------------------------------------------
        // BUSINESS TYPE IDS
        // ---------------------------------------------------

        const businessTypeIds =
          [
            ...new Set(
              subcategory.businessTypes
                .map(
                  businessType =>
                    BUSINESS_TYPES[
                      businessType
                    ]
                )
                .filter(Boolean)
            )
          ];

        // ---------------------------------------------------
        // SAFETY CHECK
        // ---------------------------------------------------

        if (
          audiences.length === 0
        ) {

          console.error(
            `FAILED VALIDATION: ${category.name} > ${subcategory.name} has no audiences.`
          );

          failed++;

          continue;

        }

        if (
          businessTypeIds.length === 0
        ) {

          console.error(
            `FAILED VALIDATION: ${category.name} > ${subcategory.name} has no business types.`
          );

          failed++;

          continue;

        }

        // ---------------------------------------------------
        // CREATE ITEM
        // ---------------------------------------------------

        const now =
          new Date().toISOString();

        const item = {

          subcategoryId:
            crypto.randomUUID(),

          categoryId,

          name:
            subcategory.name,

          description:
            subcategory.description ||
            '',

          status:
            'ACTIVE',

          servicesCount:
            0,

          audiences,

          businessTypeIds,

          createdAt:
            now,

          updatedAt:
            now

        };

        try {

          await dynamoDB.send(
            new PutCommand({

              TableName:
                SUBCATEGORY_TABLE,

              Item:
                item,

              ConditionExpression:
                'attribute_not_exists(subcategoryId)'

            })
          );

          console.log(
            `CREATED: ${category.name} > ${subcategory.name}`
          );

          console.log(
            `  Audiences: ${audiences.join(', ')}`
          );

          console.log(
            `  Business Types: ${subcategory.businessTypes.join(', ')}`
          );

          console.log(
            `  Business Type IDs: ${businessTypeIds.join(', ')}`
          );

          created++;

          await sleep(50);

        } catch (error) {

          console.error('');
          console.error(
            `FAILED: ${category.name} > ${subcategory.name}`
          );

          console.error(
            error?.message ||
            error
          );

          failed++;

        }

      }

    }

    // -------------------------------------------------------
    // FINAL RESULT
    // -------------------------------------------------------

    console.log('');
    console.log('========================================');
    console.log('SEED COMPLETE');
    console.log('========================================');
    console.log(
      'Created:',
      created
    );
    console.log(
      'Skipped:',
      skipped
    );
    console.log(
      'Failed:',
      failed
    );
    console.log(
      'Missing Categories:',
      missingCategories
    );
    console.log('========================================');
    console.log('');

    if (
      failed > 0 ||
      missingCategories > 0
    ) {

      console.log(
        'RESULT: Completed with warnings/errors.'
      );

    } else {

      console.log(
        'RESULT: SUCCESS'
      );

    }

    console.log('');

  };

// =========================================================
// RUN
// =========================================================

main()
  .catch(
    error => {

      console.error('');
      console.error(
        '========================================'
      );
      console.error(
        'FATAL ERROR'
      );
      console.error(
        '========================================'
      );

      console.error(
        error?.message ||
        error
      );

      console.error('');

      process.exit(1);

    }
  );
const { execFileSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const REGION = "ap-south-2";
const TABLE_NAME = "Subcategories";

const categories = [
  {
    categoryId: "CAT#e0142035-1f33-4bf0-972f-6e7677cf30e3",
    name: "Nails",
    subcategories: [
      "Manicure",
      "Pedicure",
      "Gel Nails",
      "Gel Polish",
      "Acrylic Nails",
      "Poly Gel Nails",
      "Nail Extensions",
      "Nail Art",
      "French Manicure",
      "Nail Repair",
      "Nail Removal",
      "Nail Shaping & Buffing",
      "Cuticle Care",
      "Nail Strengthening",
      "Kids' Nail Services"
    ]
  },

  {
    categoryId: "CAT#fe2ca7c3-0797-4e59-9242-65c673f29360",
    name: "Hair",
    subcategories: [
      "Haircuts & Trims",
      "Hair Styling",
      "Hair Coloring",
      "Highlights & Balayage",
      "Hair Bleaching & Lightening",
      "Hair Toning & Glossing",
      "Hair Smoothening & Straightening",
      "Hair Perming & Curling",
      "Hair Treatments & Repair",
      "Hair Spa",
      "Scalp Care",
      "Hair Fall & Hair Growth Care",
      "Hair Extensions",
      "Wigs & Hair Systems",
      "Bridal & Wedding Hair",
      "Party & Occasion Hairstyling",
      "Men's Hair Services",
      "Kids' Hair Services",
      "Hair Consultation",
      "Hair Wash & Conditioning",
      "Hair & Scalp Massage",
      "Ayurvedic & Herbal Hair Care",
      "Hair Correction & Rescue",
      "Hair Accessories & Hair Jewellery",
      "Specialty & Creative Hair Services"
    ]
  },

  {
    categoryId: "CAT#a2c39487-cf1a-4284-afbb-7ef1c7e0f9e6",
    name: "Bridal",
    subcategories: [
      "Bridal Makeup",
      "Bridal Hair",
      "Bridal Hairstyling",
      "Bridal Facial",
      "Bridal Cleanup",
      "Bridal Manicure",
      "Bridal Pedicure",
      "Bridal Mehndi",
      "Bridal Waxing",
      "Bridal Threading",
      "Bridal De-Tan",
      "Bridal Body Polishing",
      "Bridal Skin Treatment",
      "Bridal Grooming Package",
      "Complete Bridal Package"
    ]
  },

  {
    categoryId: "CAT#2d8e5d9d-6a74-42bf-86eb-626922a793fe",
    name: "Face",
    subcategories: [
      "Basic Facial",
      "Deep Cleansing Facial",
      "Hydrating Facial",
      "Brightening Facial",
      "Anti-Aging Facial",
      "Acne Facial",
      "Sensitive Skin Facial",
      "De-Tan Facial",
      "Oxygen Facial",
      "Gold Facial",
      "Diamond Facial",
      "Pearl Facial",
      "Cleanup",
      "Face Massage",
      "Face Mask & Pack"
    ]
  },

  {
    categoryId: "CAT#0bcb36e7-da24-485a-9b14-31fe9fa63f9a",
    name: "Men's Grooming",
    subcategories: [
      "Men's Haircut",
      "Men's Hair Styling",
      "Men's Hair Coloring",
      "Men's Hair Treatment",
      "Men's Facial",
      "Men's Cleanup",
      "Men's De-Tan",
      "Men's Manicure",
      "Men's Pedicure",
      "Men's Waxing",
      "Men's Threading",
      "Men's Body Grooming",
      "Men's Head Massage",
      "Men's Grooming Package",
      "Men's Grooming Consultation"
    ]
  },

  {
    categoryId: "CAT#8ba8f5fb-1933-492b-9b32-abcb2044b5d3",
    name: "Massage",
    subcategories: [
      "Head Massage",
      "Neck & Shoulder Massage",
      "Back Massage",
      "Full Body Massage",
      "Swedish Massage",
      "Deep Tissue Massage",
      "Aromatherapy Massage",
      "Hot Stone Massage",
      "Thai Massage",
      "Balinese Massage",
      "Foot Massage",
      "Leg Massage",
      "Prenatal Massage",
      "Couples Massage",
      "Massage Consultation"
    ]
  },

  {
    categoryId: "CAT#4e0198de-eb3d-4955-8416-bbca061d18ab",
    name: "Makeup",
    subcategories: [
      "Party Makeup",
      "Bridal Makeup",
      "Reception Makeup",
      "Engagement Makeup",
      "Wedding Guest Makeup",
      "HD Makeup",
      "Airbrush Makeup",
      "Traditional Makeup",
      "Natural Makeup",
      "Glam Makeup",
      "Editorial Makeup",
      "Photoshoot Makeup",
      "Maternity Makeup",
      "Makeup Trial",
      "Makeup Consultation"
    ]
  },

  {
    categoryId: "CAT#11c99f0e-191a-497b-8f55-54aa306b5b62",
    name: "Skin",
    subcategories: [
      "Skin Consultation",
      "Skin Analysis",
      "Acne Care",
      "Pigmentation Care",
      "Dark Spot Care",
      "De-Tan Treatment",
      "Skin Brightening",
      "Skin Hydration",
      "Anti-Aging Treatments",
      "Sensitive Skin Care",
      "Open Pore Care",
      "Blackhead & Whitehead Removal",
      "Body Polishing",
      "Body Scrub",
      "Body Wrap",
      "Skin Exfoliation",
      "Skin Repair & Rejuvenation",
      "Advanced Skin Treatments"
    ]
  },

  {
    categoryId: "CAT#733f1f90-45c5-4035-bbb2-1da85e380893",
    name: "Beard",
    subcategories: [
      "Beard Trim",
      "Beard Styling",
      "Beard Shaping",
      "Beard Line-Up",
      "Beard Fade",
      "Beard Coloring",
      "Beard Straightening",
      "Beard Smoothening",
      "Beard Wash",
      "Beard Conditioning",
      "Beard Treatment",
      "Beard Consultation"
    ]
  },

  {
    categoryId: "CAT#6324bfb3-2ba9-45c7-a0bc-6ab5c7b5992c",
    name: "Waxing",
    subcategories: [
      "Full Body Waxing",
      "Full Arms Waxing",
      "Half Arms Waxing",
      "Full Legs Waxing",
      "Half Legs Waxing",
      "Underarm Waxing",
      "Back Waxing",
      "Chest Waxing",
      "Stomach Waxing",
      "Bikini Waxing",
      "Brazilian Waxing",
      "Face Waxing",
      "Upper Lip Waxing",
      "Chin Waxing",
      "Eyebrow Waxing"
    ]
  },

  {
    categoryId: "CAT#36f61ef3-98b6-42aa-99ce-302d7bd6b71b",
    name: "Spa",
    subcategories: [
      "Full Body Spa",
      "Swedish Spa",
      "Aromatherapy Spa",
      "Deep Tissue Spa",
      "Hot Stone Spa",
      "Balinese Spa",
      "Thai Spa",
      "Couple Spa",
      "Head Spa",
      "Foot Spa",
      "Back Spa",
      "Body Scrub Spa",
      "Body Wrap Spa",
      "Detox Spa",
      "Spa Package"
    ]
  },

  {
    categoryId: "CAT#f4c48875-4619-4ebf-8f40-40c9993a825a",
    name: "Threading",
    subcategories: [
      "Eyebrow Threading",
      "Upper Lip Threading",
      "Lower Lip Threading",
      "Chin Threading",
      "Forehead Threading",
      "Full Face Threading",
      "Sideburn Threading",
      "Neck Threading",
      "Eyebrow Shaping",
      "Threading Package"
    ]
  }
];

function runAws(args) {
  return execFileSync(
    "aws",
    args,
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 50 * 1024 * 1024
    }
  );
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getExistingSubcategories() {
  console.log("Reading existing Subcategories table...");

  const output = runAws([
    "dynamodb",
    "scan",
    "--table-name",
    TABLE_NAME,
    "--region",
    REGION,
    "--output",
    "json"
  ]);

  const parsed = JSON.parse(output);

  return parsed.Items || [];
}

function plainString(item, attributeName) {
  return item &&
    item[attributeName] &&
    item[attributeName].S
    ? item[attributeName].S
    : "";
}

function createPutRequest(categoryId, name) {
  const now = new Date().toISOString();

  return {
    PutRequest: {
      Item: {
        subcategoryId: {
          S: crypto.randomUUID()
        },
        categoryId: {
          S: categoryId
        },
        createdAt: {
          S: now
        },
        description: {
          S: ""
        },
        name: {
          S: name
        },
        servicesCount: {
          N: "0"
        },
        status: {
          S: "ACTIVE"
        },
        updatedAt: {
          S: now
        }
      }
    }
  };
}

async function writeBatch(requests, batchNumber, totalBatches) {
  if (!requests.length) {
    return;
  }

  const tempFile = path.join(
    __dirname,
    `.subcategory-batch-${batchNumber}.json`
  );

  const payload = {
    [TABLE_NAME]: requests
  };

  fs.writeFileSync(
    tempFile,
    JSON.stringify(payload, null, 2),
    "utf8"
  );

  console.log(
    `Writing batch ${batchNumber}/${totalBatches} (${requests.length} items)...`
  );

  let remaining = requests;

  try {
    let attempt = 1;

    while (remaining.length > 0) {
      if (attempt > 1) {
        console.log(
          `Retrying ${remaining.length} unprocessed items...`
        );

        await sleep(
          Math.min(1000 * Math.pow(2, attempt - 2), 10000)
        );
      }

      const retryPayload = {
        [TABLE_NAME]: remaining
      };

      fs.writeFileSync(
        tempFile,
        JSON.stringify(retryPayload, null, 2),
        "utf8"
      );

      const output = runAws([
        "dynamodb",
        "batch-write-item",
        "--request-items",
        `file://${tempFile}`,
        "--region",
        REGION,
        "--output",
        "json"
      ]);

      const result = JSON.parse(output);

      remaining =
        result.UnprocessedItems &&
        result.UnprocessedItems[TABLE_NAME]
          ? result.UnprocessedItems[TABLE_NAME]
          : [];

      if (remaining.length === 0) {
        console.log(
          `Batch ${batchNumber}/${totalBatches} completed.`
        );
      }

      attempt++;
    }
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

async function main() {
  console.log("");
  console.log("==============================================");
  console.log(" Clavata Master Subcategory Import");
  console.log("==============================================");
  console.log("");

  console.log(`Region: ${REGION}`);
  console.log(`Table:  ${TABLE_NAME}`);
  console.log("");

  const existingItems = getExistingSubcategories();

  console.log(
    `Existing Subcategories records: ${existingItems.length}`
  );

  const existingKeys = new Set();

  for (const item of existingItems) {
    const categoryId = plainString(item, "categoryId");
    const name = plainString(item, "name");

    if (categoryId && name) {
      existingKeys.add(
        `${categoryId}|||${name.toLowerCase().trim()}`
      );
    }
  }

  const requests = [];

  let totalMasterSubcategories = 0;
  let alreadyExisting = 0;

  for (const category of categories) {
    console.log(
      `${category.name}: ${category.subcategories.length} subcategories`
    );

    for (const name of category.subcategories) {
      totalMasterSubcategories++;

      const key =
        `${category.categoryId}|||${name.toLowerCase().trim()}`;

      if (existingKeys.has(key)) {
        alreadyExisting++;
        continue;
      }

      requests.push(
        createPutRequest(
          category.categoryId,
          name
        )
      );

      existingKeys.add(key);
    }
  }

  console.log("");
  console.log(
    `Total master subcategories: ${totalMasterSubcategories}`
  );

  console.log(
    `Already existing: ${alreadyExisting}`
  );

  console.log(
    `New records to insert: ${requests.length}`
  );

  if (requests.length === 0) {
    console.log("");
    console.log(
      "Nothing to insert. All master subcategories already exist."
    );
    return;
  }

  const batches = [];

  for (let i = 0; i < requests.length; i += 25) {
    batches.push(
      requests.slice(i, i + 25)
    );
  }

  console.log(
    `Number of DynamoDB batches: ${batches.length}`
  );

  console.log("");

  for (let i = 0; i < batches.length; i++) {
    await writeBatch(
      batches[i],
      i + 1,
      batches.length
    );
  }

  console.log("");
  console.log("==============================================");
  console.log(" Import completed successfully");
  console.log("==============================================");
  console.log("");
  console.log(
    `Inserted: ${requests.length}`
  );
  console.log(
    `Skipped existing: ${alreadyExisting}`
  );
  console.log(
    `Total master subcategories: ${totalMasterSubcategories}`
  );
  console.log("");
}

main().catch(error => {
  console.error("");
  console.error("==============================================");
  console.error(" IMPORT FAILED");
  console.error("==============================================");
  console.error("");
  console.error(error.message || error);
  console.error("");
  process.exit(1);
});
import dotenv from "dotenv";

dotenv.config();

// Database configuration
export const DB_CONFIG = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
};

// Constants
export const MC_CAFE_CLASS_ID = [
  "1095",
  "1072",
  "1124",
  "1099",
  "1118",
  "1119",
  "1124",
];
export const CANJE_PUNTOS_CLASS = ["1126", "1127", "1128", "1129"];
export const INVALID_PRODUCT_CODE = ["21341", "21342", "21403"];

// Migration configuration
export const MIGRATION_CONFIG = {
  categories: {
    table: "categories",
    dataKey: "MDS_CLASE",
    upsertKey: "class_id",
  },
  option_groups: {
    table: "option_groups",
    dataKey: "MDS_GRUPO_OPCIONES",
    upsertKey: "group_id",
  },
  products: {
    table: "products",
    dataKey: "MDS_ITEM",
    upsertKey: ["class_id", "item_id"],
  },
  product_prices: {
    table: "product_prices",
    dataKey: "PRECIO_PRODUCTO",
  },
  product_sizes: {
    table: "product_sizes",
    dataKey: "MDS_TAMANO",
    upsertKey: ["class_id", "item_id", "size_number"],
  },
  product_option_groups: {
    table: "product_option_groups",
    dataKey: "MDS_ITEM_GRUPO",
    upsertKey: ["class_id", "item_id", "group_id"],
  },
  options: {
    table: "options",
    dataKey: "MDS_OPCION",
    upsertKey: ["group_id", "option_id"],
  },
  recipes: {
    table: "recipes",
    dataKey: "MDS_RECETA",
    upsertKey: ["product_code", "ingredient_id"],
  },
};

export const PROCESSING_CONFIG = {
  batchSize: 5,
};

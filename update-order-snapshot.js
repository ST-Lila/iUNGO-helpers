import { supabase } from "./db.js";

// Cargar diccionarios desde Supabase
async function loadDictionaries() {
  const [products, sizes, options, ingredients] = await Promise.all([
    supabase.from("products").select("product_code, name"),
    supabase.from("product_sizes").select("product_code, name"),
    supabase.from("options").select("product_code, name"),
    supabase.from("recipes").select("ingredient_id, description"),
  ]);

  const nameByCode = {};

  products.data?.forEach((p) => (nameByCode[p.product_code] = p.name));
  sizes.data?.forEach((s) => (nameByCode[s.product_code] = s.name));
  options.data?.forEach((o) => (nameByCode[o.product_code] = o.name));
  ingredients.data?.forEach(
    (i) => (nameByCode[String(i.ingredient_id)] = i.description)
  );

  return nameByCode;
}

function parseSnapshot(mc_order_json, nameByCode) {
  const items = mc_order_json.ordenGeneral.detalle.map((item) => {
    const basePrice = item.precio;
    const options =
      item.opciones?.map((opt) => ({
        name:
          nameByCode[opt.cod_producto] ||
          opt.nombre ||
          `Producto ${opt.cod_producto}`,
        price: parseFloat(opt.precio),
      })) || [];

    const ingredients_added =
      item.agregados?.map((ing) => ({
        name:
          nameByCode[String(ing.cod_ingrediente)] ||
          `Ingrediente ${ing.cod_ingrediente}`,
        price: parseFloat(ing.precio) || 0,
      })) || [];

    const ingredients_removed =
      item.ingredientes
        ?.filter((ing) => ing.subtipo === "sin")
        .map((ing) => ({
          name:
            nameByCode[String(ing.cod_ingrediente)] ||
            `Ingrediente ${ing.cod_ingrediente}`,
        })) || [];

    let detail = basePrice.toFixed(2) + " (precio_base)";
    options.forEach((opt) => {
      detail += ` + ${opt.price.toFixed(2)} (${opt.name})`;
    });
    ingredients_added.forEach((ing) => {
      detail += ` + ${ing.price.toFixed(2)} (${ing.name})`;
    });

    return {
      name: nameByCode[item.cod_producto] || `Producto ${item.cod_producto}`,
      size: null,
      detail,
      base_price: basePrice,
      options,
      ingredients_added,
      ingredients_removed,
    };
  });

  const total = mc_order_json.ordenGeneral.forma_pago?.total_facturado || 0;

  return { items, total };
}

async function updateSnapshotById(orderId, nameByCode) {
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("id, mc_order_json")
    .eq("id", orderId)
    .single();

  if (orderError || !orderData) {
    console.error(`❌ Error fetching order ${orderId}:`, orderError);
    return;
  }

  const mc_order_json = orderData.mc_order_json;
  const order_snapshot = parseSnapshot(mc_order_json, nameByCode);

  const { error: updateError } = await supabase
    .from("orders")
    .update({ order_snapshot })
    .eq("id", orderId);

  if (updateError) {
    console.error(
      `❌ Error updating order_snapshot for ${orderId}:`,
      updateError
    );
  } else {
    console.log(`✅ order_snapshot updated for order ${orderId}`);
  }
}

async function updateAllSnapshots() {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, mc_order_json");

  if (error) {
    console.error("❌ Error fetching all orders:", error);
    return;
  }

  const nameByCode = await loadDictionaries();

  for (const order of orders) {
    await updateSnapshotById(order.id, nameByCode);
  }
}

// Argumentos
const [, , arg] = process.argv;

if (!arg) {
  console.error(
    "❌ Debes pasar un ID o '--all'. Ej:\n  node update_order_snapshot.js f79bc8a1-...\n  node update_order_snapshot.js --all"
  );
  process.exit(1);
}

if (arg === "--all") {
  updateAllSnapshots();
} else {
  loadDictionaries().then((nameByCode) => updateSnapshotById(arg, nameByCode));
}

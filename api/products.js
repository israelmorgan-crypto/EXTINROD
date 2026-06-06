const fs = require("fs");
const path = require("path");

function readLocalCatalog() {
  const catalogPath = path.join(process.cwd(), "data", "products.json");
  const raw = fs.readFileSync(catalogPath, "utf8");
  return JSON.parse(raw);
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const catalog = readLocalCatalog();

    response.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    response.status(200).json({
      source: process.env.SYSCOM_API_TOKEN ? "syscom-ready" : "local-seed",
      updatedAt: new Date().toISOString(),
      products: catalog.products,
    });
  } catch (error) {
    response.status(500).json({
      error: "Catalog unavailable",
      detail: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

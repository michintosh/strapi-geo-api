const mysql = require("mysql2/promise");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config(); // Load environment variables from .env file

// Database connection configuration
const dbConfig = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT,
};
// Function to import data
async function importData() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Read and parse JSON files
    const nationsFilePath = path.join(__dirname, "json", "gi_nazioni.json");
    const regionsFilePath = path.join(__dirname, "json", "gi_regioni.json");
    const provincesFilePath = path.join(__dirname, "json", "gi_province.json");
    const citiesFilePath = path.join(__dirname, "json", "gi_comuni.json");
    const zipCodesFilePath = path.join(__dirname, "json", "gi_cap.json");

    const nationsData = JSON.parse(await fs.readFile(nationsFilePath, "utf8"));
    const regionsData = JSON.parse(await fs.readFile(regionsFilePath, "utf8"));
    const provincesData = JSON.parse(
      await fs.readFile(provincesFilePath, "utf8")
    );
    const citiesData = JSON.parse(await fs.readFile(citiesFilePath, "utf8"));
    const zipCodesData = JSON.parse(
      await fs.readFile(zipCodesFilePath, "utf8")
    );

    // Clean previous data
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0"); // Disable foreign key checks
    await connection.execute("TRUNCATE TABLE regions_nation_links");
    await connection.execute("TRUNCATE TABLE zip_codes_city_links");
    await connection.execute("TRUNCATE TABLE zip_codes");
    await connection.execute("TRUNCATE TABLE cities_province_links");
    await connection.execute("TRUNCATE TABLE cities");
    await connection.execute("TRUNCATE TABLE provinces_region_links");
    await connection.execute("TRUNCATE TABLE provinces");
    await connection.execute("TRUNCATE TABLE regions");
    await connection.execute("TRUNCATE TABLE nations");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1"); // Enable foreign key checks

    // Insert nations
    const nationMap = {};
    for (const nation of nationsData) {
      const [nationResult] = await connection.execute(
        "INSERT INTO nations (code, title, belfiore_code, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
        [
          nation.sigla_nazione,
          nation.denominazione_nazione,
          nation.codice_belfiore,
        ]
      );
      nationMap[nation.sigla_nazione] = nationResult.insertId;
    }

    // Get the ID for the nation with code "IT"
    const [nationResult] = await connection.execute(
      "SELECT id FROM nations WHERE code = ?",
      ["IT"]
    );
    const italyNationId = nationResult[0]?.id;

    if (!italyNationId) {
      throw new Error('Nation with code "IT" not found in the database.');
    }

    // Insert regions and get their IDs
    const regionMap = {};
    for (const region of regionsData) {
      const [result] = await connection.execute(
        "INSERT INTO regions (code, title, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
        [region.codice_regione, region.denominazione_regione]
      );
      regionMap[region.codice_regione] = result.insertId;

      // Link regions to the nation with code "IT"
      await connection.execute(
        "INSERT INTO regions_nation_links (region_id, nation_id, region_order) VALUES (?, ?, ?)",
        [result.insertId, italyNationId, 1] // Assuming region_order is 1 for simplicity, modify as needed
      );
    }

    // Insert provinces and get their IDs
    const provinceMap = {};
    for (const province of provincesData) {
      const regionId = regionMap[province.codice_regione];
      if (regionId) {
        const [provinceResult] = await connection.execute(
          "INSERT INTO provinces (code, title, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
          [province.sigla_provincia, province.denominazione_provincia]
        );
        const provinceId = provinceResult.insertId;

        provinceMap[province.sigla_provincia] = provinceId;

        await connection.execute(
          "INSERT INTO provinces_region_links (province_id, region_id, province_order) VALUES (?, ?, ?)",
          [provinceId, regionId, 1] // Assuming province_order is 1 for simplicity, modify as needed
        );
      } else {
        console.warn(
          `Region code ${province.codice_regione} not found for province ${province.denominazione_provincia}`
        );
      }
    }

    // Insert cities and link to provinces
    const cityMap = {};
    for (const city of citiesData) {
      const provinceId = provinceMap[city.sigla_provincia];
      if (provinceId) {
        const [cityResult] = await connection.execute(
          "INSERT INTO cities (code, title, belfiore_code, lon, lat, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
          [
            city.codice_istat,
            city.denominazione_ita,
            city.codice_belfiore,
            city.lon,
            city.lat,
          ]
        );
        const cityId = cityResult.insertId;

        cityMap[city.codice_istat] = cityId;

        await connection.execute(
          "INSERT INTO cities_province_links (city_id, province_id, city_order) VALUES (?, ?, ?)",
          [cityId, provinceId, 1] // Assuming province_order is 1 for simplicity, modify as needed
        );
      } else {
        console.warn(
          `Province code ${city.sigla_provincia} not found for city ${city.denominazione_ita}`
        );
      }
    }

    // Insert zip codes and link to cities
    for (const zipCode of zipCodesData) {
      const cityId = cityMap[zipCode.codice_istat];
      if (cityId) {
        const [zipCodeResult] = await connection.execute(
          "INSERT INTO zip_codes (code, title, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
          [zipCode.cap, zipCode.cap]
        );
        const zipCodeId = zipCodeResult.insertId;

        await connection.execute(
          "INSERT INTO zip_codes_city_links (zip_code_id, city_id, zip_code_order) VALUES (?, ?, ?)",
          [zipCodeId, cityId, 1] // Assuming zip_code_order is 1 for simplicity, modify as needed
        );
      } else {
        console.warn(
          `City code ${zipCode.codice_istat} not found for zip code ${zipCode.cap}`
        );
      }
    }
  } catch (err) {
    console.error("Error importing data:", err);
  } finally {
    await connection.end();
  }
}

importData().catch((err) => console.error(err));

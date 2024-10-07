import algoliasearch from 'algoliasearch';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env.test') });

const { ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY, ALGOLIA_INDEX_NAME } = process.env;

if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_API_KEY || !ALGOLIA_INDEX_NAME) {
  console.error('Missing the required environment variables');
  process.exit(1);
}

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);

const processAndIndexRecords = async () => {
  try {
    const productsPath = path.join(__dirname, '../../../data/products.json');
    const rawData = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(rawData);

    const updatedProducts = products.map(product => {
      if (product.categories.includes('Cameras & Camcorders')) {
        return { ...product, price: Math.floor(product.price * 0.8) };
      }
      return product;
    });

    const index = client.initIndex(ALGOLIA_INDEX_NAME);
    const { objectIDs } = await index.saveObjects(updatedProducts, { autoGenerateObjectIDIfNotExist: true });

    console.log(`Updated all relevant ${objectIDs.length} records successfully`);
  } catch (error) {
    console.error('There was an error processing and indexing records:', error);
    process.exit(1);
  }
};

processAndIndexRecords();
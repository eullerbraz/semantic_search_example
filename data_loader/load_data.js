import { ChromaClient } from 'chromadb';
import csv from 'csv-parser';
import fs from 'fs';

const chromaClient = new ChromaClient();

const collection = await chromaClient.getOrCreateCollection({ name: 'movies' });

const ids = [];

const documents = [];

const metadatas = [];

fs.createReadStream('mpst_full_data.csv')
  .pipe(csv())
  .on('data', async (row) => {
    const id = row['imdb_id'];
    const document = JSON.stringify({
      title: row['title'],
      tags: row['tags'],
      synopsis: row['plot_synopsis'],
    });
    const metadata = {
      title: row['title'],
      tags: row['tags'],
      synopsis: row['plot_synopsis'],
    };

    ids.push(id);
    documents.push(document);
    metadatas.push(metadata);
  })
  .on('end', async () => {
    let startIdx = 0;

    while (startIdx < ids.length) {
      const endIdx = startIdx + 100;

      console.log(`Adding documents from ${startIdx} to ${endIdx}`);

      await collection.add({
        ids: ids.slice(startIdx, endIdx),
        documents: documents.slice(startIdx, endIdx),
        metadatas: metadatas.slice(startIdx, endIdx),
      });

      startIdx = endIdx;
    }

    console.log('CSV file successfully processed and data added to ChromaDB');
  });

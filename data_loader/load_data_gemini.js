import { GoogleGenAI } from '@google/genai';
import { ChromaClient } from 'chromadb';
import csv from 'csv-parser';
import fs from 'fs';

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chromaClient = new ChromaClient();

const collection = await chromaClient.getOrCreateCollection({
  name: 'movies_gemini',
});

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

      console.log(`Embedding documents from ${startIdx} to ${endIdx}`);

      const documentsToEmbed = documents.slice(startIdx, endIdx);

      const response = await genai.models.embedContent({
        model: 'models/text-embedding-004',
        contents: documentsToEmbed,
        config: { taskType: 'retrieval_document' },
      });

      console.log(`Adding documents from ${startIdx} to ${endIdx}`);

      await collection.add({
        ids: ids.slice(startIdx, endIdx),
        embeddings: response.embeddings.map((e) => e.values),
        metadatas: metadatas.slice(startIdx, endIdx),
      });

      startIdx = endIdx;
    }

    console.log('CSV file successfully processed and data added to ChromaDB');
  });

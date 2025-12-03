import { GoogleGenAI } from '@google/genai';

export default async function query(chromaCollection, queryText) {
  let result;

  switch (chromaCollection.name) {
    case 'movies_gemini':
      result = await queryGemini(chromaCollection, queryText);
      break;

    default:
      result = await queryDefault(chromaCollection, queryText);
      break;
  }

  const distances = result.distances[0].map((d) => (1 - d + 1) / 2);

  const movies = result.ids[0].map((id, i) => ({
    id,
    distance: distances[i],
    title: result.metadatas[0][i].title,
    tags: result.metadatas[0][i].tags.split(', '),
    synopsis: result.metadatas[0][i].synopsis,
  }));

  return movies;
}

export async function queryDefault(chromaCollection, queryText) {
  return chromaCollection.query({
    queryTexts: [queryText],
  });
}

export async function queryGemini(chromaCollection, queryText) {
  const genai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  const response = await genai.models.embedContent({
    model: 'models/text-embedding-004',
    contents: [queryText],
    config: { taskType: 'retrieval_document' },
  });

  const queryEmbeddings = response.embeddings[0].values;

  return chromaCollection.query({
    queryEmbeddings: [queryEmbeddings],
  });
}

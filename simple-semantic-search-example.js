import { cos_sim, pipeline } from '@huggingface/transformers';
import fs from 'fs';

const embedder = await pipeline(
  'feature-extraction',
  'Xenova/all-MiniLM-L6-v2',
  { dtype: 'q8' }
);

async function getEmbeddings(texts) {
  return await embedder(texts, { pooling: 'mean', normalize: true }).then((t) =>
    t.tolist()
  );
}

const movies = JSON.parse(fs.readFileSync('./movies.json'));

const movieTexts = movies.map((movie) => JSON.stringify(movie));

const movieEmbeddings = await getEmbeddings(movieTexts);

for (let i = 0; i < movies.length; i++) {
  movies[i].embedding = movieEmbeddings[i];
}

const query = 'A movie about space and aliens';

const queryEmbedding = (await getEmbeddings(query))[0];

for (const movie of movies) {
  movie.similarity = cos_sim(queryEmbedding, movie.embedding);
}

movies.sort((a, b) => b.similarity - a.similarity);

console.log(
  movies.slice(0, 5).map((movie) => ({
    name: movie.name,
    category: movie.category,
    synopsis: movie.synopsis,
    similarity: movie.similarity,
  }))
);

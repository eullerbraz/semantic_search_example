export default async function query(chromaCollection, queryText) {
  const result = await chromaCollection.query({
    queryTexts: [queryText],
  });

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

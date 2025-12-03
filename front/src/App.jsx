import { useEffect, useState } from 'react';
import './App.css';

import { ChromaClient } from 'chromadb';

const mockMovies = [
  {
    title: 'The Last Atlas',
    tags: ['Sci-Fi', 'Mystery', 'Exploration'],
    synopsis:
      'A lone space cartographer discovers a void in the star charts that leads to a dimension where physics is reversed. adsf kadsj klfadjs iadjsf kladfhjs jhadfsku hdasjk hfdaskjfh jkasdh jkdhafs jklhadsf kljhdafsjk hadfsjk hadfsjk hdafslkj hadsfjk hadfsjk hadsfjk lhadfsjkhadfs jkadfhs jkadsfh kjadfs hkadsf hajkd hjkads hd jkfhdafsljk hadsfkj hdafs jkhdfs ajkdh jadsfh jadfwh ',
  },
  {
    title: 'Echoes of the Silent City',
    tags: ['Horror', 'Thriller'],
    synopsis:
      'A group of urban explorers discovers an abandoned metropolis where the only sounds are the whispers of its former inhabitants.',
  },
  {
    title: "Dragon's Gambit",
    tags: ['Fantasy', 'Political Drama'],
    synopsis:
      'The peaceful treaty between humans and dragons is threatened when a young, ambitious prince tries to seize a hoard of magical artifacts.',
  },
  {
    title: 'The Quantum Chef',
    tags: ['Comedy', 'Sci-Fi'],
    synopsis:
      "A struggling cook accidentally uses his neighbor's particle accelerator to perfectly season his dishes, leading to culinary chaos.",
  },
];

function MovieTag({ tag }) {
  return (
    <span
      className='movie-tag'
      style={{
        border: '1px solid grey',
        padding: 5,
        fontSize: 12,
        borderRadius: 8,
      }}
    >
      {tag}
    </span>
  );
}

function MovieCard({ title, tags, synopsis }) {
  return (
    <div
      className='movie-card'
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        border: '1px solid grey',
        borderRadius: 10,
        padding: '10px',
        height: '250px',
      }}
    >
      <h2 style={{ margin: 0 }}>{title}</h2>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 5,
        }}
      >
        {tags.map((tag, index) => (
          <MovieTag key={index} tag={tag} />
        ))}
      </div>
      <div style={{ overflow: 'auto', padding: 5 }}>{synopsis}</div>
    </div>
  );
}

function App() {
  const [chromaCollection, setChromaCollection] = useState(null);

  async function queryDatabase() {
    const result = await chromaCollection.query({
      queryTexts: ['Looking for a sci-fi movie with exploration themes.'],
    });

    console.log(result);
  }

  useEffect(() => {
    const initializeChroma = async () => {
      const chromaClient = new ChromaClient();
      const collection = await chromaClient.getOrCreateCollection({
        name: 'movies',
      });

      setChromaCollection(collection);
    };

    initializeChroma();
  }, []);

  return (
    <>
      <h1>Movie Recommender</h1>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <textarea></textarea>
        <button onClick={queryDatabase}>Submit</button>
      </div>
      <div
        className='movie-list'
        style={{
          marginTop: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}
      >
        {mockMovies.map((movie, index) => (
          <MovieCard key={index} {...movie} />
        ))}
      </div>
    </>
  );
}

export default App;

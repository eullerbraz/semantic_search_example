import { useEffect, useState } from 'react';
import './App.css';

import { ChromaClient } from 'chromadb';

function MovieTag({ tag }) {
  return <span className='movie-tag'>{tag}</span>;
}

function MovieCard({ id, title, tags, synopsis, distance }) {
  return (
    <div className='movie-card'>
      <div className='title-container'>
        <h2 className='movie-card-title'>
          <a href={`https://www.imdb.com/title/${id}`} target='_blank'>
            {title}
          </a>
        </h2>
        <div
          className='title-background'
          style={{ width: `${distance * 100}%` }}
        ></div>
      </div>
      <b>Tags:</b>
      <div className='movie-card-tags'>
        <div className='movie-card-tags-container'>
          {tags.map((tag, index) => (
            <MovieTag key={index} tag={tag} />
          ))}
        </div>
      </div>
      <b>Synopsis:</b>
      <div className='movie-card-synopsis'>{synopsis}</div>
    </div>
  );
}

function LoadingIndicator() {
  const loadingGifUrl =
    'https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUyd3B2cXFsd3lyazN5dHQzY2RpaXI3eWkza2RjMXlpbWlkczVnYngycyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/L05HgB2h6qICDs5Sms/200.gif';

  return (
    <div className='loading-indicator'>
      <img src={loadingGifUrl} alt='Loading...' />
      <span>Loading...</span>
    </div>
  );
}

function App() {
  const [chromaCollection, setChromaCollection] = useState(null);
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [queryText, setQueryText] = useState('');

  async function queryDatabase() {
    setIsLoading(true);

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

    setMovieList(movies);
    setIsLoading(false);
  }

  useEffect(() => {
    const initializeChroma = async () => {
      const chromaClient = new ChromaClient();
      const collection = await chromaClient.getOrCreateCollection({
        name: 'movies',
        space: 'cosine',
      });

      setChromaCollection(collection);
      setIsConnected(true);
    };

    initializeChroma();
  }, []);

  return (
    <>
      <h1>Movie Recommender</h1>
      <div className='query-box'>
        <textarea
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
        ></textarea>
        <button onClick={queryDatabase} disabled={isLoading || !isConnected}>
          Submit
        </button>
      </div>

      {isLoading && <LoadingIndicator />}

      <div className='movie-list'>
        {movieList.map((movie, index) => (
          <MovieCard key={index} {...movie} />
        ))}
      </div>
    </>
  );
}

export default App;

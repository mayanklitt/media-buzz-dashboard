import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './styles.css';

const App = () => {
  const [data, setData] = useState({ movies: [], news: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchData = async (url) => {
    try {
      const response = await axios.get(url);
      const moviesWithNewsCount = response.data.movies.map(movie => ({
        ...movie,
        newsCount: response.data.news.filter(article => 
          article.title?.toLowerCase().includes(movie.title.toLowerCase())
        ).length
      }));
      setData({ movies: moviesWithNewsCount, news: response.data.news });
      setIsSearching(false);
    } catch (err) {
      console.error('Fetch Error:', err);
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    fetchData(`http://localhost:5000/api/search?q=${encodeURIComponent(searchQuery)}`);
  };

  useEffect(() => {
    fetchData('http://localhost:5000/api/data');
  }, []);

  return (
    <div className="dashboard">
      <h1>MediaBuzz Movie Dashboard</h1>
      
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search movies..."
          disabled={isSearching}
        />
        <button type="submit" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="chart-container">
        <h2>Popularity vs Media Coverage</h2>
        <ResponsiveContainer width="95%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="popularity" name="Popularity" />
            <YAxis type="number" dataKey="newsCount" name="News Mentions" />
            <Tooltip />
            <Scatter data={data.movies} fill="#8884d8" name="Movies" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="news-section">
        <h2>Related News</h2>
        {data.news.map((article, index) => (
          <div key={index} className="news-card">
            <a href={article.url} target="_blank" rel="noreferrer">
              <h3>{article.title}</h3>
            </a>
            <p>{article.description || 'No description available'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
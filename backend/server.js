const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET',
  credentials: true
}));

const PORT = 5000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

let cache = {
    movies: null,
    news: null,
    lastFetch: 0
};

// Helper: Fetch news for movies
async function fetchNews(movieTitles) {
    const queries = encodeURIComponent(movieTitles.join(' OR '));
    const response = await axios.get(
        `https://newsapi.org/v2/everything?q=${queries}&apiKey=${NEWS_API_KEY}`
    );
    return response.data.articles.slice(0, 15);
}

// Original trending movies endpoint
app.get('/api/data', async (req, res) => {
    try {
        if (Date.now() - cache.lastFetch > 600000) {
            const response = await axios.get(
                `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`
            );
            const movies = response.data.results.slice(0, 10);
            const news = await fetchNews(movies.map(m => m.title));
            
            cache = { movies, news, lastFetch: Date.now() };
        }
        
        res.json({
            movies: cache.movies.map(m => ({
                id: m.id,
                title: m.title,
                popularity: m.popularity,
                release_date: m.release_date
            })),
            news: cache.news
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// New search endpoint
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).json({ error: 'Search query required' });

        const movieResponse = await axios.get(
            `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
        );
        
        const movies = movieResponse.data.results.slice(0, 5);
        const news = await fetchNews(movies.map(m => m.title));
        
        res.json({
            movies: movies.map(m => ({
                id: m.id,
                title: m.title,
                popularity: m.popularity,
                release_date: m.release_date
            })),
            news
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

app.listen(PORT, () => console.log(`Backend ready on port ${PORT}`));
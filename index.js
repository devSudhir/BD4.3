const express = require('express');
const { resolve } = require('path');

const cors = require('cors');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());
const port = 3010;

let db;
(async () => {
  db = await open({
    filename: './BD4.3/database.sqlite',
    driver: sqlite3.Database,
  });
})();

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

async function fetchAllMovies() {
  const query = 'SELECT * from movies';
  let response = await db.all(query, []);
  return { movies: response };
}

app.get('/movies', async (req, res) => {
  try {
    const allMovies = await fetchAllMovies();
    if (allMovies.movies.length === 0) {
      res.status(404).json({ error: 'Movies not found' });
    }
    res.status(200).json(allMovies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchMoviesByActor(actor) {
  const query = 'Select * from movies where actor = ?';
  const response = await db.all(query, [actor]);
  return { movies: response };
}

app.get('/movies/actor/:actor', async (req, res) => {
  const actor = req.params.actor;
  try {
    const result = await fetchMoviesByActor(actor);
    if (result.movies.length === 0) {
      res.status(404).json({ error: 'Movies related to actor not found' });
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function filterMoviesByDirector(director) {
  const query = 'Select * from movies where director = ?';
  const response = await db.all(query, [director]);
  return { movies: response };
}

app.get('/movies/director/:director', async (req, res) => {
  const director = req.params.director;
  try {
    const result = await filterMoviesByDirector(director);
    if (result.movies.length === 0) {
      res.status(404).json({ error: 'Movies related to director not found' });
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

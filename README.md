# 🎬 CineSearch - Movie Database

A modern movie search application using the OMDb API to browse and discover films with detailed information and favorites functionality.

![Movie Search](https://via.placeholder.com/800x400/9b59b6/ffffff?text=Movie+Database)

## ✨ Features

- **Movie Search** - Find films by title, year, or keyword
- **Detailed Information** - Cast, ratings, plot, and technical details
- **Favorites System** - Save and manage favorite movies
- **Advanced Filtering** - Filter by type (movie, series, episode)
- **Pagination** - Browse through search results
- **Responsive Design** - Mobile-first approach
- **Modal Interface** - Clean detail views
- **Local Storage** - Persistent favorites

## 🚀 Live Demo

[View Live Demo](https://ge-lang.github.io/movie-search)

## 🛠️ Technologies Used

- **HTML5** - Semantic structure
- **CSS3** - Grid, Flexbox, CSS Variables
- **JavaScript ES6+** - Async/Await, Fetch API
- **OMDb API** - Movie database
- **Responsive Design** - Mobile optimization

## 📦 Installation

```bash
git clone https://github.com/ge-lang/movie-search.git
cd movie-search

# Get API key from OMDb and replace in script.js
```

🔑 API Configuration

1. Visit OMDb API
2. Register for a free API key
3. Replace 'your_api_key_here' in script.js

🎯 Usage Examples

```javascript
// Search for movies
movieApp.searchMovies('Avengers');

// Get movie details
movieApp.getMovieDetails('tt0848228');

// Manage favorites
movieApp.toggleFavorite('tt0848228');
```

📱 Features

· Real-time Search with debouncing
· Image Lazy Loading for performance
· Keyboard Navigation support
· Error Handling and loading states
· Cross-browser Compatibility

🤝 Contributing

Please read CONTRIBUTING.md for details on our code of conduct.

📄 License

MIT Licensed - see LICENSE file.

  
        class MovieSearchApp {
            constructor() {
                this.apiKey = 'your_api_key_here'; // Get free API key from OMDb
                this.currentPage = 1;
                this.totalPages = 0;
                this.currentSearch = '';
                this.currentType = 'movie';
                this.favorites = this.loadFavorites();
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.updateFavoritesButton();
                
                // Load popular movies on startup
                this.searchMovies('avengers');
            }

            setupEventListeners() {
                // Search functionality
                document.getElementById('searchBtn').addEventListener('click', () => {
                    this.handleSearch();
                });

                document.getElementById('searchInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.handleSearch();
                });

                // Filters
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                        this.currentType = e.target.dataset.type;
                        if (this.currentSearch) {
                            this.currentPage = 1;
                            this.searchMovies(this.currentSearch);
                        }
                    });
                });

                // Modal
                document.getElementById('closeModal').addEventListener('click', () => {
                    this.closeModal();
                });

                document.getElementById('movieModal').addEventListener('click', (e) => {
                    if (e.target === e.currentTarget) {
                        this.closeModal();
                    }
                });

                // Favorites
                document.getElementById('favoritesBtn').addEventListener('click', () => {
                    this.showFavorites();
                });

                // Keyboard navigation
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') this.closeModal();
                });
            }

            async handleSearch() {
                const query = document.getElementById('searchInput').value.trim();
                if (query) {
                    this.currentSearch = query;
                    this.currentPage = 1;
                    await this.searchMovies(query);
                }
            }

            async searchMovies(query, page = 1) {
                this.showLoading(true);
                this.hideError();

                try {
                    const response = await fetch(
                        `https://www.omdbapi.com/?apikey=${this.apiKey}&s=${encodeURIComponent(query)}&type=${this.currentType}&page=${page}`
                    );

                    const data = await response.json();

                    if (data.Response === 'True') {
                        this.displayMovies(data.Search, data.totalResults);
                        this.displayResultsInfo(query, data.totalResults);
                    } else {
                        this.showError(data.Error);
                        this.clearMovies();
                    }

                } catch (error) {
                    this.showError('Failed to fetch movies. Please check your connection.');
                    console.error('Search error:', error);
                } finally {
                    this.showLoading(false);
                }
            }

            async getMovieDetails(imdbID) {
                try {
                    const response = await fetch(
                        `https://www.omdbapi.com/?apikey=${this.apiKey}&i=${imdbID}&plot=full`
                    );

                    const data = await response.json();
                    return data;

                } catch (error) {
                    console.error('Details error:', error);
                    return null;
                }
            }

            displayMovies(movies, totalResults) {
                const grid = document.getElementById('moviesGrid');
                this.totalPages = Math.ceil(totalResults / 10);

                grid.innerHTML = movies.map(movie => `
                    <div class="movie-card fade-in" onclick="movieApp.showMovieDetails('${movie.imdbID}')">
                        <div class="movie-poster ${movie.Poster === 'N/A' ? 'placeholder' : ''}">
                            ${movie.Poster !== 'N/A' ? 
                                `<img src="${movie.Poster}" alt="${movie.Title}" loading="lazy">` : 
                                '🎬'
                            }
                        </div>
                        <div class="movie-info">
                            <h3 class="movie-title">${this.escapeHtml(movie.Title)}</h3>
                            <div class="movie-meta">
                                <span class="movie-year">${movie.Year}</span>
                                <span class="movie-type">${movie.Type}</span>
                            </div>
                            <p class="movie-plot">${movie.Plot || 'Plot not available'}</p>
                        </div>
                    </div>
                `).join('');

                this.renderPagination();
            }

            async showMovieDetails(imdbID) {
                this.showLoading(true);
                
                const movie = await this.getMovieDetails(imdbID);
                
                if (movie) {
                    this.openModal(movie);
                }
                
                this.showLoading(false);
            }

            openModal(movie) {
                document.getElementById('modalTitle').textContent = movie.Title;
                
                const isFavorite = this.favorites.some(fav => fav.imdbID === movie.imdbID);
                
                document.getElementById('modalBody').innerHTML = `
                    <img src="${movie.Poster !== 'N/A' ? movie.Poster : ''}" 
                         class="modal-poster" 
                         alt="${movie.Title}"
                         onerror="this.style.display='none'">
                    <div class="modal-details">
                        <div class="rating">
                            <span class="rating-value">⭐ ${movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/A'}</span>
                            <span>${movie.imdbVotes !== 'N/A' ? movie.imdbVotes + ' votes' : ''}</span>
                            <button class="favorite-toggle ${isFavorite ? 'active' : ''}" 
                                    onclick="movieApp.toggleFavorite('${movie.imdbID}')">
                                ${isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                            </button>
                        </div>
                        
                        <div class="detail-grid">
                            <div class="detail-item">
                                <div class="detail-label">Year</div>
                                <div class="detail-value">${movie.Year}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Rated</div>
                                <div class="detail-value">${movie.Rated !== 'N/A' ? movie.Rated : 'Not rated'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Runtime</div>
                                <div class="detail-value">${movie.Runtime !== 'N/A' ? movie.Runtime : 'N/A'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Genre</div>
                                <div class="detail-value">${movie.Genre !== 'N/A' ? movie.Genre : 'N/A'}</div>
                            </div>
                        </div>

                        <div class="plot">
                            <h3>Plot</h3>
                            <p>${movie.Plot !== 'N/A' ? movie.Plot : 'Plot not available.'}</p>
                        </div>

                        <div class="detail-grid">
                            <div class="detail-item">
                                <div class="detail-label">Director</div>
                                <div class="detail-value">${movie.Director !== 'N/A' ? movie.Director : 'N/A'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Actors</div>
                                <div class="detail-value">${movie.Actors !== 'N/A' ? movie.Actors : 'N/A'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Language</div>
                                <div class="detail-value">${movie.Language !== 'N/A' ? movie.Language : 'N/A'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Country</div>
                                <div class="detail-value">${movie.Country !== 'N/A' ? movie.Country : 'N/A'}</div>
                            </div>
                        </div>

                        ${movie.BoxOffice !== 'N/A' ? `
                            <div class="detail-item">
                                <div class="detail-label">Box Office</div>
                                <div class="detail-value">${movie.BoxOffice}</div>
                            </div>
                        ` : ''}
                    </div>
                `;

                document.getElementById('movieModal').classList.add('active');
            }

            closeModal() {
                document.getElementById('movieModal').classList.remove('active');
            }

            toggleFavorite(imdbID) {
                const movie = this.getMovieFromCache(imdbID);
                if (!movie) return;

                const existingIndex = this.favorites.findIndex(fav => fav.imdbID === imdbID);
                
                if (existingIndex > -1) {
                    this.favorites.splice(existingIndex, 1);
                } else {
                    this.favorites.unshift(movie);
                }

                this.saveFavorites();
                this.updateFavoritesButton();
                
                // Update the modal if open
                if (document.getElementById('movieModal').classList.contains('active')) {
                    this.showMovieDetails(imdbID);
                }
            }

            showFavorites() {
                if (this.favorites.length === 0) {
                    alert('You have no favorite movies yet!');
                    return;
                }

                this.displayMovies(this.favorites, this.favorites.length);
                document.getElementById('resultsInfo').textContent = `Your Favorite Movies (${this.favorites.length})`;
                document.getElementById('pagination').style.display = 'none';
            }

            renderPagination() {
                const pagination = document.getElementById('pagination');
                
                if (this.totalPages <= 1) {
                    pagination.style.display = 'none';
                    return;
                }

                pagination.style.display = 'flex';
                pagination.innerHTML = '';

                // Previous button
                const prevBtn = document.createElement('button');
                prevBtn.className = `page-btn ${this.currentPage === 1 ? 'disabled' : ''}`;
                prevBtn.textContent = '← Previous';
                prevBtn.addEventListener('click', () => {
                    if (this.currentPage > 1) {
                        this.currentPage--;
                        this.searchMovies(this.currentSearch, this.currentPage);
                    }
                });
                pagination.appendChild(prevBtn);

                // Page numbers
                const startPage = Math.max(1, this.currentPage - 2);
                const endPage = Math.min(this.totalPages, startPage + 4);

                for (let i = startPage; i <= endPage; i++) {
                    const pageBtn = document.createElement('button');
                    pageBtn.className = `page-btn ${i === this.currentPage ? 'active' : ''}`;
                    pageBtn.textContent = i;
                    pageBtn.addEventListener('click', () => {
                        this.currentPage = i;
                        this.searchMovies(this.currentSearch, this.currentPage);
                    });
                    pagination.appendChild(pageBtn);
                }

                // Next button
                const nextBtn = document.createElement('button');
                nextBtn.className = `page-btn ${this.currentPage === this.totalPages ? 'disabled' : ''}`;
                nextBtn.textContent = 'Next →';
                nextBtn.addEventListener('click', () => {
                    if (this.currentPage < this.totalPages) {
                        this.currentPage++;
                        this.searchMovies(this.currentSearch, this.currentPage);
                    }
                });
                pagination.appendChild(nextBtn);
            }

            displayResultsInfo(query, totalResults) {
                const info = document.getElementById('resultsInfo');
                info.textContent = `Found ${totalResults} results for "${query}"`;
            }

            clearMovies() {
                document.getElementById('moviesGrid').innerHTML = '';
                document.getElementById('pagination').style.display = 'none';
            }

            showLoading(show) {
                const loading = document.getElementById('loading');
                const searchText = document.getElementById('searchText');
                const searchSpinner = document.getElementById('searchSpinner');
                const searchBtn = document.getElementById('searchBtn');

                if (show) {
                    loading.style.display = 'block';
                    searchText.style.display = 'none';
                    searchSpinner.style.display = 'inline-block';
                    searchBtn.disabled = true;
                } else {
                    loading.style.display = 'none';
                    searchText.style.display = 'inline';
                    searchSpinner.style.display = 'none';
                    searchBtn.disabled = false;
                }
            }

            showError(message) {
                document.getElementById('errorMessage').textContent = message;
                document.getElementById('errorMessage').style.display = 'block';
            }

            hideError() {
                document.getElementById('errorMessage').style.display = 'none';
            }

            updateFavoritesButton() {
                const btn = document.getElementById('favoritesBtn');
                if (this.favorites.length > 0) {
                    btn.innerHTML = `❤️${this.favorites.length}`;
                } else {
                    btn.innerHTML = '❤️';
                }
            }

            getMovieFromCache(imdbID) {
                // In a real app, you might want to cache movie details
                return null; // Simplified version
            }

            loadFavorites() {
                return JSON.parse(localStorage.getItem('movieFavorites')) || [];
            }

            saveFavorites() {
                localStorage.setItem('movieFavorites', JSON.stringify(this.favorites));
            }

            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
        }

        // Initialize the movie app
        const movieApp = new MovieSearchApp();

        // For demo purposes - you need to get a real API key from OMDb
        // Sign up at http://www.omdbapi.com/apikey.aspx
        movieApp.apiKey = 'demo_key'; // Replace with your actual API key

        // Mock data for demonstration
        if (movieApp.apiKey === 'demo_key') {
            movieApp.searchMovies = async function(query) {
                this.showLoading(true);
                this.hideError();
                
                // Simulate API delay
                setTimeout(() => {
                    const mockData = {
                        Search: [
                            {
                                Title: "The Avengers",
                                Year: "2012",
                                imdbID: "tt0848228",
                                Type: "movie",
                                Poster: "https://via.placeholder.com/300x450/4a90e2/ffffff?text=The+Avengers"
                            },
                            {
                                Title: "Avengers: Endgame",
                                Year: "2019",
                                imdbID: "tt4154796",
                                Type: "movie", 
                                Poster: "https://via.placeholder.com/300x450/e74c3c/ffffff?text=Endgame"
                            }
                        ],
                        totalResults: "2",
                        Response: "True"
                    };
                    
                    this.displayMovies(mockData.Search, mockData.totalResults);
                    this.displayResultsInfo(query, mockData.totalResults);
                    this.showLoading(false);
                }, 1000);
            };
        }
    

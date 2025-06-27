import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { searchProducts } from '../../data/store';
import './SearchBar.css';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const searchRef = useRef(null);
    const searchTimeout = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
    }, []);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setQuery(value);
        setError(null);

        // Clear previous timeout
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        if (value.trim().length >= 2) {
            setIsLoading(true);
            setIsOpen(true);

            // Debounce the search
            searchTimeout.current = setTimeout(async () => {
                try {
                    const searchResults = await searchProducts(value);
                    setResults(searchResults);
                } catch (error) {
                    console.error('Error searching products:', error);
                    setError('A apărut o eroare la căutare. Vă rugăm să încercați din nou.');
                } finally {
                    setIsLoading(false);
                }
            }, 300); // Wait 300ms after last keystroke before searching
        } else {
            setResults([]);
            setIsOpen(false);
            setIsLoading(false);
        }
    };

    const handleResultClick = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        setError(null);
    };

    return (
        <div className="search-container" ref={searchRef}>
            <div className="search-input-wrapper">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Căutare produse..."
                    value={query}
                    onChange={handleSearch}
                    onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
                />
                {query && (
                    <button
                        className="clear-search"
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                            setIsOpen(false);
                            setError(null);
                        }}
                    >
                        ×
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="search-results">
                    {isLoading ? (
                        <div className="search-loading">
                            Se caută...
                        </div>
                    ) : error ? (
                        <div className="search-error">
                            {error}
                        </div>
                    ) : results.length > 0 ? (
                        results.map(product => (
                            <Link
                                key={product.id}
                                to={`/product/${product.id}`}
                                className="search-result-item"
                                onClick={handleResultClick}
                            >
                                <img src={product.image} alt={product.name} className="result-image" />
                                <div className="result-info">
                                    <h4>{product.name}</h4>
                                    <p className="result-price">{product.price} MDL</p>
                                </div>
                            </Link>
                        ))
                    ) : query.trim().length >= 2 && (
                        <div className="no-results">
                            Nu au fost găsite produse pentru "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar; 
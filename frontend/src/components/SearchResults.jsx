import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import Feed from './Feed';

const BASE_URL = 'http://127.0.0.1:8000'; 

const SearchResults = () => {
  const location = useLocation();
  const { results, query, category } = location.state || { results: [], query: '', category: '' };
  const [fetchedResults, setFetchedResults] = useState(results);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page

    // Reset fetchedResults when the category changes
    setFetchedResults([]);

    // Fetch products for the category
    if (category) {
      fetchCategoryProducts();
    }
  }, [category]); // Add category as a dependency

  const fetchCategoryProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/products/${category}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched category products:', data.results); // Log the fetched products
      setFetchedResults(data.results);
    } catch (error) {
      console.error('Error fetching category products:', error);
    }
  };

  console.log('Received state in SearchResults:', { results, query, category });
  console.log('Fetched results:', fetchedResults);

  return (
    <Box>
      {category ? (
        <Typography variant="h4" sx={{ textAlign: 'center', marginY: 2 }}>
          Products in Category: <strong>{query}</strong> {/* Use the category name */}
        </Typography>
      ) : (
        <Typography variant="h4" sx={{ textAlign: 'center', marginY: 2 }}>
          Search Results for: <strong>{query}</strong>
        </Typography>
      )}
      {fetchedResults.length > 0 ? (
        <Feed initialProducts={fetchedResults} searchQuery={query} categorySlug={category} />
      ) : (
        <Typography variant="h6" sx={{ textAlign: 'center', marginY: 2 }}>
          No results found for category "<strong>{query}</strong>" {/* Use the category name */}
        </Typography>
      )}
    </Box>
  );
};

export default SearchResults;
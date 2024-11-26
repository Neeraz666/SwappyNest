import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import Feed from './Feed';

const SearchResults = () => {
    const location = useLocation();
    const { results, query } = location.state || { results: [], query: '' };
    console.log("Search Results with Images:", results);


    return (
        <Box>
            <Typography variant="h4" sx={{ textAlign: 'center', marginY: 2 }}>
                Search Results for: <strong>{query}</strong>
            </Typography>
            {results && results.length > 0 ? (
                <Feed initialProducts={results} searchQuery={query} />
            ) : (
                <Typography variant="h6" sx={{ textAlign: 'center', marginY: 2 }}>
                    No results found for "<strong>{query}</strong>"
                </Typography>
            )}
        </Box>
    );
};

export default SearchResults;

import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { Box, Typography } from "@mui/material"
import Feed from "./Feed"

const BASE_URL = "http://localhost:8000" // Ensure this matches your backend URL

const SearchResults = () => {
  const location = useLocation()
  const { results = [], query = "", category = "" } = location.state || {}
  const [fetchedResults, setFetchedResults] = useState(results)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0) // Scroll to the top of the page

    if (category) {
      fetchCategoryProducts()
    } else if (query && results.length === 0) {
      // Only fetch if we don't have results already
      fetchSearchResults()
    } else {
      // If we have results, use them directly
      setFetchedResults(results)
    }
  }, [category, query, results])

  const fetchCategoryProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/products/${category}/`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      setFetchedResults(data.results || [])
    } catch (error) {
      console.error("Error fetching category products:", error)
      setFetchedResults([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSearchResults = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/products/search/?q=${query}`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json()
      setFetchedResults(data.results || data)
    } catch (error) {
      console.error("Error fetching search results:", error)
      setFetchedResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ textAlign: "center", marginY: 2 }}>
        {category ? `Products in Category: ${category}` : `Search Results for: ${query}`}
      </Typography>

      {loading ? (
        <Typography variant="body1" sx={{ textAlign: "center", marginY: 2 }}>
          Loading...
        </Typography>
      ) : fetchedResults.length > 0 ? (
        <Feed initialProducts={fetchedResults} searchQuery={query} categorySlug={category} />
      ) : (
        <Typography variant="body1" sx={{ textAlign: "center", marginY: 2 }}>
          No results found.
        </Typography>
      )}
    </Box>
  )
}

export default SearchResults


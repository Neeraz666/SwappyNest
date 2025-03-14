import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { CATEGORY_CHOICES } from '../choices';

const Categories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category } = location.state || { category: '' }; // Get the selected category from location.state
  const [selectedCategory, setSelectedCategory] = useState(category);

  const handleCategoryClick = (categorySlug, categoryName) => {
    setSelectedCategory(categorySlug); // Update the selected category
    navigate('/searchedresult', { state: { category: categorySlug, results: [], query: categoryName } });
  };

  return (
    <Box sx={{ height: '100%' }}>
      <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>Category</Typography>
      <List sx={{ p: 0 }}>
        {CATEGORY_CHOICES.map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategory === category.value; // Check if the category is selected
          return (
            <ListItem key={category.value} disablePadding>
              <ListItemButton
                onClick={() => handleCategoryClick(category.value, category.name)}
                sx={{
                  backgroundColor: isSelected ? '#e0e7ff' : 'inherit', // Highlight the selected category
                  '&:hover': {
                    backgroundColor: isSelected ? '#e0e7ff' : '#f5f5f5', // Keep the highlight on hover
                  },
                }}
              >
                <ListItemIcon>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText primary={category.name} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default Categories;
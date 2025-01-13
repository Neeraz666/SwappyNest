import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { CATEGORY_CHOICES } from '../choices';


const Categories = () => {
  return (
    <Box sx={{ height: '100%' }}>
      <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>Category</Typography>
      <List sx={{ p: 0 }}>
        {CATEGORY_CHOICES.map((category) => {
          const IconComponent = category.icon; 
          return (
            <ListItem key={category.value} disablePadding>
              <ListItemButton>
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
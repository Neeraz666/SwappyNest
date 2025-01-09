import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import {
  Storefront, DirectionsCar, Spa, Book, Business, Computer, Tv, Event,
  LocalGroceryStore, Weekend, Work, Phone, MusicNote, Pets, Home
} from '@mui/icons-material';

const categories = [
  { name: 'HB Select', icon: Storefront, count: 0 },
  { name: 'Apparels & Accessories', icon: Weekend, count: 14052 },
  { name: 'Automobiles', icon: DirectionsCar, count: 12889 },
  { name: 'Beauty & Health', icon: Spa, count: 14656 },
  { name: 'Books & Learning', icon: Book, count: 1717 },
  { name: 'Business & Industrial', icon: Business, count: 12824 },
  { name: 'Computers & Peripherals', icon: Computer, count: 52370 },
  { name: 'Electronics, TVs, & More', icon: Tv, count: 23291 },
  { name: 'Events & Happenings', icon: Event, count: 448 },
  { name: 'Fresh Veggies & Meat', icon: LocalGroceryStore, count: 478 },
  { name: 'Furnishings & Appliances', icon: Weekend, count: 33333 },
  { name: 'Jobs', icon: Work, count: 416 },
  { name: 'Mobile Phones & Accessories', icon: Phone, count: 35840 },
  { name: 'Music Instruments', icon: MusicNote, count: 8219 },
  { name: 'Pets & Pet Care', icon: Pets, count: 1209 },
  { name: 'Real Estate', icon: Home, count: 36973 }
];

const Categories = () => {
  return (
    <Box sx={{ height: '100%', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#888 #f1f1f1', '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-track': { background: '#f1f1f1' }, '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '4px' }, '&::-webkit-scrollbar-thumb:hover': { background: '#555' } }}>
      <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>Category</Typography>
      <List sx={{ p: 0 }}>
        {categories.map((category) => (
          <ListItem key={category.name} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <category.icon />
              </ListItemIcon>
              <ListItemText 
                primary={category.name} 
                secondary={`(${category.count})`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Categories;
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
    <Box sx={{ 
      width: '320px', // Increased from 280px
      flexShrink: 0, 
      borderRight: '1px solid #e0e0e0', 
      height: 'calc(100vh - 80px)', 
      overflowY: 'auto',
      backgroundColor: '#ffffff',
      pl: 0 // Remove left padding to align with logo
    }}>
      <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>Category</Typography>
      <List sx={{ p: 0 }}> {/* Remove default List padding */}
        {categories.map((category) => (
          <ListItem key={category.name} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <category.icon />
              </ListItemIcon>
              <ListItemText 
                primary={category.name} 
                secondary={`(${category.count.toLocaleString()})`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Categories;


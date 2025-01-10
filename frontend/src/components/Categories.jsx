import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import {
  Storefront, DirectionsCar, Book, Spa, CollectionsBookmark, Brush, Computer, 
  FitnessCenter, Weekend, LocalFlorist, LocalGroceryStore, Favorite, HomeWork, 
  Kitchen, Movie, MusicNote, Terrain, Pets, Checkroom, SportsBasketball, 
  Create, Toys, SportsEsports, Watch, Diamond
} from '@mui/icons-material';

const categories = [
  { name: 'Accessories', icon: Storefront, value: 'accessories' },
  { name: 'Automotive', icon: DirectionsCar, value: 'automotive' },
  { name: 'Books', icon: Book, value: 'books' },
  { name: 'Beauty', icon: Spa, value: 'beauty' },
  { name: 'Collectibles', icon: CollectionsBookmark, value: 'collectibles' },
  { name: 'Crafts', icon: Brush, value: 'crafts' },
  { name: 'Electronics', icon: Computer, value: 'electronics' },
  { name: 'Fitness', icon: FitnessCenter, value: 'fitness' },
  { name: 'Furniture', icon: Weekend, value: 'furniture' },
  { name: 'Garden', icon: LocalFlorist, value: 'garden' },
  { name: 'Groceries', icon: LocalGroceryStore, value: 'groceries' },
  { name: 'Health', icon: Favorite, value: 'health' },
  { name: 'Home Appliances', icon: HomeWork, value: 'home_appliances' },
  { name: 'Kitchenware', icon: Kitchen, value: 'kitchenware' },
  { name: 'Movies', icon: Movie, value: 'movies' },
  { name: 'Music', icon: MusicNote, value: 'music' },
  { name: 'Outdoor', icon: Terrain, value: 'outdoor' },
  { name: 'Pet Supplies', icon: Pets, value: 'pet_supplies' },
  { name: 'Fashion', icon: Checkroom, value: 'fashion' },
  { name: 'Sports', icon: SportsBasketball, value: 'sports' },
  { name: 'Stationery', icon: Create, value: 'stationery' },
  { name: 'Toys', icon: Toys, value: 'toys' },
  { name: 'Video Games', icon: SportsEsports, value: 'video_games' },
  { name: 'Watches', icon: Watch, value: 'watches' },
  { name: 'Jewellry', icon: Diamond, value: 'jewellry' },
];

const Categories = () => {
  return (
    <Box sx={{ height: '100%' }}>
      <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>Category</Typography>
      <List sx={{ p: 0 }}>
        {categories.map((category) => (
          <ListItem key={category.value} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <category.icon />
              </ListItemIcon>
              <ListItemText 
                primary={category.name} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Categories;


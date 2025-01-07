import React, { useState } from "react";
import { Box, TextField, Button, MenuItem, Select, InputLabel, FormControl, Typography, CircularProgress, IconButton, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import axios from "axios";
import { AddPhotoAlternate, Delete } from "@mui/icons-material";
import { CONDITION_CHOICES, CATEGORY_CHOICES } from '../choices'; // adjust the path if needed

const UploadProduct = () => {
  const navigate = useNavigate();

  // State for product form data
  const [productData, setProductData] = useState({
    productname: '',
    description: '',
    purchaseyear: '',
    condition: '',
    category: '',
    images: []
  });

  // State for image previews
  const [imagePreviews, setImagePreviews] = useState([]);

  // State for loading, error, and options
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle file input for images
  const handleImageChange = (e) => {
    const files = e.target.files;
    const selectedFiles = Array.from(files);

    // Update product data with selected images
    setProductData((prevData) => ({
      ...prevData,
      images: selectedFiles
    }));

    // Create preview URLs for selected images
    const previews = selectedFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Remove a previewed image
  const handleRemoveImage = (index) => {
    const updatedImages = [...productData.images];
    updatedImages.splice(index, 1);
    setProductData((prevData) => ({
      ...prevData,
      images: updatedImages
    }));

    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (productData.images.length === 0) {
      setError('Please upload at least one image.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    for (const key in productData) {
      if (key === 'images') {
        Array.from(productData[key]).forEach((image) => {
          formData.append('images', image);
        });
      } else {
        formData.append(key, productData[key]);
      }
    }

    try {
      const response = await axios.post('http://localhost:8000/api/products/uploadproduct/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      console.log(response.data);
      navigate('/'); 
    } catch (error) {
      setError('There was an issue uploading your product. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Upload Product
      </Typography>

      {error && (
        <Typography color="error" sx={{ marginBottom: '1rem' }}>
          {error}
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        {/* Product Name */}
        <TextField
          label="Product Name"
          name="productname"
          value={productData.productname}
          onChange={handleInputChange}
          fullWidth
          required
          sx={{ marginBottom: '1rem' }}
        />

        {/* Description */}
        <TextField
          label="Description"
          name="description"
          value={productData.description}
          onChange={handleInputChange}
          fullWidth
          multiline
          rows={4}
          required
          sx={{ marginBottom: '1rem' }}
        />

        {/* Purchase Year */}
        <TextField
          label="Purchase Year"
          name="purchaseyear"
          value={productData.purchaseyear}
          onChange={handleInputChange}
          fullWidth
          type="date"
          required
          sx={{ marginBottom: '1rem' }}
          InputLabelProps={{
            shrink: true,
          }}
        />

        {/* Condition */}
        <FormControl fullWidth sx={{ marginBottom: '1rem' }} required>
          <InputLabel>Condition</InputLabel>
          <Select
            label="Condition"
            name="condition"
            value={productData.condition}
            onChange={handleInputChange}
          >
            {CONDITION_CHOICES.map((condition) => (
              <MenuItem key={condition.value} value={condition.value}>
                {condition.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Category */}
        <FormControl fullWidth sx={{ marginBottom: '1rem' }} required>
          <InputLabel>Category</InputLabel>
          <Select
            label="Category"
            name="category"
            value={productData.category}
            onChange={handleInputChange}
          >
            {CATEGORY_CHOICES.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Image Upload */}
        <Box sx={{ marginBottom: '1rem' }}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            style={{ display: 'none' }}
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              variant="outlined"
              component="span"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <AddPhotoAlternate sx={{ marginRight: '0.5rem' }} />
              Upload Images
            </Button>
          </label>
          <Typography variant="body2" color="textSecondary" sx={{ marginTop: '0.5rem' }}>
            You can select multiple images (JPG, PNG, etc.).
          </Typography>
        </Box>

        {/* Display Selected Images */}
        {imagePreviews.length > 0 && (
          <Box sx={{ marginBottom: '1rem' }}>
            <Typography variant="h6">Selected Images:</Typography>
            <Grid container spacing={2}>
              {imagePreviews.map((preview, index) => (
                <Grid item key={index} xs={4}>
                  <Box sx={{ position: 'relative' }}>
                    <img src={preview} alt={`Preview ${index}`} style={{ width: '100%', borderRadius: '8px' }} />
                    <IconButton
                      onClick={() => handleRemoveImage(index)}
                      sx={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white' }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ padding: '0.8rem' }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Submit'}
        </Button>
      </form>
    </Box>
  );
};

export default UploadProduct;

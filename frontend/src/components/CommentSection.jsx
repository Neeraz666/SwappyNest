import React, { useState } from "react";
import { Box, Avatar, Typography } from "@mui/material";

const CommentSection = ({ comments }) => {
    const [showMore, setShowMore] = useState({});

    const handleToggleDescription = (index) => {
        setShowMore((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    return (
        <Box sx={{
            maxHeight: '400px', 
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
                width: '12px',  // Increased width
                height: '12px'  // Increased height for horizontal scrollbar
            },
            '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#888',
                borderRadius: '10px',
                border: '2px solid #f1f1f1'
            },
            '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#555',
            }
        }}>
            {comments.map((comment, index) => {
                const isLongComment = comment.text.length > 100; // Check if the comment is long

                return (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {/* Fallback to first letter of the user's name if avatar is null */}
                        <Avatar sx={{ mr: 2 }}>{comment.user?.[0] || 'U'}</Avatar>
                        <Box>
                            <Typography variant="subtitle2">{comment.user || 'Anonymous'}</Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    display: 'inline',
                                    color: 'black',  // Change the comment text color to black
                                }}
                            >
                                {isLongComment && !showMore[index] // If long comment, show truncated version
                                    ? comment.text.slice(0, 100) + '...'
                                    : comment.text}
                            </Typography>

                            {/* Only show the "See more" button if the comment is long */}
                            {isLongComment && (
                                <Typography
                                    component="span"
                                    variant="body2"
                                    onClick={() => handleToggleDescription(index)}
                                    sx={{
                                        color: 'primary.main',
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' },
                                        marginLeft: '4px',  // Space between ellipsis and "See more"
                                    }}
                                >
                                    {showMore[index] ? 'Show less' : 'See more'}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};

export default CommentSection;

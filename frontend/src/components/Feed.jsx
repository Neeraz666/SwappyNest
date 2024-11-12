import React, { useState } from "react";
import { Avatar, Box, Typography, IconButton, InputBase, Modal } from "@mui/material";
import { FavoriteBorder, Comment, Share } from "@mui/icons-material";
import CommentSection from './CommentSection';
import Slider from "react-slick";

const Feed = () => {
    const [open, setOpen] = useState(false); // Modal open state
    const [selectedPost, setSelectedPost] = useState(null); // Selected post for the modal

    const comments = [
        { user: "User 1", avatar: "https://picsum.photos/200", text: "This is an awesome offer!" },
        { user: "User 2", avatar: "https://picsum.photos/200", text: "I'm really interested in this." },
        { user: "User 3", avatar: "https://picsum.photos/200", text: "What's the lowest you'll accept?" },
        // Additional comments...
    ];

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    // Handle open and close of modal
    const handleOpen = (post) => {
        setSelectedPost(post);
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    // Dummy post data
    const posts = [
        {
            id: 1,
            user: 'Viserys',
            date: '2024-10-23',
            content: 'Show me something that is worthy of Rolex swap',
            media: [
                "https://picsum.photos/400/300",
                "https://picsum.photos/400/300",
            ]
        }
    ];

    return (
        <Box sx={{ maxWidth: '700px', margin: '0 auto', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Posts */}
            {posts.map((post) => (
                <Box key={post.id} sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: "8px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <img
                            src="https://picsum.photos/400/300"
                            alt="Profile"
                            style={{ height: 40, width: 40, borderRadius: "50%", marginRight: 10 }}
                        />
                        <Box>
                            <Typography variant="h6">{post.user}</Typography>
                            <Typography variant="caption">{post.date}</Typography>
                        </Box>
                    </Box>
                    <Typography sx={{ mb: 1 }}>{post.content}</Typography>

                    {/* Carousel */}
                    <Slider {...settings}>
                        {post.media.map((media, index) => (
                            <Box key={index} onClick={() => handleOpen(post)} sx={{ cursor: 'pointer' }}>
                                {media.endsWith(".mp4") ? (
                                    <video controls src={media} style={{ width: '100%', height: 'auto' }} />
                                ) : (
                                    <img src={media} alt={`Post Image ${index + 1}`} style={{ width: '100%', height: 'auto' }} />
                                )}
                            </Box>
                        ))}
                    </Slider>

                    {/* Interaction */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", my: 2, paddingTop: 2 }}>
                        <IconButton
                            disableRipple
                            sx={{
                                padding: 0, // Remove default padding
                                '&:hover': { color: 'primary.dark' }
                            }}
                        >
                            <FavoriteBorder />
                            <Typography variant="body2">Like</Typography>
                        </IconButton>
                        <IconButton
                            disableRipple
                            onClick={() => handleOpen(post)}
                            sx={{
                                padding: 0, // Remove default padding
                                '&:hover': { color: 'primary.dark' }
                            }}
                        >
                            <Comment />
                            <Typography variant="body2">Comment</Typography>
                        </IconButton>
                        <IconButton
                            disableRipple
                            sx={{
                                padding: 0, // Remove default padding
                                '&:hover': { color: 'primary.dark' }
                            }}
                        >
                            <Share />
                            <Typography variant="body2">Share</Typography>
                        </IconButton>
                    </Box>


                    {/* Display top comment with avatar */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar alt={comments[0].user} src={comments[0].avatar} sx={{ width: 40, height: 40, marginRight: '10px' }} />
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>{comments[0].user}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{comments[0].text}</Typography>
                        </Box>
                    </Box>




                    {/* Comment Input */}
                    <InputBase
                        placeholder="Place your offer..."
                        fullWidth
                        sx={{p: 1, border: "1px solid #ccc", borderRadius: "4px" }}
                    />
                </Box>
            ))}

            {/* Modal */}
            <Modal open={open} onClose={handleClose}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '80%', bgcolor: 'background.paper', boxShadow: 24, p: 4
                }}>
                    {selectedPost && (
                        <Box sx={{ display: "flex", gap: 2 }}>
                            {/* Left section (Image/Video) */}
                            <Box sx={{ width: "65%" }}>
                                <Slider {...settings}>
                                    {selectedPost.media.map((media, index) => (
                                        <Box key={index}>
                                            {media.endsWith(".mp4") ? (
                                                <video controls src={media} style={{ width: '100%', height: 'auto' }} />
                                            ) : (
                                                <img src={media} alt={`Post Image ${index + 1}`} style={{ width: '100%', height: 'auto' }} />
                                            )}
                                        </Box>
                                    ))}
                                </Slider>
                            </Box>

                            {/* Right section (Description and Comments) */}
                            <Box sx={{ width: "35%", display: "flex", flexDirection: "column" }}>
                                {/* Avatar in Modal */}
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <img
                                        src="https://picsum.photos/400/300"
                                        alt="Profile"
                                        style={{ height: 40, width: 40, borderRadius: "50%", marginRight: 10 }}
                                    />
                                    <Box>
                                        <Typography variant="h6">{selectedPost.user}</Typography>
                                        <Typography variant="caption">{selectedPost.date}</Typography>
                                    </Box>
                                </Box>

                                <Typography variant="body2" sx={{ mt: 2 }}>{selectedPost.content}</Typography>

                                {/* Interaction */}
                                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, padding: 0 }}>
                                    <IconButton disableRipple sx={{ '&:hover': { color: 'primary.dark' } }}>
                                        <FavoriteBorder />
                                        <Typography variant="body2">Like</Typography>
                                    </IconButton>
                                    <IconButton disableRipple sx={{ '&:hover': { color: 'primary.dark' } }}>
                                        <Share />
                                        <Typography variant="body2">Share</Typography>
                                    </IconButton>
                                </Box>

                                {/* Comment Section */}
                                <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '300px', mt: 2 }}>
                                    <CommentSection comments={comments} />
                                </Box>

                                {/* Comment Input in Modal - Aligned to carousel */}
                                <InputBase
                                    placeholder="Place your offer..."
                                    fullWidth
                                    sx={{ mt: 2, p: 1, border: "1px solid #ccc", borderRadius: "4px", marginTop: 0 }}
                                />
                            </Box>
                        </Box>
                    )}
                </Box>
            </Modal>
        </Box>
    );
};

export default Feed;

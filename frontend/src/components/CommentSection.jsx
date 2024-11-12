import React from "react";
import { Box, Avatar, Typography } from "@mui/material";

const CommentSection = ({ comments }) => {
    return (
        <Box>
            {comments.map((comment, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar alt={comment.user} src={comment.avatar} sx={{ width: 40, height: 40, marginRight: '10px' }} />
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>{comment.user}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{comment.text}</Typography>
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default CommentSection;

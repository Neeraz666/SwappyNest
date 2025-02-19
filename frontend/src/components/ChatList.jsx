"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Paper,
  CircularProgress,
} from "@mui/material"
import ChatBox from "./Chatbox"
import { useAuth } from "../context/authContext"
import genericProfileImage from "../assets/profile.png"
import AvatarComponent from "./AvatarComponent"

const BASE_URL = "http://127.0.0.1:8000"

const ChatList = () => {
  const { isAuth, userData } = useAuth()
  const [selectedChat, setSelectedChat] = useState(null)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuth && userData) {
      const token = localStorage.getItem("access_token")
      if (token) {
        setLoading(true)
        fetch("http://localhost:8000/api/chatapp/conversations/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            const filteredChats = data.map((chat) => {
              const otherParticipant = chat.participants.find((user) => user.id !== userData.id)
              return { ...chat, otherParticipant }
            })
            setConversations(filteredChats)
            setLoading(false)
          })
          .catch((error) => {
            console.error("Error fetching conversations:", error)
            setLoading(false)
          })
      } else {
        console.error("No access token found")
        setLoading(false)
      }
    }
  }, [isAuth, userData])

  if (!isAuth) {
    return <Typography variant="h6">You need to log in first</Typography>
  }

  const handleSelectChat = (chat) => {
    setSelectedChat(chat)
  }

  const getFullImageUrl = (imagePath) => {
    if (imagePath.startsWith("http")) {
      return imagePath
    }
    return `${BASE_URL}${imagePath}`
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Paper
        elevation={3}
        sx={{
          flex: selectedChat ? "1 1 50%" : "1 1 100%", // Allow flexible growth
          minHeight: "300px", // Ensure a minimum height
          overflowY: "auto",
          borderRadius: "8px",
          p: 2,
          backgroundColor: "#fff",
          transition: "flex 0.3s ease-in-out",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Recent Chats
        </Typography>
        {loading ? (
          <CircularProgress sx={{ margin: "auto", display: "block" }} />
        ) : (
          <List>
            {conversations.map((chat) => {
              const avatarSrc = chat.otherParticipant.profilephoto
                ? getFullImageUrl(chat.otherParticipant.profilephoto)
                : genericProfileImage;

              return (
                <ListItem key={chat.id} disablePadding>
                  <ListItemButton onClick={() => handleSelectChat(chat)} selected={selectedChat?.id === chat.id}>
                    <ListItemAvatar>
                      <AvatarComponent src={avatarSrc} userId={chat.otherParticipant.id} size={40} disabled={true} />
                    </ListItemAvatar>
                    <ListItemText primary={chat.otherParticipant.username} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>

      {selectedChat && (
        <Box
          sx={{
            flex: "1 1 50%", // Allow flexible height adjustment
            mt: 2,
            transition: "flex 0.3s ease-in-out",
            overflow: "hidden",
          }}
        >
          <ChatBox chat={selectedChat} onClose={() => setSelectedChat(null)} />
        </Box>
      )}
    </Box>
  )
}

export default ChatList


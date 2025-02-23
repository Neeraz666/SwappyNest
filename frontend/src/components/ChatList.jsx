"use client"

import { useState, useEffect, useRef } from "react"
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
  const socketRef = useRef(null)

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

        // Set up WebSocket connection
        const ws = new WebSocket(`ws://localhost:8000/ws/chat/list/${userData.id}/`)
        socketRef.current = ws

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          if (data.type === "update_conversation") {
            updateConversation(data.conversation)
          }
        }

        return () => {
          if (socketRef.current) {
            socketRef.current.close()
          }
        }
      } else {
        console.error("No access token found")
        setLoading(false)
      }
    }
  }, [isAuth, userData])

  const updateConversation = (updatedConversation) => {
    setConversations((prevConversations) => {
      const existingIndex = prevConversations.findIndex((conv) => conv.id === updatedConversation.id)
      if (existingIndex !== -1) {
        // Update existing conversation
        const updatedConversations = [...prevConversations]
        updatedConversations[existingIndex] = {
          ...updatedConversation,
          otherParticipant: updatedConversation.participants.find((p) => p.id !== userData.id),
        }
        return updatedConversations
      } else {
        // Add new conversation
        const newConversation = {
          ...updatedConversation,
          otherParticipant: updatedConversation.participants.find((p) => p.id !== userData.id),
        }
        return [newConversation, ...prevConversations]
      }
    })
  }

  const getLastMessagePreview = (lastMessage) => {
    if (!lastMessage) return "No messages yet"

    try {
      const parsedMessage = JSON.parse(lastMessage)
      if (parsedMessage.type === "product") {
        return "Shared a product"
      }
    } catch (e) {
      // If parsing fails, it's a regular text message
    }

    return lastMessage.length > 30 ? `${lastMessage.substring(0, 30)}...` : lastMessage
  }

  if (!isAuth) {
    return <Typography variant="h6">You need to log in first</Typography>
  }

  const handleSelectChat = (chat) => {
    setSelectedChat(chat)
  }

  const getFullImageUrl = (imagePath) => {
    if (imagePath && imagePath.startsWith("http")) {
      return imagePath
    }
    return imagePath ? `${BASE_URL}${imagePath}` : genericProfileImage
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <Paper
        elevation={3}
        sx={{
          flex: selectedChat ? "1 1 40%" : "1 1 100%",
          minHeight: "300px",
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
              const avatarSrc = getFullImageUrl(chat.otherParticipant.profilephoto)

              return (
                <ListItem key={chat.id} disablePadding>
                  <ListItemButton onClick={() => handleSelectChat(chat)} selected={selectedChat?.id === chat.id}>
                    <ListItemAvatar>
                      <AvatarComponent src={avatarSrc} userId={chat.otherParticipant.id} size={40} disabled={true} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={chat.otherParticipant.username}
                      secondary={getLastMessagePreview(chat.last_message)}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        )}
      </Paper>

      {selectedChat && (
        <Box
          sx={{
            flex: "1 1 50%",
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


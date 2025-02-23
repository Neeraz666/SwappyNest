"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Box,
  Typography,
  Paper,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Snackbar,
  Alert,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { useAuth } from "../context/authContext"
import AvatarComponent from "./AvatarComponent"
import ProductModal from "./ProductModal"

const BASE_URL = "http://127.0.0.1:8000"

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.svg?height=140&width=200"
  return imagePath.startsWith("http") ? imagePath : `${BASE_URL}${imagePath}`
}

const ChatBox = ({ chat, onClose }) => {
  const { userData } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [selectedModalProduct, setSelectedModalProduct] = useState(null)
  const [connectionError, setConnectionError] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState("error")
  const reconnectTimeoutRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }, [])

  const showSnackbar = useCallback((message, severity = "error") => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setSnackbarOpen(true)
  }, [])

  const connectWebSocket = useCallback(() => {
    if (!chat || !chat.id) {
      console.error("Chat or chat ID is undefined. Cannot establish WebSocket connection.")
      showSnackbar("Error: Unable to connect to chat. Please try again later.")
      return null
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connected")
      return socketRef.current
    }

    console.log("Attempting to connect WebSocket")
    const participantIds = chat.participants
      .map((p) => p.id)
      .sort()
      .join("_")
    const ws = new WebSocket(`ws://localhost:8000/ws/chat/conversation_${participantIds}/`)
    socketRef.current = ws

    ws.onopen = () => {
      console.log("WebSocket connected successfully")
      setConnectionError(false)
    }

    ws.onmessage = (event) => {
      console.log("WebSocket message received:", event.data)
      const data = JSON.parse(event.data)
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some((msg) => msg.id === data.id)
        if (!messageExists) {
          const newMessage = {
            id: data.id,
            sender: data.sender_id === userData.id ? userData.username : chat.otherParticipant.username,
            text: data.content,
            timestamp: data.timestamp,
          }
          setTimeout(scrollToBottom, 100) // Scroll after the state update
          return [...prevMessages, newMessage]
        }
        return prevMessages
      })
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      setConnectionError(true)
      showSnackbar("Error in chat connection")
    }

    ws.onclose = (event) => {
      console.log("WebSocket closed:", event)
      if (!event.wasClean) {
        setConnectionError(true)
        if (!reconnectTimeoutRef.current) {
          showSnackbar("Disconnected from chat. Attempting to reconnect...")
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null
            connectWebSocket()
          }, 5000)
        }
      }
    }

    return ws
  }, [chat, userData.id, userData.username, scrollToBottom, showSnackbar])

  useEffect(() => {
    const token = localStorage.getItem("access_token")

    if (token && chat && chat.id) {
      setLoading(true)
      fetch(`http://localhost:8000/api/chatapp/conversations/${chat.id}/messages/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => {
          setMessages(data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)))
          setLoading(false)
          setTimeout(scrollToBottom, 100) // Scroll after the messages are rendered
        })
        .catch((error) => {
          console.error("Error fetching messages:", error)
          setLoading(false)
          setConnectionError(true)
          showSnackbar("Error loading messages")
        })
    }

    const ws = connectWebSocket()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (ws) {
        console.log("Closing WebSocket connection")
        ws.close()
      }
    }
  }, [chat, scrollToBottom, connectWebSocket, showSnackbar])

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  const handleSendMessage = async () => {
    if (newMessage.trim() && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      setSending(true)
      try {
        const messageData = {
          sender_id: userData.id,
          receiver_id: chat.otherParticipant.id,
          message: newMessage,
        }
        socketRef.current.send(JSON.stringify(messageData))
        setNewMessage("")
        setTimeout(scrollToBottom, 100) // Scroll after sending the message
      } catch (error) {
        console.error("Error sending message:", error)
        showSnackbar("Error sending message")
        setConnectionError(true)
      } finally {
        setSending(false)
      }
    } else {
      console.error("WebSocket is not open. Current state:", socketRef.current?.readyState)
      showSnackbar("Connection lost. Attempting to reconnect...")
      setConnectionError(true)
      connectWebSocket()
    }
  }

  const handleProductClick = (product, msg) => {
    const formattedProduct = {
      id: product.id,
      name: product.name,
      condition: product.condition,
      purchaseYear: product.purchaseYear,
      images: [product.image],
      description: product.description || "No description provided",
      uploadDate: product.uploadDate || "Not Provided",
      uploadedBy: msg.sender,
      userId: msg.sender === userData.username ? userData.id : chat.otherParticipant.id,
      userProfilePic:
        msg.sender === userData.username
          ? getFullImageUrl(userData.profilephoto)
          : getFullImageUrl(chat.otherParticipant.profilephoto),
    }
    setSelectedModalProduct(formattedProduct)
    setProductModalOpen(true)
  }

  const renderMessage = (msg) => {
    try {
      const parsedMsg = JSON.parse(msg.text)
      if (parsedMsg.type === "product") {
        const product = parsedMsg.data
        return (
          <Card sx={{ maxWidth: 345, my: 1, cursor: "pointer" }} onClick={() => handleProductClick(product, msg)}>
            <CardMedia component="img" height="140" image={getFullImageUrl(product.image)} alt={product.name} />
            <CardContent>
              <Typography gutterBottom variant="h6" component="div">
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {product.condition} • {product.purchaseYear}
              </Typography>
            </CardContent>
          </Card>
        )
      }
    } catch (e) {
      // If parsing fails, it's a regular text message
    }
    return <Typography variant="body2">{msg.text}</Typography>
  }

  if (!chat || !chat.id) {
    return (
      <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
        <Typography>No chat selected or chat information is incomplete.</Typography>
      </Paper>
    )
  }

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ borderBottom: "1px solid #ddd", p: 2 }}
        >
          <Typography variant="h6">Chat with {chat.otherParticipant.username}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 2, backgroundColor: "#f9f9f9" }}>
          {loading ? (
            <CircularProgress sx={{ margin: "auto", display: "block" }} />
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = msg.sender === userData.username
              return (
                <Box
                  key={msg.id || index}
                  sx={{
                    display: "flex",
                    justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                    mb: 1,
                    alignItems: "center",
                  }}
                >
                  {!isCurrentUser && (
                    <AvatarComponent
                      src={getFullImageUrl(chat.otherParticipant.profilephoto)}
                      userId={chat.otherParticipant.id}
                      size={32}
                    />
                  )}
                  <Paper
                    sx={{
                      p: 1,
                      backgroundColor: isCurrentUser ? "#dcf8c6" : "#ffffff",
                      borderRadius: "8px",
                      maxWidth: "70%",
                      ml: isCurrentUser ? 1 : 0,
                      mr: !isCurrentUser ? 1 : 0,
                    }}
                  >
                    {renderMessage(msg)}
                  </Paper>
                  {isCurrentUser && (
                    <AvatarComponent src={getFullImageUrl(userData.profilephoto)} userId={userData.id} size={32} />
                  )}
                </Box>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ display: "flex", gap: 1, p: 2, borderTop: "1px solid #ddd" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            size="small"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
            disabled={sending || connectionError}
          />
          <Button variant="contained" color="primary" onClick={handleSendMessage} disabled={sending || connectionError}>
            {sending ? <CircularProgress size={24} /> : "Send"}
          </Button>
        </Box>
      </Paper>
      <ProductModal open={productModalOpen} onClose={() => setProductModalOpen(false)} product={selectedModalProduct} />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ChatBox


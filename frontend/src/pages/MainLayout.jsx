import { Box } from "@mui/material"
import Categories from "../components/Categories"
import ChatList from "../components/ChatList"
import Navbar from "../components/Navbar"

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <Box
        sx={{
          display: "grid",
          gridTemplateAreas: `
          "sidebar main chat"
        `,
          gridTemplateRows: "1fr",
          gridTemplateColumns: "280px 1fr 280px",
          height: "calc(100vh - 6rem)", // Full height minus Navbar
          backgroundColor: "#f5f5f5",
          overflow: "hidden", // Prevent the entire layout from scrolling
        }}
      >
        {/* Sidebar (Categories) */}
        <Box
          sx={{
            gridArea: "sidebar",
            borderRight: "1px solid #e0e0e0",
            backgroundColor: "#ffffff",
            overflowY: "auto", // Allow scrolling inside the sidebar
            height: "100%",
          }}
        >
          <Categories />
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            gridArea: "main",
            padding: "24px 40px",
            overflowY: "auto", // Allow scrolling inside the main content
            height: "100%",
            scrollbarWidth: "none", // Hide scrollbar for Firefox
            "&::-webkit-scrollbar": {
              display: "none", // Hide scrollbar for Chrome/Safari
            },
          }}
        >
          {children}
        </Box>

        {/* Chat Section */}
        <Box
          sx={{
            gridArea: "chat",
            borderLeft: "1px solid #e0e0e0",
            backgroundColor: "#ffffff",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden", 
          }}
        >
          <ChatList />
        </Box>
      </Box>
    </>
  )
}

export default MainLayout
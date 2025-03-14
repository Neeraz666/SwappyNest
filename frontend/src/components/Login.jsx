import { useState } from "react"
import { TextField, Button, IconButton, Checkbox, Typography, Container, Box, Link, Alert } from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import axios from "axios"
import { useAuth } from "../context/authContext"
import { useNotification } from "../context/notificationContext"
import { useNavigate } from "react-router-dom"
import SimpleLayout from "../pages/SimpleLayout"

export const Login = () => {
  const [isLoginForm, setIsLoginForm] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [profilephoto, setProfilephoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [password, setPassword] = useState("")
  const [password1, setPassword1] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const { showNotification } = useNotification()
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setProfilephoto(file)

    if (file) {
      setPreview(URL.createObjectURL(file))
    } else {
      setPreview(null)
    }
  }

  const submitLogin = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await login(email, password)
      showNotification("Login successful!", "success")
      navigate("/")
    } catch (error) {
      console.error("Error during login:", error)
      setError("Login failed. Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const submitSignup = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (password !== password1) {
      setError("Passwords do not match!")
      setIsLoading(false)
      return
    }

    const formData = new FormData()
    formData.append("email", email)
    formData.append("username", username)
    formData.append("firstname", firstname)
    formData.append("lastname", lastname)
    formData.append("phone", phone)
    formData.append("address", address)
    formData.append("profilephoto", profilephoto)
    formData.append("password", password)
    formData.append("password1", password1)

    try {
      await axios.post("http://localhost:8000/api/user/signup/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      showNotification("Account created successfully! You can now login.", "success")
      setIsLoginForm(true)
      setError("")
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.error || JSON.stringify(error.response.data))
      } else {
        console.error("Error signing up:", error)
        setError("An error occurred while signing up. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm)
    setError("")
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <SimpleLayout>
      <Container maxWidth="xs">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{ mt: 8, p: 3, boxShadow: 3, borderRadius: 2 }}
        >
          <Typography component="h1" variant="h5" mb={2}>
            {isLoginForm ? "Login" : "Signup"}
          </Typography>
          <form onSubmit={isLoginForm ? submitLogin : submitSignup}>
            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={() => setError("")}>
                {error}
              </Alert>
            )}
            <TextField
              label="Email"
              variant="outlined"
              margin="normal"
              fullWidth
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!isLoginForm && (
              <>
                <TextField
                  label="Username"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                  label="First Name"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                />
                <TextField
                  label="Last Name"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  required
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                />
                <TextField
                  label="Phone"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <TextField
                  label="Address"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }}>
                  Upload Profile Photo
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>

                {preview && (
                  <Box mt={2} display="flex" justifyContent="center">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt="Profile Preview"
                      style={{ width: "100px", height: "100px", borderRadius: "50%" }}
                    />
                  </Box>
                )}
              </>
            )}
            <TextField
              label="Password"
              variant="outlined"
              margin="normal"
              fullWidth
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                ),
              }}
            />
            {!isLoginForm && (
              <TextField
                label="Confirm Password"
                variant="outlined"
                margin="normal"
                fullWidth
                required
                type={showPassword ? "text" : "password"}
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  ),
                }}
              />
            )}
            {isLoginForm && (
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Box display="flex" alignItems="center">
                  <Checkbox />
                  <Typography variant="body2">Remember me</Typography>
                </Box>
                <Link href="/resetpassword" variant="body2">
                  Forgot password?
                </Link>
              </Box>
            )}
            <Button type="submit" fullWidth variant="contained" color="primary" disabled={isLoading} sx={{ mt: 2 }}>
              {isLoading ? "Processing..." : isLoginForm ? "Login Now" : "Signup Now"}
            </Button>
            <Box mt={2} textAlign="center">
              <Typography variant="body2">
                {isLoginForm ? "Don't have an account? " : "Already have an account? "}
                <Link component="button" variant="body2" onClick={toggleForm} sx={{ cursor: "pointer" }}>
                  {isLoginForm ? "Signup" : "Login"}
                </Link>
              </Typography>
            </Box>
          </form>
        </Box>
      </Container>
    </SimpleLayout>
  )
}

export default Login


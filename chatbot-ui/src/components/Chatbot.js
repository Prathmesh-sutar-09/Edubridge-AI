import React, { useState } from "react";
import {
  Container,
  TextField,
  IconButton,
  Box,
  Typography,
  Paper,
  Drawer,
  Button,
  List,
  ListItem,
  ListItemText,
  createTheme,
  ThemeProvider,
  CssBaseline,
  CircularProgress,
  Divider,
  Avatar,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HistoryIcon from "@mui/icons-material/History";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";
import ReactMarkdown from "react-markdown";
import DOMPurify from "dompurify";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [document, setDocument] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [isBotProcessing, setIsBotProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      background: {
        default: darkMode ? "#222224" : "#fff",
        paper: darkMode ? "#111112" : "#fff",
      },
      text: {
        primary: darkMode ? "#fafcff" : "#000",
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "20px",
            padding: "8px 16px",
            textTransform: "none",
            boxShadow: "none",
            transition: "background-color 0.3s ease",
            "&:hover": {
              boxShadow: "none",
            },
          },
          outlined: {
            border: "2px solid",
          },
          contained: {
            color: "white",
          },
        },
      },
    },
  });

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = {
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages([...messages, userMessage]);
    setUserHistory([...userHistory, input]);
    setInput("");

    setIsBotProcessing(true);

    try {
      const response = await fetch("http://localhost:8080/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input, use_user_file: !!document }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from the server");
      }

      const data = await response.json();
      const botMessage = {
        text: data.response,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const botMessage = {
        text: "Sorry, something went wrong. Please try again.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } finally {
      setIsBotProcessing(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setUserHistory([]);
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:8080/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload file");
        }

        setDocument(file);
        alert(`Document "${file.name}" uploaded and processed successfully!`);
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to upload file. Please try again.");
      }
    }
  };

  const handleDeleteDocument = async () => {
    if (!document) return;

    setIsDeleting(true);
    try {
      const response = await fetch("http://localhost:8080/delete-user-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      setDocument(null);
      alert("Document deleted successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete document. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Message copied to clipboard!");
    });
  };

  const renderMessageContent = (text) => {
    const containsHTML = /<[^>]+>/g.test(text);
  
    if (containsHTML) {
      const sanitizedHTML = DOMPurify.sanitize(text);
      return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
    } else {
      return (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {text}
        </ReactMarkdown>
      );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Drawer
          variant="permanent"
          open
          sx={{
            width: 300,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 300,
              boxSizing: "border-box",
              backgroundColor: darkMode ? "#1a1a1d" : "#f8f9fa",
              color: theme.palette.text.primary,
              p: 2,
              display: "flex",
              flexDirection: "column",
              borderRight: "none",
              boxShadow: darkMode ? "4px 0 15px rgba(0, 0, 0, 0.3)" : "4px 0 15px rgba(0, 0, 0, 0.1)",
              backgroundImage: darkMode 
                ? "linear-gradient(195deg, #1a1a1d, #121214)" 
                : "linear-gradient(195deg, #f8f9fa, #e9ecef)",
              transition: "all 0.3s ease",
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 1 }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main,
                mr: 2,
                width: 40,
                height: 40,
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)"
              }}
            >
              AI
            </Avatar>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: theme.palette.text.primary,
                fontFamily: "'Pacifico', cursive",
                textShadow: darkMode ? "0 2px 4px rgba(0,0,0,0.3)" : "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Edubridge AI
            </Typography>
          </Box>

          <Divider sx={{ 
            mb: 3, 
            bgcolor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
          }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ 
              mb: 1, 
              color: darkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
              fontWeight: 600,
              letterSpacing: "0.5px",
              pl: 1
            }}>
              DOCUMENTS
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<FolderIcon />}
              sx={{
                mb: 1,
                width: "100%",
                justifyContent: 'flex-start',
                color: theme.palette.text.primary,
                backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                },
                transition: "all 0.2s ease",
                py: 1.5,
                pl: 2,
                borderRadius: "12px"
              }}
            >
              Upload Document
              <input type="file" hidden onChange={handleDocumentUpload} />
            </Button>
            {document && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                p: 1.5,
                pl: 2,
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderRadius: "12px",
                mt: 1,
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <UploadFileIcon fontSize="small" sx={{ 
                    mr: 1.5,
                    color: darkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"
                  }} />
                  <Typography variant="body2" noWrap sx={{ 
                    flexGrow: 1,
                    color: theme.palette.text.primary,
                    fontSize: "0.8rem"
                  }}>
                    {document.name}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteDocument}
                  disabled={isDeleting}
                  sx={{
                    mt: 1,
                    width: "100%",
                    justifyContent: 'center',
                    color: theme.palette.error.main,
                    borderColor: theme.palette.error.main,
                    '&:hover': {
                      backgroundColor: theme.palette.error.dark + '10',
                      borderColor: theme.palette.error.dark,
                    },
                    '&.Mui-disabled': {
                      color: theme.palette.text.disabled,
                      borderColor: theme.palette.action.disabledBackground,
                    },
                    py: 0.5,
                    fontSize: '0.75rem'
                  }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Document'}
                </Button>
              </Box>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ 
              mb: 1, 
              color: darkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
              fontWeight: 600,
              letterSpacing: "0.5px",
              pl: 1
            }}>
              CHAT ACTIONS
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleClearChat}
              sx={{
                width: "100%",
                justifyContent: 'flex-start',
                color: theme.palette.text.primary,
                backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                },
                transition: "all 0.2s ease",
                py: 1.5,
                pl: 2,
                borderRadius: "12px"
              }}
            >
              Clear Chat
            </Button>
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" sx={{ 
              mb: 1, 
              color: darkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
              fontWeight: 600,
              letterSpacing: "0.5px",
              pl: 1
            }}>
              CHAT HISTORY
            </Typography>
            <List sx={{ 
              overflowY: 'auto', 
              maxHeight: '40vh',
              pr: 1,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                borderRadius: '3px',
              },
            }}>
              {userHistory.map((msg, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => setInput(msg)}
                  sx={{
                    borderRadius: "10px",
                    mb: 0.5,
                    px: 1.5,
                    py: 1,
                    transition: "all 0.2s ease",
                    '&:hover': {
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                      transform: 'translateX(2px)'
                    },
                    '&.Mui-selected': {
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                    }
                  }}
                >
                  <HistoryIcon fontSize="small" sx={{ 
                    mr: 1.5, 
                    color: darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                    minWidth: '24px'
                  }} />
                  <ListItemText 
                    primary={msg.length > 30 ? `${msg.substring(0, 30)}...` : msg}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: {
                        color: theme.palette.text.primary,
                        fontSize: '0.85rem',
                        fontWeight: 500
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            flexGrow: 1,
            overflowY: "hidden",
          }}
        >
          <Paper
            elevation={0}
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              p: 2,
              mb: 2,
              height: "80%",
              backgroundColor: "transparent",
              boxShadow: "none",
              border: "none",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: darkMode ? "#333" : "#f1f1f1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: darkMode ? "#666" : "#888",
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: darkMode ? "#888" : "#666",
                },
              },
            }}
          >
            {messages.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: theme.palette.text.secondary,
                }}
              >
                <Typography variant="h4">How can I assist you?</Typography>
              </Box>
            ) : (
              messages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    textAlign: msg.sender === "user" ? "right" : "left",
                    mb: 2,
                    display: "flex",
                    justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                    animation: "fadeIn 0.5s ease",
                    "@keyframes fadeIn": {
                      from: { opacity: 0, transform: "translateY(10px)" },
                      to: { opacity: 1, transform: "translateY(0)" },
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                      maxWidth: "75%",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 0.5,
                      }}
                    >
                      {msg.sender === "user" ? "You" : "Bot"} • {msg.timestamp}
                    </Typography>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "15px",
                        bgcolor:
                          msg.sender === "user"
                            ? "primary.main"
                            : darkMode
                            ? "grey.800"
                            : "grey.200",
                        color: msg.sender === "user" ? "black" : theme.palette.text.primary,
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        },
                      }}
                    >
                      {msg.sender === "bot" ? (
                        renderMessageContent(msg.text)
                      ) : (
                        <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
                          {msg.text}
                        </Typography>
                      )}
                      {msg.sender === "bot" && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          <IconButton size="small" onClick={() => alert("Liked!")}>
                            <ThumbUpIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => alert("Disliked!")}>
                            <ThumbDownIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleCopyMessage(msg.text)}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))
            )}

            {isBotProcessing && (
              <Box
                sx={{
                  textAlign: "left",
                  mb: 2,
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    maxWidth: "75%",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 0.5,
                    }}
                  >
                    Bot • Typing...
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "15px",
                      bgcolor: darkMode ? "grey.800" : "grey.200",
                      color: theme.palette.text.primary,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    <CircularProgress size={20} />
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              paddingBottom: 2,
              marginTop: "auto",
              width: "100%",
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              sx={{
                width: "80%",
                maxWidth: 600,
                borderRadius: "30px",
                background: `linear-gradient(145deg, ${darkMode ? "#2a2a2e" : "#f0f0f0"}, ${theme.palette.background.paper})`,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "30px",
                  color: theme.palette.text.primary,
                  transition: "all 0.3s ease",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: darkMode ? "#555" : "#004085",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: darkMode ? "#777" : "#004085",
                    boxShadow: darkMode
                      ? "0 0 0 2px rgba(255, 255, 255, 0.1)"
                      : "0 0 0 2px rgba(0, 64, 133, 0.2)",
                  },
                },
                "& .MuiOutlinedInput-input": {
                  padding: "12px 16px",
                  color: theme.palette.text.primary,
                  "&::placeholder": {
                    color: darkMode ? "#aaa" : "#666",
                    opacity: 1,
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: darkMode ? "#444" : "#ddd",
                  transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              sx={{
                marginLeft: 2,
                backgroundColor: theme.palette.primary.main,
                borderRadius: "50%",
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <SendRoundedIcon sx={{ color: 'white' }} />
            </IconButton>
          </Box>
        </Box>

        <IconButton
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            color: theme.palette.text.primary,
            backgroundColor: darkMode ? "#334155" : "#ADD8E6",
            ":hover": {
              backgroundColor: darkMode ? "#475569" : "#6495ED",
              color: "white",
            },
          }}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Container>
    </ThemeProvider>
  );
};

export default Chatbot;
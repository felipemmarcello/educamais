import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebase.js';
import { TextField, Button, Paper, Box, FormControlLabel, Checkbox, IconButton, InputAdornment, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import educaImage from '../images/educa-mais.png';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { useState, useContext, useEffect } from 'react';
import UserContext from '../contexts/UserContext.jsx';

const theme = createTheme({
  palette: {
    primary: {
      main: "#5589c4"
    },
    secondary: {
      main: "#FFA000"
    }
  },
});

function LoginPage() {
  const { setGlobalUid } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('email');
    const savedPassword = localStorage.getItem('password');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

    if (savedRememberMe) {
      setEmail(savedEmail || '');
      setPassword(savedPassword || '');
      setRememberMe(savedRememberMe);
    }
  }, []);

  async function handleSignIn() {
    try {
      if (rememberMe) {
        localStorage.setItem('email', email);
        localStorage.setItem('password', password);
        localStorage.setItem('rememberMe', rememberMe.toString());
      } else {
        localStorage.removeItem('email');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMe');
      }

      await setPersistence(auth, browserLocalPersistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      setGlobalUid(uid);

      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        const role = userDoc.data().role;

        switch (role) {
          case 'AdminEM':
            navigate('/AdminEM');
            break;
          case 'admin':
          case 'adminMaster': // Adicionado para permitir acesso a adminMaster
            navigate('/admin');
            break;
          case 'student':
            navigate('/student');
            break;
          case 'professor':
            navigate('/professor');
            break;
          default:
            console.error('"Role" não reconhecida!');
            break;
        }
      } else {
        console.error('Documento do usuário não encontrado!');
      }
    } catch (error) {
      console.error('Erro durante o login:', error);
      setError('E-mail ou Senha incorreto. Tente novamente.');
    }
  }

  const handleClickShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <Box sx={{
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      p: 2,
    }}>
      <Paper elevation={14} sx={{
        width: 300,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: `3px solid #274856`
      }}>
        <ThemeProvider theme={theme}>
          <TextField
            label="Login"
            variant="outlined"
            fullWidth
            color="primary"
            backgroundColor="#ffffff"
            sx={{ mb: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            color="primary"
            fullWidth
            sx={{ mb: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {error && (
            <Typography variant="caption" color="error" sx={{ mb: 0, fontSize: '12px' }}>
              {error}
            </Typography>
          )}
        </ThemeProvider>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-initial' }}>
          <ThemeProvider theme={theme}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label="Lembrar conta"
            />
          </ThemeProvider>
        </Box>
        <ThemeProvider theme={theme}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" color="primary" onClick={handleSignIn}>Entrar</Button>
          </Box>
        </ThemeProvider>

      </Paper>
      <img src={educaImage} alt="Educa" style={{ width: '35%' }} />
    </Box>
  );
}

export default LoginPage;

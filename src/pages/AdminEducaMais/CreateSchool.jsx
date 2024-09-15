import React, { useState } from 'react';
import { doc, setDoc, collection } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/firebase.js';
import {
  TextField, Grid, Button, Box, Typography, Divider, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, InputAdornment, MenuItem,
  Select, FormControl, InputLabel
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function CreateSchool({ onClose }) {
  const [schoolName, setSchoolName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [SchoolEmailDomain, setSchoolEmailDomain] = useState('');
  const [emailExtension, setEmailExtension] = useState('.com');
  const [adminEmailPrefix, setAdminEmailPrefix] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [errorFields, setErrorFields] = useState({});
  const [status, setStatus] = useState('');

  const handleDialogClose = () => {
    setOpenDialog(false);
    setStatus('');
    if (onClose) onClose();
  };

  const handleSaveSchool = async () => {
    setErrorFields({});
    let validationErrors = {};

    if (!schoolName) {
      validationErrors.schoolName = true;
    }
    if (!address) {
      validationErrors.address = true;
    }
    if (!city) {
      validationErrors.city = true;
    }
    if (!state) {
      validationErrors.state = true;
    }
    if (!SchoolEmailDomain) {
      validationErrors.SchoolEmailDomain = true;
    }
    if (!adminEmailPrefix) {
      validationErrors.adminEmailPrefix = true;
    }
    if (!adminPassword || adminPassword.length < 6) {
      validationErrors.adminPassword = true;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrorFields(validationErrors);
      return;
    }

    try {
      const schoolData = {
        schoolName,
        address,
        city,
        state,
        SchoolEmailDomain: `@${SchoolEmailDomain}${emailExtension}`,
        adminEmail: `${adminEmailPrefix}@${SchoolEmailDomain}${emailExtension}`,
      };

      const newSchoolRef = doc(collection(db, 'schools'));
      await setDoc(newSchoolRef, schoolData);

      const adminEmail = `${adminEmailPrefix}@${SchoolEmailDomain}${emailExtension}`;
      const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      const uid = userCredential.user.uid;

      const userData = {
        email: adminEmail,
        name: 'Admin Master', // Nome do Admin Master
        schoolName,
        schoolId: newSchoolRef.id,
        role: 'adminMaster'
      };

      await setDoc(doc(db, 'users', uid), userData);

      setOpenDialog(true);
    } catch (error) {
      console.error('Error creating school:', error);
      setStatus('Erro ao criar a escola. Por favor, tente novamente.');
    }
  };

  return (
    <Box sx={{ maxWidth: '82%', margin: 'auto', mt: 1}}>
    
      <div style={{ display: 'flex', paddingTop: '5%', paddingLeft: '2%' }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Criar Escola
        </Typography>
      </div>

      <Divider sx={{margin: 'auto', height: '50%', marginBottom: '5%' }} />

        <Typography sx={{ }}>
          Informações da Escola
        </Typography>

      <Grid container spacing={0.8}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            variant="outlined"
            label="Nome"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            margin="normal"
            required
            error={!!errorFields.schoolName}
            helperText={errorFields.schoolName && "Campo obrigatório"}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            variant="outlined"
            label="Endereço"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            margin="normal"
            required
            error={!!errorFields.address}
            helperText={errorFields.address && "Campo obrigatório"}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            variant="outlined"
            label="Cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            margin="normal"
            required
            error={!!errorFields.city}
            helperText={errorFields.city && "Campo obrigatório"}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            variant="outlined"
            label="Estado"
            value={state}
            onChange={(e) => setState(e.target.value)}
            margin="normal"
            required
            error={!!errorFields.state}
            helperText={errorFields.state && "Campo obrigatório"}
          />
        </Grid>
        </Grid>

        <Typography sx={{ marginTop: '6%'}}>
          Domínio de E-mail e Usuário Administrador da Escola
        </Typography>

        <Grid container spacing={0}>
        <Grid item xs={10} sm={8}>
          <FormControl fullWidth>
            <TextField
              variant="outlined"
              label="Domínio de E-mail"
              value={SchoolEmailDomain}
              onChange={(e) => setSchoolEmailDomain(e.target.value)}
              margin="normal"
              required
              error={!!errorFields.SchoolEmailDomain}
              helperText={errorFields.SchoolEmailDomain && "Campo obrigatório"}
              InputProps={{
                startAdornment: <InputAdornment position="start">@</InputAdornment>,

                endAdornment: (
                  <InputAdornment position="end">
                    <FormControl variant="standard">
                      <Select
                        value={emailExtension}
                        onChange={(e) => setEmailExtension(e.target.value)}
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                        MenuProps={{
                          getContentAnchorEl: null,
                          anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left"
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "left"
                          }
                        }}
                      >
                        <MenuItem value=".com">.com</MenuItem>
                        <MenuItem value=".com.br">.com.br</MenuItem>
                      </Select>
                    </FormControl>
                  </InputAdornment>
                ),
              }}
              
            />
          </FormControl>
        </Grid>
        <Grid item xs={10} sm={8}>
          <TextField
            fullWidth
            variant="outlined"
            label="E-mail do Admin"
            value={adminEmailPrefix}
            onChange={(e) => setAdminEmailPrefix(e.target.value)}
            margin="normal"
            required
            error={!!errorFields.adminEmailPrefix}
            helperText={errorFields.adminEmailPrefix && "Campo obrigatório"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  @{SchoolEmailDomain}{emailExtension}
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            variant="outlined"
            label="Senha do Admin"
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            margin="normal"
            required
            error={!!errorFields.adminPassword}
            helperText={errorFields.adminPassword && "Campo obrigatório e deve ter pelo menos 6 caracteres"}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveSchool}
        >
          Criar
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Escola criada com sucesso!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A escola foi criada com sucesso e o Admin Master foi registrado.
          </DialogContentText>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CreateSchool;

import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { TextField, Grid, Button, Box, Typography, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, InputAdornment, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function CreateSchool({ onClose }) {
  const [schoolName, setSchoolName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [SchoolEmailDomain, setSchoolEmailDomain] = useState('');
  const [emailExtension, setEmailExtension] = useState('.com');
  const [adminEmailPrefix, setAdminEmailPrefix] = useState('');
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

      // Create a new document with an auto-generated ID
      const newSchoolRef = doc(collection(db, 'schools'));
      await setDoc(newSchoolRef, schoolData);

      setOpenDialog(true);
    } catch (error) {
      console.error('Error creating school:', error);
      setStatus('Erro ao criar a escola. Por favor, tente novamente.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', paddingTop: '5%', paddingLeft: '12%' }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Criar Escola e seu Domínio de E-mail
        </Typography>
      </div>
      <Divider sx={{ width: '80%', margin: 'auto', height: '50%' }} />
      <Box sx={{ maxWidth: '70%', margin: 'auto', mt: 1, bgcolor: '#fff', paddingTop: '3%' }}>
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label="Nome da Escola"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              margin="normal"
              required
              error={!!errorFields.schoolName}
              helperText={errorFields.schoolName && "Campo obrigatório"}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label="Endereço da Escola"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              margin="normal"
              required
              error={!!errorFields.address}
              helperText={errorFields.address && "Campo obrigatório"}
            />
          </Grid>
          <Grid item xs={12}>
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
          <Grid item xs={12}>
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
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              variant="outlined"
              label="Domínio de E-mail da Escola"
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
                    <FormControl>
                      <Select
                        value={emailExtension}
                        onChange={(e) => setEmailExtension(e.target.value)}
                      >
                        <MenuItem value=".com">.com</MenuItem>
                        <MenuItem value=".com.br">.com.br</MenuItem>
                      </Select>
                    </FormControl>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label="E-mail do Admin Master da Escola"
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
        </Grid>
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <Button
            variant="contained"
            style={{ backgroundColor: '#5589c4', color: '#ffffff' }}
            onClick={handleSaveSchool}
            sx={{ mt: 2, width: '100px', marginTop: '4%', marginLeft: '2%' }}
          >
            Criar
          </Button>
        </div>
        {status && (
          <Typography color="error" sx={{ mt: 2 }}>
            {status}
          </Typography>
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Escola criada com sucesso!</DialogTitle>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <DialogContent style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <DialogContentText>
              {status}
            </DialogContentText>
            <CheckCircleIcon color="success" style={{ fontSize: 75 }} />
          </DialogContent>
        </div>
        <DialogActions>
          <Button onClick={handleDialogClose} style={{ color: '#5589c4' }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CreateSchool;

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../../../firebase/firebase.js';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Container, Typography, List, ListItem, ListItemText, ListItemButton, Box, Divider, Paper, TextField, Pagination } from '@mui/material';
import TextWithColor from '../../../components/TextWithColors.jsx';
import UserContext from '../../../contexts/UserContext.jsx';
import portugueseIcon from '../../../images/portugueseIcon.png';
import mathematicsIcon from '../../../images/mathematicsIcon.png';
import scienceIcon from '../../../images/scienceIcon.png';
import geographyIcon from '../../../images/geographyIcon.png';
import historyIcon from '../../../images/historyIcon.png';
import artIcon from '../../../images/artIcon.png';
import englishIcon from '../../../images/englishIcon.png';
import physicalEducationIcon from '../../../images/physicalEducationIcon.png';
import religionIcon from '../../../images/religionIcon.png';

const SubjectsList = () => {
  const { subjectId } = useParams();
  const { globalUid } = useContext(UserContext);
  const [subjects, setSubjects] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const subjectsPerPage = 7;
  const navigate = useNavigate();
  const [schoolYear, setSchoolYear] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [classRoom, setClassRoom] = useState('');

  // Mapeamento de subjectId para nome e cor
  const subjectDetails = {
    portuguese: { name: 'Língua Portuguesa', icon: portugueseIcon, color: '#FF6347' },
    mathematics: { name: 'Matemática', icon: mathematicsIcon, color: '#eed171' },
    science: { name: 'Ciências', icon: scienceIcon, color: '#5bcb77' },
    geography: { name: 'Geografia', icon: geographyIcon, color: '#00BFFF' },
    history: { name: 'História', icon: historyIcon, color: '#DEB887' },
    art: { name: 'Arte', icon: artIcon, color: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' },
    english: { name: 'Língua Inglesa', icon: englishIcon, color: 'linear-gradient(to right, blue, #b7b9b9, red)' },
    physicalEducation: { name: 'Educação Física', icon: physicalEducationIcon, color: '#ed8900' },
    religion: { name: 'Ensino Religioso', icon: religionIcon, color: '#aea881' }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userDoc = await getDoc(doc(db, 'users', globalUid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSchoolYear(userData.schoolYear);
        setSchoolId(userData.schoolId);
        setClassRoom(userData.classRoom);
      }
    };

    fetchUserData();
  }, [globalUid]);

  useEffect(() => {
    const fetchSubjects = async () => {
      const querySnapshot = await getDocs(collection(db, `${subjectId}Questions`));
      let fetchedSubjects = new Set();
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.schoolYear === schoolYear && data.schoolId === schoolId && data.classRoom === classRoom) {
          fetchedSubjects.add(data.subject);
        }
      });

      const subjectsArray = Array.from(fetchedSubjects).map(subject => ({
        subject,
        ...subjectDetails[subject]
      }));

      // Ordenar os subjects em ordem alfabética
      subjectsArray.sort((a, b) => a.subject.localeCompare(b.subject));
      setSubjects(subjectsArray);
    };

    if (schoolYear && schoolId && classRoom) {
      fetchSubjects();
    }
  }, [subjectId, schoolYear, schoolId, classRoom]);

  const handleNavigation = (subject) => {
    navigate(`/student/subjects/${subjectId}/${subject}`);
  };

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset page to 1 when search term changes
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedSubjects = filteredSubjects.slice((page - 1) * subjectsPerPage, page * subjectsPerPage);

  const getSubjectDisplayName = (subjectId) => {
    const details = subjectDetails[subjectId];
    return details ? (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextWithColor subject={subjectId} text={details.name} color={details.color} />
        <img src={details.icon} alt={`${details.name} icon`} style={{ width: '50px', marginLeft: '20px' }} />
      </Box>
    ) : (
      subjectId.charAt(0).toUpperCase() + subjectId.slice(1)
    );
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2, marginBottom: '5%', marginTop: '6%' }}>
        <Typography variant="h3" gutterBottom className="text-shadow">
          {getSubjectDisplayName(subjectId)}
        </Typography>
      </Box>
      <Box sx={{ marginTop: '5%', marginLeft: 'auto', marginRight: 'auto', width: '70%' }}>
        <Paper elevation={2} sx={{ padding: '20px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '20px' }}>
            <Typography variant="h5" gutterBottom>
              Conteúdos
            </Typography>
            <TextField
              label="Pesquisar"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
            />
          </Box>
          <List>
            {paginatedSubjects.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavigation(item.subject)}>
                    <ListItemText primary={<TextWithColor subject={item.subject} text={getSubjectDisplayName(item.subject)} color={item.color} />} />
                  </ListItemButton>
                </ListItem>
                {index < paginatedSubjects.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(filteredSubjects.length / subjectsPerPage)}
            page={page}
            onChange={handleChangePage}
            color="primary"
          />
        </Box>
      </Box>
    </Container>
  );
};

export default SubjectsList;

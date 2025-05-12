import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Paper,
  Button,
  useMediaQuery,
  useTheme,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  ElectricBolt as ElectricBoltIcon,
  Cable as CableIcon,
  GpsFixed as GpsFixedIcon,
  FlashOn as FlashOnIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import PassiveFireProtection from '../components/checklist/PassiveFireProtection';
import ActiveFireProtection from '../components/checklist/ActiveFireProtection';
import TransformerRisk from '../components/checklist/TransformerRisk';
import CircuitBreakerRisk from '../components/checklist/CircuitBreakerRisk';
import CableRisk from '../components/checklist/CableRisk';
import EarthingAndLightning from '../components/checklist/EarthingAndLightning';
import ArcProtection from '../components/checklist/ArcProtection';
import VoiceRecorder from '../components/VoiceRecorder';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  }),
}));

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const Checklist: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [activeSection, setActiveSection] = useState('passive-fire-protection');

  // Update drawer state when screen size changes
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const sections: ChecklistSection[] = [
    {
      id: 'passive-fire-protection',
      title: 'Passive Fire Protection',
      icon: <SecurityIcon />,
      component: <PassiveFireProtection />,
    },
    {
      id: 'active-fire-protection',
      title: 'Active Fire Protection',
      icon: <AssessmentIcon />,
      component: <ActiveFireProtection />,
    },
    {
      id: 'transformer-risk',
      title: 'Transformer Risk',
      icon: <WarningIcon />,
      component: <TransformerRisk />,
    },
    {
      id: 'circuit-breaker-risk',
      title: 'Circuit Breaker Risk',
      icon: <ElectricBoltIcon />,
      component: <CircuitBreakerRisk />,
    },
    {
      id: 'cable-risk',
      title: 'Cable Risk',
      icon: <CableIcon />,
      component: <CableRisk />,
    },
    {
      id: 'earthing-lightning',
      title: 'Earthing & Lightning',
      icon: <GpsFixedIcon />,
      component: <EarthingAndLightning />,
    },
    {
      id: 'arc-protection',
      title: 'Arc Protection',
      icon: <FlashOnIcon />,
      component: <ArcProtection />,
    },
  ];

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    if (isMobile) {
      setOpen(false); // Close drawer on mobile after selection
    }
  };

  const handleReview = () => {
    // TODO: Implement review functionality
    navigate('/review');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarStyled position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {sections.find(section => section.id === activeSection)?.title}
          </Typography>
          <Button color="inherit" onClick={handleReview}>
            Review
          </Button>
        </Toolbar>
      </AppBarStyled>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
      >
        <DrawerHeader>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Assessment
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {sections.map((section) => (
            <ListItem
              button
              key={section.id}
              selected={activeSection === section.id}
              onClick={() => handleSectionChange(section.id)}
            >
              <ListItemIcon>{section.icon}</ListItemIcon>
              <ListItemText primary={section.title} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItemButton onClick={() => navigate('/review')}>
            <ListItemIcon>
              <AssessmentIcon />
            </ListItemIcon>
            <ListItemText primary="Review & Submit" />
          </ListItemButton>
        </List>
        <Box sx={{ p: 2 }}>
          <VoiceRecorder section={activeSection} />
        </Box>
      </Drawer>
      <Main open={open && !isMobile}>
        <DrawerHeader />
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
            {sections.find((section) => section.id === activeSection)?.component}
          </Paper>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleReview}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Review & Submit
            </Button>
          </Box>
        </Container>
      </Main>
    </Box>
  );
};

export default Checklist; 
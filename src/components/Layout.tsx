import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  ListSubheader,
  Divider,
  CssBaseline,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Cable,
  Calculate,
  Settings,
  Battery4Bar,
  ElectricalServices,
  BarChart,
} from "@mui/icons-material";

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuSections = [
  {
    title: "AC Calculators",
    items: [
      { id: "wire-calc", label: "AC Wire Calculator", icon: <Cable /> },
      {
        id: "voltage-drop",
        label: "Voltage Drop Calculator",
        icon: <Calculate />,
      },
      {
        id: "conduit-fill",
        label: "Conduit Fill Calculator",
        icon: <Settings />,
      },
      {
        id: "bs7671-ref-charts",
        label: "BS7671 Reference Charts",
        icon: <BarChart />,
      },
    ],
  },
  {
    title: "DC Calculators",
    items: [
      { id: "dc-calc", label: "DC Wire Calculator", icon: <Battery4Bar /> },
      {
        id: "dc-breaker-calc",
        label: "DC Breaker Calculator",
        icon: <ElectricalServices />,
      },
    ],
  },
];

export default function Layout({
  children,
  activeTab,
  onTabChange,
}: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: "#1976d2",
        }}
      >
        <Toolbar>
          <Cable sx={{ mr: 2 }} />
          <Typography variant="h6" noWrap component="div">
            Electric Calculator v1.0.1
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          {menuSections.map((section, sectionIndex) => (
            <List
              key={section.title}
              subheader={
                <ListSubheader component="div" id={`section-${sectionIndex}`}>
                  {section.title}
                </ListSubheader>
              }
            >
              {section.items.map((item) => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    selected={activeTab === item.id}
                    onClick={() => onTabChange(item.id)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
              {sectionIndex < menuSections.length - 1 && <Divider />}
            </List>
          ))}
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </Box>
  );
}

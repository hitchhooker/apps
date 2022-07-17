import * as React from 'react';
import { useNavigate, Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import MuiDrawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink, faWaterLadder, faServer } from '@fortawesome/free-solid-svg-icons'
import HubIcon from '@mui/icons-material/Hub';
import SearchSmall from './SearchSmall'
import { getNetworkIcon } from '../constants'
import polkadotJsSVG from '../assets/polkadot_js_logo.svg';
import apiSlice from '../features/api/apiSlice'
import {
  pageChanged,
  selectPage,
} from '../features/layout/layoutSlice';
import {
  chainInfoChanged,
  chainChanged,
  selectChain,
  selectAddress
} from '../features/chain/chainSlice';
import {
  selectAccount,
} from '../features/web3/web3Slice';


function useWeb3ChainInfo(api) {
  const dispatch = useDispatch();
  
  React.useEffect(() => {
    
    const fetchWeb3ChainInfo = async (api) => {
      return await api.registry.getChainProperties();
    }
    
    if (api) {
      fetchWeb3ChainInfo(api).then((info) => {
				dispatch(chainInfoChanged(info.toHuman()));
			});
		}
  }, [api, dispatch]);

  return [];
}

const drawerWidth = 210;

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== 'open',
  })(({ theme, open }) => ({
	zIndex: theme.zIndex.drawer + 1,
	transition: theme.transitions.create(['width', 'margin'], {
	  easing: theme.transitions.easing.sharp,
	  duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
	  marginLeft: drawerWidth,
	  width: `calc(100% - ${drawerWidth}px)`,
	  transition: theme.transitions.create(['width', 'margin'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	  }),
	}),
  }));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
({ theme, open }) => ({
	'& .MuiDrawer-paper': {
	position: 'relative',
	whiteSpace: 'nowrap',
	width: drawerWidth,
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	}),
	boxSizing: 'border-box',
	...(!open && {
		overflowX: 'hidden',
		transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
		}),
		width: theme.spacing(5),
		[theme.breakpoints.up('sm')]: {
		width: theme.spacing(7),
		},
	}),
	},
}),
);

export const LayoutPage = ({api}) => {
  const theme = useTheme();
	const navigate = useNavigate();
	const dispatch = useDispatch();
  
	const [open, setOpen] = React.useState(false);
	const toggleDrawer = () => {
		setOpen(!open);
	};

	const selectedChain = useSelector(selectChain);
  const selectedAddress = useSelector(selectAddress);
  const selectedPage = useSelector(selectPage);
	const web3Account = useSelector(selectAccount);
	useWeb3ChainInfo(api);

	const handleChainSelection = (ev, chain) => {
		if (chain === null) {
			return;
		}
		dispatch(chainChanged(chain));
		// Invalidate cached pools so it re-fetchs pools from selected chain
		dispatch(apiSlice.util.invalidateTags(['Pool']));
		navigate(`/${chain}`, {replace: true})
  };

  const handlePageSelection = (page) => {
    dispatch(pageChanged(page));
    navigate(`/${selectedChain}/${page}`)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="absolute" open={open} color="transparent" sx={{ bgcolor: "rgba(255, 255, 255, 0.5)", backdropFilter: 'blur(8px)'}} elevation={0} >
        <Toolbar sx={{ 
          bgcolor: 'transparent',
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          pr: '24px', // keep right padding when drawer closed
          mt: 1 
          }} id="top-toolbar">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: '36px',
              ...(open && { display: 'none' }),
            }}
            >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            {selectedPage === 'parachains/val-group' ? (!!selectedAddress ? <SearchSmall /> : null) : null}
          </Box>
          <ToggleButtonGroup
            // orientation="vertical"
            value={selectedChain}
            exclusive
            onChange={handleChainSelection}
            aria-label="text alignment"
            sx={{ display: 'flex', alignItems: 'center', 	}}
          >
            {!!web3Account ? 
              <Box sx={{ mr: 3, p: 1, mt: 1, display: 'flex', alignItems: 'center', bgcolor: 'background.secondary', borderRadius: 3}}>
                <Typography variant="body2" color="text.secondary" sx={{ pl: 1, pr: 1 }} >{web3Account.meta.name}</Typography>
                <img src={polkadotJsSVG} style={{ 
                  width: 26,
                  height: 26 }} alt={web3Account.meta.name}/>
              </Box> : null}
            <ToggleButton disabled value="polkadot" aria-label="Polkadot Network" sx={{ mr: 1, border: 0, '&.Mui-selected' : {borderRadius: 16, pr: 2}, '&.MuiToggleButtonGroup-grouped:not(:last-of-type)': {borderRadius: 16}}}>
              <img src={getNetworkIcon("polkadot")}  style={{ 
                width: 32,
                height: 32 }} alt={"polkadot"}/>
              {selectedChain === "polkadot" ? <Typography variant='h5' sx={{ paddingLeft: '8px'}}>Polkadot</Typography> : null}
            </ToggleButton>
            <ToggleButton value="kusama" aria-label="Kusama Network" sx={{ mr: 1, border: 0, '&.Mui-selected' : {borderRadius: 16, pr: 2}, '&.MuiToggleButtonGroup-grouped:not(:first-of-type)': {borderRadius: 16}}}>
              <img src={getNetworkIcon("kusama")}  style={{ 
                width: 32,
                height: 32 }} alt={"kusama"}/>
              {selectedChain === "kusama" ? <Typography variant='h5' sx={{ paddingLeft: '8px'}}>Kusama</Typography> : null}
            </ToggleButton>
            {/* <ToggleButton value="westend" aria-label="Westend Network" sx={{ mr: 1, border: 0, '&.Mui-selected' : {borderRadius: 16}, '&.MuiToggleButtonGroup-grouped:not(:last-of-type)': {borderRadius: 16}}}>
              <img src={getNetworkIcon("westend")} style={{ 
                width: 32,
                height: 32 }} alt={"westend"}/>
              {selected === "westend" ? <Typography variant='h5' sx={{ paddingLeft: '8px'}}>Westend</Typography> : null}
            </ToggleButton> */}
          </ToggleButtonGroup>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open} 
      // sx={{
      //   '.MuiDrawer-paper': open ? {width: 210} : {width: 64}
      // }}
        >
            <Toolbar
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                px: [1],
              }}
            >
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider sx={{ my: 1 }} />
            <List component="nav" 
              sx={{ '> .MuiListItemButton-root.Mui-selected': { bgcolor: "rgba(0, 0, 0, 0.12)"}, '> .MuiListItemButton-root.Mui-selected:hover': { bgcolor: "rgba(0, 0, 0, 0.18)"}}}>
              <ListSubheader component="div" sx={{ color: theme.palette.neutrals[300] }}>
                {open ? 'Validators' : 'Val..'}
              </ListSubheader>
              <ListItemButton selected={selectedPage === 'validators/insights'} disabled
                onClick={() => handlePageSelection('validators/insights')}>
                <ListItemIcon>
                  <FontAwesomeIcon icon={faServer} />
                </ListItemIcon>
                <ListItemText primary="Insights" sx={{ '> .MuiTypography-root': {fontSize: '0.875rem'} }} />
              </ListItemButton>
              <Divider sx={{ my: 1 }} />
              <ListSubheader component="div" sx={{ color: theme.palette.neutrals[300] }}>
                {open ? 'Parachains' : 'Par..'}
              </ListSubheader>
              <ListItemButton selected={selectedPage === 'parachains/overview'}
                onClick={() => handlePageSelection('parachains/overview')}>
                <ListItemIcon>
                  <FontAwesomeIcon icon={faLink} />
                </ListItemIcon>
                <ListItemText primary="Overview" 
                  sx={{ '> .MuiTypography-root': {fontSize: '0.875rem'} }} />
              </ListItemButton>
              <ListItemButton selected={selectedPage === 'parachains/val-group'} 
                onClick={() => handlePageSelection('parachains/val-group')}>
                <ListItemIcon>
                  <HubIcon />
                </ListItemIcon>
                <ListItemText primary="Val. Group" 
                sx={{ '> .MuiTypography-root': {fontSize: '0.875rem'} }} />
              </ListItemButton>
              
              <Divider sx={{ my: 1 }} />
              <ListItemButton  selected={selectedPage === 'pools'}  disabled
                onClick={() => handlePageSelection('pools')}>
                <ListItemIcon>
                  <FontAwesomeIcon icon={faWaterLadder} />
                </ListItemIcon>
                <ListItemText primary="Nomination Pools" sx={{ '> .MuiTypography-root': {fontSize: '0.875rem'} }} />
              </ListItemButton>
            </List>
          </Drawer>
      <Box
            component="main"
            sx={{
              // backgroundColor: (theme) =>
              //   theme.palette.mode === 'light'
              //     ? theme.palette.grey[100]
              //     : theme.palette.grey[900],
              background: "linear-gradient(180deg, #FFF, #F1F1F0)",
              flexGrow: 1,
              height: '100vh',
              overflow: 'auto',
            }}
          >	
        {/*  hidden toolbar */}
        <Toolbar/>
        <Outlet api={api} />
      </Box>
    </Box>
  );
}
import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from "react-router-dom";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import SessionPieChart from './SessionPieChart';
import SessionBox from './SessionBox';
import BlockFinalizedBox from './BlockFinalizedBox';
import ValGroupBox from './ValGroupBox';
import ValAddressProfile from './ValAddressProfile';
import SearchSmall from './SearchSmall';
import ValHeaderBox from './ValHeaderBox';
import ValBodyBox from './ValBodyBox';
import {
  selectAddress,
  addressChanged
} from '../features/chain/chainSlice';
import { 
  selectSessionHistory,
  selectSessionCurrent,
 } from '../features/api/sessionsSlice';
import { 
  selectIsLiveMode,
  selectIsHistoryMode,
} from '../features/layout/layoutSlice';
import { 
  selectIsSocketConnected,
} from '../features/api/socketSlice';

export const ValGroupPage = () => {
	// const theme = useTheme();
  const dispatch = useDispatch();
  const isSocketConnected = useSelector(selectIsSocketConnected);
  const selectedAddress = useSelector(selectAddress);
  const historySession = useSelector(selectSessionHistory);
  const currentSession = useSelector(selectSessionCurrent);
  const isLiveMode = useSelector(selectIsLiveMode);
  const isHistoryMode = useSelector(selectIsHistoryMode);
  let [searchParams] = useSearchParams();
  const searchAddress = searchParams.get("address");
  const sessionIndex = isLiveMode ? currentSession : (!!historySession ? historySession : currentSession);
  

  React.useEffect(() => {
    if (searchAddress && searchAddress !== selectedAddress) {
      dispatch(addressChanged(searchAddress));
    }
  }, [searchAddress, selectedAddress]);

  if (!isSocketConnected) {
    // TODO websocket/network disconnected page
    return (<Box sx={{ m: 2, minHeight: '100vh' }}></Box>)
  }

  return (
		<Box sx={{ m: 2, minHeight: '100vh' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ValHeaderBox address={selectedAddress} sessionIndex={sessionIndex} />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ 
            opacity: 0.25,
            height: '1px',
            borderTop: '0px solid rgba(0, 0, 0, 0.08)',
            borderBottom: 'none',
            backgroundColor: 'transparent',
            backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0))'
            }} />
        </Grid>

        <Grid item xs={12}>
          <ValBodyBox address={selectedAddress} sessionIndex={sessionIndex} />
        </Grid>
        
        {/* ---------- */}
        
        <Grid item xs={12}>
          {!!selectedAddress ? 
          <Box>
            {/* <Divider sx={{ 
            opacity: 0.25,
            height: '1px',
            borderTop: '0px solid rgba(0, 0, 0, 0.08)',
            borderBottom: 'none',
            backgroundColor: 'transparent',
            backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0))'
            }} /> */}
            <ValGroupBox address={selectedAddress} sessionIndex={sessionIndex} />
          </Box>
             : 
          <Box sx={{ height: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <SearchSmall />
          </Box>
          }
        </Grid>
      </Grid>
		</Box>
  );
}
import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from "react-router-dom";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import SessionPieChart from './SessionPieChart';
import BestBlock from './BestBlock';
import ValGroupBox from './ValGroupBox';
import ValAddress from './ValAddress';
import SearchSmall from './SearchSmall';
import ValidatorSessionHistoryPointsChart from './ValidatorSessionHistoryPointsChart';
import {
  selectAddress,
  addressChanged
} from '../features/chain/chainSlice';
import { 
  selectSessionHistory,
  selectSessionCurrent,
 } from '../features/api/sessionsSlice'
import { 
  selectIsLiveMode,
  selectIsHistoryMode,
} from '../features/layout/layoutSlice'
import { 
  selectIsSocketConnected,
} from '../features/api/socketSlice'

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
		<Box sx={{ m: 2, minHeight: '100vh', mt: isLiveMode ? '16px' : '112px' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          {!!selectedAddress ? <ValAddress address={selectedAddress}  sessionIndex={sessionIndex} showGrade /> : null}
        </Grid>
        {isLiveMode ?
          <Grid item xs={12} md={4}>
            <SessionPieChart sessionIndex={sessionIndex} />
          </Grid>
        : null}
        {isLiveMode ? 
          <Grid item xs={12} md={3}>
            <BestBlock />
          </Grid>
        : null}
        {isHistoryMode ? 
          <Grid item xs={12}>
            <ValidatorSessionHistoryPointsChart sessionIndex={sessionIndex} />
          </Grid>
        : null}
        {isHistoryMode ? 
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
        : null}
        <Grid item xs={12}>
          {!!selectedAddress ? 
            <ValGroupBox address={selectedAddress} sessionIndex={sessionIndex} /> : 
            <Box sx={{ height: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <SearchSmall />
            </Box>
          }
        </Grid>
      </Grid>
		</Box>
  );
}
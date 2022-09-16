import * as React from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { BarChart, Bar, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import {
   selectValidatorsBySessionAndGroupId
} from '../features/api/valGroupsSlice';
import {
  selectBackingPointsBySession
} from '../features/api/sessionsSlice';

const renderTooltip = (props, theme) => {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    const data = payload[0] && payload[0].payload;
    return (
      <Box
        sx={{ 
          bgcolor: '#fff',
          p: 2,
          m: 0,
          borderRadius: 1,
          minWidth: '230px',
          boxShadow: 'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px'
         }}
      >
        <Typography component="div" variant="caption" color="inherit" paragraph>
          <b>Backing points</b>
        </Typography>
        <Typography component="div" variant="caption" color="inherit">
          <span style={{ marginRight: '8px', color: theme.palette.neutrals[400] }}>❚</span>Val. Group {data.groupId} (avg): <b>{data.value}</b>
        </Typography>
        <Typography component="div" variant="caption" color="inherit">
          <span style={{ marginRight: '8px', color: theme.palette.neutrals[200] }}>❚</span>All Val. Groups (avg): <b>{data.avg}</b>
        </Typography>
      </Box>
    );
  }

  return null;
};

export default function ValGroupPointsBox({groupId, sessionIndex}) {
  const theme = useTheme();
  const validators = useSelector(state => selectValidatorsBySessionAndGroupId(state, sessionIndex,  groupId));
  const all = useSelector(state => selectBackingPointsBySession(state, sessionIndex));
  
  if (!validators.length) {
    return null
  }
  
  const backingPoints = Math.round(validators.map(v => ((v.auth.ep - v.auth.sp) - (v.auth.ab * 20)) > 0 ? (v.auth.ep - v.auth.sp) - (v.auth.ab * 20) : 0).reduce((a, b) => a + b, 0) / validators.length);

  const avg = !!all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : 0;
  const diff = !!avg ? Math.round(((backingPoints * 100 / avg) - 100) * 10) / 10 : 0;

  const data = [
    {name: 'Backing Points', value: backingPoints, avg, groupId},
  ];
  
  return (
    <Paper sx={{
        p: 2,
        display: 'flex',
        // flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: 112,
        borderRadius: 3,
        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px'
      }}>
      <Box sx={{ pl: 1, pr: 1, display: 'flex', flexDirection: 'column', alignItems: 'left'}}>
        <Typography variant="caption" sx={{whiteSpace: 'nowrap'}}>Backing Points</Typography>
        <Typography variant="h4">
          {backingPoints}
        </Typography>
        <Tooltip title={`${diff}% than the Backing Points average of all the Val. Groups in the current session`} arrow>
          <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', 
            lineHeight: 0.875,
            color: Math.sign(diff) > 0 ? theme.palette.semantics.green : theme.palette.semantics.red }}>
            <b style={{whiteSpace: 'pre'}}>{diff !== 0 ? (Math.sign(diff) > 0 ? `+${diff}%` : `-${Math.abs(diff)}%`) : ' '}</b>
          </Typography>
        </Tooltip>
      </Box>
      <ResponsiveContainer width='40%' height='100%'>
        <BarChart data={data}
          margin={{
            top: 10,
            right: 0,
            left: 0,
            bottom: 10,
          }}>
          <Bar dataKey="value" barSize={12} fill={theme.palette.neutrals[400]} />
          <Bar dataKey="avg" barSize={12} fill={theme.palette.neutrals[200]} />
          <ChartTooltip 
                cursor={{fill: 'transparent'}}
                offset={24}
                wrapperStyle={{ zIndex: 100 }} 
                content={props => renderTooltip(props, theme)} />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
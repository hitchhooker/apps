import * as React from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import isUndefined from 'lodash/isUndefined'
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { BarChart, Bar, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import {
   selectValidatorsBySessionAndGroupId
} from '../features/api/valGroupsSlice';
import {
  selectMVRsBySession
} from '../features/api/sessionsSlice';
import { calculateMvr } from '../util/mvr'

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
          <b>Missed Vote Ratio</b>
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

export default function ValGroupMvrBox({groupId, sessionIndex}) {
  const theme = useTheme();
  const validators = useSelector(state => selectValidatorsBySessionAndGroupId(state, sessionIndex,  groupId));
  const allMVRs = useSelector(state => selectMVRsBySession(state, sessionIndex));
  
  if (!validators.length) {
    return null
  }
  
  const mvr = calculateMvr(
    validators.map(v => v.para_summary.ev).reduce((a, b) => a + b, 0),
    validators.map(v => v.para_summary.iv).reduce((a, b) => a + b, 0),
    validators.map(v => v.para_summary.mv).reduce((a, b) => a + b, 0)
  )
  const avg = Math.round((!!allMVRs.length ? allMVRs.reduce((a, b) => a + b, 0) / allMVRs.length : 0) * 10000) / 10000;

  const diff = !!avg && !!mvr ? Math.round(((mvr * 100 / avg) - 100) * 10) / 10 : 0;

  const data = [
    {name: 'MVR', value: Math.round(mvr * 10000) / 10000, avg: Math.round(avg * 10000) / 10000, groupId},
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
        <Typography variant="caption" sx={{whiteSpace: 'nowrap'}}>Missed Vote Ratio</Typography>
        <Typography variant="h4">
          {!isUndefined(mvr) ? Math.round(mvr * 10000) / 10000 : '-'}
        </Typography>
        <Tooltip title={`${diff}% than the MVR average of all the Val. Groups in the current session`} arrow>
          <Typography variant="subtitle2" sx={{
            lineHeight: 0.875,
            whiteSpace: 'nowrap', color: Math.sign(diff) > 0 ? theme.palette.semantics.red : theme.palette.semantics.green
            }}>
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
import * as React from 'react';
import { useSelector } from 'react-redux';
import isUndefined from 'lodash/isUndefined';
import isNull from 'lodash/isNull';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import IconButton from '@mui/material/IconButton';
import PieChartIcon from '@mui/icons-material/PieChart';
import ListIcon from '@mui/icons-material/List';
// import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled, useTheme } from '@mui/material/styles';
import GradesPieChart from './GradesPieChart';
import Tooltip from './Tooltip';
import {
  selectValidatorsInsightsBySessions,
} from '../features/api/validatorsSlice'
import { 
  selectIdentityFilter,
  selectSubsetFilter
 } from '../features/layout/layoutSlice'
import { 
  selectSessionHistoryRangeIds,
} from '../features/api/sessionsSlice'
import { grade } from '../util/grade'

const grades = ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"]

// const CustomTooltip = styled(({ className, ...props }) => (
//   <Tooltip {...props} arrow classes={{ popper: className }} />
// ))(({ theme }) => ({
//   [`& .${tooltipClasses.arrow}`]: {
//     color: theme.palette.grey[600],
//   },
//   [`& .${tooltipClasses.tooltip}`]: {
//     color: theme.palette.text.primary,
//     backgroundColor: theme.palette.background.primary,
//     boxShadow: 'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px',
//   },
// }));

export default function GradesWithFilterBox({sessionIndex, isHistoryMode}) {
  const theme = useTheme();
  const identityFilter = useSelector(selectIdentityFilter);
  const subsetFilter = useSelector(selectSubsetFilter);
  const historySessionRangeIds = useSelector(selectSessionHistoryRangeIds);
  const rows = useSelector(state => selectValidatorsInsightsBySessions(state, isHistoryMode ? historySessionRangeIds : [sessionIndex], isHistoryMode, identityFilter, subsetFilter));
  const [showPie, setShowPie] = React.useState(true);
  
  if (!rows.length) {
    return null
  }

  const mvrs = rows.map(v => v.mvr).filter(mvr => !isUndefined(mvr) && !isNull(mvr))
  
  if (!mvrs.length) {
    return null
  }

  const gradesData = grades.map(g => {
    const quantity = mvrs.filter(mvr => grade(1 - mvr) === g).length;
    const percentage = quantity * 100 / mvrs.length;
    return {
      name: g,
      value: percentage,
      quantity,
    }
  });
  
  const handleView = () => {
    setShowPie(!showPie);
  }
  
  return (
    <Paper sx={{ 
      // m: 2,
      // p: 2,
      display: 'flex',
      flexDirection: 'column',
      // justifyContent: 'center',
      // alignItems: 'center',
      width: '100%',
      // width: 352,
      height: 352,
      borderRadius: 3,
      boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}>
      <Box sx={{p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
          <Box sx={{ display: 'flex', width: "80%"}}>
            <Box sx={{mr: 1,
              whiteSpace: "nowrap", 
              overflow: "hidden", 
              textOverflow: "ellipsis"
            }}>
              <Box sx={{ display: 'flex'}}>
                <Typography variant="h6" sx={{ mr: 1, overflow: "hidden", textOverflow: "ellipsis" }} title="Distribution by grade">
                Distribution by grade
                </Typography>
                <Tooltip
                  disableFocusListener
                  placement="bottom-end"
                  title={
                    <Box sx={{ p: 1}}>
                      <Typography variant="caption" >A grade reflects the backing votes ratio (BVR) of one or a set of validators:</Typography>
                      <ul>
                        <li>{"A+ = BVR > 99%"}</li>
                        <li>{"A = BVR > 95%"}</li>
                        <li>{"B+ = BVR > 90%"}</li>
                        <li>{"B = BVR > 80%"}</li>
                        <li>{"C+ = BVR > 70%"}</li>
                        <li>{"C = BVR > 60%"}</li>
                        <li>{"D+ = BVR > 50%"}</li>
                        <li>{"D = BVR > 40%"}</li>
                        <li>{"F = BVR <= 40%"}</li>
                      </ul>
                      <i>Note: BVR = 1 - MVR</i>
                    </Box>
                  }
                  >
                  <InfoOutlinedIcon sx={{ color: theme.palette.neutrals[300]}}/>
                </Tooltip>
              </Box>
              <Typography variant="subtitle2" sx={{ height: 16, overflow: "hidden", textOverflow: "ellipsis" }}>
                {subsetFilter !== '' ? <span>Only for subset {subsetFilter}</span> : 'Only para-validators'}
              </Typography>
            </Box>
          </Box>
          <Box>
          <IconButton aria-label="grade-details" onClick={handleView}>
            { !showPie ? <PieChartIcon fontSize="small" /> : <ListIcon fontSize="small" /> }
          </IconButton>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          { showPie ? 
          
            <GradesPieChart data={gradesData} size="md"  /> :
           
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '256px'}}>
              <List dense >
                {gradesData.map((g, i) => (
                  <ListItem key={i} sx={{ 
                      // bgcolor: theme.palette.grade[g],
                      borderBottom: `1px solid ${theme.palette.divider}`, 
                      '+ :last-child': { borderBottom: 'none'} 
                    }}
                      secondaryAction={
                        <Typography variant="caption">{`${(Math.round(g.value*100)/100)}%`}</Typography>
                      }
                    >
                    <ListItemIcon sx={{ minWidth: '24px'}}>
                      <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', 
                        bgcolor: theme.palette.grade[g.name], 
                        display: "inline-block" }}>
                      </Box>
                    </ListItemIcon>
                    <ListItemText sx={{ m: 0 }} primary={`${g.name}`} />
                  </ListItem>
                ))}
              </List>
            </Box>
          }
        </Box>
      </Box>
    </Paper>
  )
}
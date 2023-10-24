import * as React from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import NominationDialog from './NominationDialog';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Identicon from '@polkadot/react-identicon';
import { ReactComponent as NominationIcon } from '../../assets/polkadot_icons/nominating_white.svg';
import {
  selectValProfileByAddress,
  useGetValidatorProfileByAddressQuery
} from '../../features/api/valProfilesSlice';
import {
  selectCandidates
} from '../../features/api/boardsSlice';
import { stashDisplay, nameDisplay } from '../../util/display'

function CandidateChip({stash, onClick}) {
  const theme = useTheme();
  useGetValidatorProfileByAddressQuery(stash);
  const valProfile = useSelector(state => selectValProfileByAddress(state, stash));

  return (
    <Chip sx={{ mb: theme.spacing(1), minWidth: 128, justifyContent: 'flex-start'}} 
      onClick={() => onClick(stash)}
      label={nameDisplay(!!valProfile ? valProfile._identity : stashDisplay(stash, 4), 12)} 
      icon={<Identicon value={stash} size={24} theme={'polkadot'} />} 
    />
  )
}

export default function NominationBox({api, left, onClick, onAddAllClick }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const candidates = useSelector(selectCandidates);
  
  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  return (
      <Box sx={{ 
        position: 'absolute', 
        top: 96,
        transition: theme.transitions.create(['left'], {
          duration: theme.transitions.duration.standard,
        }),
        left,
        zIndex: 1
      }}>
        <Stack direction="column" sx={{ width: 145 }}>
          <Typography variant='h6' paragraph>
            Candidates
            {candidates.length > 0 ?
              <Box component="span" sx={{ 
                position: 'absolute',
                top: 0,
                right: -10,
                backgroundColor: theme.palette.background.secondary, width: 28, height: 28, borderRadius: '50%',
                color: theme.palette.text.secondary,
                display: 'center',
                alignItems: 'center',
                justifyContent: 'center'
                }}><Typography variant='caption' color="secondary">{candidates.length}</Typography>
              </Box> : null }
          </Typography>
          { candidates.length < 16 ?
            <Button sx={{mb: theme.spacing(1)}} onClick={onAddAllClick} align="flex-start" variant='contained'>
              Add All
            </Button> : null }
          {candidates.length > 0 ?
            <Button sx={{mb: theme.spacing(1)}} onClick={handleOpenDialog} startIcon={<NominationIcon />} variant='contained'>
              {/* <Box component="span" sx={{ 
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  backgroundColor: theme.palette.semantics.red, width: 28, height: 28, borderRadius: '50%',
                  color: theme.palette.text.secondary,
                  display: 'center',
                  alignItems: 'center',
                  justifyContent: 'center'
                  }}><Typography variant='caption' color="secondary">{candidates.length}</Typography>
                  </Box> */}
              Nominate
            </Button> : null}
          {candidates.map((value, index) => (<CandidateChip key={index} stash={value} onClick={onClick} />))}
        </Stack>
        { open ?
            <NominationDialog
            api={api}
            open={open}
            onClose={handleCloseDialog}
          /> : null}
      </Box>
  );
}
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'

export default function PaginationBox({totalSize = 100, pageSize = 16, onChange}) {
  const [page, setPage] = React.useState(0);
  
  const handlePreviousPage = () => {
    if (page > 0) {
      const next = page - 1;
      setPage(next)
      if (onChange) {
        onChange(next)
      }
    }
  }

  const handleNextPage = () => {
    if (page < Math.round(totalSize/pageSize)) {
      const next = page + 1;
      setPage(next)
      if (onChange) {
        onChange(next)
      }
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
      <Typography variant='caption' sx={{mr: 1}}>
        {`${page + 1}—${Math.round(totalSize/pageSize) + 1} of ${totalSize}`}
      </Typography>
      <IconButton onClick={handlePreviousPage} 
        disabled={page === 0}
        sx={{width: 30, height: 30, mr: 2}}>
        <FontAwesomeIcon icon={faAngleLeft} fontSize="small" />
      </IconButton>
      <IconButton onClick={handleNextPage} 
        disabled={page === Math.round(totalSize/pageSize)}
        sx={{ width: 30, height: 30}}>
        <FontAwesomeIcon icon={faAngleRight} fontSize="small" />
      </IconButton>
    </Box>
  );
}
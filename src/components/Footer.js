import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import EmailIcon from '@mui/icons-material/EmailRounded';
import Identicon from '@polkadot/react-identicon';
import logo from '../assets/logo/logo_1_inverted_subtract_turboflakes_.svg';
import twitterSVG from '../assets/twitter_white.svg';
import githubSVG from '../assets/github_white.svg';
import polkadotSVG from '../assets/polkadot_icon.svg';
import kusamaSVG from '../assets/kusama_icon.svg';
import kusamaTreasurySVG from '../assets/kusama_support_treasury_white.svg';
import { getNetworkIcon, getTurboValidators } from '../constants/index';

export default function Footer({small}) {
	
	const handleTwitter = () => {
		window.open('https://twitter.com/turboflakes', '_blank')
	}
	
	const handleGithub = () => {
		window.open('https://github.com/turboflakes', '_blank')
	}

	const handleEmail = () => {
		window.location.href = "mailto:support@turboflakes.io"
	}

		return (
			<Box sx={{ bgcolor: 'background.secondary'}} >
				<Container>
					{ !small ? 
						<Grid container sx={{ py: small ? 4 : 8 }}>
							<Grid container item xs={12} sm={6}>
								<Link href="https://www.turboflakes.io" target="_blank" rel="noreferrer" color="inherit" align="right" >
									<img src={logo} style={{ height: small ? 32 : 64, marginBottom: 24 }} alt={"logo"}/>
								</Link>
							</Grid>
							<Grid item xs={6} sm={3}>
								<Typography variant="h5" color="textSecondary" paragraph>
									General
								</Typography>
								<Typography color="textSecondary" gutterBottom>
									<Link href="https://www.turboflakes.io/#/about" underline="none" color="inherit">About us</Link>
								</Typography>
								{/* <Typography color="textSecondary" gutterBottom>
									<Link href="https://www.turboflakes.io/#/tools" underline="none" color="inherit">Tools</Link>
								</Typography> */}
								<Typography color="textSecondary" gutterBottom>
									<Link href="https://www.turboflakes.io/#/validators" underline="none" color="inherit">Validators</Link>
								</Typography>
								<Typography color="textSecondary" gutterBottom>
									<Link href="https://pools.turboflakes.io" underline="none" color="inherit">Nomination Pools</Link>
								</Typography>
							</Grid>
						
							<Grid item xs={6} sm={3}>
								<Typography variant="h5" color="textSecondary" paragraph>
									Networks
								</Typography>
								<Typography color="textSecondary" gutterBottom>
									<Link href="https://polkadot.network/" underline="none"  target="_blank" rel="noreferrer" color="inherit">Polkadot Network</Link>
								</Typography>
								<Typography color="textSecondary" gutterBottom>
									<Link href="https://kusama.network/" underline="none" target="_blank" rel="noreferrer" color="inherit">Kusama Network</Link>
								</Typography>
							</Grid> 
						</Grid> : null}
					  <Box sx={{ py: 2, display: 'flex', justifyContent: small ? 'space-between' : 'flex-end', alignItems: 'center' }}>
              <Link href="https://www.turboflakes.io" target="_blank" rel="noreferrer" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
                <img src={logo} style={{ height: small ? 32 : 64 }} alt={"logo"}/>
              </Link>
              <Box sx={{ display: 'flex'}}>
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center'}}>
                  <Typography variant="caption" color="textSecondary">
                  <b>Hey! Stake with</b>
                  </Typography>
                </Box>
                {getTurboValidators("polkadot").map((v, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center'}}>
                    <Typography variant="caption" color="textSecondary" sx={{mr: 1}}>
                      <b>{v.name}</b>
                    </Typography>
                    <Box sx={{ position: 'relative'}}>
                      <img src={polkadotSVG} 
                        style={{ 
                          position: 'absolute', 
                          border: '1px solid #FFF', borderRadius: '50%', 
                          height: 20, right: -8, bottom: 2 }} alt={"github"}/>
                      <Identicon
                        value={v.stash}
                        size={32}
                        theme={'polkadot'} />
                    </Box>
                  </Box>
                ))}
                {getTurboValidators("kusama").map((v, i) => (
                  <Box key={i} sx={{ ml: 2, display: 'flex', alignItems: 'center'}}>
                    <Typography variant="caption" color="textSecondary" sx={{mr: 1}}>
                      <b>{v.name}</b>
                    </Typography>
                    <Box sx={{ position: 'relative'}}>
                      <img src={kusamaSVG} 
                        style={{ 
                          position: 'absolute', 
                          border: '1px solid #FFF', borderRadius: '50%', 
                          height: 20, right: -8, bottom: 2 }} alt={"github"}/>
                      <Identicon
                        value={v.stash}
                        size={32}
                        theme={'polkadot'} />
                    </Box>
                  </Box>
                ))}
              </Box>
					</Box>
          <Box sx={{ py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" color="textSecondary" sx={{ mr: 2 }}>
              © 2023 TurboFlakes • ONE-T // indexer bot • Substrate Blockchain Analytics
              </Typography>
              <img src={kusamaTreasurySVG} style={{ 
                    marginLeft: 8,
                    height: 32 }} alt={"supported by kusama treasury"}/>
            </Box>
            <Box>
              
							<IconButton size="small" sx={{ 
								margin: '0 8px', 
								border: '1px solid #FFF', 
								color: 'text.secondary',
								width: 30,
								height: 30 
								}} onClick={handleEmail}>
								<EmailIcon sx={{ width: 20 , height: 20 }}/>
							</IconButton>
							<IconButton color="secondary" size="small" sx={{ 
								margin: '0 8px', 
								border: '1px solid #FFF', 
								color: 'text.secondary',
								width: 30,
								height: 30 }} onClick={handleTwitter}>
								<img src={twitterSVG}  style={{ 
									width: 18,
									height: 18 }} alt={"github"}/>
							</IconButton>
							<IconButton color="secondary" size="small" sx={{ 
								ml: 1, 
								border: '1px solid #FFF', 
								color: 'text.secondary',
								width: 30,
								height: 30 }} onClick={handleGithub}>
								<img src={githubSVG} style={{ 
									width: 18,
									height: 18 }} alt={"github"}/>
							</IconButton>
            </Box>
            {/* TODO */}
						{/* <Box sx={{ display: 'flex'}}>
							<Typography variant="caption" color="textSecondary" sx={{ mr: 2 }}>
								<Link href="/#/disclaimer" underline="none" color="inherit" >Disclaimer</Link>
							</Typography>
							<Typography variant="caption" color="textSecondary" sx={{ mr: 2 }}>
								<Link href="/#/privacy" underline="none" color="inherit" >Privacy Policy</Link>
							</Typography>
							<Typography variant="caption" color="textSecondary">
								<Link href="/#/terms" underline="none" color="inherit" >Terms of Use</Link>
							</Typography>
						</Box> */}
					</Box>
				</Container>
			</Box>
		)
	
}
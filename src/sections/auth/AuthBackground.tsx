// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// project-import
import { ThemeDirection, ThemeMode } from 'config';

// ==============================|| AUTH BLUR BACK SVG ||============================== //

export default function AuthBackground() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        filter: 'blur(18px)',
        zIndex: -1,
        bottom: 0,
        transform: theme.direction === ThemeDirection.RTL ? 'rotate(180deg)' : 'inherit'
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 60 60" width="100%" height="calc(100vh - 175px)">
        <defs>
          <style>{`.cls-1 { fill-rule: evenodd; }`}</style>
        </defs>
        <g>
          <g id="Layer_1">
            <g>
              <path
                className="cls-1"
                d="M32.2,17.8h-13.2c.2-.2.4-.5.4-.9s-.1-.6-.3-.8h11.9L12.5,5.7l5.9,10c-.1,0-.2-.1-.4-.1-.5,0-1,.3-1.2.8l-6.4-10.9-6,13,5.9,10h0l.2.3-1.4,1.1c-2.3-3.9-4.7-8-6.6-11.2v-.2c0,0,0-.2,0-.2L9.9,2.3c7.9,4.4,15.7,8.9,23.6,13.3,8.7,4.9,17.3,9.8,25,14.2l.4.2h0l-.4.2c-7.7,4.4-16.4,9.3-25,14.2-7.9,4.4-15.7,8.9-23.6,13.3l-7.4-15.8v-.2c0,0,0-.2,0-.2,1.8-3,4.2-7.1,6.5-11l1.4,1c-2,3.4-4,6.9-6,10.3l6,13,6.5-10.9c.2.5.6.9,1.2.9h.2l-5.8,9.8,18.4-10.4h-11.7c.1-.2.2-.4.2-.6,0-.5-.3-.9-.7-1.1h13.5l-6.5-10.9c.1,0,.2.1.4.1.6,0,1.1-.4,1.2-1l6.6,11.1,4.8-8,1.8-3.1c.2.5.6.8,1.2.8s.3,0,.4-.1l-1.4,2.3-4.5,7.4,3.5-2,14.4-8.2h-11.5c.2-.2.3-.5.3-.8s0-.7-.4-.9h11.6l-14.4-8.2-3.5-2,3.9,6.5,2,3.4c0,0-.3-.1-.4-.1-.5,0-1,.3-1.2.8l-6.6-11.1-6.7,11.3c-.2-.4-.6-.7-1.1-.7s-1.3.6-1.3,1.3.1.5.2.6h-13.6v-.5l.2-.5-.2-.4v-.4h14l6.8-11.4h0Z"
              />
              <path className="cls-1" d="M18.3,18.2h-.2c-.6,0-1-.4-1.2-.9-1.3,2.1-2.5,4.2-3.8,6.3l.9,1.6h0l4.3-7h0Z" />
              <path className="cls-1" d="M16.9,43c.2-.4.6-.7,1.1-.7s.3,0,.4,0l-4.2-7-1,1.6c1.4,2.1,2.4,3.9,3.7,6Z" />
            </g>
          </g>
        </g>
      </svg>
    </Box>
  );
}

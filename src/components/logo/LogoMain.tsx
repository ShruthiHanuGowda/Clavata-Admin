// material-ui
import logo from 'assets/images/logo/d_energy_logo_final_nft_ver 1.png';
// project-import

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

interface LogoProps {
  reverse?: boolean;
}

export default function LogoMain({ reverse }: LogoProps) {
  return (
    <img
      src={logo}
      alt="d_energy_logo"
      width="100%"
      style={{
        filter: reverse ? 'invert(1)' : 'none' // Example: Invert the image if reverse is true
      }}
    />
  );
}

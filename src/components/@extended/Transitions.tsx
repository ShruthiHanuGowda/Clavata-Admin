import { forwardRef, CSSProperties, ReactElement, Ref } from 'react';
import Collapse, { CollapseProps } from '@mui/material/Collapse';
import Fade, { FadeProps } from '@mui/material/Fade';
import Box from '@mui/material/Box';
import Grow, { GrowProps } from '@mui/material/Grow';
import Slide, { SlideProps } from '@mui/material/Slide';
import Zoom, { ZoomProps } from '@mui/material/Zoom';

// ==============================|| TRANSITIONS ||============================== //

type TransitionProps = GrowProps | CollapseProps | FadeProps | SlideProps | ZoomProps;

interface Props {
  children?: ReactElement;
  position?: 'top-left' | 'top-right' | 'top' | 'bottom-left' | 'bottom-right' | 'bottom';
  sx?: CSSProperties;
  in?: boolean;
  type?: 'grow' | 'collapse' | 'fade' | 'slide' | 'zoom';
  direction?: 'up' | 'right' | 'left' | 'down';
  others?: TransitionProps;
}

function transitions({ children, position = 'top-left', type = 'grow', direction = 'up', ...others }: Props, ref: Ref<HTMLElement>) {
  let positionSX: CSSProperties = { transformOrigin: '0 0 0' };

  switch (position) {
    case 'top-right':
      positionSX = { transformOrigin: 'top right' };
      break;
    case 'top':
      positionSX = { transformOrigin: 'top' };
      break;
    case 'bottom-left':
      positionSX = { transformOrigin: 'bottom left' };
      break;
    case 'bottom-right':
      positionSX = { transformOrigin: 'bottom right' };
      break;
    case 'bottom':
      positionSX = { transformOrigin: 'bottom' };
      break;
    case 'top-left':
    default:
      positionSX = { transformOrigin: '0 0 0' };
      break;
  }

  return (
    <Box ref={ref}>
      {type === 'grow' && (
        <Grow {...(others as GrowProps)} timeout={{ appear: 0, enter: 150, exit: 150 }}>
          <Box sx={positionSX}>{children}</Box>
        </Grow>
      )}

      {type === 'collapse' && (
        <Collapse {...(others as CollapseProps)} sx={positionSX}>
          {children}
        </Collapse>
      )}

      {type === 'fade' && (
        <Fade {...(others as FadeProps)} timeout={{ appear: 0, enter: 300, exit: 150 }}>
          <Box sx={positionSX}>{children}</Box>
        </Fade>
      )}

      {type === 'slide' && (
        <Slide {...(others as SlideProps)} timeout={{ appear: 0, enter: 150, exit: 150 }} direction={direction}>
          <Box sx={positionSX}>{children}</Box>
        </Slide>
      )}

      {type === 'zoom' && (
        <Zoom {...(others as ZoomProps)}>
          <Box sx={positionSX}>{children}</Box>
        </Zoom>
      )}
    </Box>
  );
}

export default forwardRef(transitions);

function popupTransition(props: ZoomProps, ref: Ref<unknown>) {
  return <Zoom ref={ref} timeout={200} {...props} />;
}
export const PopupTransition = forwardRef(popupTransition);

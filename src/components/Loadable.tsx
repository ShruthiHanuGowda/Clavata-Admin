import { ComponentType, Suspense } from 'react';
import Loader from './Loader';

// ==============================|| LOADABLE - LAZY LOADING ||============================== //

function Loadable<T extends object>(Component: ComponentType<T>) {
  const LoadableComponent = (props: T) => (
    <Suspense fallback={<Loader />}>
      <Component {...props} />
    </Suspense>
  );

  // Set display name for React DevTools and to fix eslint warning
  LoadableComponent.displayName = `Loadable(${Component.displayName || Component.name || 'Component'})`;

  return LoadableComponent;
}

export default Loadable;

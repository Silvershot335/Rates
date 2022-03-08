import type { FC } from 'react';
import Spinner from './Spinner';

const LoadingScreen: FC = () => (
  <div className="flex items-center justify-center flex-1">
    <Spinner />
  </div>
);

export default LoadingScreen;

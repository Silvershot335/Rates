import type { FC } from 'react';

const Spinner: FC = () => (
  <div
    className="spinner-border animate-spin inline-block w-8 h-8 border-r-transparent border-purple-500 border-4 rounded-full"
    role="status"
  >
    <span className="invisible">Loading...</span>
  </div>
);

export default Spinner;

import { AppErrorBoundary } from './components/molecules/AppErrorBoundary';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <AppErrorBoundary>
      <AppRoutes />
    </AppErrorBoundary>
  );
}

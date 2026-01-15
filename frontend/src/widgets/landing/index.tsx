// Re-export landing module components
import './i18n/config';
import { Home } from './pages/Home';

export const LandingModule = () => {
    return <Home />;
};

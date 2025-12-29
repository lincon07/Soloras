import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/pages/dashboard/dashboard';
import Providers from './providers';
import { Menu } from './menu-bar';
import SettingsPage from './components/pages/settings/settings';


export const AppRoutes = () => {
    return (
            <Providers>
                {/* <Menu /> */}
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
            </Providers>
    )
}
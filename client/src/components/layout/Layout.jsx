import { Outlet } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarContent,
  SidebarInset
} from '../ui/sidebar';
import { AppHeader } from './AppHeader';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <SidebarProvider>
        <div className="flex flex-1">
          <Sidebar>
            <SidebarContent>
              {/* Sidebar content goes here */}
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <div className="p-6">
              <Outlet />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";

const Layout = ({ children, authUser }) => {
  return (
    <div className="min-h-screen bg-surface-0">
      <div className="max-w-7xl mx-auto flex">
        {/* Left sidebar */}
        <div className="w-16 xl:w-72 flex-shrink-0 border-r border-surface-3">
          <Sidebar authUser={authUser} />
        </div>

        {/* Main content */}
        <main className="flex-1 max-w-[600px] border-r border-surface-3 min-h-screen">
          {children}
        </main>

        {/* Right panel */}
        <div className="hidden lg:block w-80 xl:w-96 px-6 py-4 flex-shrink-0">
          <RightPanel authUser={authUser} />
        </div>
      </div>
    </div>
  );
};

export default Layout;
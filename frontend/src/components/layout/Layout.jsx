import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children, missedCount = 0 }) {
  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header missedCount={missedCount} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
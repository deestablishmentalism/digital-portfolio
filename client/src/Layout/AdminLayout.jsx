import { Outlet, useNavigate } from "react-router-dom";
import { Suspense, useState } from "react";
import SpinnerComponent from "../Components/SpinnerComponent";
import AdminNavLink from "../Components/AdminNavLink";
import { Home, LogOut, Menu, X, Shield } from "lucide-react";
import api from "../api/axios";
import { useToastMessage } from "../Components/ToastMessage";

export default function AdminLayout() {
    const navigate = useNavigate();
    const showToastMessage = useToastMessage();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            const response = await api.post("/users/logging-out");
            if (response.status !== 200) throw new Error("ERR: " + response.status);
            showToastMessage(response.data.success, response.data.message);
            navigate("/login");
        } catch (error) {
            showToastMessage(false, error.message);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center gap-2 text-teal-400">
                    <Shield className="w-5 h-5" />
                    <span className="font-header-text text-sm tracking-wider">Admin Center</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                >
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-4">
                    <nav>
                        <ul className="space-y-1.5" onClick={() => setIsMobileMenuOpen(false)}>
                            <AdminNavLink to="/admin" end>Dashboard</AdminNavLink>
                            <AdminNavLink to="/admin/project">Projects</AdminNavLink>
                            <AdminNavLink to="/admin/links">Links</AdminNavLink>
                            <AdminNavLink to="/admin/skills">Skills</AdminNavLink>
                            <AdminNavLink to="/admin/personal-info">Personal Info</AdminNavLink>
                        </ul>
                    </nav>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-sub-header-text uppercase text-slate-400 hover:text-teal-300"
                        >
                            <Home className="w-4 h-4" />
                            <span>View Site</span>
                        </a>

                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-sub-header-text uppercase"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>{isLoggingOut ? "Exiting..." : "Logout"}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 p-5 border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-md flex-col justify-between shrink-0">
                <div>
                    <div className="flex items-center gap-2.5 px-3 py-3 mb-6 rounded-xl bg-slate-900/60 border border-slate-800 text-teal-400">
                        <Shield className="w-5 h-5" />
                        <span className="font-header-text text-sm tracking-wider">Admin Center</span>
                    </div>

                    <nav>
                        <ul className="space-y-1.5 font-sub-header-text text-xs uppercase tracking-wider">
                            <AdminNavLink to="/admin" end>Dashboard</AdminNavLink>
                            <AdminNavLink to="/admin/project">Projects</AdminNavLink>
                            <AdminNavLink to="/admin/links">Links</AdminNavLink>
                            <AdminNavLink to="/admin/skills">Skills</AdminNavLink>
                            <AdminNavLink to="/admin/personal-info">Personal Info</AdminNavLink>
                        </ul>
                    </nav>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-800/80">
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800 hover:border-teal-400/40 text-slate-300 hover:text-teal-200 text-xs font-sub-header-text uppercase tracking-wider transition-all"
                    >
                        <Home className="w-4 h-4" />
                        <span>Live Site</span>
                    </a>

                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-red-500/30 bg-red-950/40 hover:bg-red-950/80 hover:border-red-500/60 text-red-300 text-xs font-sub-header-text uppercase tracking-wider transition-all cursor-pointer"
                    >
                        {isLoggingOut ? (
                            <SpinnerComponent width={18} height={18} />
                        ) : (
                            <>
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                <Suspense
                    fallback={
                        <div className="flex justify-center items-center min-h-[50vh]">
                            <SpinnerComponent width={36} height={36} />
                        </div>
                    }
                >
                    <Outlet />
                </Suspense>
            </main>
        </div>
    );
}

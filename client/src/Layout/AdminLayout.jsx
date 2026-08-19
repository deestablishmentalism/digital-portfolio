import { Outlet, NavLink } from "react-router-dom";
import { Suspense } from "react";
import SpinnerComponent from "../Components/SpinnerComponent";
import AdminNavLink from "../Components/AdminNavLink";
import { Home} from "lucide-react";
export default function AdminLayout() {
    return(
        <div className="flex min-h-screen">
            <aside className="w-64 p-4 border-r border-white/10 flex flex-col justify-between">
                <nav>
                    <ul className="space-y-1">
                        <AdminNavLink to="/admin" end>Dashboard</AdminNavLink>
                        <AdminNavLink to="/admin/project">Projects</AdminNavLink>
                        <AdminNavLink to="/admin/links">Links</AdminNavLink>
                        <AdminNavLink to="/admin/skills">Skills</AdminNavLink> 
                        <AdminNavLink to="/admin/personal-info">Personal Info</AdminNavLink>
                    </ul>
                </nav>
                <div className="m-2 flex flex-col">
                    <div className="m-1 card-light text-center ">
                        <h2 className="text-lg font-semibold font-header-text">Admin</h2>      
                    </div> 
                    <NavLink to="/" className="m-1 card-dark flex justify-center hover:bg-slate-800">
                        <Home/>
                    </NavLink>
                </div>
            </aside>
            <main className="flex-1 p-6">
                <Suspense fallback={<SpinnerComponent width={40} height={40} color="black"/>}>
                    <Outlet/>
                </Suspense>
            </main>
        </div>
    );
}
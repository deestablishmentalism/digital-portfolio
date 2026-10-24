import { NavLink } from "react-router-dom";

export default function AdminNavLink({ to, end, children }) {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          `block px-3.5 py-2.5 rounded-xl font-sub-header-text text-xs uppercase tracking-wider transition-all duration-200 ${
            isActive
              ? "bg-teal-950/70 text-teal-300 border border-teal-500/40 shadow-sm shadow-teal-950/50 font-semibold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
          }`
        }
      >
        {children}
      </NavLink>
    </li>
  );
}

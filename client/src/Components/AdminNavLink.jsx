import { NavLink } from "react-router-dom";

export default function AdminNavLink({ to, end, children }) {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          `block px-4 py-2 rounded transition-colors ${
            isActive
              ? "bg-sky-500/20 text-sky-300 border-l-2 border-sky-400"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
          }`
        }
      >
        {children}
      </NavLink>
    </li>
  );
}

import {useEffect, useState} from "react"
import { NavLink } from "react-router-dom"
import { SocialsIconMapper } from "../utils/IconMapper"
import api from "../api/axios"
export default function ContactSectionComponent({preview=false,refreshKey}) {
    const [links, setLinks] = useState([])
    useEffect(()=> {
        async function fetchLinks() {
            try {
                const response = preview ? await api.get("/links/contacts/admin") : await api.get("/links/contacts")
                if(!response.status === 200) throw new Error("ERR: "+response.status)
                setLinks(response.data)
            }
            catch(error) {
                console.error(error.message)
            }
        }
        fetchLinks()
    },[refreshKey])
    return(
        <>
            <div className="w-full">
                <h2 className="text-md m-1 font-bold text-white">Open to work or for projects.</h2>
                <div className="w-full max-w-full p-2 border border-slate-800/70 rounded-2xl bg-slate-950/40">
                    {links.length === 0 ? (
                        <div className="flex justify-center items-center px-6 py-4 text-sm text-slate-400">
                            No links provided.
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-2">
                            {links.map((link) => {
                                const hrefString =
                                    link.social === "gmail"
                                        ? "mailto:"
                                        : link.social === "phonenumber"
                                        ? "tel:"
                                        : "";

                                const Icon = SocialsIconMapper(false)[link.social];

                                return (
                                    <NavLink
                                        key={link._id}
                                        to={hrefString + link.link}
                                        target="_blank"
                                        className={`
                                            group
                                            w-full md:w-auto
                                            min-w-40
                                            flex items-center justify-center gap-3
                                            px-4 py-3
                                            rounded-xl
                                            border border-slate-700/60
                                            bg-slate-900/60
                                            text-slate-200
                                            transition-all duration-200
                                            hover:-translate-y-0.5
                                            hover:border-teal-400/50
                                            hover:bg-slate-800
                                            hover:text-teal-200
                                            hover:shadow-lg hover:shadow-teal-950/20
                                            ${preview
                                                ? "pointer-events-none"
                                                : "cursor-pointer"}
                                        `}
                                    >
                                        {Icon && (
                                            <Icon
                                                className="
                                                    w-6 h-6
                                                    transition-transform duration-200
                                                    group-hover:scale-110
                                                "
                                            />
                                        )}

                                        <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
                                            {returnPhoneNumber(link.social).toUpperCase()}
                                        </span>
                                    </NavLink>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
function returnPhoneNumber(text) {
    return typeof text === "string"
    ? text.replace(/phonenumber/g, "phone number")
    : text;
}
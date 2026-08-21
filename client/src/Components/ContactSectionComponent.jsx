import {useEffect, useState} from "react"
import { NavLink } from "react-router-dom"
import { SocialsIconMapper } from "../utils/IconMapper"
export default function ContactSectionComponent({preview=false,refreshKey}) {
    const [links, setLinks] = useState([])
    useEffect(()=> {
        async function fetchLinks() {
            try {
                const response = await fetch("/api/links/contacts")
                if(!response.ok) throw new Error("ERR: "+response.status)
                setLinks(await response.json())
            }
            catch(error) {
                console.error(error.message)
            }
        }
        fetchLinks()
    },[refreshKey])
    return(
        <>
            <div>
                <h2 className="text-md m-1 font-bold text-white">Open to work or for projects.</h2>
                <div className="p-2 border-1 border-slate-800 rounded flex"> 
                    {links.length === 0 ? (
                        <div className="flex justify-center">No Links provided.</div>
                    )
                    : (
                        <div className="w-full flex gap-2 flex-wrap md:flex-nowrap">
                            {links.map((link)=> {
                            const hrefString = link.social === "gmail" ? "mailto:" : link.social === "phonenumber" ? "tel:" : ""
                            return(
                                <NavLink
                                    key={link._id}
                                    to={hrefString + link.link}
                                    target="_blank"
                                    className={`w-full flex items-center gap-2
                                            text-white
                                            p-2 rounded border-2 border-slate-800
                                            ${preview ? "pointer-events-none" : "cursor-pointer"} hover:bg-slate-800
                                            hover:text-teal-200
                                            justify-center`}
                                >
                                    {(() => {
                                        const Icon = SocialsIconMapper(true)[link.social];
                                        return Icon ? <Icon className="w-10 h-10 md:w-15 md:h-15" /> : null;
                                    })()}
                                    <span className="text-[10px] sm:text-[11px] md:text-[13px] font-bold">{returnPhoneNumber(link.social).toUpperCase()}</span>
                                </NavLink>
                                )
                            })
                            }
                        </div>
                    )
                    }
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
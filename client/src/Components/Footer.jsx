import {useState, useEffect} from "react"
import { NavLink } from "react-router-dom";
import {DevIconsMapper, SocialsIconMapper} from "../utils/IconMapper";
import {Checkbox} from "@/components/ui/checkbox"
import {Label} from "@/components/ui/label"
import SpinnerComponent from "./SpinnerComponent";
import api from "../api/axios";
import { useToastMessage } from "./ToastMessage";
export default function Footer({preview=false, editMode = null, refreshKey}) {
    const showToastMessage = useToastMessage()
    const [links, setLinks] = useState([]);
    useEffect(()=> {
        async function fetchLinks() {
            try {
                const response = preview ? await api.get('/links/admin') : await api.get("/links");
                setLinks(response.data);
            }
            catch(error) {
                showToastMessage(false, error.message)
            }
        }
        fetchLinks();
    },[refreshKey]);
    const clickHandler = (e)=> {
        if(preview) e.preventDefault();
    }
    const mern = ["mongodb", "express", "react", "nodejs"];
    const footerLinks = links.filter((link) => link.in_footer);
    return(
        <>
            <div className={`px-6 py-2 ${preview ? "rounded" : ""} w-full bg-gradient-to-br from-mauve-950 via-mist-950 to-olive-900`}>
                {editMode !== null && editMode ?
                    <EditMode links={links} setLinks={setLinks}/>
                :
                <footer className="flex flex-col text-teal-200">
                    <div className="flex justify-between">
                        <div className="flex gap-2 items-center">
                                {footerLinks.length === 0 && preview ?
                                "No Links set yet" : footerLinks.map((link)=> {
                                    const isMail = link.social === "gmail"; 
                                    return(
                                        <div key={link._id} className="flex items-center gap-1 text-teal-200">
                                            <NavLink to={isMail ? `mailto:${link.link}` : link.link} target="_blank" 
                                            className={`flex items-center 
                                            p-1 rounded-full border-2 border-slate-800 ${preview ? "pointer-events-none" : 
                                            "cursor-pointer hover:bg-slate-800 hover:text-teal-200"}`}>
                                                {(()=>{
                                                    const Icon = SocialsIconMapper(false)[link.social];
                                                    return Icon ? <Icon size={20}/> : null;
                                                })()
                                                }
                                            </NavLink>
                                        </div>
                                    );
                                })
                                }
                        </div>
                        <NavLink to="/login" className={`font-sub-header-text text-[12px] ${preview ? "pointer-events-none" : "cursor-pointer hover:text-teal-400"}`}
                            onClick={clickHandler}
                        >Admin Login</NavLink>
                    </div>
                    <div className="mt-2 flex justify-between">
                        <span className="flex items-center">@2026 Jearard David</span>
                        <div className="flex flex-col">
                            <div className="p-2 flex border-3 border-slate-800 rounded justify-between gap-1">
                                {mern.map((tech, index)=> {
                                    const Icon = DevIconsMapper(true)[tech];
                                    return(
                                        <div key={index} className="flex flex-col items-center">
                                            {Icon && <Icon size={20} />}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </footer>
                }
            </div>
        </>
    );
}
function EditMode({links, setLinks}) {
    const [selectedIds, setSelectedIds] = useState([])
    const [prevLinks, setPrevLinks] = useState(links)
    const [isSaving, setIsSaving] = useState(false)
    useEffect(() => {
        setSelectedIds(
            links
                .filter(link => link.in_footer)
                .map(link => link._id)
        );
    }, [links]);
    const toggleLink = (id, checked) => {
        setSelectedIds(prev => checked
            ? [...new Set([...prev, id])]
            : prev.filter(x => x !== id),
        );
    };
    const handleSubmit = async ()=> {
        setIsSaving(true)
        try {
            const response = await api.put("/links/footer", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds }),
            });
            showToastMessage(response.data.success, response.data.message)
            setLinks(response.data.data);
        }
        catch(error) {
            console.error("Error saving footer links: " + error.message);
        }
        finally {
            setIsSaving(false)
        }
    }
    return(
        <>
            <div>
                <div className="m-2 admin-header [&>div]:m-2">
                    <div className="flex flex-col">
                        <h1>Footer Links</h1>
                        <div className="admin-container">
                            {links.length === 0 ?
                                <span className="text-[11px]">No links available</span>
                                : links.map((link)=> (
                                    <div key={link._id} className="flex checkbox-hover gap-1 items-center">
                                        <Checkbox checked={selectedIds.includes(link._id)} id={`cb-${link._id}`} className="size-3.5"
                                            onCheckedChange={(checked) => toggleLink(link._id, !!checked)}
                                        />
                                        <Label htmlFor={`cb-${link._id}`} className="flex items-center text-[11px]">
                                            {(()=> {
                                                const Icon = SocialsIconMapper(true)[link.social];
                                                return Icon ? <Icon className="size-3.5"/> : null;
                                            })()
                                            }
                                            <span className="truncate">{link.social}</span>
                                        </Label>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
                <div className="m-2 flex justify-end">
                    <button className="appearance-none pt-[0.5px] px-1 border-1 text-centerborder-slate-800 rounded 
                    cursor-pointer hover:bg-slate-800 hover:text-teal-200"
                        onClick={handleSubmit}
                        disabled={isSaving}
                    >
                        {isSaving ? <SpinnerComponent width="4" height="4" /> : <span className="text-[11px] leading-none">Save</span>}
                    </button>
                </div>                
            </div>
        </>
    );
}
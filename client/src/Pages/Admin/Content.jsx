import {ChevronDown, ChevronUp, X} from "lucide-react"
import { useState } from "react";
import SkillsSectionComponent from "../../Components/SkillsSectionComponent";
import AboutSectionComponent from "../../Components/AboutSectionComponent";
import Footer from "../../Components/Footer";
export default function Content() {
    return(
        <>
            <div>
                <h1 className="text-3xl font-bold text-teal-200 font-header-text">Contents</h1>   
                <div className="m-4">
                    <BuildDropDownComponent title="ABOUT"/>
                    <BuildDropDownComponent title="SKILLS"/>
                    <BuildDropDownComponent title="FOOTER" />
                </div> 
            </div>       
        </>
    );
}
function BuildDropDownComponent({title}) {
    const [isDroppedDown, setIsDroppedDown] = useState(false);
    return(
        <>
            <div className={`mt-2 p-2 border-1 border-slate-600 bg-gradient-to-br from-emerald-900 via-emerald-950 to-teal-950 rounded text-emerald-200
            flex justify-between font-sub-header-text 
            cursor-pointer hover:bg-gradient-to-br hover:from-emerald-800 hover:via-emerald-900 hover:to-emerald-950 ${isDroppedDown ? "shadow-xl" : ""}`}
                onClick={()=>setIsDroppedDown(prev=> !prev)}
            >
                <span>{title}</span>
                <div>
                    {isDroppedDown ? <ChevronUp/> : <ChevronDown/>}
                </div>
            </div>
            {isDroppedDown && (
                <div className="">
                    <DropDownItem title={title}/>    
                </div>
            )}
        </>
    );
}
function DropDownItem({title}) {
    const [editMode, setEditMode] = useState(false)
    const ItemMapper = {
        ABOUT: <AboutSectionComponent/>,
        SKILLS: <SkillsSectionComponent preview={true} editMode={editMode}/>,
        FOOTER: <Footer preview={true} editMode={editMode}/>,
    }
    return(
        <>
            <div className="p-2 border-1 border-slate-600 bg-cyan-950 rounded text-teal-300">
                <div className="flex justify-between mb-2">
                    <h1 className="text-xl">{title}</h1>
                    <button className="admin-header-button" 
                    onClick={()=>setEditMode(prev=> !prev)}
                    > {editMode ? 
                        <X/> : "Edit Mode"
                    }</button>
                </div>
                <div>
                    {ItemMapper[title]}
                </div>
            </div>
        </>
    );
}
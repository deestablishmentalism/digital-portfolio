import {ChevronDown, ChevronUp, X} from "lucide-react"
import { useState } from "react";
import SkillsSectionComponent from "../../Components/SkillsSectionComponent";
import AboutSectionComponent from "../../Components/AboutSectionComponent";
import Footer from "../../Components/Footer";
export default function Skills() {
    const [editMode, setEditMode] = useState(false)
    return(
        <>
            <div>
                <h1 className="text-3xl font-bold text-teal-200 font-header-text">Contents</h1>   
                <div className="admin-container">
                    <div className="flex justify-end">
                        <button className="admin-header-button" 
                        onClick={()=>setEditMode(prev=> !prev)}
                        > {editMode ? 
                            <X/> : "Edit Mode"
                        }</button>
                    </div>
                    <SkillsSectionComponent preview={true} editMode={editMode}/>
                </div> 
            </div>       
        </>
    );
}
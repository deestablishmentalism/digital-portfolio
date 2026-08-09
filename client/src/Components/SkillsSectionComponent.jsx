import { useRef, useLayoutEffect, useState, useEffect } from "react";
import { DevIconsMapper } from "../utils/IconMapper";
import {Checkbox} from "@/components/ui/checkbox"
import {Label} from "@/components/ui/label"
import SpinnerComponent from "./SpinnerComponent";
const DIV_WIDTH = 800;

export default function SkillsSectionComponent({preview=false, editMode = null}) {
    const parentRef = useRef(null)
    const innerRef = useRef(null)
    const [scale, setScale] = useState(1)
    const [parentHeight, setParentHeight] = useState(null)
    const [skills, setSkills] = useState([])
    const [projects, setProjects] = useState([])
    const [skillBuilder, setSkillBuilder] = useState({})
    const languages = skills?.langauges || []
    const frontend = skills?.frontend || []
    const backend = skills?.backend || []
    const tools = skills?.tools || []
    useEffect(()=> {
        async function fetchSkills() {
            try {
                const response = await fetch("/api/skills");
                if(!response.ok) throw new Error("ERR: " + response.status);
                setSkills(await response.json());
            }
            catch(error) {
                console.error("Error fetching skills: " + error.message);
            }
        }
        fetchSkills();
    }, [])
    useEffect(()=> {
        async function fetchProjects() {
            try {
                const response = await fetch("/api/projects")
                if(!response.ok) throw new Error("ERR: " + response.status)
                const data = await response.json()
                const counts = {}
                for (const project of data) {
                    for (const language of project.languages || []) {
                        const slug = language.toLowerCase()
                        counts[slug] = (counts[slug] || 0) + 1
                    }
                }
                setProjects(data)
                setSkillBuilder(counts)
            }
            catch(error) {
                console.error("Error fetching projects "+ error.message)
            }
        }
        fetchProjects();
    }, [])
    useLayoutEffect(() => {
        if(!preview) return;

        const updateScale = () => {
            const parentWidth = parentRef.current.offsetWidth;
            setScale(parentWidth / DIV_WIDTH);
        };

        updateScale();

        const observer = new ResizeObserver(updateScale);
        observer.observe(parentRef.current);
        return () => observer.disconnect();
    }, [preview])

    useLayoutEffect(() => {
        if (!preview || !innerRef.current) {
            setParentHeight(null);
            return;
        }

        const updateHeight = () => {
            const scaledHeight = innerRef.current.getBoundingClientRect().height;
            setParentHeight(scaledHeight+25);
        };

        updateHeight();

        const observer = new ResizeObserver(updateHeight);
        observer.observe(innerRef.current);
        return () => observer.disconnect();
    }, [preview, scale, skills, editMode])

    return (
        <div ref={parentRef} className={`w-full ${preview ? "overflow-hidden" : ""}`}
            style={preview && parentHeight ? { height: parentHeight } : {}}
        >
            <div
                ref={innerRef}
                style={preview ? {
                    width: DIV_WIDTH,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                } : {
                    width: "100%",
                }}
            >
            {editMode !== null && editMode ?
                <EditMode skills={skills}/>
                :
                <div className={`flex ${preview ? "flex-wrap" : ""} justify-between flex-wrap md:flex-nowrap`}>
                    <DisplaySkills items={frontend} title="Front-End" preview={preview} builder={skillBuilder} total={projects.length}/>
                    <DisplaySkills items={backend} title="Back-End" preview={preview} builder={skillBuilder} total={projects.length}/>
                    <DisplaySkills items={languages} title="Languages" preview={preview} builder={skillBuilder} total={projects.length}/>
                    <DisplaySkills items={tools} title="Tools & Others" preview={preview} builder={skillBuilder} total={projects.length}/>
                </div>
            }
            </div>
        </div>
  );
}
function DisplaySkills({items, title, preview, builder, total}) {
    return(
        <>
            <div className={`m-2 p-4 border-1 border-slate-900 rounded ${preview ? "w-80" : "w-full"}`}>
                <span className="text-teal-500 text-xs">{title}</span>
                {items.length === 0
                    ? <div>
                        <span> No {title.toLowerCase()} skills set yet</span>
                    </div>
                    :
                    <div className="flex flex-wrap gap-2">
                        {items.map((slug)=> {
                            const count = builder?.[slug] || 0
                            const mastery = total > 0 ? Math.round((count / total) * 100) : 0
                            return (
                                <SkillItem
                                    key={slug}
                                    slug={slug}
                                    mastery={mastery}
                                    preview={preview}
                                />
                            );
                        })}
                    </div>
                }
            </div>
        </>
    );
}
function SkillItem({slug, mastery, preview}) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(mastery);
        }, 50);

        return () => clearTimeout(timer);
    }, [mastery]);

    const Icon = DevIconsMapper(preview)[slug];

    return (
        <div className="relative px-2 py-1 bg-transparent rounded-full flex items-center gap-2 border-2 border-slate-800 overflow-hidden">

            <div
                className="absolute inset-y-0 left-0 bg-radial from-teal-600/70 via-teal-800/70 to-teal-950/70 rounded-full transition-[width] duration-700 ease-out"
                style={{width: `${progress}%`}}
            />

            <div className="relative flex items-center gap-2">
                {Icon && <Icon className="size-5" />}

                <span className="m-1 font-header-text text-teal-200 text-[15px]">
                    {slug}
                </span>

                {mastery > 0 && (
                    <span className="text-[10px] text-teal-400">
                        {mastery}%
                    </span>
                )}
            </div>
        </div>
    );
}
function EditMode({skills}) {
    const [languages, setLanguages] = useState([])
    const [frontend, setFrontend] = useState([])
    const [backend, setBackend] = useState([])
    const [tools, setTools] = useState([])
    const [isSaving, setIsSaving] = useState(false)
    const [selected, setSelected] = useState({
        frontend: skills?.frontend || [],
        backend: skills?.backend || [],
        languages: skills?.langauges || [],
        tools: skills?.tools || [],
    })
    useEffect(()=> {
        async function fetchTech() {
            try {
                const response = await fetch("/api/tech");
                const data = await response.json();
                if(!response.ok) throw new Error("ERR: " + response.status);
                setFrontend(Object.values(data.frontend || []))
                setBackend(Object.values(data.backend || []))
                setLanguages(Object.values(data.languages || []))
                setTools(Object.values(data.tools || []))
            }
            catch(error) {
                console.error("Error fetching data: " + error.message);
            }
        }
        fetchTech()
    }, [])
    const [prevSkills, setPrevSkills] = useState(skills)
    if (prevSkills !== skills) {
        setPrevSkills(skills)
        setSelected({
            frontend: skills?.frontend || [],
            backend: skills?.backend || [],
            languages: skills?.langauges || [],
            tools: skills?.tools || [],
        })
    }
    const toggleSkill = (category) => (slug, checked) => {
        setSelected(prev => ({
            ...prev,
            [category]: checked
                ? [...new Set([...prev[category], slug])]
                : prev[category].filter(s => s !== slug),
        }));
    };
    const handleSubmit = async (e)=> {
        e.preventDefault()
        setIsSaving(true)
        try {
            const response = await fetch("/api/skills", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    skills: {
                        frontend: selected.frontend,
                        backend: selected.backend,
                        langauges: selected.languages,
                        tools: selected.tools,
                    },
                }),
            });
            const data = await response.json();
            if(!response.ok) throw new Error("ERR: " + response.status);
            setSelected({
                frontend: data.frontend || [],
                backend: data.backend || [],
                languages: data.langauges || [],
                tools: data.tools || [],
            })
        }
        catch(error) {
            console.error("Error saving skills: " + error.message);
        }
        finally {
            setIsSaving(false)
        }
    }
    return(
        <>
            <div>
                <div className="m-2 admin-header [&>div]:m-2">
                    <SkillCheckBoxes items={frontend} title="Front-End" selected={selected.frontend} onToggle={toggleSkill("frontend")}/>
                    <SkillCheckBoxes items={backend} title="Back-End" selected={selected.backend} onToggle={toggleSkill("backend")}/>
                    <SkillCheckBoxes items={languages} title="Languages" selected={selected.languages} onToggle={toggleSkill("languages")}/>
                    <SkillCheckBoxes items={tools} title="Tools&Others" selected={selected.tools} onToggle={toggleSkill("tools")}/>
                </div>
                <div className="m-2 flex justify-end">
                    <button type="submit" className="appearance-none pt-[0.5px] px-1 border-1 text-centerborder-slate-800 rounded 
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
function SkillCheckBoxes({items, title, selected, onToggle}) {
    return(
        <>
            <div className="flex w-full flex-col">
                <h1>{title}</h1>
                <div className="scrollable admin-container h-64 w-full overflow-x-auto">
                {items.map((item)=> (
                    <div key={item.slug} className="flex checkbox-hover gap-1 items-center">
                        <Checkbox checked={selected.includes(item.slug)} id={`cb-${item.slug}`} className="size-3.5"
                            onCheckedChange={(checked) => onToggle(item.slug, !!checked)}
                        />
                        <Label htmlFor={`cb-${item.slug}`} className="flex items-center text-[11px]">
                            {(()=> {
                                const Icon = DevIconsMapper(true)[item.slug];
                                return Icon ? <Icon className="size-3.5"/> : null;
                            })()
                            }
                            <span className="truncate">{item.name}</span>
                        </Label>
                    </div>
                ))
                }
                </div>
            </div>
        </>
    );
}
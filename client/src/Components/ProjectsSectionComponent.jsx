import { useEffect, useState, useCallback } from "react";
import SpinnerComponent from "./SpinnerComponent";
import LazyImageLoader from "../utils/LazyImageLoader";
import {X, ArrowBigLeft, ArrowBigRight} from "lucide-react"
import {DevIconsMapper} from "../utils/IconMapper";
export default function ProjectsSectionComponent({preview=false}) {
    const [fetching, setFetching] = useState(true); 
    const [projects, setProjects] = useState([])
    const [isGalleryOpen, setIsGalleryOpen] = useState(false)
    const [gallery, setGallery] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    useEffect(()=>{
        async function fetchProjects() {
            try {
                const response = await fetch("/api/projects");
                const data = await response.json();
                if(!response.ok) throw new Error("ERR: " + response.status);
                setProjects(data || [])
            }
            catch(error) {
                console.error(error.message);
            }
            finally {
                setFetching(false)
            }
        }
        fetchProjects()
    },[])
    const handleProjectClick = (project) => {
        if(preview) return;
        if (project.preview.type === "gallery") {
            setGallery(project.preview.images);
            setCurrentIndex(0);
            setIsGalleryOpen(true);
        } else if (project.preview.type === "url") {
            window.open(project.url, "_blank", "noopener,noreferrer");
        }
    };
    const handlePrev = useCallback(() => {
        setCurrentIndex(i => (i === 0 ? gallery.length - 1 : i - 1));
    }, [gallery.length]);
    const handleNext = useCallback(() => {
        setCurrentIndex(i => (i === gallery.length - 1 ? 0 : i + 1));
    }, [gallery.length]);
    const handleClose = () => setIsGalleryOpen(false);
    useEffect(() => {
        if (!isGalleryOpen) return;
        const handler = (e) => {
            if (e.key === "Escape") handleClose();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isGalleryOpen, handlePrev, handleNext]);
    return(
        <>
            <div>
                {fetching ? (
                    <SpinnerComponent width={30} height={30}></SpinnerComponent>  
                ) : 
                  projects.length === 0 ? (
                    <div className="flext justify-center">
                        <span>No Projects to show</span>
                    </div>  
                ) : (
                   <div className="">
                        {projects.map((project) => {
                            const date = new Date(project.createdAt);
                            const startDate = new Date(project.project_start_date);
                            const endDate = new Date(project.project_end_date);
                            return(
                                <div key={project._id} className="group relative rounded w-80 h-57 bg-black z-1 overflow-hidden 
                                font-header-text text-[11px]" 
                                >
                                    {!preview && (
                                        <div className="absolute top-0 right-0 z-20 h-full w-full bg-teal-950 text-white 
                                            opacity-0
                                            -translate-y-4
                                            transition-all
                                            duration-300
                                            ease-out
                                            group-hover:opacity-100
                                            group-hover:translate-y-0 
                                            flex flex-col">
                                            <div className="p-2 flex justify-end text-white">
                                                <button
                                                    className="p-2 cursor-pointer bg-black rounded-full
                                                    duration-200 hover:bg-teal-950 hover:text-teal-200 hover:border-1"
                                                    onClick={()=>handleProjectClick(project)}
                                                >
                                                    <span>
                                                        {project.preview.type.toUpperCase()}
                                                    </span>
                                                </button>
                                            </div>
                                            <div className="p-2 flex flex-wrap gap-2 justify-center w-full opacity-0 group-hover:opacity-100">
                                                {!preview && (project.languages.map((language, index)=> {
                                                    const Icon = DevIconsMapper(false)[language.toLowerCase()];
                                                    return(
                                                        <div key={index}>
                                                            {Icon && <Icon size={25} />}
                                                        </div>
                                                    )
                                                })
                                            )}
                                            </div>
                                            <div className="p-2">
                                                <span>
                                                    {project.project_description}
                                                </span>
                                            </div>
                                        </div>   
                                    )
                                    }
                                    
                                    <div className="w-full h-40">
                                        {
                                            <LazyImageLoader src={project.preview.images[0].secure_url} alt={projects} className="w-full h-full object-cover"/>
                                        }
                                    </div>
                                    <div className="p-2 text-gray-200 flex flex-col">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-2xl"> 
                                            {project.project_name} 
                                            </span>
                                            <div 
                                                className="px-2 py-1 rounded-full 
                                                bg-transparent border-2 border-teal-950">
                                                <span className="text-[11px]"> {project.project_type} </span>
                                            </div>
                                        </div>
                                        {preview ? 
                                        (
                                            <span>
                                                Entry created at {new Intl.DateTimeFormat("en-US",{
                                                    month: "long",
                                                    day: "numeric",
                                                    year: "numeric"
                                                }).format(date)
                                                }    
                                            </span>    
                                        )
                                        : (
                                            <span>
                                                {new Intl.DateTimeFormat("en-US",{
                                                    month: "long",
                                                    day: "numeric",
                                                    year: "numeric"
                                                }).format(startDate)} - {new Intl.DateTimeFormat("en-US",{
                                                    month: "long",
                                                    day: "numeric",
                                                    year: "numeric"
                                                }).format(endDate)}
                                            </span>
                                        )}
                                        
                                    </div>
                                </div>
                            );
                        })}
                    </div> 
                )}
            </div>
            {isGalleryOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={handleClose}>
                    <div className="relative max-w-5xl w-full mx-4" onClick={e => e.stopPropagation()}>
                        <button onClick={handleClose} className="absolute -top-12 right-0 text-white/70 hover:text-white text-3xl transition-colors z-10 cursor-pointer">
                            <X/>
                        </button>
                        <div className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden shadow-2xl">
                            <LazyImageLoader src={gallery[currentIndex]?.secure_url} alt={`gallery-${currentIndex}`} className="w-full h-full object-contain"/>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <button onClick={handlePrev} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white 
                            cursor-pointer
                            rounded-full transition-all backdrop-blur-sm border border-white/10">
                            <ArrowBigLeft/>
                            Prev</button>
                            <span className="text-white/60 text-sm font-mono">{currentIndex + 1} / {gallery.length}</span>
                            <button onClick={handleNext} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 
                            cursor-pointer
                            hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm border border-white/10">
                            Next <ArrowBigRight/> 
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
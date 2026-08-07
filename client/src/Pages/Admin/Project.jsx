import { useEffect, useState } from "react"
import AddProjectModal from "../../Components/AddProjectModal"
import SpinnerComponent from "../../Components/SpinnerComponent";
export default function Project() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpenModal, setIsOpenModal] = useState(false);
    useEffect(() => {
        async function fetchProjects() {
            try {
                const response = await fetch("/api/projects");
                if (!response.ok) throw new Error("Failed to fetch projects");
                const data = await response.json();
                setProjects(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchProjects();
    }, []);

    return (
        <>
            <div>
                <div className="admin-header font-header-text text-[11px]">
                    <h1 className="text-3xl font-bold"> Projects</h1>
                    <button className="admin-header-button"
                        onClick={()=> setIsOpenModal(prev=> !prev)}
                    >
                        <span className="font-bold">Add a project</span>
                    </button>
                </div>
                <div>
                    {isOpenModal && (
                        <AddProjectModal open={isOpenModal} onOpenChange={setIsOpenModal}/>
                    )}
                </div>
                <div className="p-4 ">
                    <h1 className="m-2 text-white text-2xl"> Projects uploaded</h1>
                    {loading ? (
                        <SpinnerComponent width={25} height={25} />
                    ) : projects.length === 0 ? (
                        <div className="m-2 p-2 bg-red-300 rounded">
                            <p className="text-white text-center">No projects uploaded yet.</p>    
                        </div>    
                    ) : (
                        <div className="">
                            {projects.map((project) => {
                                const date = new Date(project.createdAt);
                                return(
                                    <>
                                    <div key={project._id} className="group rounded w-80 h-60 bg-black z-1 overflow-hidden">
                                        <div className="w-full h-40 relative">
                                            {
                                                <img src={project.preview.images[0].secure_url} className="w-full h-full object-cover"></img>
                                            }
                                            <div className="p-2 absolute top-1 right-1 bg-black text-white rounded-full opacity-0 
                                            group-hover:opacity-100 transition-opacity duration-200">
                                                <span>
                                                    {project.preview.type.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-2 group-hover:bg-slate-800 text-gray-200 flex flex-col">
                                            <span className="font-bold text-2xl">
                                            {project.project_name} 
                                            </span>
                                            <span>
                                               Entry created at {new Intl.DateTimeFormat("en-US",{
                                                    month: "long",
                                                    day: "numeric",
                                                    year: "numeric"
                                                }).format(date)
                                                }    
                                            </span>
                                        </div>
                                    </div>
                                    </>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

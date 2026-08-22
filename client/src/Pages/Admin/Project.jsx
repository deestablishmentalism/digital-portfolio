import { useEffect, useState } from "react"
import AddProjectModal from "../../Components/AddProjectModal"
import SpinnerComponent from "../../Components/SpinnerComponent";
import api from "../../api/axios";
import { useToastMessage } from "../../Components/ToastMessage";
import ProjectsSectionComponent from "../../Components/ProjectsSectionComponent";
export default function Project() {
    const showToastMessage = useToastMessage()
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpenModal, setIsOpenModal] = useState(false);
    useEffect(() => {
        async function fetchProjects() {
            try {
                const response = await api.get("/projects");
                setProjects(response.data);
            } catch (error) {
                showToastMessage(false, error.message)
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
                    <ProjectsSectionComponent preview={true}/>
                </div>
            </div>
        </>
    );
}

import { useState, useCallback } from "react";
import { FolderGit2, Plus, Layers, RefreshCw, AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddProjectModal from "../../Components/AddProjectModal";
import ProjectsSectionComponent from "../../Components/ProjectsSectionComponent";
import SpinnerComponent from "../../Components/SpinnerComponent";
import { useToastMessage } from "../../Components/ToastMessage";
import api from "../../api/axios";

export default function Project() {
    const showToastMessage = useToastMessage();
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [deletingProject, setDeletingProject] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    const handleConfirmDelete = async () => {
        if (!deletingProject?._id) return;
        setIsDeleting(true);
        try {
            const response = await api.delete(`/projects/${deletingProject._id}`);
            showToastMessage(
                Boolean(response.data?.success),
                response.data?.message || "Project deleted successfully!"
            );
            setDeletingProject(null);
            handleRefresh();
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Failed to delete project";
            showToastMessage(false, msg);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full pb-8">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                <div>
                    <div className="flex items-center gap-2 text-teal-400 mb-1">
                        <FolderGit2 className="w-5 h-5" />
                        <span className="font-sub-header-text text-xs uppercase tracking-wider font-semibold">
                            Portfolio Management
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-sub-header-text text-slate-100 tracking-wide">
                        Projects
                    </h1>
                    <p className="text-xs sm:text-sm font-body-text text-slate-400 mt-1">
                        Create, preview, and organize featured projects, tech stacks, and showcase galleries.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={handleRefresh}
                        className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-900/60 text-slate-300 hover:text-teal-200 hover:border-teal-400/50 hover:bg-slate-800 transition-all cursor-pointer"
                        title="Refresh Projects"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => setIsOpenModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-500/40 bg-teal-950/60 hover:bg-teal-900 text-teal-200 font-sub-header-text text-xs uppercase tracking-wider font-semibold transition-all shadow-lg shadow-teal-950/30 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Project</span>
                    </button>
                </div>
            </div>

            {/* Add Modal */}
            {isOpenModal && (
                <AddProjectModal
                    open={isOpenModal}
                    onOpenChange={(open) => {
                        setIsOpenModal(open);
                        if (!open) handleRefresh();
                    }}
                />
            )}

            {/* Edit Modal */}
            {editingProject && (
                <AddProjectModal
                    key={editingProject._id}
                    open={Boolean(editingProject)}
                    project={editingProject}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditingProject(null);
                            handleRefresh();
                        }
                    }}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={Boolean(deletingProject)}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) setDeletingProject(null);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            <DialogTitle>Delete Project</DialogTitle>
                        </div>
                        <DialogDescription className="pt-1">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-foreground">
                                {deletingProject?.project_name}
                            </span>
                            ? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isDeleting}
                            onClick={() => setDeletingProject(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={handleConfirmDelete}
                        >
                            {isDeleting ? (
                                <SpinnerComponent width={16} height={16} />
                            ) : (
                                "Delete Project"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Content Container */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                    <div className="flex items-center gap-2 text-teal-400">
                        <Layers className="w-4 h-4" />
                        <h2 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wider font-semibold">
                            Uploaded Projects & Live Preview
                        </h2>
                    </div>
                    <span className="text-xs font-body-text text-slate-400">
                        Interactive Gallery Mode
                    </span>
                </div>

                <ProjectsSectionComponent
                    key={refreshKey}
                    preview={true}
                    onEdit={setEditingProject}
                    onDelete={setDeletingProject}
                />
            </div>
        </div>
    );
}

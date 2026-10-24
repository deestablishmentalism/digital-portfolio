import { useState, useCallback } from "react";
import { FolderGit2, Plus, Layers, RefreshCw } from "lucide-react";
import AddProjectModal from "../../Components/AddProjectModal";
import ProjectsSectionComponent from "../../Components/ProjectsSectionComponent";

export default function Project() {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

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

            {/* Modal */}
            {isOpenModal && (
                <AddProjectModal
                    open={isOpenModal}
                    onOpenChange={(open) => {
                        setIsOpenModal(open);
                        if (!open) handleRefresh();
                    }}
                />
            )}

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

                <ProjectsSectionComponent key={refreshKey} preview={true} />
            </div>
        </div>
    );
}

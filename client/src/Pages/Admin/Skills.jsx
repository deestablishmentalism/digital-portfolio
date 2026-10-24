import { useState } from "react";
import { Cpu, Pencil, X } from "lucide-react";
import SkillsSectionComponent from "../../Components/SkillsSectionComponent";

export default function Skills() {
    const [editMode, setEditMode] = useState(false);

    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full pb-8">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                <div>
                    <div className="flex items-center gap-2 text-teal-400 mb-1">
                        <Cpu className="w-5 h-5" />
                        <span className="font-sub-header-text text-xs uppercase tracking-wider font-semibold">
                            Technical Stack Management
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-sub-header-text text-slate-100 tracking-wide">
                        Skills & Technologies
                    </h1>
                    <p className="text-xs sm:text-sm font-body-text text-slate-400 mt-1">
                        Manage your technical toolkit, categorize proficiencies, and configure portfolio displays.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => setEditMode((prev) => !prev)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border font-sub-header-text text-xs uppercase tracking-wider font-semibold transition-all shadow-lg cursor-pointer ${
                            editMode
                                ? "border-red-500/40 bg-red-950/60 hover:bg-red-900 text-red-200 shadow-red-950/30"
                                : "border-teal-500/40 bg-teal-950/60 hover:bg-teal-900 text-teal-200 shadow-teal-950/30"
                        }`}
                    >
                        {editMode ? (
                            <>
                                <X className="w-4 h-4" />
                                <span>Exit Edit Mode</span>
                            </>
                        ) : (
                            <>
                                <Pencil className="w-4 h-4" />
                                <span>Edit Skills</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                    <div className="flex items-center gap-2 text-teal-400">
                        <Cpu className="w-4 h-4" />
                        <h2 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wider font-semibold">
                            {editMode ? "Select Active Skills by Category" : "Skills Preview & Mastery Display"}
                        </h2>
                    </div>
                    <span className="text-xs font-body-text text-slate-400">
                        {editMode ? "Select technologies and click Save" : "Live interactive layout"}
                    </span>
                </div>

                <SkillsSectionComponent preview={true} editMode={editMode} />
            </div>
        </div>
    );
}

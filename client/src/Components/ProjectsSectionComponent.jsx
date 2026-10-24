import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import SpinnerComponent from "./SpinnerComponent";
import LazyImageLoader from "../utils/LazyImageLoader";
import { X, ArrowBigLeft, ArrowBigRight, Calendar, Eye, ExternalLink } from "lucide-react";
import { DevIconsMapper } from "../utils/IconMapper";

export default function ProjectsSectionComponent({ preview = false, onLoad }) {
    const [fetching, setFetching] = useState(true);
    const [projects, setProjects] = useState([]);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [gallery, setGallery] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [overlayOpen, setOverlayOpen] = useState(new Set());

    useEffect(() => {
        async function fetchProjects() {
            try {
                const response = preview ? await api.get("/projects/admin") : await api.get("/projects");
                setProjects(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error(error.message);
            } finally {
                setFetching(false);
                onLoad?.();
            }
        }
        fetchProjects();
    }, [preview, onLoad]);

    const handleProjectClick = (project) => {
        if (preview) return;
        if (project.preview?.type === "gallery") {
            setGallery(project.preview.images || []);
            setCurrentIndex(0);
            setIsGalleryOpen(true);
        } else if (project.preview?.type === "url" && project.url) {
            window.open(project.url, "_blank", "noopener,noreferrer");
        }
    };

    const handlePrev = useCallback(() => {
        setCurrentIndex((i) => (i === 0 ? gallery.length - 1 : i - 1));
    }, [gallery.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((i) => (i === gallery.length - 1 ? 0 : i + 1));
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

    return (
        <div className="w-full">
            {fetching ? (
                <div className="flex justify-center items-center py-10">
                    <SpinnerComponent width={30} height={30} />
                </div>
            ) : projects.length === 0 ? (
                <div className="flex justify-center items-center p-6 text-sm text-slate-400 font-body-text">
                    No projects to show.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full p-2">
                    {projects.map((project) => {
                        const isOpen = overlayOpen.has(project._id);

                        const toggleOverlay = (e) => {
                            if (preview) return;
                            e.stopPropagation();
                            setOverlayOpen((prev) => {
                                const next = new Set(prev);
                                if (next.has(project._id)) next.delete(project._id);
                                else next.add(project._id);
                                return next;
                            });
                        };

                        const dateStr = preview
                            ? `Created ${formatDate(project.createdAt)}`
                            : `${formatDate(project.project_start_date)} – ${formatDate(project.project_end_date)}`;

                        return (
                            <div
                                key={project._id}
                                className="group relative rounded-2xl bg-slate-950/40 border border-slate-800/80 overflow-hidden flex flex-col transition-all duration-300 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-950/30 backdrop-blur-xs cursor-pointer"
                                onClick={toggleOverlay}
                            >
                                {/* Project Image Banner */}
                                <div className="relative w-full aspect-video overflow-hidden bg-slate-900 border-b border-slate-800/60">
                                    {project.preview?.images?.[0]?.secure_url ? (
                                        <LazyImageLoader
                                            src={project.preview.images[0].secure_url}
                                            alt={project.project_name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600 font-sub-header-text text-xs">
                                            No Preview
                                        </div>
                                    )}

                                    {/* Project Type Badge */}
                                    {project.project_type && (
                                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full border border-teal-500/30 bg-slate-950/80 backdrop-blur-md text-teal-300 text-xs font-sub-header-text uppercase tracking-wider">
                                            {project.project_type}
                                        </div>
                                    )}
                                </div>

                                {/* Project Card Body */}
                                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
                                    <div>
                                        <h3
                                            className="font-sub-header-text text-base sm:text-lg font-bold text-slate-100 tracking-wide truncate"
                                            title={project.project_name}
                                        >
                                            {project.project_name}
                                        </h3>
                                        <p className="mt-1 text-xs font-body-text text-slate-400 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                                            <span>{dateStr}</span>
                                        </p>
                                    </div>

                                    {/* Tech Stack Preview */}
                                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800/60 items-center">
                                        {(project.languages || []).map((language, idx) => {
                                            const Icon = DevIconsMapper(false)[language.toLowerCase()];
                                            return (
                                                <div
                                                    key={idx}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 text-xs"
                                                    title={language}
                                                >
                                                    {Icon && <Icon className="size-3.5 shrink-0" />}
                                                    <span className="font-body-text text-[11px]">{language}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Hover / Click Overlay */}
                                {!preview && (
                                    <div
                                        className={`absolute inset-0 z-10 bg-slate-950/95 backdrop-blur-md p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 ease-out ${
                                            isOpen
                                                ? "opacity-100 translate-y-0 pointer-events-auto"
                                                : "opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                                            <span className="font-sub-header-text text-xs uppercase tracking-wider text-teal-400 font-semibold truncate pr-2">
                                                {project.project_name}
                                            </span>
                                            <button
                                                type="button"
                                                className="shrink-0 px-3 py-1 cursor-pointer bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/40 rounded-full font-sub-header-text text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProjectClick(project);
                                                }}
                                            >
                                                {project.preview?.type === "gallery" ? (
                                                    <>
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Gallery</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        <span>Open</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-1.5 py-2">
                                            {(project.languages || []).map((language, index) => {
                                                const Icon = DevIconsMapper(false)[language.toLowerCase()];
                                                return (
                                                    <div
                                                        key={index}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 text-xs"
                                                    >
                                                        {Icon && <Icon className="size-3 shrink-0" />}
                                                        <span className="font-body-text text-[11px]">{language}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="overflow-y-auto scrollable flex-1 my-1 pr-1">
                                            <p className="font-body-text text-xs sm:text-sm text-slate-300 leading-relaxed">
                                                {project.project_description}
                                            </p>
                                        </div>

                                        <div className="pt-2 border-t border-slate-800/80 text-[10px] font-body-text text-slate-500 flex justify-between items-center">
                                            <span>Click card to {isOpen ? "close" : "keep open"}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Gallery */}
            {isGalleryOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                    onClick={handleClose}
                >
                    <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={handleClose}
                            className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors z-10 cursor-pointer p-1"
                        >
                            <X className="w-7 h-7" />
                        </button>
                        <div className="relative aspect-video bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                            <LazyImageLoader
                                src={gallery[currentIndex]?.secure_url}
                                alt={`gallery-${currentIndex}`}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <button
                                onClick={handlePrev}
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-teal-200 cursor-pointer rounded-full transition-all border border-slate-700/60 font-sub-header-text text-xs uppercase tracking-wider"
                            >
                                <ArrowBigLeft className="w-4 h-4" />
                                <span>Prev</span>
                            </button>
                            <span className="text-slate-400 text-xs font-mono">
                                {currentIndex + 1} / {gallery.length}
                            </span>
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-teal-200 cursor-pointer rounded-full transition-all border border-slate-700/60 font-sub-header-text text-xs uppercase tracking-wider"
                            >
                                <span>Next</span>
                                <ArrowBigRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function formatDate(dateValue) {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return String(dateValue);
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
    }).format(date);
}

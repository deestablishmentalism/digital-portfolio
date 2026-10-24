import { useEffect, useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import {
    FolderGit2,
    Code2,
    Share2,
    Sparkles,
    ExternalLink,
    ArrowRight,
    User,
    MapPin,
    RefreshCw,
    CheckCircle2,
    Plus,
    Bot,
    Layers,
    Globe,
    Cpu
} from "lucide-react";
import api from "../../api/axios";
import SpinnerComponent from "../../Components/SpinnerComponent";
import { DevIconsMapper, SocialsIconMapper } from "../../utils/IconMapper";

export default function Dashboard() {
    const [personalInfo, setPersonalInfo] = useState(null);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState({});
    const [links, setLinks] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let isMounted = true;
        async function loadData() {
            try {
                const [personalRes, projectsRes, skillsRes, linksRes] = await Promise.allSettled([
                    api.get("/personal-info/admin").catch(() => api.get("/personal-info")),
                    api.get("/projects/admin").catch(() => api.get("/projects")),
                    api.get("/skills/admin").catch(() => api.get("/skills")),
                    api.get("/links/admin").catch(() => api.get("/links")),
                ]);

                if (!isMounted) return;

                if (personalRes.status === "fulfilled" && personalRes.value?.data?.data) {
                    setPersonalInfo(personalRes.value.data.data);
                }

                if (projectsRes.status === "fulfilled") {
                    const pData = projectsRes.value?.data;
                    setProjects(Array.isArray(pData) ? pData : Array.isArray(pData?.data) ? pData.data : []);
                }

                if (skillsRes.status === "fulfilled") {
                    const sData = skillsRes.value?.data;
                    setSkills(sData && typeof sData === "object" && !Array.isArray(sData) ? sData : {});
                }

                if (linksRes.status === "fulfilled") {
                    const lData = linksRes.value?.data;
                    setLinks(Array.isArray(lData) ? lData : Array.isArray(lData?.data) ? lData.data : []);
                }
            } catch (error) {
                console.error("Dashboard load error:", error);
            } finally {
                if (isMounted) {
                    setFetching(false);
                    setRefreshing(false);
                }
            }
        }

        loadData();

        return () => {
            isMounted = false;
        };
    }, [refreshKey]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setRefreshKey((prev) => prev + 1);
    }, []);

    // Computed metrics
    const frontendSkills = skills?.frontend || [];
    const backendSkills = skills?.backend || [];
    const languageSkills = skills?.languages || [];
    const toolSkills = skills?.tools || [];
    const totalSkillsCount =
        frontendSkills.length + backendSkills.length + languageSkills.length + toolSkills.length;

    const clientProjectsCount = projects.filter((p) => p.project_type === "client").length;
    const personalProjectsCount = projects.filter((p) => p.project_type === "personal").length;

    const contactLinksCount = links.filter((l) => l.in_contact).length;
    const footerLinksCount = links.filter((l) => l.in_footer).length;

    // Tech footprint in projects
    const projectLanguages = new Set();
    const languageStats = {};
    projects.forEach((p) => {
        (p.languages || []).forEach((lang) => {
            const key = lang.trim();
            projectLanguages.add(key);
            languageStats[key] = (languageStats[key] || 0) + 1;
        });
    });
    const topProjectLanguages = Object.entries(languageStats).sort((a, b) => b[1] - a[1]);

    // Profile details
    const fullName = [personalInfo?.first_name, personalInfo?.middle_name, personalInfo?.last_name]
        .filter(Boolean)
        .join(" ");

    const formattedAddress = [
        personalInfo?.address?.house_number ? `#${personalInfo.address.house_number}` : null,
        personalInfo?.address?.subdivision,
        personalInfo?.address?.barangay,
        personalInfo?.address?.city,
        personalInfo?.address?.province,
        personalInfo?.address?.region,
    ]
        .filter(Boolean)
        .join(", ");

    // Portfolio Health / Completeness Checklist
    const checklistItems = [
        { label: "Profile Picture", complete: !!personalInfo?.profile?.secure_url, path: "/admin/personal-info" },
        { label: "Summary / Biography", complete: !!personalInfo?.summary, path: "/admin/personal-info" },
        { label: "Location Details", complete: !!personalInfo?.address?.city, path: "/admin/personal-info" },
        { label: "Featured Projects", complete: projects.length > 0, path: "/admin/project" },
        { label: "Skills Configured", complete: totalSkillsCount > 0, path: "/admin/skills" },
        { label: "Contact Links", complete: contactLinksCount > 0, path: "/admin/links" },
    ];
    const completedChecklistCount = checklistItems.filter((i) => i.complete).length;
    const healthPercentage = Math.round((completedChecklistCount / checklistItems.length) * 100);

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <SpinnerComponent width={40} height={40} />
                <span className="text-sm font-sub-header-text uppercase tracking-wider text-teal-400 animate-pulse">
                    Loading Portfolio Dashboard...
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full pb-8">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                <div>
                    <div className="flex items-center gap-2 text-teal-400 mb-1">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-sub-header-text text-xs uppercase tracking-wider font-semibold">
                            Admin Control Center
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-sub-header-text text-slate-100 tracking-wide">
                        {personalInfo?.first_name ? `Welcome back, ${personalInfo.first_name}` : "Portfolio Dashboard"}
                    </h1>
                    <p className="text-xs sm:text-sm font-body-text text-slate-400 mt-1">
                        Live overview of your digital portfolio statistics, active tech stack, projects, and connected channels.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-900/60 text-slate-300 hover:text-teal-200 hover:border-teal-400/50 hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
                        title="Refresh Dashboard Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-teal-400" : ""}`} />
                    </button>

                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-500/40 bg-teal-950/60 hover:bg-teal-900 text-teal-200 font-sub-header-text text-xs uppercase tracking-wider font-semibold transition-all shadow-lg shadow-teal-950/30"
                    >
                        <span>View Live Site</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>

            {/* KPI Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Projects KPI */}
                <NavLink
                    to="/admin/project"
                    className="group p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs flex flex-col justify-between transition-all duration-300 hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-950/30"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="font-sub-header-text text-xs uppercase tracking-wider text-slate-400">
                                Projects
                            </span>
                            <div className="text-3xl font-bold font-sub-header-text text-slate-100 mt-1">
                                {projects.length}
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400 group-hover:scale-110 transition-transform">
                            <FolderGit2 className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <span className="font-body-text text-slate-400">
                            {clientProjectsCount} Client · {personalProjectsCount} Personal
                        </span>
                        <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </NavLink>

                {/* 2. Skills KPI */}
                <NavLink
                    to="/admin/skills"
                    className="group p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs flex flex-col justify-between transition-all duration-300 hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-950/30"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="font-sub-header-text text-xs uppercase tracking-wider text-slate-400">
                                Active Skills
                            </span>
                            <div className="text-3xl font-bold font-sub-header-text text-slate-100 mt-1">
                                {totalSkillsCount}
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400 group-hover:scale-110 transition-transform">
                            <Cpu className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <span className="font-body-text text-slate-400">
                            {frontendSkills.length} FE · {backendSkills.length} BE · {languageSkills.length} Lang
                        </span>
                        <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </NavLink>

                {/* 3. Links KPI */}
                <NavLink
                    to="/admin/links"
                    className="group p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs flex flex-col justify-between transition-all duration-300 hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-950/30"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="font-sub-header-text text-xs uppercase tracking-wider text-slate-400">
                                Social & Links
                            </span>
                            <div className="text-3xl font-bold font-sub-header-text text-slate-100 mt-1">
                                {links.length}
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400 group-hover:scale-110 transition-transform">
                            <Globe className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <span className="font-body-text text-slate-400">
                            {contactLinksCount} Contact · {footerLinksCount} Footer
                        </span>
                        <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                </NavLink>

                {/* 4. Portfolio Health KPI */}
                <NavLink
                    to="/admin/personal-info"
                    className="group p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs flex flex-col justify-between transition-all duration-300 hover:border-teal-400/50 hover:shadow-lg hover:shadow-teal-950/30"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="font-sub-header-text text-xs uppercase tracking-wider text-slate-400">
                                Portfolio Health
                            </span>
                            <div className="text-3xl font-bold font-sub-header-text text-slate-100 mt-1">
                                {healthPercentage}%
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-400 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col gap-1.5">
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-700 ease-out"
                                style={{ width: `${healthPercentage}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>{completedChecklistCount} of {checklistItems.length} complete</span>
                            <span className="text-teal-400 font-medium">AI Ready</span>
                        </div>
                    </div>
                </NavLink>
            </div>

            {/* Main Content Layout: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: 2 Columns Wide */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Snapshot Card */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                            <div className="flex items-center gap-2 text-teal-400">
                                <User className="w-4 h-4" />
                                <h2 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wider font-semibold">
                                    Profile Snapshot
                                </h2>
                            </div>
                            <NavLink
                                to="/admin/personal-info"
                                className="text-xs font-sub-header-text text-teal-400 hover:text-teal-200 transition-colors inline-flex items-center gap-1 uppercase tracking-wider"
                            >
                                <span>Edit Profile</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </NavLink>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                            {personalInfo?.profile?.secure_url ? (
                                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-teal-500/30 shadow-lg shadow-teal-950/40 shrink-0">
                                    <img
                                        src={personalInfo.profile.secure_url}
                                        alt={fullName || "Profile"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 shrink-0">
                                    <User className="w-12 h-12 opacity-40" />
                                </div>
                            )}

                            <div className="flex-1 text-center sm:text-left min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <h3 className="text-lg sm:text-xl font-bold font-sub-header-text text-slate-100 tracking-wide truncate">
                                        {fullName || "Name Not Configured"}
                                    </h3>
                                    <span className="inline-flex items-center self-center sm:self-auto gap-1.5 px-2.5 py-0.5 rounded-full border border-teal-500/30 bg-teal-950/60 text-teal-300 text-xs font-sub-header-text uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                        Software Developer
                                    </span>
                                </div>

                                <p className="mt-2 text-xs sm:text-sm font-body-text text-slate-300 line-clamp-3 leading-relaxed">
                                    {personalInfo?.summary || "No biography summary set yet. Add one in Personal Info."}
                                </p>

                                {formattedAddress && (
                                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-xl border border-slate-700/60 bg-slate-900/60 text-slate-300 text-xs">
                                        <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                                        <span className="font-body-text truncate">{formattedAddress}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Featured Projects Card */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
                            <div className="flex items-center gap-2 text-teal-400">
                                <FolderGit2 className="w-4 h-4" />
                                <h2 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wider font-semibold">
                                    Uploaded Projects ({projects.length})
                                </h2>
                            </div>
                            <NavLink
                                to="/admin/project"
                                className="text-xs font-sub-header-text text-teal-400 hover:text-teal-200 transition-colors inline-flex items-center gap-1 uppercase tracking-wider"
                            >
                                <span>Manage All</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </NavLink>
                        </div>

                        {projects.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-sm font-body-text text-slate-400 mb-3">
                                    No projects created yet. Start showcasing your work!
                                </p>
                                <NavLink
                                    to="/admin/project"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-teal-500/40 bg-teal-950/60 hover:bg-teal-900 text-teal-200 text-xs font-sub-header-text uppercase tracking-wider"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add First Project</span>
                                </NavLink>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {projects.map((project) => (
                                    <div
                                        key={project._id}
                                        className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-teal-500/30 hover:bg-slate-900/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            {project.preview?.images?.[0]?.secure_url ? (
                                                <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                                                    <img
                                                        src={project.preview.images[0].secure_url}
                                                        alt={project.project_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                                                    <Layers className="w-5 h-5" />
                                                </div>
                                            )}

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-sub-header-text text-sm font-bold text-slate-100 truncate">
                                                        {project.project_name}
                                                    </h4>
                                                    <span className="px-2 py-0.5 rounded-full border border-teal-500/30 bg-teal-950/60 text-teal-300 text-[10px] font-sub-header-text uppercase tracking-wider">
                                                        {project.project_type}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-body-text text-slate-400 line-clamp-1 mt-0.5">
                                                    {project.project_description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                            <div className="flex items-center gap-1">
                                                {(project.languages || []).slice(0, 4).map((lang, idx) => {
                                                    const Icon = DevIconsMapper(false)[lang.toLowerCase()];
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-300"
                                                            title={lang}
                                                        >
                                                            {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
                                                        </div>
                                                    );
                                                })}
                                                {(project.languages || []).length > 4 && (
                                                    <span className="text-[10px] font-mono text-slate-400 pl-1">
                                                        +{project.languages.length - 4}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tech Stack in Projects Analysis */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
                            <div className="flex items-center gap-2 text-teal-400">
                                <Code2 className="w-4 h-4" />
                                <h2 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wider font-semibold">
                                    Project Technology Utilization
                                </h2>
                            </div>
                            <span className="text-xs font-body-text text-slate-400">
                                {projectLanguages.size} technologies verified in portfolio
                            </span>
                        </div>

                        {topProjectLanguages.length === 0 ? (
                            <p className="text-xs font-body-text text-slate-400">
                                No technology data associated with projects yet.
                            </p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {topProjectLanguages.map(([lang, count]) => {
                                    const Icon = DevIconsMapper(false)[lang.toLowerCase()];
                                    return (
                                        <div
                                            key={lang}
                                            className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center justify-between gap-2"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                {Icon && <Icon className="w-4 h-4 text-teal-400 shrink-0" />}
                                                <span className="font-sub-header-text text-xs text-slate-200 truncate">
                                                    {lang}
                                                </span>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-teal-300 font-mono text-[11px] font-semibold border border-slate-800">
                                                {count} {count === 1 ? "proj" : "projs"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: 1 Column Wide */}
                <div className="space-y-6">
                    {/* Portfolio Readiness Checklist */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
                            <div className="flex items-center gap-2 text-teal-400">
                                <CheckCircle2 className="w-4 h-4" />
                                <h3 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wider font-semibold">
                                    Setup Checklist
                                </h3>
                            </div>
                            <span className="font-sub-header-text text-xs text-teal-400 font-bold">
                                {healthPercentage}%
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            {checklistItems.map((item, idx) => (
                                <NavLink
                                    key={idx}
                                    to={item.path}
                                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800/60 bg-slate-900/40 hover:bg-slate-800/70 hover:border-slate-700 transition-all text-xs"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                                item.complete
                                                    ? "bg-teal-500/20 text-teal-400 border border-teal-500/40"
                                                    : "bg-slate-800 text-slate-500 border border-slate-700"
                                            }`}
                                        >
                                            {item.complete ? "✓" : "•"}
                                        </div>
                                        <span className={`font-body-text ${item.complete ? "text-slate-200" : "text-slate-400"}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-teal-400 font-sub-header-text uppercase">
                                        {item.complete ? "Set" : "Fix →"}
                                    </span>
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* Skills Categories Summary */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
                            <div className="flex items-center gap-2 text-teal-400">
                                <Cpu className="w-4 h-4" />
                                <h3 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wider font-semibold">
                                    Skills Distribution
                                </h3>
                            </div>
                            <NavLink
                                to="/admin/skills"
                                className="text-xs font-sub-header-text text-teal-400 hover:text-teal-200 transition-colors inline-flex items-center gap-1 uppercase tracking-wider"
                            >
                                <span>Edit</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </NavLink>
                        </div>

                        <div className="space-y-3">
                            <SkillCategoryRow title="Front-End" count={frontendSkills.length} skills={frontendSkills} />
                            <SkillCategoryRow title="Back-End" count={backendSkills.length} skills={backendSkills} />
                            <SkillCategoryRow title="Languages" count={languageSkills.length} skills={languageSkills} />
                            <SkillCategoryRow title="Tools & Others" count={toolSkills.length} skills={toolSkills} />
                        </div>
                    </div>

                    {/* Social & Contact Links Card */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
                            <div className="flex items-center gap-2 text-teal-400">
                                <Share2 className="w-4 h-4" />
                                <h3 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wider font-semibold">
                                    Connected Channels
                                </h3>
                            </div>
                            <NavLink
                                to="/admin/links"
                                className="text-xs font-sub-header-text text-teal-400 hover:text-teal-200 transition-colors inline-flex items-center gap-1 uppercase tracking-wider"
                            >
                                <span>Manage</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </NavLink>
                        </div>

                        {links.length === 0 ? (
                            <p className="text-xs font-body-text text-slate-400">
                                No links configured yet.
                            </p>
                        ) : (
                            <div className="space-y-2.5">
                                {links.map((link) => {
                                    const Icon = SocialsIconMapper(false)[link.social];
                                    return (
                                        <div
                                            key={link._id}
                                            className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/50 flex items-center justify-between gap-3 text-xs"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                {Icon ? (
                                                    <div className="p-1.5 rounded-lg bg-slate-950 text-teal-400 shrink-0 border border-slate-800">
                                                        <Icon className="w-3.5 h-3.5" />
                                                    </div>
                                                ) : null}
                                                <div className="min-w-0">
                                                    <div className="font-sub-header-text text-slate-200 uppercase text-[11px] font-semibold truncate">
                                                        {link.social}
                                                    </div>
                                                    <div className="text-slate-400 font-body-text text-[10px] truncate">
                                                        {link.link}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                {link.in_contact && (
                                                    <span className="px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-500/30 text-[9px] font-mono">
                                                        Contact
                                                    </span>
                                                )}
                                                {link.in_footer && (
                                                    <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 text-[9px] font-mono">
                                                        Footer
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Quick Admin Navigation Shortcuts */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                        <div className="flex items-center gap-2 text-teal-400 mb-3 pb-3 border-b border-slate-800/80">
                            <Bot className="w-4 h-4" />
                            <h3 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wider font-semibold">
                                Quick Shortcuts
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <NavLink
                                to="/admin/project"
                                className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-teal-400/40 transition-all flex flex-col gap-1 text-slate-200"
                            >
                                <span className="font-sub-header-text text-teal-400 text-[11px] uppercase">
                                    + Projects
                                </span>
                                <span className="text-[10px] text-slate-400 font-body-text">
                                    Add or edit portfolio work
                                </span>
                            </NavLink>

                            <NavLink
                                to="/admin/skills"
                                className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-teal-400/40 transition-all flex flex-col gap-1 text-slate-200"
                            >
                                <span className="font-sub-header-text text-teal-400 text-[11px] uppercase">
                                    🛠️ Skills
                                </span>
                                <span className="text-[10px] text-slate-400 font-body-text">
                                    Manage tech stack
                                </span>
                            </NavLink>

                            <NavLink
                                to="/admin/links"
                                className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-teal-400/40 transition-all flex flex-col gap-1 text-slate-200"
                            >
                                <span className="font-sub-header-text text-teal-400 text-[11px] uppercase">
                                    🔗 Links
                                </span>
                                <span className="text-[10px] text-slate-400 font-body-text">
                                    Footer & contacts
                                </span>
                            </NavLink>

                            <NavLink
                                to="/admin/personal-info"
                                className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-teal-400/40 transition-all flex flex-col gap-1 text-slate-200"
                            >
                                <span className="font-sub-header-text text-teal-400 text-[11px] uppercase">
                                    👤 Profile
                                </span>
                                <span className="text-[10px] text-slate-400 font-body-text">
                                    Bio, photo, address
                                </span>
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SkillCategoryRow({ title, count, skills = [] }) {
    return (
        <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/50 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
                <span className="font-sub-header-text text-slate-300 uppercase tracking-wider text-[11px] font-semibold">
                    {title}
                </span>
                <span className="font-mono text-[10px] text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-500/30">
                    {count} {count === 1 ? "skill" : "skills"}
                </span>
            </div>
            {skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {skills.map((slug) => (
                        <span
                            key={slug}
                            className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-sub-header-text uppercase"
                        >
                            {slug}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

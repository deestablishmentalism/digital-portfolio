import { useEffect, useState } from "react";
import { User, MapPin, Briefcase, CalendarDays } from "lucide-react";
import api from "../api/axios";
import SpinnerComponent from "./SpinnerComponent";

const formatMonthYear = (date) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

function formatDuration(start, end) {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const totalMonths = Math.max(
        1,
        (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
            (endDate.getUTCMonth() - startDate.getUTCMonth()) +
            1
    );
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    return [
        years ? `${years} yr${years > 1 ? "s" : ""}` : null,
        months ? `${months} mo${months > 1 ? "s" : ""}` : null,
    ]
        .filter(Boolean)
        .join(" ");
}

export default function AboutSectionComponent({ preview = false, onLoad }) {
    const [personalInfo, setPersonalInfo] = useState(null);
    const [workExperiences, setWorkExperiences] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            try {
                const [infoRes, workRes] = await Promise.allSettled([
                    preview ? api.get("/personal-info/admin") : api.get("/personal-info"),
                    preview ? api.get("/work-experience/admin") : api.get("/work-experience"),
                ]);

                if (isMounted) {
                    if (infoRes.status === "fulfilled") {
                        setPersonalInfo(infoRes.value.data?.data || null);
                    }
                    if (workRes.status === "fulfilled") {
                        const experiences = workRes.value.data?.data || [];
                        setWorkExperiences(
                            [...experiences].sort(
                                (a, b) => new Date(b.start_date) - new Date(a.start_date)
                            )
                        );
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                if (isMounted) {
                    setFetching(false);
                    onLoad?.();
                }
            }
        }

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [preview, onLoad]);

    const fullName = [
        personalInfo?.first_name,
        personalInfo?.middle_name,
        personalInfo?.last_name,
    ]
        .filter(Boolean)
        .join(" ");

    const formattedAddress = formatAddress(personalInfo?.address);

    return (
        <div className="w-full">
            {fetching ? (
                <div className="flex justify-center items-center py-10">
                    <SpinnerComponent width={30} height={30} />
                </div>
            ) : !personalInfo && workExperiences.length === 0 ? (
                <div className="flex justify-center items-center p-6 text-sm text-slate-400 font-body-text">
                    No personal information available.
                </div>
            ) : (
                <div className="flex flex-col gap-4 sm:gap-6 w-full">
                    {/* Top Row: Identity & Bio/Location */}
                    {personalInfo && (
                        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 w-full">
                            {/* Left Column: Identity / Profile Card */}
                            <div className="flex flex-col items-center md:items-start w-full md:w-64 lg:w-72 shrink-0 p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs text-center md:text-left transition-all duration-300 hover:border-slate-700/80">
                                {personalInfo?.profile?.secure_url ? (
                                    <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-2xl overflow-hidden border-2 border-teal-500/30 shadow-lg shadow-teal-950/40 group mb-4">
                                        <img
                                            src={personalInfo.profile.secure_url}
                                            alt={fullName || "Profile"}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-teal-400 mb-4">
                                        <User className="w-16 h-16 opacity-40" />
                                    </div>
                                )}

                                {fullName && (
                                    <h2 className="font-sub-header-text text-base sm:text-lg font-bold text-slate-100 tracking-wide">
                                        {fullName}
                                    </h2>
                                )}

                                <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-950/60 text-teal-300 text-xs font-sub-header-text uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                                    <span>Software Developer</span>
                                </div>
                            </div>

                            {/* Right Column: Bio / Summary & Location Card */}
                            <div className="flex-1 w-full flex flex-col justify-between gap-5 p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs transition-all duration-300 hover:border-slate-700/80">
                                {/* Summary Section */}
                                <div className="flex flex-col gap-2.5">
                                    <div className="flex items-center gap-2 text-teal-400">
                                        <User className="w-4 h-4 shrink-0" />
                                        <h3 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wider font-semibold">
                                            Summary
                                        </h3>
                                    </div>
                                    <p className="font-body-text text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                        {personalInfo?.summary || "No summary provided."}
                                    </p>
                                </div>

                                {/* Location Section */}
                                {formattedAddress && (
                                    <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-800/80">
                                        <div className="flex items-center gap-2 text-teal-400">
                                            <MapPin className="w-4 h-4 shrink-0" />
                                            <h3 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wider font-semibold">
                                                Location
                                            </h3>
                                        </div>
                                        <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-700/60 bg-slate-900/60 text-slate-200 text-xs sm:text-sm w-fit max-w-full">
                                            <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                                            <span className="font-body-text text-slate-300">
                                                {formattedAddress}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Work Experience Card */}
                    <div className="w-full p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs transition-all duration-300 hover:border-slate-700/80 flex flex-col gap-4 sm:gap-5">
                        <div className="flex items-center gap-2 text-teal-400 pb-3 border-b border-slate-800/80">
                            <Briefcase className="w-4 h-4 shrink-0" />
                            <h3 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wider font-semibold">
                                Work Experience
                            </h3>
                        </div>

                        {workExperiences.length === 0 ? (
                            <div className="py-6 flex flex-col items-center gap-2 text-center text-slate-400">
                                <Briefcase className="w-8 h-8 opacity-30 text-teal-400" />
                                <p className="text-xs sm:text-sm font-body-text">No work experience listed yet.</p>
                            </div>
                        ) : (
                            <ol className="relative flex flex-col gap-4 border-l border-slate-800 ml-1.5 sm:ml-2">
                                {workExperiences.map((experience) => {
                                    const isCurrent = !experience.end_date;
                                    return (
                                        <li key={experience._id} className="relative pl-5 sm:pl-6">
                                            {/* Timeline marker */}
                                            <span
                                                className={`absolute -left-[7px] top-4 w-3.5 h-3.5 rounded-full border-2 ${
                                                    experience.end_date
                                                        ? "border-slate-600 bg-slate-900"
                                                        : "border-teal-400 bg-teal-950 shadow-[0_0_8px] shadow-teal-500/60"
                                                }`}
                                            />
                                            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2 transition-all duration-200 hover:border-slate-700/80">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-2">
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm sm:text-base font-bold font-sub-header-text text-slate-100 tracking-wide break-words">
                                                            {experience.work_title}
                                                        </h4>
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs font-body-text text-slate-400">
                                                            <CalendarDays className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                                                            <span>
                                                                {formatMonthYear(experience.start_date)} —{" "}
                                                                {isCurrent ? "Present" : formatMonthYear(experience.end_date)}
                                                            </span>
                                                            <span className="text-slate-600">•</span>
                                                            <span>
                                                                {formatDuration(experience.start_date, experience.end_date)}
                                                            </span>
                                                            {isCurrent && (
                                                                <span className="px-2 py-0.5 rounded-full border border-teal-500/30 bg-teal-950/60 text-teal-300 text-[10px] font-sub-header-text uppercase tracking-wider">
                                                                    Current
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {experience.description && (
                                                    <p className="font-body-text text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                                                        {experience.description}
                                                    </p>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function formatAddress(address) {
    if (!address) return "";
    if (typeof address === "string") return address;
    const parts = [
        address.house_number ? `#${address.house_number}` : null,
        address.subdivision,
        address.barangay,
        address.city,
        address.province,
        address.region,
    ].filter(Boolean);
    return parts.join(", ");
}

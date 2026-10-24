import { useEffect, useState } from "react";
import { User, MapPin } from "lucide-react";
import api from "../api/axios";
import SpinnerComponent from "./SpinnerComponent";

export default function AboutSectionComponent({ preview = false, onLoad }) {
    const [personalInfo, setPersonalInfo] = useState(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        async function fetchPersonalInfo() {
            try {
                const response = preview
                    ? await api.get("/personal-info/admin")
                    : await api.get("/personal-info");
                setPersonalInfo(response.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setFetching(false);
                onLoad?.();
            }
        }

        fetchPersonalInfo();
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
            ) : !personalInfo ? (
                <div className="flex justify-center items-center p-6 text-sm text-slate-400 font-body-text">
                    No personal information available.
                </div>
            ) : (
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

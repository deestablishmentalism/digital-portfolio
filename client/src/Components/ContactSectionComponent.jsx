import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import { SocialsIconMapper } from "../utils/IconMapper";
import api from "../api/axios";
import SpinnerComponent from "./SpinnerComponent";

export default function ContactSectionComponent({ preview = false, refreshKey, onLoad }) {
    const [links, setLinks] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        async function fetchLinks() {
            try {
                const response = preview
                    ? await api.get("/links/contacts/admin")
                    : await api.get("/links/contacts");
                if (response.status !== 200) throw new Error("ERR: " + response.status);
                setLinks(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error(error.message);
            } finally {
                setFetching(false);
                onLoad?.();
            }
        }
        fetchLinks();
    }, [refreshKey, preview, onLoad]);

    return (
        <div className="w-full">
            <div className="flex items-center gap-2 mb-3 text-teal-400">
                <Briefcase className="w-4 h-4 shrink-0" />
                <h2 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wider font-semibold">
                    Open to work & collaboration
                </h2>
            </div>

            <div className="w-full p-4 sm:p-5 border border-slate-800/80 rounded-2xl bg-slate-950/40 backdrop-blur-xs">
                {fetching ? (
                    <div className="flex justify-center items-center py-6">
                        <SpinnerComponent width={26} height={26} />
                    </div>
                ) : links.length === 0 ? (
                    <div className="flex justify-center items-center px-6 py-4 text-sm text-slate-400 font-body-text">
                        No contact links provided.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {links.map((link) => {
                            const href = getContactHref(link.social, link.link);
                            const Icon = SocialsIconMapper(false)[link.social];
                            const label = formatSocialLabel(link.social);

                            return (
                                <a
                                    key={link._id}
                                    href={preview ? undefined : href}
                                    target={
                                        link.social === "gmail" || link.social === "phonenumber"
                                            ? undefined
                                            : "_blank"
                                    }
                                    rel="noopener noreferrer"
                                    className={`
                                        group
                                        w-full
                                        flex items-center gap-3.5
                                        px-4 py-3.5
                                        rounded-xl
                                        border border-slate-700/60
                                        bg-slate-900/60
                                        text-slate-200
                                        transition-all duration-200
                                        hover:-translate-y-0.5
                                        hover:border-teal-400/50
                                        hover:bg-slate-800/80
                                        hover:text-teal-200
                                        hover:shadow-lg hover:shadow-teal-950/30
                                        ${preview ? "pointer-events-none cursor-default" : "cursor-pointer"}
                                    `}
                                >
                                    {Icon && (
                                        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-teal-400 group-hover:text-teal-300 transition-colors shrink-0">
                                            <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                                        </div>
                                    )}

                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs sm:text-sm font-sub-header-text font-medium tracking-wide truncate text-slate-200 group-hover:text-teal-200">
                                            {label}
                                        </span>
                                        <span className="text-[11px] font-body-text text-slate-400 truncate group-hover:text-slate-300">
                                            {link.link}
                                        </span>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function getContactHref(social, link) {
    if (!link) return "#";
    if (social === "gmail") return `mailto:${link}`;
    if (social === "phonenumber") return `tel:${link}`;
    if (link.startsWith("http://") || link.startsWith("https://")) return link;
    return `https://${link}`;
}

function formatSocialLabel(social) {
    if (!social) return "";
    const map = {
        gmail: "Email",
        phonenumber: "Phone",
        linkedin: "LinkedIn",
        facebook: "Facebook",
        github: "GitHub",
        discord: "Discord",
        messenger: "Messenger",
    };
    return map[social.toLowerCase()] || social.toUpperCase();
}

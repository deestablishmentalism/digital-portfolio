import { useState, useEffect } from "react";
import { Globe, Plus, Trash, Pencil, X, Check, Share2, Layers } from "lucide-react";
import { SocialsIconMapper } from "../../utils/IconMapper";
import AddLinks from "../../Components/AddLink";
import SpinnerComponent from "../../Components/SpinnerComponent";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToastMessage } from "../../Components/ToastMessage";
import Footer from "../../Components/Footer";
import ContactSectionComponent from "../../Components/ContactSectionComponent";
import DeleteConfirmationModal from "../../Components/DeleteConfirmationModal";
import api from "../../api/axios";

export default function Links() {
    const showToastMessage = useToastMessage();
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [deleteData, setDeleteData] = useState(null);
    const [links, setLinks] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [contactRefreshKey, setContactRefreshKey] = useState(0);
    const [footerRefreshKey, setFooterRefreshKey] = useState(0);

    useEffect(() => {
        let isMounted = true;
        async function fetchLinks() {
            try {
                const response = await api.get("/links/admin");
                if (isMounted) {
                    setLinks(Array.isArray(response.data) ? response.data : []);
                }
            } catch (error) {
                showToastMessage(false, error.message);
            } finally {
                if (isMounted) {
                    setIsFetching(false);
                }
            }
        }
        fetchLinks();
        return () => {
            isMounted = false;
        };
    }, [showToastMessage]);

    const handleLinkSaved = (data) => {
        setLinks((prev) => [...prev, data]);
        setIsOpenModal(false);
        setContactRefreshKey((prev) => prev + 1);
        setFooterRefreshKey((prev) => prev + 1);
    };

    const handleLinkUpdated = (updatedLink) => {
        setLinks((prev) =>
            prev.map((link) => (link._id === updatedLink._id ? updatedLink : link))
        );
        setContactRefreshKey((prev) => prev + 1);
        setFooterRefreshKey((prev) => prev + 1);
        setEditId(null);
    };

    const handleLinkDeleted = (deletedItem) => {
        setLinks((prev) => prev.filter((link) => link._id !== deletedItem._id));
        setContactRefreshKey((prev) => prev + 1);
        setFooterRefreshKey((prev) => prev + 1);
        setDeleteData(null);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full pb-8">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                <div>
                    <div className="flex items-center gap-2 text-teal-400 mb-1">
                        <Globe className="w-5 h-5" />
                        <span className="font-sub-header-text text-xs uppercase tracking-wider font-semibold">
                            Channels & Communications
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-sub-header-text text-slate-100 tracking-wide">
                        Links & Socials
                    </h1>
                    <p className="text-xs sm:text-sm font-body-text text-slate-400 mt-1">
                        Configure social profiles, direct communication channels, and display visibility across sections.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => setIsOpenModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-teal-500/40 bg-teal-950/60 hover:bg-teal-900 text-teal-200 font-sub-header-text text-xs uppercase tracking-wider font-semibold transition-all shadow-lg shadow-teal-950/30 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Active Link</span>
                    </button>
                </div>
            </div>

            {/* Modals */}
            {isOpenModal && (
                <AddLinks
                    open={isOpenModal}
                    onOpenChange={setIsOpenModal}
                    onSave={handleLinkSaved}
                />
            )}

            {deleteData && (
                <DeleteConfirmationModal
                    data={{
                        id: deleteData._id,
                        title: deleteData.social,
                    }}
                    open={!!deleteData}
                    onOpenChange={(open) => {
                        if (!open) setDeleteData(null);
                    }}
                    onDelete={handleLinkDeleted}
                />
            )}

            {/* Configured Links List */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                    <div className="flex items-center gap-2 text-teal-400">
                        <Share2 className="w-4 h-4" />
                        <h2 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wider font-semibold">
                            Configured Channels ({links.length})
                        </h2>
                    </div>
                    <span className="text-xs font-body-text text-slate-400">
                        Click edit to update URL or placement
                    </span>
                </div>

                {isFetching ? (
                    <div className="flex justify-center items-center py-12">
                        <SpinnerComponent width={36} height={36} />
                    </div>
                ) : links.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-sm font-body-text text-slate-400 mb-3">
                            No links configured yet. Connect your email, phone, GitHub, or social profiles.
                        </p>
                        <button
                            onClick={() => setIsOpenModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-teal-500/40 bg-teal-950/60 hover:bg-teal-900 text-teal-200 text-xs font-sub-header-text uppercase tracking-wider cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add First Link</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {links.map((link) => {
                            const date = new Date(link.updatedAt ?? link.createdAt);
                            const isEditing = editId === link._id;
                            const Icon = SocialsIconMapper(true)[link.social];

                            return (
                                <div
                                    key={link._id}
                                    className="p-4 sm:p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-teal-500/30 transition-all flex flex-col justify-between gap-3.5"
                                >
                                    {isEditing ? (
                                        <EditLink
                                            link={link}
                                            onCancel={() => setEditId(null)}
                                            onSave={handleLinkUpdated}
                                        />
                                    ) : (
                                        <>
                                            {/* Header Row: Icon, Platform & Action Buttons */}
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {Icon ? (
                                                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-teal-400 shrink-0">
                                                            <Icon className="w-6 h-6" />
                                                        </div>
                                                    ) : null}
                                                    <div className="min-w-0">
                                                        <h3 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wide font-bold text-slate-100 truncate">
                                                            {formatPhoneNumber(link.social)}
                                                        </h3>
                                                        <span className="text-[10px] font-mono text-slate-400">
                                                            {link.updatedAt ? "Updated" : "Created"}{" "}
                                                            {new Intl.DateTimeFormat("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            }).format(date)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button
                                                        onClick={() => setEditId(link._id)}
                                                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-teal-300 hover:border-teal-500/40 hover:bg-slate-900 transition-colors cursor-pointer"
                                                        title="Edit Link"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteData(link)}
                                                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-red-300 hover:border-red-500/40 hover:bg-slate-900 transition-colors cursor-pointer"
                                                        title="Delete Link"
                                                    >
                                                        <Trash className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Link Target URL */}
                                            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-body-text text-slate-300 truncate">
                                                {link.link}
                                            </div>

                                            {/* Visibility Badges */}
                                            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                                                <span className="text-slate-400 font-body-text text-xs">Visible in:</span>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {link.in_contact ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-500/30 text-[10px] font-sub-header-text uppercase">
                                                            Contact
                                                        </span>
                                                    ) : null}
                                                    {link.in_footer ? (
                                                        <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-sub-header-text uppercase">
                                                            Footer
                                                        </span>
                                                    ) : null}
                                                    {!link.in_contact && !link.in_footer && (
                                                        <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-mono italic">
                                                            Hidden
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Live Previews: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Section Preview */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                        <div className="flex items-center gap-2 text-teal-400">
                            <Layers className="w-4 h-4" />
                            <h3 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wider font-semibold">
                                Contact Section Preview
                            </h3>
                        </div>
                        <span className="text-xs font-body-text text-slate-400">
                            Homepage component
                        </span>
                    </div>
                    <ContactSectionComponent preview={true} refreshKey={contactRefreshKey} />
                </div>

                {/* Footer Section Preview */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
                        <div className="flex items-center gap-2 text-teal-400">
                            <Layers className="w-4 h-4" />
                            <h3 className="font-sub-header-text text-xs sm:text-sm uppercase tracking-wider font-semibold">
                                Footer Section Preview
                            </h3>
                        </div>
                        <span className="text-xs font-body-text text-slate-400">
                            Site-wide footer component
                        </span>
                    </div>
                    <Footer preview={true} refreshKey={footerRefreshKey} />
                </div>
            </div>
        </div>
    );
}

function formatPhoneNumber(text) {
    return typeof text === "string" ? text.replace(/phonenumber/g, "phone number") : text;
}

function EditLink({ link, onCancel, onSave }) {
    const showToastMessage = useToastMessage();
    const [payload, setPayload] = useState(link);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e) => {
        e?.preventDefault();
        try {
            setIsSaving(true);
            const response = await api.put("/links", payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            showToastMessage(response.data.success, response.data.message);
            onSave(response.data.data);
        } catch (error) {
            showToastMessage(false, error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="flex flex-col gap-3 w-full">
            <div>
                <Label className="text-xs font-sub-header-text uppercase tracking-wider text-teal-400 mb-1.5 block">
                    Target URL / Handle
                </Label>
                <Input
                    type="text"
                    value={payload.link}
                    onChange={(e) => setPayload({ ...payload, link: e.target.value })}
                    className="bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-xl"
                    placeholder="https://... or email"
                />
            </div>

            <div className="flex items-center gap-4 py-1">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id={`footer-${payload._id}`}
                        checked={payload.in_footer}
                        onCheckedChange={(checked) =>
                            setPayload({ ...payload, in_footer: !!checked })
                        }
                    />
                    <Label
                        htmlFor={`footer-${payload._id}`}
                        className="text-xs font-body-text text-slate-300 cursor-pointer"
                    >
                        Show in Footer
                    </Label>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id={`contact-${payload._id}`}
                        checked={payload.in_contact}
                        onCheckedChange={(checked) =>
                            setPayload({ ...payload, in_contact: !!checked })
                        }
                    />
                    <Label
                        htmlFor={`contact-${payload._id}`}
                        className="text-xs font-body-text text-slate-300 cursor-pointer"
                    >
                        Show in Contact
                    </Label>
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title="Cancel"
                >
                    <X className="w-4 h-4" />
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-950/80 border border-teal-500/40 text-teal-200 hover:bg-teal-900 transition-colors text-xs font-sub-header-text uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                    {isSaving ? (
                        <SpinnerComponent width={16} height={16} />
                    ) : (
                        <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Save</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

import { useState, useEffect, useRef } from "react";
import { User, MapPin, Pencil, X, Plus, Trash, Check, Camera, Sparkles, Briefcase, CalendarDays, FileText, ExternalLink, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SpinnerComponent from "../../Components/SpinnerComponent";
import AddressSelectComponent from "../../Components/AddressSelectComponent";
import { fetchRegions, fetchProvinces, fetchCities, fetchBarangays } from "../../utils/AddressAPI";
import api from "../../api/axios";
import { useToastMessage } from "../../Components/ToastMessage";

export default function PersonalInfo() {
    const showToastMessage = useToastMessage();
    const [personalInfo, setPersonalInfo] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const inputFileRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchPersonalInfo() {
            try {
                const response = await api.get("/personal-info/admin");
                if (isMounted) {
                    setPersonalInfo(response.data.data);
                }
            } catch (error) {
                showToastMessage(false, error.message);
            } finally {
                if (isMounted) {
                    setIsFetching(false);
                }
            }
        }
        fetchPersonalInfo();
        return () => {
            isMounted = false;
        };
    }, [showToastMessage]);

    const resizeAndEncode = (file) =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const MAX_SIZE = 1024;
                let width = img.naturalWidth;
                let height = img.naturalHeight;
                if (width > MAX_SIZE || height > MAX_SIZE) {
                    const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                URL.revokeObjectURL(img.src);
                canvas.toBlob((blob) => {
                    if (!blob) {
                        return reject(new Error("Image resize failed"));
                    }
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                }, "image/jpeg", 0.85);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });

    const handleFileSelect = async (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        e.target.value = "";
        setSelectedFile(selected);
        try {
            const resized = await resizeAndEncode(selected);
            if (preview) URL.revokeObjectURL(preview);
            setPreview(resized);
        } catch (error) {
            console.error(error);
            setSelectedFile(null);
            setPreview("");
        }
    };

    const removeFile = () => {
        if (preview) URL.revokeObjectURL(preview);
        setSelectedFile(null);
        setPreview("");
        if (inputFileRef.current) inputFileRef.current.value = "";
    };

    const handleProfileSave = async () => {
        if (!selectedFile) return;
        setIsSavingProfile(true);
        try {
            const image = await resizeAndEncode(selectedFile);
            const response = await api.put("/personal-info/profile", {
                image,
            });
            setPersonalInfo(response.data.data);
            showToastMessage(true, "Profile picture updated successfully!");
            removeFile();
        } catch (error) {
            showToastMessage(false, error.message);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const fullName = [
        personalInfo?.first_name,
        personalInfo?.middle_name,
        personalInfo?.last_name,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full pb-8">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs">
                <div>
                    <div className="flex items-center gap-2 text-teal-400 mb-1">
                        <User className="w-5 h-5" />
                        <span className="font-sub-header-text text-xs uppercase tracking-wider font-semibold">
                            Public Identity & Profile
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-sub-header-text text-slate-100 tracking-wide">
                        Personal Information
                    </h1>
                    <p className="text-xs sm:text-sm font-body-text text-slate-400 mt-1">
                        Manage your developer profile, avatar photo, professional biography, and geographical address.
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
                                <span>Edit Profile</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {isFetching ? (
                <div className="flex justify-center items-center py-16">
                    <SpinnerComponent width={36} height={36} />
                </div>
            ) : (
                /* Main 2-Column Responsive Layout */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Avatar & Photo Management */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs flex flex-col items-center text-center gap-4">
                        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80">
                            <div className="flex items-center gap-2 text-teal-400">
                                <Camera className="w-4 h-4" />
                                <h2 className="font-sub-header-text text-xs uppercase tracking-wider font-semibold">
                                    Profile Picture
                                </h2>
                            </div>
                            {preview ? (
                                <span className="text-[10px] font-mono text-teal-400 animate-pulse">
                                    New Selected
                                </span>
                            ) : null}
                        </div>

                        {/* Avatar Image Frame */}
                        {preview ? (
                            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-2 border-teal-500/50 shadow-xl shadow-teal-950/40 group">
                                <img
                                    src={preview}
                                    alt="Selected preview"
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute top-3 right-3">
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="p-2 bg-red-600/90 hover:bg-red-700 rounded-full text-white cursor-pointer shadow-lg transition-transform hover:scale-110"
                                        title="Remove selection"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : personalInfo?.profile?.secure_url ? (
                            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-2 border-teal-500/30 shadow-xl shadow-teal-950/40 group">
                                <img
                                    src={personalInfo.profile.secure_url}
                                    alt={fullName || "Profile"}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => inputFileRef.current?.click()}
                                        className="p-2 bg-slate-900/90 hover:bg-teal-950 border border-teal-500/40 text-teal-200 rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110"
                                        title="Change photo"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40 flex flex-col items-center justify-center gap-3 text-slate-400">
                                <User className="w-12 h-12 opacity-30 text-teal-400" />
                                <button
                                    type="button"
                                    onClick={() => inputFileRef.current?.click()}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-sub-header-text uppercase cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Upload Photo</span>
                                </button>
                            </div>
                        )}

                        <input
                            ref={inputFileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        {/* Upload / Save Actions */}
                        {preview ? (
                            <div className="flex items-center gap-2 mt-1">
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-sub-header-text uppercase cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleProfileSave}
                                    disabled={isSavingProfile}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-950/80 border border-teal-500/40 text-teal-200 hover:bg-teal-900 text-xs font-sub-header-text uppercase tracking-wider font-semibold transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isSavingProfile ? (
                                        <SpinnerComponent width={16} height={16} />
                                    ) : (
                                        <>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Save Photo</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => inputFileRef.current?.click()}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-sub-header-text uppercase tracking-wider cursor-pointer transition-colors"
                            >
                                <Camera className="w-3.5 h-3.5 text-teal-400" />
                                <span>Change Photo</span>
                            </button>
                        )}

                        {/* File Specs Badge */}
                        {personalInfo?.profile?.format && (
                            <div className="w-full pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                                <span>Format: {personalInfo.profile.format.toUpperCase()}</span>
                                <span>
                                    {personalInfo.profile.width}×{personalInfo.profile.height}px
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Bio & Information Card */}
                    <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs flex flex-col justify-between">
                        {editMode ? (
                            <EditMode
                                personalInfo={personalInfo}
                                onSave={(data) => {
                                    setPersonalInfo(data);
                                    setEditMode(false);
                                }}
                                onCancel={() => setEditMode(false)}
                            />
                        ) : (
                            <div className="flex flex-col gap-6">
                                {/* Name Header */}
                                <div>
                                    <div className="flex items-center gap-2 text-teal-400 mb-2">
                                        <User className="w-4 h-4" />
                                        <h3 className="font-sub-header-text text-xs uppercase tracking-wider font-semibold">
                                            Developer Identity
                                        </h3>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                                        <h2 className="text-xl sm:text-2xl font-bold font-sub-header-text text-slate-100 tracking-wide">
                                            {fullName || "Name Not Configured"}
                                        </h2>
                                        <span className="inline-flex items-center self-start sm:self-auto gap-1.5 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-950/60 text-teal-300 text-xs font-sub-header-text uppercase tracking-wider">
                                            <Sparkles className="w-3 h-3 text-teal-400" />
                                            Software Developer
                                        </span>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="pt-4 border-t border-slate-800/80">
                                    <div className="flex items-center gap-2 text-teal-400 mb-2">
                                        <User className="w-4 h-4" />
                                        <h3 className="font-sub-header-text text-xs uppercase tracking-wider font-semibold">
                                            Biography & Summary
                                        </h3>
                                    </div>
                                    <p className="font-body-text text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
                                        {personalInfo?.summary || "No biography provided yet. Click Edit Profile to add your summary."}
                                    </p>
                                </div>

                                {/* Resume Link */}
                                <div className="pt-4 border-t border-slate-800/80">
                                    <div className="flex items-center gap-2 text-teal-400 mb-2">
                                        <FileText className="w-4 h-4" />
                                        <h3 className="font-sub-header-text text-xs uppercase tracking-wider font-semibold">
                                            Resume
                                        </h3>
                                    </div>
                                    {personalInfo?.resume_link ? (
                                        <a
                                            href={personalInfo.resume_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 max-w-full text-sm font-body-text text-teal-300 hover:text-teal-200 underline-offset-4 hover:underline"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{personalInfo.resume_link}</span>
                                        </a>
                                    ) : (
                                        <p className="font-body-text text-sm text-slate-400">
                                            No resume link provided. The resume button will be hidden on the public site.
                                        </p>
                                    )}
                                </div>

                                {/* Address / Location Details */}
                                <div className="pt-4 border-t border-slate-800/80">
                                    <div className="flex items-center gap-2 text-teal-400 mb-3">
                                        <MapPin className="w-4 h-4" />
                                        <h3 className="font-sub-header-text text-xs uppercase tracking-wider font-semibold">
                                            Location & Address
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <AddressField label="Region" value={personalInfo?.address?.region} />
                                        <AddressField label="Province" value={personalInfo?.address?.province} />
                                        <AddressField label="City" value={personalInfo?.address?.city} />
                                        <AddressField label="Barangay" value={personalInfo?.address?.barangay} />
                                        <AddressField label="Street" value={personalInfo?.address?.subdivision} />
                                        <AddressField label="House #" value={personalInfo?.address?.house_number} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Work Experience (fetches independently; edit controls follow the page Edit Mode toggle) */}
            <WorkExperienceSection editMode={editMode} />
        </div>
    );
}

function AddressField({ label, value }) {
    return (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1">
            <span className="text-[10px] font-sub-header-text uppercase tracking-wider text-teal-400 font-semibold">
                {label}
            </span>
            <span className="text-xs font-body-text text-slate-200 font-medium truncate">
                {value || "—"}
            </span>
        </div>
    );
}

function EditMode({ personalInfo, onSave, onCancel }) {
    const showToastMessage = useToastMessage();
    const [isSaving, setIsSaving] = useState(false);
    const initialAddress = personalInfo?.address || {};
    const [payload, setPayload] = useState({
        first_name: personalInfo?.first_name || "",
        middle_name: personalInfo?.middle_name || "",
        last_name: personalInfo?.last_name || "",
        summary: personalInfo?.summary || "",
        resume_link: personalInfo?.resume_link || "",
        address: {
            region: initialAddress.region || "",
            province: initialAddress.province || "",
            city: initialAddress.city || "",
            barangay: initialAddress.barangay || "",
            subdivision: initialAddress.subdivision || "",
            house_number: initialAddress.house_number || "",
        },
    });

    const [regions, setRegions] = useState(null);
    const [provinces, setProvinces] = useState(null);
    const [cities, setCities] = useState(null);
    const [barangays, setBarangays] = useState(null);
    const [regionCode, setRegionCode] = useState(null);
    const [provinceCode, setProvinceCode] = useState(null);
    const [cityCode, setCityCode] = useState(null);
    const [isRegionFetching, setIsRegionFetching] = useState(true);
    const [isProvinceFetching, setIsProvinceFetching] = useState(false);
    const [isCityFetching, setIsCityFetching] = useState(false);
    const [isBarangayFetching, setIsBarangayFetching] = useState(false);

    useEffect(() => {
        let isMounted = true;
        async function loadRegions() {
            try {
                const response = await fetchRegions();
                if (!isMounted) return;
                setRegions(response);
                if (initialAddress.region) {
                    const match = response.find((r) => r.name === initialAddress.region);
                    if (match) {
                        setRegionCode(match.code);
                        setIsProvinceFetching(true);
                    }
                }
            } catch (error) {
                if (isMounted) setRegions(null);
                console.error(error.message);
            } finally {
                if (isMounted) setIsRegionFetching(false);
            }
        }
        loadRegions();
        return () => {
            isMounted = false;
        };
    }, [initialAddress.region]);

    useEffect(() => {
        let isMounted = true;
        async function loadProvinces() {
            if (!regionCode) return;
            try {
                const response = await fetchProvinces(regionCode);
                if (!isMounted) return;
                setProvinces(response);
                if (initialAddress.province) {
                    const match = response.find((p) => p.name === initialAddress.province);
                    if (match) {
                        setProvinceCode(match.code);
                        setIsCityFetching(true);
                    }
                }
            } catch (error) {
                if (isMounted) setProvinces(null);
                console.error(error.message);
            } finally {
                if (isMounted) setIsProvinceFetching(false);
            }
        }
        loadProvinces();
        return () => {
            isMounted = false;
        };
    }, [regionCode, initialAddress.province]);

    useEffect(() => {
        let isMounted = true;
        async function loadCities() {
            if (!provinceCode) return;
            try {
                const response = await fetchCities(provinceCode);
                if (!isMounted) return;
                setCities(response);
                if (initialAddress.city) {
                    const match = response.find((c) => c.name === initialAddress.city);
                    if (match) {
                        setCityCode(match.code);
                        setIsBarangayFetching(true);
                    }
                }
            } catch (error) {
                if (isMounted) setCities(null);
                console.error(error.message);
            } finally {
                if (isMounted) setIsCityFetching(false);
            }
        }
        loadCities();
        return () => {
            isMounted = false;
        };
    }, [provinceCode, initialAddress.city]);

    useEffect(() => {
        let isMounted = true;
        async function loadBarangays() {
            if (!cityCode) return;
            try {
                const response = await fetchBarangays(cityCode);
                if (!isMounted) return;
                setBarangays(response);
            } catch (error) {
                if (isMounted) setBarangays(null);
                console.error(error.message);
            } finally {
                if (isMounted) setIsBarangayFetching(false);
            }
        }
        loadBarangays();
        return () => {
            isMounted = false;
        };
    }, [cityCode]);

    const handleRegionChange = (code) => {
        const name = regions?.find((r) => r.code === code)?.name || code;
        setRegionCode(code);
        setProvinceCode(null);
        setCityCode(null);
        setProvinces(null);
        setCities(null);
        setBarangays(null);
        setIsProvinceFetching(true);
        setIsCityFetching(false);
        setIsBarangayFetching(false);
        setPayload((prev) => ({
            ...prev,
            address: { ...prev.address, region: name, province: "", city: "", barangay: "" },
        }));
    };

    const handleProvinceChange = (code) => {
        const name = provinces?.find((p) => p.code === code)?.name || code;
        setProvinceCode(code);
        setCityCode(null);
        setCities(null);
        setBarangays(null);
        setIsCityFetching(true);
        setIsBarangayFetching(false);
        setPayload((prev) => ({
            ...prev,
            address: { ...prev.address, province: name, city: "", barangay: "" },
        }));
    };

    const handleCityChange = (code) => {
        const name = cities?.find((c) => c.code === code)?.name || code;
        setCityCode(code);
        setBarangays(null);
        setIsBarangayFetching(true);
        setPayload((prev) => ({
            ...prev,
            address: { ...prev.address, city: name, barangay: "" },
        }));
    };

    const handleBarangayChange = (code) => {
        const name = barangays?.find((b) => b.code === code)?.name || code;
        setPayload((prev) => ({
            ...prev,
            address: { ...prev.address, barangay: name },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await api.put("/personal-info", payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            showToastMessage(response.data.success, response.data.message);
            onSave(response.data.data);
        } catch (error) {
            showToastMessage(false, getErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Full Name Inputs */}
            <div>
                <div className="flex items-center gap-2 text-teal-400 mb-3">
                    <User className="w-4 h-4" />
                    <h3 className="font-sub-header-text text-xs uppercase tracking-wider font-semibold">
                        Full Name
                    </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <Label htmlFor="first-name" className="text-xs font-sub-header-text uppercase text-slate-400 mb-1.5 block">
                            First Name
                        </Label>
                        <Input
                            id="first-name"
                            placeholder="First Name"
                            value={payload.first_name}
                            onChange={(e) => setPayload({ ...payload, first_name: e.target.value })}
                            className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl"
                        />
                    </div>
                    <div>
                        <Label htmlFor="middle-name" className="text-xs font-sub-header-text uppercase text-slate-400 mb-1.5 block">
                            Middle Name
                        </Label>
                        <Input
                            id="middle-name"
                            placeholder="Middle Name"
                            value={payload.middle_name}
                            onChange={(e) => setPayload({ ...payload, middle_name: e.target.value })}
                            className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl"
                        />
                    </div>
                    <div>
                        <Label htmlFor="last-name" className="text-xs font-sub-header-text uppercase text-slate-400 mb-1.5 block">
                            Last Name
                        </Label>
                        <Input
                            id="last-name"
                            placeholder="Last Name"
                            value={payload.last_name}
                            onChange={(e) => setPayload({ ...payload, last_name: e.target.value })}
                            className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl"
                        />
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="pt-4 border-t border-slate-800/80">
                <Label htmlFor="summary" className="text-xs font-sub-header-text uppercase text-teal-400 mb-2 block font-semibold">
                    Biography / Summary
                </Label>
                <Textarea
                    id="summary"
                    rows={4}
                    placeholder="Describe your background, skills, and goals..."
                    value={payload.summary}
                    onChange={(e) => setPayload({ ...payload, summary: e.target.value })}
                    className="bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm rounded-xl leading-relaxed"
                />
            </div>

            {/* Resume Link */}
            <div className="pt-4 border-t border-slate-800/80">
                <Label htmlFor="resume-link" className="text-xs font-sub-header-text uppercase text-teal-400 mb-2 block font-semibold">
                    Resume Link
                </Label>
                <Input
                    id="resume-link"
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={payload.resume_link}
                    onChange={(e) => setPayload({ ...payload, resume_link: e.target.value })}
                    className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl"
                />
                <p className="mt-1.5 text-[11px] font-body-text text-slate-500">
                    Leave empty to hide the Resume button on the public site.
                </p>
            </div>

            {/* Address */}
            <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-teal-400 mb-3">
                    <MapPin className="w-4 h-4" />
                    <h3 className="font-sub-header-text text-xs uppercase tracking-wider font-semibold">
                        Address & Location
                    </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <Label className="text-xs font-sub-header-text uppercase text-slate-400 mb-1.5 block">
                            Region
                        </Label>
                        {isRegionFetching ? (
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                                <SpinnerComponent width={18} height={18} />
                            </div>
                        ) : regions !== null ? (
                            <AddressSelectComponent
                                data={regions}
                                value={payload.address.region}
                                onValueChange={handleRegionChange}
                                title="Region"
                            />
                        ) : (
                            <Input
                                placeholder="Region"
                                value={payload.address.region}
                                onChange={(e) =>
                                    setPayload({
                                        ...payload,
                                        address: { ...payload.address, region: e.target.value },
                                    })
                                }
                                className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl"
                            />
                        )}
                    </div>

                    <div>
                        <Label className="text-xs font-sub-header-text uppercase text-slate-400 mb-1.5 block">
                            Province
                        </Label>
                        {isProvinceFetching && regionCode ? (
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                                <SpinnerComponent width={18} height={18} />
                            </div>
                        ) : provinces !== null ? (
                            <AddressSelectComponent
                                data={provinces}
                                value={payload.address.province}
                                onValueChange={handleProvinceChange}
                                title="Province"
                            />
                        ) : (
                            <Input
                                placeholder="Province"
                                value={payload.address.province}
                                onChange={(e) =>
                                    setPayload({
                                        ...payload,
                                        address: { ...payload.address, province: e.target.value },
                                    })
                                }
                                className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl"
                            />
                        )}
                    </div>

                    <div>
                        <Label className="text-xs font-sub-header-text uppercase text-slate-400 mb-1.5 block">
                            City / Municipality
                        </Label>
                        {isCityFetching && provinceCode ? (
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                                <SpinnerComponent width={18} height={18} />
                            </div>
                        ) : cities !== null ? (
                            <AddressSelectComponent
                                data={cities}
                                value={payload.address.city}
                                onValueChange={handleCityChange}
                                title="City"
                            />
                        ) : (
                            <Input
                                placeholder="City"
                                value={payload.address.city}
                                onChange={(e) =>
                                    setPayload({
                                        ...payload,
                                        address: { ...payload.address, city: e.target.value },
                                    })
                                }
                                className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl"
                            />
                        )}
                    </div>

                    <div>
                        <Label className="text-xs font-sub-header-text uppercase text-slate-400 mb-1.5 block">
                            Barangay
                        </Label>
                        {isBarangayFetching && cityCode ? (
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                                <SpinnerComponent width={18} height={18} />
                            </div>
                        ) : barangays !== null ? (
                            <AddressSelectComponent
                                data={barangays}
                                value={payload.address.barangay}
                                onValueChange={handleBarangayChange}
                                title="Barangay"
                            />
                        ) : (
                            <Input
                                placeholder="Barangay"
                                value={payload.address.barangay}
                                onChange={(e) =>
                                    setPayload({
                                        ...payload,
                                        address: { ...payload.address, barangay: e.target.value },
                                    })
                                }
                                className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl"
                            />
                        )}
                    </div>

                    <div>
                        <Label className="text-xs font-sub-header-text uppercase text-slate-400 mb-1.5 block">
                            Subdivision / Street
                        </Label>
                        <Input
                            type="text"
                            value={payload.address.subdivision}
                            placeholder="Enter street or subdivision"
                            onChange={(e) =>
                                setPayload({
                                    ...payload,
                                    address: { ...payload.address, subdivision: e.target.value },
                                })
                            }
                            className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl"
                        />
                    </div>

                    <div>
                        <Label className="text-xs font-sub-header-text uppercase text-slate-400 mb-1.5 block">
                            House Number
                        </Label>
                        <Input
                            type="text"
                            value={payload.address.house_number}
                            placeholder="Enter house number"
                            onChange={(e) =>
                                setPayload({
                                    ...payload,
                                    address: { ...payload.address, house_number: e.target.value },
                                })
                            }
                            className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl"
                        />
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-sub-header-text uppercase tracking-wider cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-950/80 border border-teal-500/40 text-teal-200 hover:bg-teal-900 text-xs font-sub-header-text uppercase tracking-wider font-semibold shadow-lg shadow-teal-950/30 transition-all cursor-pointer disabled:opacity-50"
                >
                    {isSaving ? (
                        <SpinnerComponent width={18} height={18} />
                    ) : (
                        <>
                            <Check className="w-4 h-4" />
                            <span>Save Changes</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}


/* ---------------------------- Work Experience ---------------------------- */

const NEW_EXPERIENCE_ID = "new";

// Dates are stored as UTC midnight, so always format/convert in UTC to avoid off-by-one days
const toDateInputValue = (date) => (date ? new Date(date).toISOString().slice(0, 10) : "");

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

const sortByStartDateDesc = (list) =>
    [...list].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

const getErrorMessage = (error) => error.response?.data?.message || error.message;

function WorkExperienceSection({ editMode }) {
    const showToastMessage = useToastMessage();
    const [experiences, setExperiences] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Leaving page-level edit mode closes any open form / delete confirmation
    const activeEditingId = editMode ? editingId : null;
    const activeConfirmDeleteId = editMode ? confirmDeleteId : null;

    useEffect(() => {
        let isMounted = true;
        async function fetchExperiences() {
            try {
                const response = await api.get("/work-experience/admin");
                if (isMounted) {
                    setExperiences(response.data.data || []);
                }
            } catch (error) {
                showToastMessage(false, getErrorMessage(error));
            } finally {
                if (isMounted) {
                    setIsFetching(false);
                }
            }
        }
        fetchExperiences();
        return () => {
            isMounted = false;
        };
    }, [showToastMessage]);

    const handleSaved = (saved) => {
        setExperiences((prev) => {
            const exists = prev.some((item) => item._id === saved._id);
            const next = exists
                ? prev.map((item) => (item._id === saved._id ? saved : item))
                : [...prev, saved];
            return sortByStartDateDesc(next);
        });
        setEditingId(null);
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            const response = await api.delete(`/work-experience/${id}`);
            setExperiences((prev) => prev.filter((item) => item._id !== id));
            showToastMessage(response.data.success, response.data.message);
            setConfirmDeleteId(null);
        } catch (error) {
            showToastMessage(false, getErrorMessage(error));
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 backdrop-blur-xs flex flex-col gap-5">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div>
                    <div className="flex items-center gap-2 text-teal-400">
                        <Briefcase className="w-4 h-4" />
                        <h2 className="font-sub-header-text text-xs uppercase tracking-wider font-semibold">
                            Work Experience
                        </h2>
                    </div>
                    <p className="text-xs font-body-text text-slate-400 mt-1">
                        {editMode
                            ? "Add, update, or remove positions from your professional history."
                            : "Your professional history. Click Edit Profile to make changes."}
                    </p>
                </div>
                {editMode && activeEditingId !== NEW_EXPERIENCE_ID && (
                    <button
                        type="button"
                        onClick={() => {
                            setConfirmDeleteId(null);
                            setEditingId(NEW_EXPERIENCE_ID);
                        }}
                        className="inline-flex items-center self-start sm:self-auto gap-1.5 px-4 py-2 rounded-xl bg-teal-950/80 border border-teal-500/40 text-teal-200 hover:bg-teal-900 text-xs font-sub-header-text uppercase tracking-wider font-semibold transition-all cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Experience</span>
                    </button>
                )}
            </div>

            {/* New Experience Form */}
            {activeEditingId === NEW_EXPERIENCE_ID && (
                <WorkExperienceForm onSaved={handleSaved} onCancel={() => setEditingId(null)} />
            )}

            {isFetching ? (
                <div className="flex justify-center items-center py-10">
                    <SpinnerComponent width={28} height={28} />
                </div>
            ) : experiences.length === 0 ? (
                activeEditingId !== NEW_EXPERIENCE_ID && (
                    <div className="py-10 flex flex-col items-center gap-2 text-center text-slate-400">
                        <Briefcase className="w-10 h-10 opacity-30 text-teal-400" />
                        <p className="text-sm font-body-text">No work experience added yet.</p>
                    </div>
                )
            ) : (
                <ol className="relative flex flex-col gap-4 border-l border-slate-800 ml-2">
                    {experiences.map((experience) => (
                        <li key={experience._id} className="relative pl-6">
                            {/* Timeline marker */}
                            <span
                                className={`absolute -left-[7px] top-4 w-3.5 h-3.5 rounded-full border-2 ${
                                    experience.end_date
                                        ? "border-slate-600 bg-slate-900"
                                        : "border-teal-400 bg-teal-950 shadow-[0_0_8px] shadow-teal-500/60"
                                }`}
                            />
                            {activeEditingId === experience._id ? (
                                <WorkExperienceForm
                                    experience={experience}
                                    onSaved={handleSaved}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : (
                                <WorkExperienceCard
                                    experience={experience}
                                    editMode={editMode}
                                    isConfirmingDelete={activeConfirmDeleteId === experience._id}
                                    isDeleting={deletingId === experience._id}
                                    onEdit={() => {
                                        setConfirmDeleteId(null);
                                        setEditingId(experience._id);
                                    }}
                                    onRequestDelete={() => setConfirmDeleteId(experience._id)}
                                    onCancelDelete={() => setConfirmDeleteId(null)}
                                    onConfirmDelete={() => handleDelete(experience._id)}
                                />
                            )}
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}

function WorkExperienceCard({
    experience,
    editMode,
    isConfirmingDelete,
    isDeleting,
    onEdit,
    onRequestDelete,
    onCancelDelete,
    onConfirmDelete,
}) {
    const isCurrent = !experience.end_date;
    return (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="text-base font-bold font-sub-header-text text-slate-100 tracking-wide break-words">
                            {experience.work_title}
                        </h3>
                        {experience.company && (
                            <>
                                <span className="text-slate-600 hidden sm:inline">•</span>
                                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-sub-header-text text-teal-300 font-medium">
                                    <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                                    <span>{experience.company}</span>
                                </span>
                            </>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs font-body-text text-slate-400">
                        <CalendarDays className="w-3.5 h-3.5 text-teal-400" />
                        <span>
                            {formatMonthYear(experience.start_date)} —{" "}
                            {isCurrent ? "Present" : formatMonthYear(experience.end_date)}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span>{formatDuration(experience.start_date, experience.end_date)}</span>
                        {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full border border-teal-500/30 bg-teal-950/60 text-teal-300 text-[10px] font-sub-header-text uppercase tracking-wider">
                                Current
                            </span>
                        )}
                    </div>
                </div>

                {editMode && (
                    <div className="flex items-center gap-2 shrink-0">
                        {isConfirmingDelete ? (
                            <>
                                <span className="text-[11px] font-sub-header-text uppercase text-red-300">Delete?</span>
                                <button
                                    type="button"
                                    onClick={onCancelDelete}
                                    disabled={isDeleting}
                                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-sub-header-text uppercase cursor-pointer disabled:opacity-50"
                                >
                                    No
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirmDelete}
                                    disabled={isDeleting}
                                    className="inline-flex items-center justify-center min-w-12 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-200 hover:bg-red-900 text-[11px] font-sub-header-text uppercase cursor-pointer disabled:opacity-50"
                                >
                                    {isDeleting ? <SpinnerComponent width={14} height={14} /> : "Yes"}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={onEdit}
                                    className="p-2 rounded-lg bg-slate-900 border border-teal-500/30 text-teal-200 hover:bg-teal-950 cursor-pointer transition-colors"
                                    title="Edit experience"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={onRequestDelete}
                                    className="p-2 rounded-lg bg-slate-900 border border-red-500/30 text-red-300 hover:bg-red-950 cursor-pointer transition-colors"
                                    title="Delete experience"
                                >
                                    <Trash className="w-3.5 h-3.5" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {experience.description && (
                <p className="font-body-text text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {experience.description}
                </p>
            )}
        </div>
    );
}

function WorkExperienceForm({ experience, onSaved, onCancel }) {
    const showToastMessage = useToastMessage();
    const isNew = !experience?._id;
    const [isSaving, setIsSaving] = useState(false);
    const [isCurrent, setIsCurrent] = useState(isNew ? false : !experience.end_date);
    const [payload, setPayload] = useState({
        work_title: experience?.work_title || "",
        company: experience?.company || "",
        description: experience?.description || "",
        start_date: toDateInputValue(experience?.start_date),
        end_date: toDateInputValue(experience?.end_date),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const body = {
            work_title: payload.work_title.trim(),
            company: payload.company.trim(),
            description: payload.description.trim(),
            start_date: payload.start_date,
            end_date: isCurrent ? null : payload.end_date,
        };

        if (!body.work_title || !body.company || !body.start_date) {
            showToastMessage(false, "Work title, company, and start date are required.");
            return;
        }
        if (!isCurrent && !body.end_date) {
            showToastMessage(false, "Please provide an end date or mark this as your current position.");
            return;
        }
        if (body.end_date && body.end_date < body.start_date) {
            showToastMessage(false, "End date cannot be earlier than the start date.");
            return;
        }

        setIsSaving(true);
        try {
            const response = isNew
                ? await api.post("/work-experience", body)
                : await api.put(`/work-experience/${experience._id}`, body);
            showToastMessage(response.data.success, response.data.message);
            onSaved(response.data.data);
        } catch (error) {
            showToastMessage(false, getErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    };

    const inputId = (field) => `work-${experience?._id || NEW_EXPERIENCE_ID}-${field}`;

    return (
        <form
            onSubmit={handleSubmit}
            className="p-4 rounded-xl bg-slate-900/60 border border-teal-500/30 flex flex-col gap-4"
        >
            <div className="flex items-center gap-2 text-teal-400">
                <Briefcase className="w-4 h-4" />
                <h3 className="font-sub-header-text text-xs uppercase tracking-wider font-semibold">
                    {isNew ? "New Work Experience" : "Edit Work Experience"}
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <Label htmlFor={inputId("title")} className="text-xs font-sub-header-text uppercase text-slate-400 mb-1.5 block">
                        Work Title
                    </Label>
                    <Input
                        id={inputId("title")}
                        placeholder="e.g. Full Stack Developer"
                        value={payload.work_title}
                        onChange={(e) => setPayload({ ...payload, work_title: e.target.value })}
                        required
                        className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl"
                    />
                </div>
                <div>
                    <Label htmlFor={inputId("company")} className="text-xs font-sub-header-text uppercase text-slate-400 mb-1.5 block">
                        Company
                    </Label>
                    <Input
                        id={inputId("company")}
                        placeholder="e.g. Acme Corp"
                        value={payload.company}
                        onChange={(e) => setPayload({ ...payload, company: e.target.value })}
                        required
                        className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <Label htmlFor={inputId("start")} className="text-xs font-sub-header-text uppercase text-slate-400 mb-1.5 block">
                        Start Date
                    </Label>
                    <Input
                        id={inputId("start")}
                        type="date"
                        value={payload.start_date}
                        max={!isCurrent && payload.end_date ? payload.end_date : undefined}
                        onChange={(e) => setPayload({ ...payload, start_date: e.target.value })}
                        required
                        className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl [color-scheme:dark]"
                    />
                </div>
                <div>
                    <Label htmlFor={inputId("end")} className="text-xs font-sub-header-text uppercase text-slate-400 mb-1.5 block">
                        End Date
                    </Label>
                    <Input
                        id={inputId("end")}
                        type="date"
                        value={isCurrent ? "" : payload.end_date}
                        min={payload.start_date || undefined}
                        onChange={(e) => setPayload({ ...payload, end_date: e.target.value })}
                        disabled={isCurrent}
                        required={!isCurrent}
                        className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl [color-scheme:dark]"
                    />
                </div>
            </div>

            <label className="inline-flex items-center gap-2 self-start text-xs font-body-text text-slate-300 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={isCurrent}
                    onChange={(e) => setIsCurrent(e.target.checked)}
                    className="w-4 h-4 accent-teal-500 cursor-pointer"
                />
                I currently work here
            </label>

            <div>
                <Label htmlFor={inputId("description")} className="text-xs font-sub-header-text uppercase text-slate-400 mb-1.5 block">
                    Description
                </Label>
                <Textarea
                    id={inputId("description")}
                    rows={4}
                    placeholder="Describe your responsibilities, achievements, and the technologies you used..."
                    value={payload.description}
                    onChange={(e) => setPayload({ ...payload, description: e.target.value })}
                    className="bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm rounded-xl leading-relaxed"
                />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-sub-header-text uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-950/80 border border-teal-500/40 text-teal-200 hover:bg-teal-900 text-xs font-sub-header-text uppercase tracking-wider font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                    {isSaving ? (
                        <SpinnerComponent width={16} height={16} />
                    ) : (
                        <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{isNew ? "Add Experience" : "Save Changes"}</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

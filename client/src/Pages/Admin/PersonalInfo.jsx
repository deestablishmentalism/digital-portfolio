import { useState, useEffect, useRef } from "react";
import { User, MapPin, Pencil, X, Plus, Trash, Check, Camera, Sparkles } from "lucide-react";
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
            showToastMessage(false, error.message);
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

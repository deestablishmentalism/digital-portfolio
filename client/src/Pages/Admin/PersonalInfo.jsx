import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button"
import {TextArea} from "@/components/ui/textarea"
import {useState, useEffect, useRef} from "react"
import SpinnerComponent from "../../Components/SpinnerComponent"
import AddressSelectComponent from "../../Components/AddressSelectComponent"
import { X, Plus, Trash, Pencil } from "lucide-react"
import {fetchRegions, fetchProvinces, fetchCities, fetchBarangays} from "../../utils/AddressAPI"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import axios from "axios"
export default function PersonalInfo() {
    const [personalInfo, setPersonalInfo] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const inputFileRef = useRef(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState("")
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    useEffect(() => {
        async function fetchPersonalInfo() {
            try {
                const response = await fetch("/api/personal-info");
                if (!response.ok) {
                    throw new Error("Failed to fetch personal information");
                }
                const data = await response.json();
                setPersonalInfo(data.data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchPersonalInfo();
    },[])
    const handleFileSelect = async (e)=>{
        const selected = e.target.files[0];
        if(!selected) return;
        e.target.value = "";
        setSelectedFile(selected)
        try {
            const resized = await resizeAndEncode(selected);
            if(preview) URL.revokeObjectURL(preview)
            setPreview(resized)
        } catch (error) {
            console.error(error)
            setSelectedFile(null)
            setPreview("")
        }
    }
    const removeFile = () => {
        if(preview) URL.revokeObjectURL(preview)
        setSelectedFile(null)
        setPreview("")
        if(inputFileRef.current) inputFileRef.current.value = ""
    }
    const resizeAndEncode = (file) =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const MAX_SIZE = 1024;
                let width = img.naturalWidth;
                let height = img.naturalHeight;
                if(width > MAX_SIZE || height > MAX_SIZE) {
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
                    if(!blob) {
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
        })
    const handleProfileSave = async () => {
        if(!selectedFile) return;
        setIsSavingProfile(true)
        try {
            const image = await resizeAndEncode(selectedFile);
            const response = await fetch("/api/personal-info/profile", {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({image}),
            });
            const data = await response.json();
            if(!response.ok) {
                throw new Error(data.message || "Failed to save profile picture");
            }
            setPersonalInfo(data.data);
            removeFile();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSavingProfile(false);
        }
    }
    return(
        <>
        <div>
            <div className="flex justify-between font-header-text text-teal-200"> 
                <h1 className="text-2xl">Personal Information</h1>   
                <button
                    className="admin-header-button"
                    onClick={()=> setEditMode(prev=>!prev)}
                >{editMode ? 
                    <X/>
                    :
                    "Edit Mode"
                }
                </button> 
            </div>

            <div className="flex">
                <div>
                    <div className="m-4 p-2 bg-white rounded">
                        <h1>Profile Picture</h1>
                        {preview !== "" ?
                            <div className="group border-1 h-50 w-50 rounded overflow-hidden relative">
                                <img src={preview} alt="current selected"
                                    className="h-full w-full object-cover group-hover:blur-[2px]"
                                />   
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 ">
                                    <button 
                                        className="p-2 bg-red-400 rounded-full text-white cursor-pointer"
                                        onClick={removeFile}
                                    >
                                        <Trash/>     
                                    </button>
                                </div>
                            </div>
                            :
                            personalInfo?.profile?.secure_url ?
                            <div className="group border-1 h-50 w-50 rounded overflow-hidden relative">
                                <img src={personalInfo.profile.secure_url} alt="profile"
                                    className="h-full w-full object-cover group-hover:blur-[2px]"
                                />
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100">
                                    <button
                                        className="p-2 bg-teal-400 rounded-full text-white cursor-pointer"
                                        onClick={() => inputFileRef.current?.click()}
                                    >
                                        <Pencil/>
                                    </button>
                                </div>
                            </div>
                            :
                            <div className="border-5 border-dotted h-50 w-50 rounded">
                                <div className="flex w-full justify-center items-center h-full">
                                    <button
                                        type="button"
                                        onClick={() => inputFileRef.current?.click()}
                                        className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center 
                                        hover:bg-gray-200 cursor-pointer"
                                        >
                                        <Plus className="size-5" />
                                    </button>
                                </div>
                            </div>
                        }
                        <input ref={inputFileRef}
                        type="file" accept="image/*" 
                        className="hidden"
                        onChange={handleFileSelect}
                        />
                        {preview !== "" && (
                            <div className="flex justify-end mt-2">
                                <Button type="button" onClick={handleProfileSave} disabled={isSavingProfile}>
                                    {isSavingProfile ?
                                        <SpinnerComponent width={20} height={20} color="red"/>
                                        :
                                        "Save"
                                    }
                                </Button>   
                            </div>
                        )}
                    </div>
                </div>
                <div className="m-4 h-100 w-full scrollable">
                    {editMode ? (
                        <EditMode personalInfo={personalInfo} onSave={(data) => setPersonalInfo(data)}/>
                    )
                    : (
                    <div className="flex flex-col admin-container">
                        <h2 className="font-sub-header-text text-2xl">Full Name</h2>
                        <div className="mt-2 flex flex-col [&>h3]:mt-2 [&>h3]:font-header-text [&>h3]:text-[24px]">
                            <h3>First Name: <span className="text-white text-[15px]">{personalInfo?.first_name}</span></h3>
                            <h3>Middle Name: <span className="text-white text-[15px]">{personalInfo?.middle_name}</span></h3>
                            <h3>Last Name: <span className="text-white text-[15px]">{personalInfo?.last_name}</span> </h3>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="font-sub-header-text text-2xl">Address</h2>
                            <div className="mt-2 flex flex-wrap [&>h3]:mx-2 [&>h3]:font-header-text [&>h3]:text-[24px]">
                                <h3>Region: <span className="text-white text-[15px]">{personalInfo?.address?.region}</span> </h3>
                                <h3>Province: <span className="text-white text-[15px]">{personalInfo?.address?.province}</span> </h3>
                                <h3>City: <span className="text-white text-[15px]">{personalInfo?.address?.city}</span></h3>
                                <h3>Barangay: <span className="text-white text-[15px]">{personalInfo?.address?.barangay}</span> </h3>
                                <h3>Street: <span className="text-white text-[15px]">{personalInfo?.address?.subdivision}</span> </h3>   
                                <h3>House Number: <span className="text-white text-[15px]">{personalInfo?.address.house_number}</span> </h3>                             
                            </div>
                        </div>  
                        <div>
                            <h2 className="font-sub-header-text text-2xl">Summary</h2>   
                            <p className="text-[13px] text-white">{
                                personalInfo?.summary    
                            }</p> 
                        </div>        
                    </div>    
                    )
                    }
                </div>
            </div>
        </div>
        </>
    );
}
function EditMode({personalInfo, onSave}) {
    const [isSaving, setIsSaving] = useState(false);
    const initialAddress = personalInfo?.address || {};
    const [payLoad, setPayload] = useState({
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
        }
    })
    const [regions, setRegions] = useState(null)
    const [provinces, setProvinces] = useState(null)
    const [cities, setCities] = useState(null)
    const [barangays, setBarangays] = useState(null)
    const [regionCode, setRegionCode] = useState(null)
    const [provinceCode, setProvinceCode] = useState(null)
    const [cityCode, setCityCode] = useState(null)
    const [regionLabel, setRegionLabel] = useState("")
    const [provinceLabel, setProvinceLabel] = useState("")
    const [cityLabel, setCityLabel] = useState("")
    const [isRegionFetching, setIsRegionFetching] = useState(true)
    const [isProvinceFetching, setIsProvinceFetching] = useState(false)
    const [isCityFetching, setIsCityFetching] = useState(false)
    const [isBarangayFetching, setIsBarangayFetching] = useState(false)
    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true)
        try {
            const response = await axios.put("/api/personal-info", payLoad, {
                headers: {
                    "Content-Type" : "application/json"
                },
            })
            if(!response.data?.success) {
                throw new Error(response.data?.message || "Failed to save personal information")
            }
            onSave(response.data.data)
        }
        catch(error) {  
            console.error(error.message)
        }
        finally {
            setIsSaving(false)
        }
    }
    useEffect(() => {
        async function loadRegions() {
            try {
                const response = await fetchRegions()
                setRegions(response)
                if (initialAddress.region) {
                    const match = response.find((region) => region.name === initialAddress.region)
                    if (match) {
                        setRegionCode(match.code)
                        setIsProvinceFetching(true)
                        setPayload((prev) => ({...prev, address: {...prev.address, region: match.name}}))
                    }
                }
            }
            catch(error) {
                setRegions(null);
                console.error(error.message);
            }
            finally {
                setIsRegionFetching(false);
            }
        }
        loadRegions();
    }, [initialAddress.region])
    useEffect(() => {
        async function loadProvinces() {
            if (!regionCode) return;
            try {
                const response = await fetchProvinces(regionCode)
                setProvinces(response)
                if (initialAddress.province) {
                    const match = response.find((province) => province.name === initialAddress.province)
                    if (match) {
                        setProvinceCode(match.code)
                        setIsCityFetching(true)
                    }
                }
            }
            catch(error) {
                setProvinces(null);
                console.error(error.message);
            }
            finally {
                setIsProvinceFetching(false);
            }
        }
        loadProvinces();
    }, [regionCode, initialAddress.province])
    useEffect(() => {
        async function loadCities() {
            if (!provinceCode) return;
            try {
                const response = await fetchCities(provinceCode)
                setCities(response)
                if (initialAddress.city) {
                    const match = response.find((city) => city.name === initialAddress.city)
                    if (match) {
                        setCityCode(match.code)
                        setIsBarangayFetching(true)
                    }
                }
            }
            catch(error) {
                setCities(null);
                console.error(error.message);
            }
            finally {
                setIsCityFetching(false);
            }
        }
        loadCities();
    }, [provinceCode, initialAddress.city])
    useEffect(() => {
        async function loadBarangays() {
            if (!cityCode) return;
            try {
                const response = await fetchBarangays(cityCode)
                setBarangays(response)
            }
            catch(error) {
                setBarangays(null);
                console.error(error.message);
            }
            finally {
                setIsBarangayFetching(false);
            }
        }
        loadBarangays();
    }, [cityCode])

    const handleRegionChange = (code) => {
        const name = regions?.find((region) => region.code === code)?.name || code
        setRegionCode(code)
        setProvinceCode(null)
        setCityCode(null)
        setProvinces(null)
        setCities(null)
        setBarangays(null)
        setIsProvinceFetching(true)
        setIsCityFetching(false)
        setIsBarangayFetching(false)
        setPayload({...payLoad, address: {...payLoad.address, region: name, province: "", city: "", barangay: ""}})
    }
    const handleProvinceChange = (code) => {
        const name = provinces?.find((province) => province.code === code)?.name || code
        setProvinceCode(code)
        setCityCode(null)
        setCities(null)
        setBarangays(null)
        setIsCityFetching(true)
        setIsBarangayFetching(false)
        setPayload({...payLoad, address: {...payLoad.address, province: name, city: "", barangay: ""}})
    }
    const handleCityChange = (code) => {
        const name = cities?.find((city) => city.code === code)?.name || code
        setCityCode(code)
        setBarangays(null)
        setIsBarangayFetching(true)
        setPayload({...payLoad, address: {...payLoad.address, city: name, barangay: ""}})
    }
    const handleBarangayChange = (code) => {
        const name = barangays?.find((barangay) => barangay.code === code)?.name || code
        setPayload({...payLoad, address: {...payLoad.address, barangay: name}})
    }

    return(
        <>
            <div className="p-2 bg-white rounded border-1 border-slate-800">
                <div>
                    <h2>Edit Personal Information</h2>
                    <div className="flex flex-wrap [&>div]:m-2">
                        <div>
                            <Label htmlFor="first-name" className="mb-2">First Name</Label>
                            <Input id="first-name" placeholder="First Name" value={payLoad.first_name} 
                            onChange={(e) => setPayload({...payLoad, first_name: e.target.value})}/>       
                        </div>
                        <div>
                            <Label htmlFor="middle-name" className="mb-2">Middle Name</Label>
                            <Input id="middle-name" placeholder="Middle Name" value={payLoad.middle_name} 
                            onChange={(e) => setPayload({...payLoad, middle_name: e.target.value})}/>
                        </div>
                        <div>
                            <Label htmlFor="last-name" className="mb-2">Last Name</Label>
                            <Input id="last-name" placeholder="Last Name" value={payLoad.last_name}
                            onChange={(e) => setPayload({...payLoad, last_name: e.target.value})}/>
                        </div>
                        <div>
                            <Label htmlFor="summary" className="mb-2">Summary</Label>
                            <TextArea id="summary" placeholder="Enter summary..."
                            onChange={(e)=> setPayload({...payLoad, summary: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <h2>Edit Address</h2>
                    <div className="flex flex-wrap [&>div]:m-2">
                        <div>
                            <Label htmlFor="region" className="mb-2">Region</Label>
                            {isRegionFetching ? (
                                <SpinnerComponent width={20} height={20} color="black"/>
                            ) 
                            : regions !== null ?
                            (
                                <AddressSelectComponent data={regions} value={payLoad.address.region}
                                onValueChange={handleRegionChange} title="Region"/>
                            ) 
                            : (
                                <Input placeholder="Region" value={payLoad.address.region}
                                onChange={(e) => setPayload({...payLoad, address: {...payLoad.address, region: e.target.value}})}
                                />    
                            )}
                        </div>
                        <div >
                            <Label htmlFor="province" className="mb-2">Province</Label>
                            {isProvinceFetching && regionCode ? (
                                <SpinnerComponent width={20} height={20} color="black"/>
                            )
                            : provinces !== null ?
                            (
                            <AddressSelectComponent data={provinces} value={payLoad.address.province}
                            onValueChange={handleProvinceChange} title="Province"/>
                            )
                            : (
                                <Input placeholder="Province" value={payLoad.address.province}
                                onChange={(e) => setPayload({...payLoad, address: {...payLoad.address, province: e.target.value}})}
                                />
                            )}
                        </div>
                        <div>
                            <Label htmlFor="city" className="mb-2">City</Label>
                            {isCityFetching && provinceCode ? (
                                <SpinnerComponent width={20} height={20} color="black"/>
                            )
                            : cities !== null ?
                            (
                            <AddressSelectComponent data={cities} value={payLoad.address.city}
                            onValueChange={handleCityChange} title="City"/>
                            )
                            : (
                                <Input placeholder="City" value={payLoad.address.city}
                                onChange={(e) => setPayload({...payLoad, address: {...payLoad.address, city: e.target.value}})}
                                />
                            )}
                        </div>
                        <div>
                            <Label htmlFor="barangay" className="mb-2">Barangay</Label>
                            {isBarangayFetching && cityCode ? (
                                <SpinnerComponent width={20} height={20} color="black"/>
                            )
                            : barangays !== null ?
                            (
                            <AddressSelectComponent data={barangays} value={payLoad.address.barangay}
                            onValueChange={handleBarangayChange} title="Barangay"/>
                            )
                            : (
                                <Input placeholder="Barangay" value={payLoad.address.barangay}
                                onChange={(e) => setPayload({...payLoad, address: {...payLoad.address, barangay: e.target.value}})}
                                />
                            )}
                        </div>
                        <div>
                            <Label htmlFor="subdivision" className="mb-2">Subdivision/Street</Label>
                            <Input type="text" value={payLoad.address.subdivision} placeholder="Enter Subdivision or Street"
                            onChange={(e)=> setPayload({...payLoad, address: {...payLoad.address, subdivision: e.target.value}})}
                            />
                        </div>
                        <div>
                            <Label htmlFor="subdivision" className="mb-2">House Number</Label>
                            <Input type="text" value={payLoad.address.house_number} placeholder="Enter House Number"
                            onChange={(e)=> setPayload({...payLoad, address: {...payLoad.address, house_number: e.target.value}})}
                            />
                        </div>
                    </div>
                    <div className="m-1 p-2  flex justify-end">
                        <Button type="button" onClick={handleSave} disabled={isSaving}>{isSaving ?
                            <SpinnerComponent/>
                            : "Save"
                        }</Button>    
                    </div>
                    
                </div>
            </div>
        </>
    );
}
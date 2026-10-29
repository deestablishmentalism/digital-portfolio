import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Switch} from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog"
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import SpinnerComponent from "./SpinnerComponent"
import api from "../api/axios"
import { useToastMessage } from "./ToastMessage"
import { DevIconsMapper} from "../utils/IconMapper"
// Converts stored dates (Date ISO strings or "YYYY-MM-DD") to a date input value
const toDateInputValue = (value) => {
  if (!value || value === "Present") return ""
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)
  const date = new Date(value)
  return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10)
}

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

// Pass `project` to open the modal in edit mode with its data pre-filled
export default function AddProjectModal({ open, onOpenChange, project = null, onSaved }) {
  const isEdit = Boolean(project?._id)
  const initialType = project?.preview?.type || ""
  const initialImages = project?.preview?.images || []
  const showToastMessage = useToastMessage()
  const [isAdding, setIsAdding] = useState(false)
  const [uploadType, setUploadType] = useState(initialType)
  const [projectType, setProjectType] = useState(project?.project_type || "")
  const uploadTypeLabels = { gallery: "Gallery", url: "Active URL" }
  const projectTypeLabels = {client: "Client", personal: "Personal"}
  const initialEndDate = toDateInputValue(project?.project_end_date)
  const [isProjectFinished, setIsProjectFinished] = useState(Boolean(initialEndDate));
  const [form, setForm] = useState({
    project_name: project?.project_name || "",
    project_description: project?.project_description || "",
    project_start_date: toDateInputValue(project?.project_start_date),
    project_end_date: initialEndDate,
    languages: [],
    project_type: "",
    url: project?.preview?.url || "",
  })
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  // Already-uploaded images (edit mode) kept separately from newly selected files
  const [existingImages, setExistingImages] = useState(initialType === "gallery" ? initialImages : [])
  const [existingThumbnail, setExistingThumbnail] = useState(initialType === "url" ? initialImages[0] || null : null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState("")
  const [languages, setLanguages] = useState(project?.languages || [])
  const fileInputRef = useRef(null)
  const thumbnailInputRef = useRef(null)
  const [languagesItems, setLanguagesItems] = useState([])
  const [frontendItems, setFrontendItems] = useState([])
  const [backendItems, setBackendItems] = useState([])
  useEffect(()=>{
    async function fetchTech() {
      try {
        const response = await api.get("/tech");
        setLanguagesItems(Object.values(response.data.languages || {}));
        setFrontendItems(Object.values(response.data.frontend || {}));
        setBackendItems(Object.values(response.data.backend || {}));
      }
      catch(error) {
        showToastMessage(false, error.message)
      }
    }
    fetchTech();
  }, [showToastMessage]);
  function handleChecked(slug, isChecked) {
      setLanguages(prev =>
        isChecked
          ? [...prev, slug]
          : prev.filter(item => item !== slug)
      );
  }
  const handleFormChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
  }
  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || [])
    e.target.value = ""
    if (selected.length === 0) return
    setFiles((prev) => [...prev, ...selected])
    setPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))])
  }
  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index])
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }
  const removeExistingImage = (publicId) => {
    setExistingImages((prev) => prev.filter((img) => img.public_id !== publicId))
  }
  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setThumbnailFile(file)
    setThumbnailPreview(URL.createObjectURL(file))
  }
  const removeThumbnail = () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setThumbnailFile(null)
    setThumbnailPreview("")
    setExistingThumbnail(null)
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ""
  }
  const resetForm = () => {
    setForm({
      project_name: "",
      project_description: "",
      project_start_date: "",
      project_end_date: "",
      languages: [],
      url: "",
    })
    setUploadType("")
    setProjectType("")
    setIsProjectFinished(false)
    setLanguages([])
    setFiles([])
    previews.forEach((p) => URL.revokeObjectURL(p))
    setPreviews([])
    setExistingImages([])
    setExistingThumbnail(null)
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setThumbnailFile(null)
    setThumbnailPreview("")
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.project_name.trim()) {
      showToastMessage(false, "Project name is required.")
      return
    }
    if (!form.project_description.trim()) {
      showToastMessage(false, "Project description is required.")
      return
    }
    if (!form.project_start_date) {
      showToastMessage(false, "Project start date is required.")
      return
    }
    if (isProjectFinished && form.project_end_date && form.project_end_date < form.project_start_date) {
      showToastMessage(false, "End date cannot be earlier than the start date.")
      return
    }
    if (!projectType) {
      showToastMessage(false, "Please select a project type.")
      return
    }
    if (!uploadType) {
      showToastMessage(false, "Please select an upload type.")
      return
    }
    if (uploadType === "url" && !form.url.trim()) {
      showToastMessage(false, "Project URL is required.")
      return
    }
    if (uploadType === "gallery" && existingImages.length + files.length === 0) {
      showToastMessage(false, "Please select at least one image for the gallery.")
      return
    }

    setIsAdding(true)
    try {
      const body = {
        project_name: form.project_name.trim(),
        project_description: form.project_description.trim(),
        project_start_date: form.project_start_date,
        project_end_date: !isProjectFinished || !form.project_end_date ? "Present" : form.project_end_date,
        project_type: projectType,
        languages: languages,
        preview: {},
      }

      // Existing images are sent back as objects (kept); new files as base64 (uploaded)
      if (uploadType === "url") {
        const images = thumbnailFile
          ? [await toBase64(thumbnailFile)]
          : existingThumbnail
            ? [existingThumbnail]
            : []
        body.preview = { type: "url", url: form.url.trim(), images }
      } else if (uploadType === "gallery") {
        const newImages = await Promise.all(files.map(toBase64))
        body.preview = { type: "gallery", images: [...existingImages, ...newImages] }
      }

      const response = isEdit
        ? await api.put(`/projects/${project._id}`, body)
        : await api.post("/projects", body)
      if (response.data?.success) {
        showToastMessage(
          true,
          response.data?.message || (isEdit ? "Project updated successfully!" : "Project created successfully!")
        )
        onSaved?.(response.data.data)
        resetForm()
        onOpenChange(false)
      } else {
        throw new Error(response.data?.message || (isEdit ? "Updating project failed" : "Adding project failed"))
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to save project"
      showToastMessage(false, msg)
      console.error("Failed to save project:", error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v) }} disablePointerDismissal>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col flex-1 overflow-y-auto pr-2 scrollbar-fade">
        <DialogHeader className="relative">
          <DialogTitle>{isEdit ? "Edit Project" : "Add Project"}</DialogTitle>
          <DialogDescription className="font-black text-center text-2xl">Project Details</DialogDescription>
          <DialogClose />
        </DialogHeader>

        <form className="text-black flex flex-col gap-3" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="project-name">Project Name</Label>
            <Input id="project-name" value={form.project_name} onChange={handleFormChange("project_name")} />
          </div>

          <div>
            <Label htmlFor="project-desc">Project Description</Label>
            <Textarea id="project-desc" placeholder="Type Project Description here" 
              value={form.project_description} 
              onChange={handleFormChange("project_description")} />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="start-date" className="m-1">Start Date</Label>
              <Input id="start-date" type="date" value={form.project_start_date} onChange={handleFormChange("project_start_date")} />
            </div>
            <div className="flex-1">
              <div className="flex">
                <Switch id="has-end-date" className="m-1" checked={isProjectFinished} onCheckedChange={(checked)=> setIsProjectFinished(checked)}/> 
                <Label htmlFor="has-end-date" className="m-1">Finished Project</Label>
              </div>
                <div>
                  {isProjectFinished &&
                    <Input id="end-date" type="date" value={form.project_end_date} onChange={handleFormChange("project_end_date")} />
                  }
                </div>
            </div>
          </div>

          <div>
            <Label htmlFor="languages">Frameworks, Technologies & Languages Used</Label>
            <div className="flex w-full gap-4">
                <BuildCheckBoxComponent items={frontendItems} title={"Front-End"} 
                  selectedItems={languages} 
                  handleChecked={handleChecked}
                />
                <BuildCheckBoxComponent items={backendItems} title={"Back-End"}
                  selectedItems={languages} 
                  handleChecked={handleChecked}
                />
                <BuildCheckBoxComponent items={languagesItems} title={"Languages"}
                  selectedItems={languages} 
                  handleChecked={handleChecked}
                />
            </div>
          </div>
          <div className="flex w-full">
            <div className="m-2">
              <Label className="m-2">Upload Type</Label>
              <Select placeholder="Select upload type" value={uploadType || null} onValueChange={(v) => setUploadType(v ?? "")} className="w-100">
                <SelectTrigger className="m-2 w-full max-w-48">
                  <SelectValue>{(v) => v ? uploadTypeLabels[v] : "Select upload type"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Upload Type</SelectLabel>
                    <SelectItem value="gallery">Gallery</SelectItem>
                    <SelectItem value="url">Active URL</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>  
            <div className="m-2">
              <Label className="m-2">Project Type</Label>
              <Select placeholder="Select project type" className="w-100" value={projectType || null} onValueChange={(v) => setProjectType(v ?? "")}>
                <SelectTrigger className="m-2 w-full max-w-48">
                  <SelectValue>{(v) => v ? projectTypeLabels[v] : "Select project type"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Project Type</SelectLabel>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {uploadType === "url" && (
            <div className="flex flex-col gap-3">
              <div>
                <Label htmlFor="project-url">Project URL</Label>
                <Input
                  id="project-url"
                  type="url"
                  placeholder="https://example.com"
                  value={form.url}
                  onChange={handleFormChange("url")}
                />
              </div>

              <div>
                <Label htmlFor="project-thumbnail">Thumbnail (Optional)</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  {thumbnailPreview || existingThumbnail?.secure_url ? (
                    <div className="relative w-28 h-20 rounded-md overflow-hidden border border-slate-300 group bg-slate-100 shadow-sm">
                      <img
                        src={thumbnailPreview || existingThumbnail.secure_url}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeThumbnail}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 transition-colors cursor-pointer shadow"
                        title="Remove thumbnail"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="w-28 h-20 rounded-md border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50/50 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-teal-600 transition-colors cursor-pointer"
                    >
                      <Plus className="size-5" />
                      <span className="text-[11px] font-medium">Add Image</span>
                    </button>
                  )}
                  <input
                    id="project-thumbnail"
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailSelect}
                    className="hidden"
                  />
                  <div className="text-xs text-gray-500 flex flex-col gap-0.5">
                    <span className="font-medium text-gray-700">Cover Thumbnail</span>
                    <span>Upload a preview image to display on the project card.</span>
                    {thumbnailFile ? (
                      <span className="text-teal-600 font-mono text-[11px]">
                        {thumbnailFile.name} ({(thumbnailFile.size / 1024).toFixed(1)} KB)
                      </span>
                    ) : existingThumbnail ? (
                      <span className="text-teal-600 font-mono text-[11px]">Current thumbnail</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          {uploadType === "gallery" && (
            <div>
              <Label>Images</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {existingImages.map((img) => (
                  <div key={img.public_id} className="relative w-20 h-20 rounded-md overflow-hidden border group" title="Uploaded image">
                    <img src={img.secure_url} alt="Uploaded" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.public_id)}
                      className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
                {previews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border group">
                    <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
                >
                  <Plus className="size-5 text-gray-400" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
            <Button type="submit" disabled={isAdding}>
              {isAdding ? <SpinnerComponent width={20} height={20} color="red" /> : isEdit ? "Save Changes" : "Add Project"}
            </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
function BuildCheckBoxComponent({items, title, handleChecked, selectedItems}) {
  const [open, setOpen] = useState(false)
  return(
    <div className="relative w-full">
      <div className="flex justify-between border rounded-md p-2 bg-white cursor-pointer select-none font-bold"
        onClick={() => setOpen(!open)}
      >
        <Label className="cursor-pointer select-none font-bold">{title}</Label>
        <span>{open ? <ChevronUp/> : <ChevronDown/>}</span>
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 border rounded-md bg-white shadow-lg scrollable overflow-y-auto max-h-40">
          {items.map((item) => (
            <div key={item.slug} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100">
              <Input type="checkbox" value={item.slug} id={`cb-${item.slug}`} className="size-3" 
                checked={selectedItems.includes(item.name)}
                onChange={(e)=>handleChecked(item.name, e.target.checked)}
              />
              <Label htmlFor={`cb-${item.slug}`} className="cursor-pointer text-sm flex-1 py-1 flex items-center gap-1">
                {(() => { 
                  const icon = DevIconsMapper(true);  
                  const Icon = icon[item.slug];
                  return Icon ? <Icon className="size-4 shrink-0" /> : null; })()} {item.name} - {item.type}
              </Label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
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
import { X, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import SpinnerComponent from "./SpinnerComponent"
import api from "../api/axios"
import { useToastMessage } from "./ToastMessage"
import { DevIconsMapper} from "../utils/IconMapper"
export default function AddProjectModal({ open, onOpenChange }) {
  const showToastMessage = useToastMessage()
  const [isAdding, setIsAdding] = useState(false)
  const [uploadType, setUploadType] = useState("")
  const [projectType, setProjectType] = useState("")
  const uploadTypeLabels = { gallery: "Gallery", url: "Active URL" }
  const projectTypeLabels = {client: "Client", personal: "Personal"}
  const [isProjectFinished, setIsProjectFinished] = useState(false);
  const [form, setForm] = useState({
    project_name: "",
    project_description: "",
    project_start_date: "",
    project_end_date: "",
    languages: [],
    project_type: "",
    url: "",
  })
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [languages, setLanguages] = useState([])
  const fileInputRef = useRef(null)
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
  },[]);
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
    const selected = Array.from(e.target.files)
    setFiles(selected)
    setPreviews(selected.map((f) => URL.createObjectURL(f)))
  }
  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index])
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
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
    setFiles([])
    previews.forEach((p) => URL.revokeObjectURL(p))
    setPreviews([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsAdding(true)
    try {
      const body = {
        project_name: form.project_name,
        project_description: form.project_description,
        project_start_date: form.project_start_date,
        project_end_date: form.project_end_date === "" ? "Present" : form.project_end_date,
        project_type: projectType,
        languages: languages,
        preview: {},
      }

      if (uploadType === "url") {
        body.preview = { type: "url", url: form.url }
      } else if (uploadType === "gallery") {
        const toBase64 = (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        const images = await Promise.all(files.map(toBase64))
        body.preview = { type: "gallery", images }
      }

      const response = await api.post("/projects", body)
      if (!response.created) throw new Error("Adding project failed");
      else window.location.reload
      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to add project:", error.message)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v) }} disablePointerDismissal>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col flex-1 overflow-y-auto pr-2 scrollbar-fade">
        <DialogHeader className="relative">
          <DialogTitle>Add Project</DialogTitle>
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
                <Switch id="has-end-date" className="m-1" onCheckedChange={(checked)=> setIsProjectFinished(checked)}/> 
                <Label htmlFor="has-end-date" className="m-1">Finished Project</Label>
              </div>
                <div>
                  {isProjectFinished &&
                    <Input id="start-date" type="date" value={form.project_end_date} onChange={handleFormChange("project_end_date")} />
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
              <Select placeholder="Select upload type" onValueChange={setUploadType} className="w-100">
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
              <Select placeholder="Select project type" className="w-100" onValueChange={setProjectType}>
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
            <div>
              <Label htmlFor="project-url">Project URL</Label>
              <Input id="project-url" placeholder="https://example.com" value={form.url} onChange={handleFormChange("url")} />
            </div>
          )}

          {uploadType === "gallery" && (
            <div>
              <Label>Images</Label>
              <div className="flex flex-wrap gap-2 mt-1">
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
              {isAdding ? <SpinnerComponent width={20} height={20} color="red" /> : "Add Project"}
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
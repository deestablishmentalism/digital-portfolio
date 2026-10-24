import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {useState} from "react"
export default function AddressSelectComponent({data, value, onValueChange, title, className = "w-full"}) {
    return(
        <>
            <Select onValueChange={onValueChange} value={value}>
                <SelectTrigger className={className}>
                    <SelectValue placeholder={`Select ${title}`}/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Options</SelectLabel>
                        {data.map((item) => (
                            <SelectItem key={item.code} value={item.code}>
                                {item.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </>
    );
}
import { useCallback } from "react";
import { toast } from "@/components/ui/toast";
export function useToastMessage() {
    // Stable identity so it can be safely used in effect dependency arrays
    const showToast = useCallback((isSuccess, message) => {
        toast.add({
            title: isSuccess ? "Success!" : "Error!",
            description: message,
            type: isSuccess ? "success" : "error"
        });
    }, []);
    return showToast;
}

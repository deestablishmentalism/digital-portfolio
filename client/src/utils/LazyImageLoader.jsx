import { useState } from "react"
export default function LazyImageLoader({src, alt, className}) {
    const [isLoaded, setIsLoaded] = useState(false)
    return (
        <div className="relative w-full h-full overflow-hidden bg-slate-700">
            <img
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                className={`transition-all duration-500 ${className ?? ""} ${
                    isLoaded
                        ? "opacity-100 blur-0 scale-100"
                        : "opacity-60 blur-xl scale-110"
                }`}
            />
        </div>
    );
}
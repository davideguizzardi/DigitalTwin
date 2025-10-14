
import { useEffect, useRef, useState } from "react";

import { Toast } from "flowbite-react";
import { getIcon } from "../Commons/Constants";
export default function ToastNotification({
    message,
    isVisible,
    onClose,
    duration = 3000,
    type = "success" // "success" or "error"
}) {
    const [progress, setProgress] = useState(100);
    const [shouldRender, setShouldRender] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const hideTimeoutRef = useRef(null);

    useEffect(() => {
        let timer;
        let progressInterval;

        if (isVisible) {
            setShouldRender(true);
            requestAnimationFrame(() => setAnimateIn(true));
            setProgress(100);
            timer = setTimeout(() => {
                onClose();
                setProgress(0);
            }, duration);

            progressInterval = setInterval(() => {
                setProgress((prev) => Math.max(prev - 100 / (duration / 100), 0));
            }, 100);
        } else if (shouldRender) {
            setAnimateIn(false);
            hideTimeoutRef.current = setTimeout(() => {
                setShouldRender(false);
            }, 300);
        }

        return () => {
            clearTimeout(timer);
            clearInterval(progressInterval);
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }
        };
    }, [isVisible, duration, onClose, shouldRender]);

    // Define styles for success and error toasts
    const styles = {
        success: {
            bg: "bg-lime-100",
            text: "text-lime-500",
            progress: "bg-lime-400",
            icon: getIcon("check")
        },
        error: {
            bg: "bg-red-100",
            text: "text-red-500",
            progress: "bg-red-400",
            icon: getIcon("error","size-8")
        }
    };

    const toastStyle = styles[type] || styles.success; // Default to success

    return (
        <div
            className={`fixed left-1/2 top-5 z-[100] transform -translate-x-1/2 transition-opacity duration-300 
                ${animateIn ? "opacity-100" : "opacity-0"}`}
        >
            {shouldRender && (
                <Toast className="overflow-hidden">
                    <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${toastStyle.bg} ${toastStyle.text}`}>
                        {toastStyle.icon}
                    </div>
                    <div className="ml-3 text-sm font-normal">{message}</div>
                    <Toast.Toggle onDismiss={onClose} />
                    
                    {/* Progress Bar */}
                    <div
                        className={`absolute bottom-0 left-0 rounded-lg h-1 ${toastStyle.progress} transition-all duration-100`}
                        style={{ width: `${progress}%` }}
                    />
                </Toast>
            )}
        </div>
    );
};

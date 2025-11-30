import { useState, useEffect } from "react"
import { useCounseling } from "../hooks/useCouseling"

export const usefloatingCounseling = () => {
    const [visible, setVisible] = useState(false)
    const { counseling } = useCounseling()

    useEffect(() => {
        if (!counseling) return;
        setVisible(true)
        const timer = setTimeout(() => {
            setVisible(false)
        }, 8000)
        return () => clearTimeout(timer)
    }, [counseling]);

    return { visible, setVisible, counseling }
}



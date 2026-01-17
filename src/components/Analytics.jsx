import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function Analytics() {
    const location = useLocation()

    useEffect(() => {
        if (!window.gtag) return

        window.gtag('config', 'G-K37WCZ649G', {
            page_path: location.pathname,
        })
    }, [location])

    return null
}

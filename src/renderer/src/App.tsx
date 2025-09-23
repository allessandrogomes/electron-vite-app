import { useEffect, useState } from "react"

export default function App() {
    const [message, setMessage] = useState("")

    useEffect(() => {
        window.bridge.updateMessage((_, msg) => {
            setMessage(msg)
            console.log(msg)
        });
    }, []);

    return (
        <div>
            <h1>Electron Vite App V1.0.1</h1>
            <p>{message}</p>
        </div>
    )
}
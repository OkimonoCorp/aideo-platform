import React, { useState, useEffect } from 'react'
import TextField from '../../components/TextField'
import TextArea from '../../components/TextArea'

function MyNotes() {
    const STORAGE_KEY = 'myNotes.tasks'
    const STORAGE_KEY_TEXTAREA = 'myNotes.textarea'

    const [noteText, setNoteText] = useState(localStorage.getItem(STORAGE_KEY_TEXTAREA) || '')

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY_TEXTAREA, noteText)
        } catch (e) {
            console.error('Erreur sauvegarde notes', e)
        }
    }, [noteText])

    return (
        <div className="flex flex-col h-full rounded-4xl bg-surface text-on-surface">
            {/* Header */}
            <div className="px-6 py-0  bg-surface">
                <h1 className="text-2xl font-bold"> Mes notes & Tâches</h1>
            </div>

            <div className="flex flex-1 overflow-hidden gap-4 p-4 min-h-0 rounded-4xl">
                {/* Notes */}
                <div className="flex-1 flex flex-col bg-surface-container-lowest rounded-lg shadow-sm border border-outline overflow-hidden">
                    <div className="px-6 py-4 border-b border-outline bg-surface">
                        <h2 className="text-lg font-semibold">Notes personnelles</h2>
                    </div>
                    <TextArea
                        className="flex-1 w-full overflow-y-auto min-h-0 px-6 py-4"
                        currentValue={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Ajoutez vos notes personnelles ici..."
                    />
                </div>
            </div>
        </div>
    )
}

export default MyNotes
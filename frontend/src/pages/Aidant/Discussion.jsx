import React, {useState, useEffect} from 'react'
import TextField from "../../components/TextField.jsx"
import IconButton from "../../components/IconButton.jsx"
import SendIcon from "/icons/send.svg?react"
import AccountCircle from '/icons/account_circle.svg?react'
import {Delete} from "../../util/APIUtils.js"
import {TOKEN_STORAGE_KEY} from "../../App.jsx"

function Discussion({messages, who, whoPhotoUrl, myPhotoUrl, onSend, onBack, onDelete}) {
    const [text, setText] = useState('')
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, messageId: null })
    // État local pour gérer l'affichage immédiat (optimistic UI update)
    const [localMessages, setLocalMessages] = useState(messages)

    // Synchroniser avec les props si jamais de nouveaux messages arrivent du parent
    useEffect(() => {
        setLocalMessages(messages)
    }, [messages])

    const handleSend = () => {
        if (!text.trim()) return
        onSend(text)
        setText('')
    }

    const handleContextMenu = (e, message) => {
        if (message.auteur !== 'me') return
        e.preventDefault()
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            messageId: message.id
        })
    }

    const handleDelete = () => {
        const id = contextMenu.messageId
        if (id) {
            const token = localStorage.getItem(TOKEN_STORAGE_KEY)
            Delete(`messages/${id}`, token, () => {
                // Mise à jour immédiate de l'affichage local pour éviter le F5
                setLocalMessages(prev => prev.filter(m => m.id !== id))
                if (onDelete) onDelete(id)
            }, () => {
                alert("Impossible de supprimer ce message")
            })
        }
        setContextMenu({ visible: false, x: 0, y: 0, messageId: null })
    }

    // Fermer le menu lors d'un clic ailleurs
    useEffect(() => {
        const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, messageId: null })
        window.addEventListener('click', handleClick)
        return () => window.removeEventListener('click', handleClick)
    }, [])

    // Composant Avatar pour afficher la photo de profil ou une icône par défaut
    const Avatar = ({ photoUrl, alt, className = "w-8 h-8" }) => (
        photoUrl ? (
            <img
                src={photoUrl}
                alt={alt}
                className={`${className} rounded-full object-cover flex-shrink-0`}
            />
        ) : (
            <AccountCircle className={`${className} fill-current text-gray-500 flex-shrink-0`} />
        )
    )

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b border-outline-variant text-lg font-semibold flex items-center gap-3">
                {onBack && (
                    <IconButton
                        className="w-8 h-8 flex items-center justify-center"
                        icon={<span className="text-xl">←</span>}
                        onClick={onBack}
                    />
                )}
                <Avatar photoUrl={whoPhotoUrl} alt={`Photo de ${who}`} className="w-10 h-10" />
                <h1>Discussion avec {who}</h1>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {localMessages.map((message, index) => {
                    const isMe = message.auteur === 'me'

                    return (
                        <div
                            key={index}
                            className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                            onContextMenu={(e) => handleContextMenu(e, message)}
                        >
                            {/* Avatar pour l'autre personne (left side) */}
                            {!isMe && (
                                <Avatar photoUrl={whoPhotoUrl} alt={`Photo de ${who}`} className="w-6 h-6" />
                            )}

                            <div
                                className={`
                                    max-w-[50%]
                                    px-3 py-2
                                    rounded-2xl
                                    text-sm
                                    whitespace-pre-wrap
                                    break-all
                                    overflow-hidden
                                    ${isMe
                                    ? 'bg-primary text-on-primary rounded-br-sm'
                                    : 'bg-surface-container text-on-surface border border-outline-variant rounded-bl-sm'}
                                `}
                            >

                                <p>{message.text}</p>
                                <span className="block mt-1 text-[10px] opacity-70 text-right">
                                    {message.date}
                                </span>
                            </div>

                            {/* Avatar pour moi (right side) */}
                            {isMe && (
                                <Avatar photoUrl={myPhotoUrl} alt="Ma photo" className="w-6 h-6" />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Context Menu */}
            {contextMenu.visible && (
                <div
                    className="fixed bg-surface-container border border-outline-variant shadow-lg rounded z-50 py-1"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <button
                        className="w-full text-left px-4 py-2 hover:brightness-95 text-red-500 text-sm cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleDelete()
                        }}
                    >
                        Supprimer
                    </button>
                </div>
            )}

            {/* Input */}
            <div className="border-t border-outline-variant py-3">
                <div className="flex flex-row items-center w-8/12 mx-auto">
                    <TextField
                        className="flex-1 mr-3"
                        inputStyle="h-10"
                        placeholder="Écrire un message..."
                        currentValue={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <IconButton
                        className="flex items-center justify-center w-10 h-10"
                        icon={<SendIcon className="w-5 h-5 fill-primary" />}
                        onClick={handleSend}
                    />

                </div>
            </div>
        </div>
    )
}

export default Discussion

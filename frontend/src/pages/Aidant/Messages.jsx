import React, { useEffect, useState, useRef } from 'react'
import Inbox from './Inbox.jsx'
import Discussion from './Discussion.jsx'
import { Get, Post, GetBinary } from '/src/util/APIUtils.js'

function Messages({ token }) {
    const [discussions, setDiscussions] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [messages, setMessages] = useState([])
    const [myPhotoUrl, setMyPhotoUrl] = useState(null)
    const photoUrlsRef = useRef({}) // Pour stocker les URLs des photos des utilisateurs

    // Recupération de ma photo de profil
    useEffect(() => {
        if (!token) return

        GetBinary(`profile/photo_profil?t=${Date.now()}`, token,
            (blob) => {
                const url = URL.createObjectURL(blob)
                setMyPhotoUrl(url)
            },
            () => setMyPhotoUrl(null)
        )

        return () => {
            // Révoquer toutes les URLs des photos des utilisateurs
            Object.values(photoUrlsRef.current).forEach(url => URL.revokeObjectURL(url))
        }
    }, [token])

    // Fonction pour récupérer la photo d'un utilisateur
    const fetchUserPhoto = (userId, callback) => {
        GetBinary(`profile/photo_profil/${userId}?t=${Date.now()}`, token,
            (blob) => {
                const url = URL.createObjectURL(blob)
                photoUrlsRef.current[userId] = url
                callback(url)
            },
            () => callback(null)
        )
    }

    // Chargement des conversations
    useEffect(() => {
        if (!token) return

        Get(
            'messages/conversations',
            token,
            (data) => {
                const convs = data.map(conv => {
                    const lastMsgDate = new Date(conv.dernierMessage.date)
                    const now = new Date()
                    const isToday = lastMsgDate.toDateString() === now.toDateString()
                    const isYesterday = new Date(now - 86400000).toDateString() === lastMsgDate.toDateString()

                    // Formater l'heure ou la date
                    let timeDisplay
                    if (isToday) {
                        timeDisplay = lastMsgDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    } else if (isYesterday) {
                        timeDisplay = 'Hier'
                    } else {
                        timeDisplay = lastMsgDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
                    }

                    return {
                        id: conv.utilisateur.id,
                        name: conv.utilisateur.nom,
                        lastMessage: conv.dernierMessage.texte,
                        lastMessageTime: timeDisplay,
                        lastMessageIsMe: conv.dernierMessage.envoyeParMoi,
                        photoUrl: null
                    }
                })
                setDiscussions(convs)

                // Charger les photos de chaque utilisateur
                convs.forEach((conv) => {
                    const odysId = conv.id
                    fetchUserPhoto(odysId, (url) => {
                        setDiscussions(prev => prev.map(d =>
                            d.id === odysId ? { ...d, photoUrl: url } : d
                        ))
                    })
                })
            }
        )
    }, [token])

    // Clic sur une discussion
    const startDiscussion = (index) => {
        const user = discussions[index]
        setSelectedUser(user)

        Get(
            `messages/conversation/${user.id}`,
            token,
            (data) => {
                setMessages(
                    data.map(m => ({
                        id: m.id,
                        text: m.texte,
                        date: new Date(m.date).toLocaleTimeString(),
                        auteur: m.auteur === user.id ? 'other' : 'me'
                    }))
                )
            }
        )
    }

    // ENVOI D'UN MESSAGE
    const sendMessage = (text) => {
        if (!selectedUser) return
        Post(
            'messages',
            token,
            {
                destinataireId: selectedUser.id,
                texte: text
            },
            () => {
                const now = new Date()
                const timeDisplay = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

                // Ajouter à la discussion en cours
                setMessages(prev => [
                    ...prev,
                    { text, date: timeDisplay, auteur: 'me' }
                ])

                // Mettre à jour la preview dans Inbox
                setDiscussions(prev =>
                    prev.map(d =>
                        d.id === selectedUser.id
                            ? { ...d, lastMessage: text, lastMessageTime: timeDisplay, lastMessageIsMe: true }
                            : d
                    )
                )
            }
        )
    }

    // Vue discussion
    if (selectedUser) {
        return (
            <Discussion
                who={selectedUser.name}
                whoPhotoUrl={selectedUser.photoUrl}
                myPhotoUrl={myPhotoUrl}
                messages={messages}
                onSend={sendMessage}
                onBack={() => setSelectedUser(null)}
            />
        )
    }

    // Vue inbox
    return (
        <Inbox
            discussions={discussions}
            startDiscussion={startDiscussion}
        />
    )
}

export default Messages

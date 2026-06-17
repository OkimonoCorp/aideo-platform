import React from 'react';
import Card from "../../components/Card.jsx";
import AccountCircle from '/icons/account_circle.svg?react';


/**
 * Inbox est l'interface qui permet de choisir avec quel amis on veut parler
 * @param discussions liste du dernier message avec chaque amis
 * @param startDiscussion est une fonction qui appele le parent pour prendre les bon messages  
 */
function Inbox({discussions, startDiscussion = () => {}}) {
    return (
        <div className="px-4 py-2">
            <h1 className="text-2xl font-bold mb-4">Messagerie</h1>

            {discussions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <AccountCircle className="w-24 h-24 fill-current text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-on-surface mb-2">
                        Aucune conversation
                    </h2>
                    <p className="text-sm text-on-surface-variant max-w-md">
                        Vous n'avez pas encore de conversations. Commencez à échanger pour voir vos messages ici.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {discussions.map((message, index) => (
                        <div
                            key={index}
                            onClick={() => startDiscussion(index)}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors duration-200 border border-outline-variant"
                        >
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {message.photoUrl ? (
                                    <img
                                        src={message.photoUrl}
                                        alt={`Photo de ${message.name}`}
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                ) : (
                                    <AccountCircle className="w-14 h-14 fill-current text-gray-400" />
                                )}
                            </div>

                            {/* Contenu */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h2 className="font-semibold text-on-surface truncate">
                                        {message.name}
                                    </h2>
                                    <span className="text-xs text-on-surface-variant flex-shrink-0 ml-2">
                                        {message.lastMessageTime}
                                    </span>
                                </div>
                                <p className="text-sm text-on-surface-variant truncate">
                                    <span className={`${message.lastMessageIsMe ? 'text-primary' : ''}`}>
                                        {message.lastMessageIsMe ? 'Vous: ' : ''}
                                    </span>
                                    {message.lastMessage}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Inbox;
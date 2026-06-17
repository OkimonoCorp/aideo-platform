import React, {useEffect, useState, useRef} from 'react';
import {ScheduleXCalendar, useCalendarApp} from "@schedule-x/react";
import {createViewMonthGrid, createViewWeek} from "@schedule-x/calendar";
import {Delete, Get, Patch, Post, Put} from "../../util/APIUtils.js";
import "/src/calendar.css"
import {createDragAndDropPlugin} from "@schedule-x/drag-and-drop";
import {createScrollControllerPlugin} from "@schedule-x/scroll-controller";
import TaskDisplay from "../../components/TaskDisplay.jsx";
import {createResizePlugin} from "@schedule-x/resize";
import TextField from "../../components/TextField.jsx";
import TextArea from "../../components/TextArea.jsx";
import IconButton from "../../components/IconButton.jsx";
import Bin from "/icons/trash.svg?react";
import {DateFromString, TimeFromNowMinutes} from "../../util/DateUtils.js";

/**
 * Calendar est la page qui affiche le calendrier des tâches de l'aidant
 * @param token est le token d'authentification de l'aidant
 */
function Calendar({token}) {
    const [tasks, setTasks] = useState(undefined)
    const calendarRef = useRef(null)

    // État pour le menu contextuel (clic droit)
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, task: null })

    // On appelle l'api pour connaître les tâches si on a un token et pas encore les tâches
    // On reçoit des tâches de la forme :
    // {
    //   "id": int,
    //   "nom": string,
    //   "description": string,
    //   "date": string,
    //   "duree": float,
    //   "faite": boolean
    // }
    function refreshTasks() {
        if (token) {
            Get('taches', token, (data) => {
                // Les tâches doivent être triées dans l'ordre chronologique
                let newTasks = data.map(task => ({
                    id: task.id.toString(),
                    title: task.nom,
                    completed: task.faite,
                    description: task.description,
                    start: DateFromString(task.date),
                    end: DateFromString(task.date).add({minutes: Math.floor(task.duree)}) // On calcule l'heure de fin à partir de la durée en minutes
                }))
                console.log(newTasks)
                setTasks(newTasks)
            })
        }
    }

    // On rafraîchit les tâches si on n'a pas encore d'informations sur elles
    if (!tasks) {
        refreshTasks()
    }

    // Valeur de remplissage par défaut pour une tâche
    const defaultTask = {
        id: '',
        title: '',
        completed: false,
        description: '',
        start: undefined,
        end: undefined
    }

    // Formulaire de gestions de tâche
    const [showForm, setShowForm] = useState(false)
    const [editingTask, setEditingTask] = useState(defaultTask)

    // Fermer le formulaire de tâche
    const closeForm = () => {
        setEditingTask(defaultTask)
        setShowForm(false)
    }

    let missedTasks = []
    let nextTasks = []
    let completedTasks = []

    // Des booléens pour savoir si on présente ou non les différents types de tâche (manquée, à venir et terminée)
    // TODO: utiliser ces variables pour minimiser/maximiser les sections
    const [showMissedTasks, setShowMissedTasks] = useState(true)
    const [showNextTasks, setShowNextTasks] = useState(true)
    const [showCompletedTasks, setShowCompletedTasks] = useState(true)

    // Fermer le menu contextuel lors d'un clic ailleurs
    useEffect(() => {
        const handleClick = () => setContextMenu({ visible: false, x: 0, y: 0, task: null })
        window.addEventListener('click', handleClick)
        return () => window.removeEventListener('click', handleClick)
    }, [])

    // Gérer le clic droit sur les événements du calendrier
    useEffect(() => {
        const handleContextMenu = (e) => {
            // Trouver si on a cliqué sur un événement du calendrier
            const eventElement = e.target.closest('.sx__event')
            if (eventElement && tasks) {
                e.preventDefault()
                // Récupérer l'ID de l'événement depuis l'attribut data
                const eventId = eventElement.dataset.eventId
                const task = tasks.find(t => t.id === eventId)
                if (task) {
                    setContextMenu({
                        visible: true,
                        x: e.clientX,
                        y: e.clientY,
                        task: task
                    })
                }
            }
        }

        const calendarElement = calendarRef.current
        if (calendarElement) {
            calendarElement.addEventListener('contextmenu', handleContextMenu)
            return () => calendarElement.removeEventListener('contextmenu', handleContextMenu)
        }
    }, [tasks])

    // Pour chaque tâche, on vérifie si elle est passée ou à venir
    if (tasks) {
        tasks.map((task) => {
            // Si la tâche est terminée, on la met dans la liste des tâches terminées
            task.completed ? completedTasks.push(task) :
                // Sinon, on calcule la durée écoulée en minutes jusqu'à la fin de la tâche
                TimeFromNowMinutes(task.end)
                <= 0 ? nextTasks.push(task) // Elle est à venir si ce nombre est inférieur à 0 (on met dans 'à venir' les tâches du jour courant aussi)
                    : missedTasks.push(task) // Sinon, elle est manquée (non complétée et date passée)
        })
    }

    // On affiche les tâches complétées dans l'ordre antéchronologique
    completedTasks.reverse()

    // Initialisation du calendrier
    const calendar = useCalendarApp({
        views: [createViewWeek(), createViewMonthGrid()],
        events: [],
        plugins: [
            createDragAndDropPlugin(),
            createResizePlugin(),
            createScrollControllerPlugin({
                initialScroll: '06:50' // On affiche le calendrier à partir de 7h du matin (6:50 pour que le 7 ne soit pas coupé)
            }),
        ],
        callbacks: {
            onEventUpdate(updatedEvent) {
                setTasks((prevTasks) => prevTasks.map(event =>
                    event.id === updatedEvent.id ? updatedEvent : event));
                editTask(updatedEvent);
            },
            onDoubleClickEvent(event) {
                // On marque la tâche comme terminée seulement si elle est dans le passé
                // On permet de marquer une tâche du jour courant comme terminée.
                /*if (Temporal.Now.plainDateISO().since(event.end.toPlainDate()).total({unit: "days"}) >= 0) {
                    toggleTaskState(event)
                }*/
                // On ouvre le formulaire pour éditer la tâche
                setEditingTask(event)
                setShowForm(true)
            }
        },
        locale: "fr-FR",
    });

    // On rafraîchit les tâches dans le calendrier quand elles changent
    useEffect(() => {
        if (tasks) {
            calendar.events.set(tasks);
        }
    }, [tasks, calendar]);

    // Créer une nouvelle tâche
    const createTask = (task) => {
        Post('taches', token, {
            nom: task.title,
            description: task.description,
            // L'api s'attend au format 'YYYY-MM-DD HH:MM, mais Temporal renvoie 'YYYY-MM-DDTHH:MM:SS'
            date: formatDate(task.start),
            duree: task.end.since(task.start).total({unit: 'minutes'}),
        })

        // On rafraîchit la liste des tâches, car on ne connaît pas l'id que l'API va attribuer à la tâche.
        refreshTasks()
    }

    // Supprimer une tâche
    const deleteTask = (taskId) => {
        Delete('taches/' + taskId, token, () => {
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        }, (err) => {
            if (err.status === 403) {
                alert('vous n\'avez pas le droit de supprimer cette tâche.')
            }
        })

        // On rafraîchit la liste des tâches, car on ne sait pas si la suppression a réussi ou non.
        refreshTasks()
    }

    // Éditer une tâche existante
    const editTask = (task) => {
        Put('taches/' + task.id, token, {
            nom: task.title,
            description: task.description,
            // L'api s'attend au format 'YYYY-MM-DD HH:MM, mais Temporal renvoie 'YYYY-MM-DDTHH:MM:SS'
            date: formatDate(task.start),
            duree: task.end.since(task.start).total({unit: 'minutes'}),
        }, (err) => {
            if (err.status === 403) {
                alert('vous n\'avez pas le droit de modifier cette tâche.')
            }
        })

        // On rafraîchit la liste des tâches, car on ne sait pas si la modification a réussi ou non.
        refreshTasks()
    }

    // Changer l'état d'une tâche (complétée ou non)
    const toggleTaskState = (task) => {
        setTasks((prevTasks) => prevTasks.map(t => t.id === task.id ? {...t, completed: !t.completed} : t));
        Patch('taches/statut/' + task.id, token, {})
    }

    // Gestion de la soumission du formulaire de tâche
    const handleFormSubmit = () => {
        if (!editingTask.title || !editingTask.start || !editingTask.end) {
            alert("Veuillez remplir tous les champs obligatoires (marqués d'une étoile).");
            return;
        }

        // S'il n'existe pas déjà une tâche avec cet ID, on crée une nouvelle tâche
        if (!editingTask.id || !tasks.some(task => task.id === editingTask.id)) {
            // On crée la tâche via l'API
            createTask(editingTask);
            // On ferme le formulaire
            closeForm();
        } else {
            // On modifie la tâche via l'API
            editTask(editingTask);
            // On met à jour la liste des tâches localement
            setTasks((prevTasks) => prevTasks.map(task => task.id === editingTask.id ? editingTask : task));
            // On ferme le formulaire
            closeForm();
        }
    }

    return (
        <div className={'w-full h-full flex flex-col grow px-4 min-h-0'}>
            <div>
                <h1>Emploi du temps</h1>
            </div>
            <div className={'h-full flex flex-row min-h-0 pb-4'}>
                {/* Calendrier des tâches */}
                <div className={'h-full w-9/12 min-h-0 flex flex-col mr-4'} ref={calendarRef}>
                    <ScheduleXCalendar calendarApp={calendar}/>
                </div>
                <div className={'flex flex-col items-center grow w-3/12'}>
                    {/* Liste de tâches existantes */}
                    <div
                        className={'flex flex-col flex-1 overflow-x-hidden items-start bg-background section w-full mb-2 p-4 pt-0 overflow-y-scroll'}>
                        <h1 className={'w-full text-center'}>Tâches</h1>
                        <TaskDisplay
                            title={'Manquées'}
                            tasks={missedTasks}
                            maximized={showMissedTasks}
                        />
                        <TaskDisplay
                            title={'À venir'}
                            tasks={nextTasks}
                            maximized={showNextTasks}
                        />
                        <TaskDisplay
                            title={'Terminées'}
                            tasks={completedTasks}
                            displayDescription={false}
                            displayHour={false}
                            maximized={showCompletedTasks}
                        />
                    </div>

                    {/* Nouvelle Tâche */}
                    <div className="w-full p-4 section">
                        <div className="flex flex-row items-center gap-2">
                            <TextField
                                className="flex-1"
                                section={false}
                                placeholder="Nouvelle tâche..."
                                onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        setShowForm(true);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowForm(true)}
                                className="w-10 h-10 flex items-center justify-center bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity font-bold text-2xl cursor-pointer">
                                <span className="mb-1">+</span>
                            </button>
                        </div>
                    </div>

                    {/* Menu contextuel (clic droit) */}
                    {contextMenu.visible && (
                        <div
                            className="fixed bg-surface-container border border-outline-variant shadow-lg rounded z-50 py-1"
                            style={{ top: contextMenu.y, left: contextMenu.x }}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <button
                                className="w-full text-left px-4 py-2 hover:bg-surface-container-high text-on-surface text-sm cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingTask(contextMenu.task)
                                    setShowForm(true)
                                    setContextMenu({ visible: false, x: 0, y: 0, task: null })
                                }}
                            >
                                Modifier
                            </button>
                            <button
                                className="w-full text-left px-4 py-2 hover:bg-surface-container-high text-error text-sm cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleTaskState(contextMenu.task)
                                    setContextMenu({ visible: false, x: 0, y: 0, task: null })
                                }}
                            >
                                Marquer comme {contextMenu.task.completed && "non"} terminée
                            </button>
                            <button
                                className="w-full text-left px-4 py-2 hover:bg-surface-container-high text-error text-sm cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    deleteTask(contextMenu.task.id)
                                    setContextMenu({ visible: false, x: 0, y: 0, task: null })
                                }}
                            >
                                Supprimer
                            </button>
                        </div>
                    )}

                    {/* Formulaire de création / modification de tâche */}
                    {showForm && (
                        <div
                            className="absolute z-100 inset-0 flex items-center justify-center bg-scrim/50 backdrop-blur-sm">
                            <div
                                className="bg-surface-container p-6 rounded-2xl shadow-2xl w-96 flex flex-col gap-4 pointer-events-auto">
                                {/* Titre de la popup */}
                                <h3 className="flex flex-row justify-between items-center text-xl font-bold border-b border-outline-variant pb-2 text-on-surface">
                                    {/* Bouton supprimer la tâche */}
                                    {editingTask.id ? (
                                        <>
                                            <p>Modifier la tâche</p>
                                            <IconButton
                                                className={'w-8 h-8 bg-error rounded-lg'}
                                                title={"Supprimer la tâche"}
                                                icon={<Bin className={'fill-on-error w-4 h-4'}/>}
                                                onClick={() => {
                                                    deleteTask(editingTask.id);
                                                    closeForm();
                                                }}/>
                                        </>
                                    ) : (
                                        <p>Nouvelle Tâche</p>
                                    )}
                                </h3>

                                {/* Titre de la tâche */}
                                <TextField
                                    className={'w-full'}
                                    placeholder="Titre (ex: Rendez-vous médical)"
                                    currentValue={editingTask.title}
                                    inputStyle={'border-outline-variant focus:border-primary'}
                                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                                />

                                {/* Description de la tâche */}
                                <TextArea
                                    placeholder="Description..."
                                    className="w-full border border-outline-variant rounded-lg p-3 h-28 bg-surface-container-lowest text-on-surface outline-none focus:border-primary placeholder:text-on-surface-variant/60"
                                    currentValue={editingTask.description}
                                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                                />

                                {/* Date et heure de début */}
                                <div className="flex flex-col">
                                    <label className="mb-1 font-semibold text-on-surface-variant">Date et heure de début
                                        :</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border border-outline-variant rounded-lg p-2 bg-surface-container-lowest text-on-surface outline-none focus:border-primary"
                                        // On tronque la chaîne de caractères pour ne garder que la partie 'YYYY-MM-DDTHH:MM'
                                        value={editingTask.start ? editingTask.start.toString().substring(0, 16) : ''}
                                        onChange={(e) => {
                                            const newStart = DateFromString(e.target.value);
                                            setEditingTask({
                                                ...editingTask,
                                                start: newStart,
                                            });
                                        }}
                                    />
                                </div>

                                {/* Date et heure de fin */}
                                <div className="flex flex-col">
                                    <label className="mb-1 font-semibold text-on-surface-variant">Date et heure de fin
                                        :</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border border-outline-variant rounded-lg p-2 bg-surface-container-lowest text-on-surface outline-none focus:border-primary"
                                        // On tronque la chaîne de caractères pour ne garder que la partie 'YYYY-MM-DDTHH:MM'
                                        value={editingTask.end ? editingTask.end.toString().substring(0, 16) : ''}
                                        onChange={(e) => {
                                            const newEnd = DateFromString(e.target.value);
                                            setEditingTask({
                                                ...editingTask,
                                                end: newEnd
                                            });
                                        }}
                                    />
                                </div>

                                {/* Boutons Annuler / Enregistrer */}
                                <div className="flex gap-2 mt-2">
                                    <button onClick={closeForm}
                                            className="flex-1 py-2 bg-surface-container-high text-on-surface rounded-lg font-semibold cursor-pointer hover:bg-surface-container-highest transition-colors">Annuler
                                    </button>
                                    <button
                                        onClick={handleFormSubmit}
                                        className="flex-1 py-2 bg-primary text-on-primary rounded-lg font-semibold shadow-md cursor-pointer hover:bg-primary/90 transition-colors">Enregistrer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Fonction d'aide pour formater les dates
function formatDate(date) {
    return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(/\//g, '-');
}

export default Calendar;

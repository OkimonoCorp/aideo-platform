import React from 'react';

/**
 * Ce composant correspond à une section à droite dans le calendrier qui afficher une catégorie de tâches
 * @param title le titre de la catégorie
 * @param tasks la liste des tâches à afficher
 * @param displayDescription un booléen indiquant s'il faut afficher la description des tâches
 * @param displayHour un booléen indiquant s'il faut afficher les heures des tâches
 * @param maximized un booléen indiquant si la section est maximisée ou non
 */
function TaskDisplay({title, tasks, displayDescription = true, displayHour = true, maximized = true}) {
    return (<>
        {tasks.length > 0 && (<>
            <h2 className={'mb-2'}>{title}</h2>
            <div className={'ml-2'}>
                {maximized && tasks.map((task) => (<div key={task.id} className={'mb-2 rounded w-full'}>
                    <div>
                        <h3 className={'w-fit break-all'}>{task.title} -
                            {displayHour ? ( // Affichage avec heures de début et de fin
                                <span className={'ml-1 text-lg'}>
                                    De {task.start.toLocaleString('fr-FR', {hour: '2-digit', minute: '2-digit'})} à {task.end.toLocaleString('fr-FR', {hour: '2-digit', minute: '2-digit'})} le {task.start.toLocaleString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})}
                                </span>) : ( // Affichage sans les heures
                                <span className={'ml-1 text-lg'}>
                                    Le {task.start.toLocaleString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})}
                                </span>)}
                        </h3>
                    </div>
                    {displayDescription && (<p className={'ml-1 text-on-surface-variant break-all'}>{task.description}</p>)}
                </div>))}
            </div>
        </>)}
    </>);
}

export default TaskDisplay;
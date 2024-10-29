import { Meteor } from 'meteor/meteor';
import React, { Fragment, useState } from 'react'
import { useTracker, useSubscribe } from 'meteor/react-meteor-data'
import { TasksCollection } from "../api/TasksCollection.js"
import { Task } from './Task.jsx'
import { TaskForm } from "./TaskForm.jsx"
import { LoginForm } from './LoginForm.jsx'

export const App = () => {
  const isLoading = useSubscribe('tasks')

  const [ hideCompleted, setHideCompleted ] = useState(false)
  const hideCompletedFilter = { isChecked: { $ne: true }}

  const user = useTracker(() => Meteor.user())

  const tasks = useTracker(() => {
    if (!user) {
      console.log('No user.')
      return []
    }

    return TasksCollection.find(
      hideCompleted ? hideCompletedFilter : {}, 
      {
       sort: { createdAt: -1 } 
      }
    ).fetch()
  })

  const pendingTasksCount = useTracker(() => {
    if (!user) {
      return 0
    }

    return TasksCollection.find(hideCompletedFilter).count()
  })

  const pendingTasksTitle = `${
    pendingTasksCount ? ` (${ pendingTasksCount })` : ''
  }`

  const handleToggleChecked = ({ _id, isChecked }) => Meteor.callAsync('tasks.toggleChecked', { _id, isChecked })
  const handleDelete = ({ _id }) => Meteor.callAsync('tasks.delete', { _id })
  const logout = () => Meteor.logout()
  
  if(isLoading()) {
    return <div>Loading...</div>
  }

  return (
    <div className='app'>
      <header>
        <div className='app-bar'>
          <div className='app-header'>
            <h1>
              Let's Do This!
              { pendingTasksTitle }
            </h1>
          </div>
        </div>
      </header>
      <div className='main'>

        {user ? (
          <Fragment>
            <div className='user' onClick={logout}>
              {user.username}
            </div>
            <TaskForm />

            <div className='filter'>
              <button onClick={() => setHideCompleted(!hideCompleted)}>
                {hideCompleted ? 'Show All' : 'Hide Completed'}
              </button>
            </div>

            <ul className='tasks'>
              { tasks.map(task => (
                <Task
                  key={ task._id } 
                  task={ task } 
                  onCheckboxClick={handleToggleChecked}
                  onDeleteClick={handleDelete}
                />
              ))}
            </ul>
          </Fragment>
        ) : (
          <LoginForm />
        )} 

      </div>
    </div>
  )
}
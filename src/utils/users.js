const users = []

//addUser removeUser getUsersInRoom

const addUser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data
    if(!username || !room){
        return {
            error: 'Username and room are required!'
        }
    }

    //Check for existing user
    const existingUser = users.find((user)=>{
        return user.username === username && user.room === room
    })

    //Validate Username
    if(existingUser){
        return {
            error:'Username is in use!'
        }
    }

    //Store User
    const user = {id, username, room}
    users.push(user)
    return {user}
}

const removeUser = (id) =>{
    const index = users.findIndex((user)=>user.id === id)

    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

const getUser = (id) => {
    return users.find((user)=>user.id === id)
}

const getUsersInRoom = (room) => {
     room = room.trim().toLowerCase() 
    return users.filter((user)=>user.room === room)
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}




//***************************************************************TESTING CODE*******************************************************************************
// addUser({
//     id: 1,
//     username: 'sanket',
//     room: 'S'
// })
// addUser({
//     id: 2,
//     username: 'sheetal',
//     room: 'S'
// })

// const user = getUser(1)

// console.log(user)


// const usersInRoom = getUsersInRoom('S2')

// console.log(usersInRoom)



// const removedUser = removeUser(1)
//  console.log(removedUser)
//  console.log(users)
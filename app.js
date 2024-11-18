const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')
const dbpath = path.join(__dirname, 'cricketTeam.db')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
let db = null
const initializedbandserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server started')
    })
  } catch (e) {
    console.log(`db error ${e.message}`)
    process.exit(1)
  }
}
initializedbandserver()
const covertdbobjtoresponseobj = dbobject => {
  return {
    playerId: dbobject.player_id,
    playerName: dbobject.player_name,
    jerseyNumber: dbobject.jersey_number,
    role: dbobject.role,
  }
}

app.get('/players/', async (request, response) => {
  const playerquery = `
  select * from cricket_team`
  const bookarray = await db.all(playerquery)
  response.send(
    bookarray.map(eachPlayer => covertdbobjtoresponseobj(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const details = request.body

  const {playerName, jerseyNumber, role} = details
  const updateplayerquery = `insert into cricket_team (player_name,jersey_number,role)
  values
  (
    '${playerName}',
    ${jerseyNumber},
    '${role}'
  );`
  const dbresponse = await db.run(updateplayerquery)
  const playerId = dbresponse.lastID
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerQuery = `select * from cricket_team where player_id=${playerId}`
  const playerr = await db.get(playerQuery)
  response.send(covertdbobjtoresponseobj(playerr))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerdetails = request.body
  const {playerName, jerseyNumber, role} = playerdetails
  const playerupdatequery = `
   update cricket_team set
   
   player_name='${playerName}',
   jersey_number= ${jerseyNumber},
   role='${role}' where player_id = ${playerId}`
  await db.run(playerupdatequery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletequery = `delete from cricket_team where player_id=${playerId}`
  await db.run(deletequery)
  response.send('Player Removed')
})

module.exports = app

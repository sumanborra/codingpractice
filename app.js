const express = require('express')
const path = require('path')
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
let db = null
const initiliazation = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`Server Error ${e.message}`)
    process.exit(1)
  }
}
initiliazation()
app.get('/players/', async (request, response) => {
  const query = `SELECT * FROM player_details;`
  const playerDetails = await db.all(query)
  const data = playerDetails.map(eachObject => {
    return {
      playerId: eachObject.player_id,
      playerName: eachObject.player_name,
    }
  })
  response.send(data)
})
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const query = `SELECT * FROM player_details WHERE player_id = ${playerId};`
  const specificPlayerDetails = await db.get(query)
  const data = {
    playerId: specificPlayerDetails.player_id,
    playerName: specificPlayerDetails.player_name,
  }
  response.send(data)
})
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const updateDetails = request.body
  const {playerName} = updateDetails
  const query = `UPDATE player_details SET player_name='${playerName}';`
  await db.run(query)
  response.send('Player Details Updated')
})
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const query = `SELECT match_id AS matchId,match,year FROM match_details WHERE match_id =${matchId};`
  const details = await db.get(query)

  response.send(details)
})
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const query = `SELECT * FROM match_details NATURAL JOIN player_match_score WHERE player_id = ${playerId};`
  const matchDetails = await db.all(query)
  const data = matchDetails.map(eachObject => {
    return {
      matchId: eachObject.match_id,
      match: eachObject.match,
      year: eachObject.year,
    }
  })
  response.send(data)
})
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const query = `SELECT
	      player_details.player_id AS playerId,
	      player_details.player_name AS playerName
	    FROM player_match_score NATURAL JOIN player_details
        WHERE match_id=${matchId};`
  const specifiPlayersInSpecificMatch = await db.all(query)

  response.send(specifiPlayersInSpecificMatch)
})
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const query = `SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};`
  const detailsOfStatitics = await db.get(query)
  /*const data = {
    playerId: detailsOfStatitics['playerId'],
    playerName: detailsOfStatitics['playerName'],
    totalScore: detailsOfStatitics['SUM(score)'],
    totalFours: detailsOfStatitics['totalFours)'],
    totalSixes: detailsOfStatitics['totalSixes)'],
  }*/
  response.send(detailsOfStatitics)
})
module.exports = app

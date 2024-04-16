const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors'); // Add this line
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors()); 
const ACCESS_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2OTY3Mzg4NTQsImV4cCI6MTY5NjgyNTI1NCwianRpIjoiand0X25vbmNlIiwidHlwZSI6Im1hbmFnZW1lbnQiLCJ2ZXJzaW9uIjoyLCJuYmYiOjE2OTY3Mzg4NTQsImFjY2Vzc19rZXkiOiI2NTFhZTRjYWNhNTg0OGYwZTNkNDZiODYifQ.grbAHG-7r3ncj8ytBeHxTSVP7iQ0yMjAOuQNVfVt6G8'; // Replace with your actual access token

const createNewRoom = async (userName) => {
  try {
    const response = await fetch('https://api.100ms.live/v2/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`, // Use the variable here
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "name": `room03-k68`,
        "description": "This is a sample description for the room",
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create a new room');
    }

    const data = await response.json();
    console.log(data.id);
    const room_id = data.id;

    const generateRoomCodeResponse = await fetch(`https://api.100ms.live/v2/room-codes/room/${room_id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`, // Use the variable here
        'Content-Type': 'application/json'
      }
    });

    if (!generateRoomCodeResponse.ok) {
      throw new Error('Failed to generate a room code');
    }

    const generateRoomCodeData = await generateRoomCodeResponse.json();
    return generateRoomCodeData.data[2].code; // Assuming the code is at index 2
  }
  catch (error) {
    throw new Error('Error creating room: ' + error.message);
  }
};

app.post('/api/createRoom', async (req, res) => {
  try {
    const userName = req.body.userName;
    console.log(userName)
    const roomCode = await createNewRoom(userName);
    res.json({ roomCode: roomCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

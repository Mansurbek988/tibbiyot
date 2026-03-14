from typing import List, Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # doctor_id -> list of active websockets
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, doctor_id: int, websocket: WebSocket):
        await websocket.accept()
        if doctor_id not in self.active_connections:
            self.active_connections[doctor_id] = []
        self.active_connections[doctor_id].append(websocket)

    def disconnect(self, doctor_id: int, websocket: WebSocket):
        if doctor_id in self.active_connections:
            self.active_connections[doctor_id].remove(websocket)
            if not self.active_connections[doctor_id]:
                del self.active_connections[doctor_id]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast_to_doctor(self, doctor_id: int, message: dict):
        if doctor_id in self.active_connections:
            for connection in self.active_connections[doctor_id]:
                await connection.send_json(message)

manager = ConnectionManager()

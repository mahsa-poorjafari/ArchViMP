from channels.generic.websocket import WebsocketConsumer
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from logical_vis import views


class TraceConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        await self.accept()
        await self.send_json({
            'type': 'MESSAGE',
            'data': 'Websocket Connected'
        })

    async def receive_json(self, content, **kwargs):
        message_type = content["text"]
        print("\n-------")
        # existingTraceFile = message_type["existingTraceFile"]
        await self.send_json({
            'type': 'MESSAGE',
            'data': message_type
        })

    async def disconnect(self, close_code):
        pass



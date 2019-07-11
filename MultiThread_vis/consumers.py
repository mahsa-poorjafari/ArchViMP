from channels.generic.websocket import WebsocketConsumer
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class TraceConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        await self.accept()
        await self.send_json({
            'type': 'MESSAGE',
            'data': 'Websocket Connected'
        })

    async def receive_json(self, content, **kwargs):
        message_type = content
        print("\n-------")
        print(content)
        await self.send_json({
            'type': 'MESSAGE',
            'data': message_type
        })

    async def disconnect(self, close_code):
        pass


# def ws_connect(message):
#     Group('users').add(message.reply_channel)
#     Group('users').send({
#         'text': json.dumps({
#             'username': message.user.username,
#             'is_logged_in': True
#         })
#     })
#
#
# def ws_disconnect(message):
#     Group('users').send({
#         'text': json.dumps({
#             'username': message.user.username,
#             'is_logged_in': False
#         })
#     })
#     Group('users').discard(message.reply_channel)

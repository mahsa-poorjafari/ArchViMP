from channels.routing import URLRouter, ProtocolTypeRouter
from django.conf.urls import url
from MultiThread_vis.consumers import TraceConsumer
from channels.auth import AuthMiddlewareStack

application = ProtocolTypeRouter({
    "websocket": URLRouter([
            url(r"^trace_vis/$", TraceConsumer),
        ]),
})
# channel_routing = [
#     URLRouter('websocket.connect', ws_connect),
#     URLRouter('websocket.disconnect', ws_disconnect),
# ]

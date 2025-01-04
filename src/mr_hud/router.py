from lib.chatcontext import ChatContext
from fastapi import APIRouter, Request 
from lib.providers.services import service_manager
from lib.providers.commands import command_manager

router = APIRouter()

@router.get("/session_data/{log_id}")
async def session_data(request: Request, log_id: str):
    user = request.state.user.username
    context = ChatContext(command_manager, service_manager, user)
    await context.load_context(log_id)
    sess_data = context.data["session"]
    return sess_data

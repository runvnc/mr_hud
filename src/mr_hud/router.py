from lib.chatcontext import ChatContext
from fastapi import APIRouter, Request 

router = APIRouter()

@router.get("/session_data/{log_id}")
async def session_data(request: Request, log_id: str):
    context = ChatContext(log_id)
    sess_data = context.data["session"]
    return sess_data

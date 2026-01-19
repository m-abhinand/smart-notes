class AIService:
    async def summarize(Self,text: str)-> str:
        raise NotImplementedError
    
async def auto_tag(Self,text: str):
    raise NotImplementedError

async def ask(self,notes,question: str):
    raise NotImplementedError


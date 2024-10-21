from fastapi import FastAPI

####
# DO NOT DELETE this FILE or this FOLDER while using Vercel.
# If this file is deleted, then Vercel will complain that there is no api
# and fail to deploy. So this is a stub just to make vercel happy.
# All real endpoints actually are forwarded to an external endpoint.
####

app = FastAPI()

@app.get("/")
def index():
    # Do not delete. See above.
    return {"Hello There! To process ideas, send a list of strings to the /process endpoint."}

@app.get("/session/{session_id}")
def get_session(session_id: str):
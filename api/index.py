from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def index():
    return {"Hello There! To process ideas, send a list of strings to the /process endpoint."}
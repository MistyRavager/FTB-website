from typing import Annotated
import os

from fastapi import Depends, FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from auth import Token, get_current_team, generate_access_token

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    return generate_access_token(form_data.username, form_data.password)


@app.get("/me")
async def get_logged_in_team(
    current_user: Annotated[int, Depends(get_current_team)]
) -> int:
    return current_user


@app.post("/upload_patch/{question_id}")
async def upload_patch(
    question_id: int,
    patch: Annotated[UploadFile, File(description="The patch to upload")],
    current_user: Annotated[int, Depends(get_current_team)]
):
    # check max file size
    contents = await patch.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File greater than 5MiB")

    if not os.path.exists(f"uploads/q{question_id}"):
        raise HTTPException(status_code=400, detail="Question does not exist")

    os.makedirs(f"uploads/q{question_id}/t{current_user}", exist_ok=True)
    # count files in directory
    submission_count = len(os.listdir(f"uploads/q{question_id}/t{current_user}"))
    path = f"uploads/q{question_id}/t{current_user}"
    file_name = f"{submission_count + 1}-{patch.filename}"
    pathobj = os.path.join(path, file_name)
    with open(pathobj, "wb") as f:
        f.write(contents)

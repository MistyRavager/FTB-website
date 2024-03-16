from typing import Annotated
import os

from fastapi import Depends, FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
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

MAX_SUBMISSIONS = 3


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


@app.get("/questions")
async def get_questions():
    """
    JSON array of {"title", "repository", "points"}
    """
    return FileResponse("questions.json")


@app.get("/questions/{question_id}/submission_count")
async def get_submission_count(
    question_id: int,
    current_user: Annotated[int, Depends(get_current_team)]
) -> int:
    if not os.path.exists(f"uploads/q{question_id}"):
        raise HTTPException(status_code=404, detail="Question does not exist")
    path = f"uploads/q{question_id}/t{current_user}"
    os.makedirs(path, exist_ok=True)
    return len(os.listdir(path))


@app.get("/questions/{question_id}/latest_submission")
async def get_latest_submission(
    question_id: int,
    current_user: Annotated[int, Depends(get_current_team)]
) -> FileResponse:
    if not os.path.exists(f"uploads/q{question_id}"):
        raise HTTPException(status_code=400, detail="Question does not exist")
    path = f"uploads/q{question_id}/t{current_user}"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="No submissions")
    files = os.listdir(path)
    if not files:
        raise HTTPException(status_code=404, detail="No submissions")
    # max by prefix integer
    latest = max(files, key=lambda x: int(x.split("-")[0]))
    return FileResponse(os.path.join(path, latest))


@app.post("/questions/{question_id}")
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
    if submission_count >= MAX_SUBMISSIONS:
        raise HTTPException(status_code=400, detail="Max submissions reached")
    path = f"uploads/q{question_id}/t{current_user}"
    file_name = f"{submission_count + 1}-{patch.filename}"
    pathobj = os.path.join(path, file_name)
    with open(pathobj, "wb") as f:
        f.write(contents)

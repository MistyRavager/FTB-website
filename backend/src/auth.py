from datetime import datetime, timedelta, timezone
from typing import Annotated
import os

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel
import dotenv

dotenv.load_dotenv()

# 32 bytes of random data
# env:SECRET_KEY
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("No SECRET_KEY set")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

with open("accounts.txt", "r") as f:
    passwords = f.readlines()


class Token(BaseModel):
    access_token: str
    token_type: str

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_current_team(token: Annotated[str, Depends(oauth2_scheme)]) -> int:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        team_number = payload.get("sub")
        if team_number is None:
            raise credentials_exception
        return int(team_number)
    except JWTError:
        raise credentials_exception


def generate_access_token(username: str, password: str) -> Token:
    exc = HTTPException(
        status_code=401,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not username.isdigit():
        raise exc
    team_number = int(username)
    if team_number < 1 or team_number > len(passwords):
        raise exc
    if password != passwords[team_number - 1].strip():
        raise exc

    to_encode = {
        "sub": str(team_number),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
    }
    access_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return Token(access_token=access_token, token_type="bearer")

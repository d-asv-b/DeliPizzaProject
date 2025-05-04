from argon2 import PasswordHasher, Type

password_hasher = PasswordHasher(
        time_cost=8,
        parallelism=16,
        memory_cost=250000,
        hash_len=32,
        type=Type.ID
)


def create_hashed_password(pwd: str, salt: bytes) -> str:
    return password_hasher.hash(
        password=pwd,
        salt=salt
    )

def check_password(pwd: str, hash: str) -> bool:
    try:
        return password_hasher.verify(hash, pwd)
    except:
        return False
from argon2 import PasswordHasher, Type

from rest_framework import serializers

import pytz
import datetime

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
    
def parse_custom_delivery_time(delivery_time_str: str) -> datetime.datetime:
    try:
        day_part_str, time_part_str, tz_str = delivery_time_str.split("|")
        
        if day_part_str == "today":
            date_part = datetime.date.today()
        elif day_part_str == "tomorrow":
            date_part = datetime.date.today() + datetime.timedelta(days=1)
        
        hour, minute = map(int, time_part_str.split(":"))

        try:
            tz = pytz.timezone(tz_str)
        except pytz.exceptions.UnknownTimeZoneError:
            raise serializers.ValidationError(f"Неизвестный часовой пояс: {tz_str}")

        delivery_time = datetime.datetime(date_part.year, date_part.month, date_part.day, hour, minute)
        delivery_time_timezone = tz.localize(delivery_time)
        return delivery_time_timezone
    except ValueError:
        raise serializers.ValidationError(
            "Неверный формат deliveryTime. Ожидается 'today/HH:MM/ЧасовойПоясUTC' (например, '25.12.2024/14:30/+3')."
        )
    except Exception as e:
        raise serializers.ValidationError(f"Ошибка: {str(e)}")
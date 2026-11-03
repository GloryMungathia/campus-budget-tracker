import time
from dataclasses import dataclass, field


@dataclass
class LoginLimiter:
    max_attempts: int = 5
    lock_seconds: int = 180
    clock: object = time.monotonic
    failures: dict = field(default_factory=dict)
    locked_until: dict = field(default_factory=dict)

    def seconds_left(self, key: str) -> int:
        until = self.locked_until.get(key)
        if until is None:
            return 0
        left = until - self.clock()
        if left <= 0:
            self.locked_until.pop(key, None)
            self.failures.pop(key, None)
            return 0
        return int(left) + 1

    def record_failure(self, key: str) -> None:
        count = self.failures.get(key, 0) + 1
        self.failures[key] = count
        if count >= self.max_attempts:
            self.locked_until[key] = self.clock() + self.lock_seconds

    def reset(self, key: str) -> None:
        self.failures.pop(key, None)
        self.locked_until.pop(key, None)

    def clear(self) -> None:
        self.failures.clear()
        self.locked_until.clear()


login_limiter = LoginLimiter()


def wait_message(seconds: int) -> str:
    minutes = (seconds + 59) // 60
    unit = "minute" if minutes == 1 else "minutes"
    return f"Too many wrong attempts. Try again in {minutes} {unit}."

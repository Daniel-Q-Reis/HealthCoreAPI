from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class LogEventRequest(_message.Message):
    __slots__ = ("actor_id", "action", "target_id", "resource_type", "ip_address", "user_agent", "details", "timestamp")
    ACTOR_ID_FIELD_NUMBER: _ClassVar[int]
    ACTION_FIELD_NUMBER: _ClassVar[int]
    TARGET_ID_FIELD_NUMBER: _ClassVar[int]
    RESOURCE_TYPE_FIELD_NUMBER: _ClassVar[int]
    IP_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    USER_AGENT_FIELD_NUMBER: _ClassVar[int]
    DETAILS_FIELD_NUMBER: _ClassVar[int]
    TIMESTAMP_FIELD_NUMBER: _ClassVar[int]
    actor_id: str
    action: str
    target_id: str
    resource_type: str
    ip_address: str
    user_agent: str
    details: str
    timestamp: int
    def __init__(self, actor_id: _Optional[str] = ..., action: _Optional[str] = ..., target_id: _Optional[str] = ..., resource_type: _Optional[str] = ..., ip_address: _Optional[str] = ..., user_agent: _Optional[str] = ..., details: _Optional[str] = ..., timestamp: _Optional[int] = ...) -> None: ...

class LogEventResponse(_message.Message):
    __slots__ = ("success", "event_id")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    EVENT_ID_FIELD_NUMBER: _ClassVar[int]
    success: bool
    event_id: str
    def __init__(self, success: bool = ..., event_id: _Optional[str] = ...) -> None: ...

class GetAuditLogsRequest(_message.Message):
    __slots__ = ("target_id", "limit", "next_token")
    TARGET_ID_FIELD_NUMBER: _ClassVar[int]
    LIMIT_FIELD_NUMBER: _ClassVar[int]
    NEXT_TOKEN_FIELD_NUMBER: _ClassVar[int]
    target_id: str
    limit: int
    next_token: str
    def __init__(self, target_id: _Optional[str] = ..., limit: _Optional[int] = ..., next_token: _Optional[str] = ...) -> None: ...

class AuditLogEntry(_message.Message):
    __slots__ = ("event_id", "actor_id", "action", "target_id", "resource_type", "ip_address", "details", "timestamp")
    EVENT_ID_FIELD_NUMBER: _ClassVar[int]
    ACTOR_ID_FIELD_NUMBER: _ClassVar[int]
    ACTION_FIELD_NUMBER: _ClassVar[int]
    TARGET_ID_FIELD_NUMBER: _ClassVar[int]
    RESOURCE_TYPE_FIELD_NUMBER: _ClassVar[int]
    IP_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    DETAILS_FIELD_NUMBER: _ClassVar[int]
    TIMESTAMP_FIELD_NUMBER: _ClassVar[int]
    event_id: str
    actor_id: str
    action: str
    target_id: str
    resource_type: str
    ip_address: str
    details: str
    timestamp: str
    def __init__(self, event_id: _Optional[str] = ..., actor_id: _Optional[str] = ..., action: _Optional[str] = ..., target_id: _Optional[str] = ..., resource_type: _Optional[str] = ..., ip_address: _Optional[str] = ..., details: _Optional[str] = ..., timestamp: _Optional[str] = ...) -> None: ...

class GetAuditLogsResponse(_message.Message):
    __slots__ = ("logs", "next_token")
    LOGS_FIELD_NUMBER: _ClassVar[int]
    NEXT_TOKEN_FIELD_NUMBER: _ClassVar[int]
    logs: _containers.RepeatedCompositeFieldContainer[AuditLogEntry]
    next_token: str
    def __init__(self, logs: _Optional[_Iterable[_Union[AuditLogEntry, _Mapping]]] = ..., next_token: _Optional[str] = ...) -> None: ...

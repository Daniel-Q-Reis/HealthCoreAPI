"""
Core Services for the application.

This file contains the business logic services for the core app.
"""

import logging
from typing import TYPE_CHECKING

from src.apps.core import repositories
from src.apps.core.models import Post

if TYPE_CHECKING:
    from django.contrib.auth.models import User

logger = logging.getLogger(__name__)


def create_post(*, author: "User", title: str, content: str) -> Post:
    """
    Creates a new post.

    Args:
        author: The user creating the post.
        title: The title of the post.
        content: The content of the post.

    Returns:
        The newly created Post instance.
    """
    post = repositories.create_post(author=author, title=title, content=content)
    logger.info(
        "Post created successfully.",
        extra={"post_id": post.id, "author_id": author.id},
    )
    return post


__all__ = ["create_post"]

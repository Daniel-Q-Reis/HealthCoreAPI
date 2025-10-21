"""
Main URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path(settings.ADMIN_URL, admin.site.urls),
    # Core functionality (health checks, etc)
    path("", include("src.apps.core.urls")),
    # API docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    # API authentication
    path("api/v1/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/v1/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # API v1 routes (ready for your apps)
    # path("api/v1/", include("src.apps.your_app.urls")),
    path("api/v1/patients/", include("src.apps.patients.urls")),
    path("api/v1/practitioners/", include("src.apps.practitioners.urls")),
    path("api/v1/scheduling/", include("src.apps.scheduling.urls")),
    path("api/v1/admissions/", include("src.apps.admissions.urls")),
    path("api/v1/results/", include("src.apps.results.urls")),
    path("api/v1/staff/", include("src.apps.shifts.urls")),
    path("api/v1/experience/", include("src.apps.experience.urls")),
    # Add your apps' urls here
]

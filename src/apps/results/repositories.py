"""
Data access layer for the Results & Imaging bounded context.
"""

from .models import DiagnosticReport, Observation


def create_report(**data) -> DiagnosticReport:
    """Creates a new DiagnosticReport record."""
    observations_data = data.pop("observations", [])
    report = DiagnosticReport.objects.create(**data)
    for obs_data in observations_data:
        Observation.objects.create(report=report, **obs_data)
    return report

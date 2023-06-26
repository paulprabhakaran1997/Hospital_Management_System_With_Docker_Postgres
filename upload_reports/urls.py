from django.urls import path
from upload_reports.views import UploadReports , GetUploadedReports , GetUploadedReportsFiles

urlpatterns = [
    path("" , UploadReports.as_view() , name = "upload_reports"),
    path("get_uploaded_reports/" , GetUploadedReports.as_view() , name = "get_uploaded_reports"),
    path("get_uploaded_reports_files/" , GetUploadedReportsFiles.as_view() , name = "get_uploaded_reports_files"),
]
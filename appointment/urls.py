from django.urls import path
from appointment.views import (AppointmentView , CancelAppointment, GetPendingPaymentForOpData, GetAppointmentData ,
GetTodaysAppointmentData ,  GetAmountData , OutPatientPaymentView , Transfer_OP_TO_IP , GetDoctorData , OP_UploadReport,
OP_Refund ,GetPatientBalanceData)

urlpatterns = [
    path("" , AppointmentView.as_view() , name="appointment"),
    path("get_appointment_data/" , GetAppointmentData.as_view() , name="get_appointment_data"),
    path("get_todays_appointment_data/" , GetTodaysAppointmentData.as_view() , name="get_todays_appointment_data"),
    path("get_pending_payment_for_op_data/" , GetPendingPaymentForOpData.as_view() , name="get_pending_payment_for_op_data"),
    path("get_amount_data/" , GetAmountData.as_view() , name="get_amount_data"),
    path('get_op_payment/' , OutPatientPaymentView.as_view() , name="get_op_payment"),
    path('cancel_appointment/' , CancelAppointment.as_view() , name="cancel_appointment"),
    path('transfer_OP_TO_IP/' , Transfer_OP_TO_IP.as_view() , name = 'transfer_OP_TO_IP'),
    path('get_doctor_data/' , GetDoctorData.as_view() , name = 'get_doctor_data'),
    path('op_upload_report/' , OP_UploadReport.as_view() , name = 'op_upload_report'),
    path('op_refund/' , OP_Refund.as_view() , name = 'op_refund'),
    path('get_patient_balance_data/' , GetPatientBalanceData.as_view() , name = 'get_patient_balance_data')
]
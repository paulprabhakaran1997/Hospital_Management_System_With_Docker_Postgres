from datetime import datetime, date
from datetime import date

from patient.models import Patient
from staff.models import Staff
from doctor.models import Doctor
from appointment.models import Appointment
from lab.models import LabGroup
from xray.models import Xray
from scan.models import Scan



def get_doctor_data():
    doctor_data = []
    DoctorObj = Doctor.objects.all()
    for ht in DoctorObj:
        data = {
            'id' : ht.id,
            'name' : ht.name,
            'specialized' : ht.specialized,
            'health_checkup_master' : ht.health_checkup_master                     
        }
        doctor_data.append(data)

    return doctor_data


def get_patient_data():
    patient_data = []

    PatientObj = Patient.objects.all()

    for ht in PatientObj:
        currentdate = datetime.now().date() - ht.dob

        age = currentdate.days//365
        month = (currentdate.days - age *365) // 30
        data = {
            'id' : ht.id,
            'name' : ht.name,
            'age' : age,
            'month' : month,
            'gender' : ht.gender,
            'phone' : ht.phone,
            'father_name' : ht.father_name,
            'address' : ht.address,
            'pos_id' : ht.pos_id,
        }
        patient_data.append(data)


    return patient_data


def get_staff_data():
    staff_data = []
    StaffObj = Staff.objects.all()
    for ht in StaffObj:
        data = {
            'id' : ht.id,
            'name' : ht.name,
            'phone' : ht.phone,
            'address' : ht.address,
            'role_id' : ht.role.id,
            'role_name' : ht.role.name
        }
        staff_data.append(data)

    return staff_data


def get_appointment_data():
    appointment_data = []

    AppointmentObj = Appointment.objects.all()

    for ht in AppointmentObj:

        currentdate = datetime.now().date() - ht.patient.dob

        age = currentdate.days//365
        month = (currentdate.days - age *365) // 30

        data = {
            'id' : ht.id,
            'patient_id' : ht.patient.id,
            'patient_name' : ht.patient.name,
            'patient_age' : age,
            'patient_month' : month,
            'patient_gender' : ht.patient.gender,
            'patient_phone' : ht.patient.phone,
            'pos_id' : ht.patient.pos_id,
            'bp' : ht.bp,
            'pulse' : ht.pulse,
            'temperature' : ht.temperature,
            'rr' : ht.rr,
            'sp_o2' : ht.sp_o2,
            'blood_sugar' : ht.blood_sugar,
            'reason' : ht.reason,
            'doctor_id' : ht.doctor.id,
            'has_lab' : ht.has_lab,
            'has_xray' : ht.has_xray,
            'has_scan' : ht.has_scan,
            'doctor_name' : ht.doctor.name,
            'appointment_date' : str(ht.appointment_date),
            'checkup' : ht.checkup,
            'initially_paid' : str(ht.initially_paid),
            'payment_pending' : str(ht.payment_pending),
            'status' : ht.status,
            'is_emergency' : str(ht.is_emergency)
        }
        appointment_data.append(data)

    return appointment_data



def get_lab_group_data():
    lab_group_data = []

    LabGroupObj = LabGroup.objects.all()

    for ht in LabGroupObj:
        data = {
            'id' : ht.id,
            'name' : ht.name,
            'amount' : ht.amount,
            'description' : ht.description
        }

        lab_group_data.append(data)

    return lab_group_data


def get_xray_data():
    xray_data = []

    XrayObj = Xray.objects.all()

    for ht in XrayObj:
        data = {
            'id' : ht.id,
            'name' : ht.name,
            'amount' : ht.amount,
            'description' : ht.description
        }

        xray_data.append(data)

    return xray_data

def get_scan_data():
    scan_data = []

    ScanObj = Scan.objects.all()

    for ht in ScanObj:
        data = {
            'id' : ht.id,
            'name' : ht.name,
            'amount' : ht.amount,
            'description' : ht.description
        }

        scan_data.append(data)

    return scan_data




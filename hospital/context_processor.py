import logging
import base64
import sys
import datetime, json
from datetime import datetime, timedelta , time
from json import JSONEncoder
import json
from decimal import Decimal
from django.utils.dateparse import parse_date

from lint_hospital.encoders import DefaultEncoder

from configuration.models import AppConfiguration


def getContext(request):

    context = {
        'configuration' : AppConfiguration.objects.all().first()
    }

    return (context)

        

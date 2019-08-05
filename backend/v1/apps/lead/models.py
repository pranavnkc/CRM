import uuid
from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from phonenumber_field.modelfields import PhoneNumberField

# Create your models here.
User = get_user_model()

def get_unique_slug():
    unique_id = uuid.uuid4()
    while Lead.objects.filter(lead_id=unique_id).exists():
        unique_id = uuid.uuid4()
    return unique_id

class Lead(models.Model):
    STATUS_RAW = "raw"
    STATUS_CALLBACK = "callback"
    STATUS_PROSPECT = "prospect"
    STATUS_SALE = "sale"    
    STATUS_CHOICES = (
        (STATUS_RAW, 'Raw Lead'),
        (STATUS_CALLBACK, "Lead For Callback"),
        (STATUS_PROSPECT, "Prospect Lead"),
        (STATUS_SALE, "Lead For Sale"),
    )
    lead_id = models.SlugField(max_length=140, unique=True, default=get_unique_slug)
    created_on = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='created_leads', on_delete=models.CASCADE,default=None, null=True)
    lead_hash  = models.CharField(max_length=40, null=True, blank=True)
    status = models.CharField(choices=STATUS_CHOICES, max_length=30, default=STATUS_RAW)
    assigned_to = models.ForeignKey(User, related_name='assigned_leads', on_delete=models.CASCADE,default=None, null=True)

class LeadBusinessDetails(models.Model):
    MR = "Mr."
    MRS = "Mrs."
    MISS = "Miss"
    DR = "Dr."
    MS = "Ms."
    PROF = "Prof."
    REV = "Rev."
    SALUTATION_CHOICES= (
        (MR, MR),
        (MRS, MRS),
        (MISS, MISS),
        (DR, DR),
        (MS, MS),
        (PROF, PROF),
        (REV, REV)
    )
    lead = models.OneToOneField(Lead, on_delete=models.CASCADE, related_name="business_detail")
    busines_name = models.CharField(max_length=50, null=True, blank=True)
    salutation = models.CharField(choices=SALUTATION_CHOICES, max_length=30, null=True, blank=True)
    first_name = models.CharField(max_length=50, null=True, blank=True)
    middle_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    phone_number = models.CharField(null=True, blank=True, max_length=10)
    email = models.EmailField(null=True, blank=True)
    building_name = models.CharField(max_length=100)
    subb = models.CharField(max_length=100, null=True, blank=True)
    building_number = models.CharField(max_length=50, null=True, blank=True)
    street_name = models.CharField(max_length=100, null=True, blank=True)
    town = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    county = models.CharField(max_length=100, null=True, blank=True)

class LeadSupplyDetails(models.Model):
    lead = models.OneToOneField(Lead, on_delete=models.CASCADE, related_name="supply_detail")
    meter_type = models.CharField(max_length=100, null=True, blank=True)
    meter_type_code = models.CharField(max_length=100, null=True, blank=True)
    domestic_meter = models.CharField(max_length=100, null=True, blank=True)
    amr = models.BooleanField(default=True, null=True, blank=True)
    related_meter = models.BooleanField(default=False, null=True, blank=True)
    current_electricity_supplier =  models.CharField(max_length=100, null=True, blank=True)
    contract_end_date = models.DateField(null=True, blank=True)
    meter_serial_number = models.CharField(max_length=100, null=True, blank=True)
    supply_number = models.CharField(max_length=100, null=True, blank=True)
    
    
class Callback(models.Model):
    lead = models.ForeignKey(Lead, related_name='callbacks', on_delete=models.CASCADE, default=None, null=True)
    datetime = models.DateTimeField()
    scheduled_by = models.ForeignKey(User, related_name='scheduled_callbacks', on_delete=models.CASCADE)
    is_dialed = models.BooleanField(default=False)
    
class Comment(models.Model):
    lead = models.ForeignKey(Lead, related_name='comments', on_delete=models.CASCADE, default=None, null=True)
    comment = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(User, related_name='comments', on_delete=models.CASCADE,default=None, null=True)
    created_on = models.DateTimeField(auto_now_add=True) 

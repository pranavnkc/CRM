import uuid
from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import JSONField
from phonenumber_field.modelfields import PhoneNumberField

# Create your models here.
User = get_user_model()

def get_unique_slug():
    unique_id = uuid.uuid4()
    while Lead.objects.filter(lead_hash=unique_id).exists():
        unique_id = uuid.uuid4()
    return unique_id

def get_unique_internal_slug():
    unique_id = uuid.uuid4()
    while Lead.objects.filter(lead_internal_hash=unique_id).exists():
        unique_id = uuid.uuid4()
    return unique_id

class Status(models.Model):
    key = models.CharField(max_length=100)
    display = models.CharField(max_length=100)
    
class Lead(models.Model):
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
    lead_internal_hash = models.SlugField(max_length=140, default=get_unique_internal_slug)
    lead_hash = models.SlugField(max_length=140, default=get_unique_slug)
    source = models.CharField(max_length=200, null=True, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='created_leads', on_delete=models.CASCADE,default=None, null=True)
    status = models.CharField(max_length=40)
    assigned_to = models.ForeignKey(User, related_name='assigned_leads', on_delete=models.CASCADE,default=None, null=True)
    #lead business deatil fields
    busines_name = models.CharField(max_length=50, null=True, blank=True)
    salutation = models.CharField(choices=SALUTATION_CHOICES, max_length=30, null=True, blank=True)
    first_name = models.CharField(max_length=50, null=True, blank=True)
    middle_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    phone_number = models.CharField(null=True, blank=True, max_length=10)
    email = models.EmailField(null=True, blank=True)
    building_name = models.CharField(max_length=100, null=True, blank=True)
    subb = models.CharField(max_length=100, null=True, blank=True)
    building_number = models.CharField(max_length=50, null=True, blank=True)
    street_name = models.CharField(max_length=100, null=True, blank=True)
    town = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    county = models.CharField(max_length=100, null=True, blank=True)
    #suppky detail fields
    meter_type = models.CharField(max_length=100, null=True, blank=True)
    meter_type_code = models.CharField(max_length=100, null=True, blank=True)

    amr = models.BooleanField(default=True, null=True, blank=True)
    related_meter = models.BooleanField(default=False, null=True, blank=True)
    current_electricity_supplier =  models.CharField(max_length=100, null=True, blank=True)
    contract_end_date = models.DateField(null=True, blank=True)
    meter_serial_number = models.CharField(max_length=100, null=True, blank=True)
    supply_number = models.CharField(unique=True, max_length=100, null=True, blank=True)

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


class LeadHistory(models.Model):
    ACTION_CREATED = 'created'
    ACTION_EDIT_LEAD = 'edit'
    ACTION_DELETE_LEAD = 'deleted'
    ACTION_STATUS_CHANGE = 'status changed'
    ACTION_ASSIGN_CHANGED = "lead assign changed"
    ACTION_CALLBACk_SCHEDULED = "lead callback scheduled"
    ACTION_COMMENT = "comment"
    ACTION_CHOICES = (
        (ACTION_CREATED, "Lead Created"),
        (ACTION_EDIT_LEAD, 'Lead Edited'),
        (ACTION_STATUS_CHANGE, 'Lead Status Changed'),
        (ACTION_ASSIGN_CHANGED, 'Lead Assign Changed'),
        (ACTION_CALLBACk_SCHEDULED, 'Lead Callback Scheduled'),
        (ACTION_DELETE_LEAD, 'Lead Deleted'),
        (ACTION_COMMENT, 'Comment Added')
    )
    lead = models.ForeignKey(Lead, null=True, blank=True, on_delete=models.SET_NULL, related_name='lead_history')
    action = models.CharField(
        choices=ACTION_CHOICES, max_length=30)
    created_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    created_on = models.DateTimeField(auto_now=True, null=True)
    old_instance_meta = JSONField(blank=True, null=True)
    new_instance_meta = JSONField(blank=True, null=True)

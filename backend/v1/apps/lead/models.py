import uuid
from django.db import models
from django.utils import timezone
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
    def __str__(self):
        return  self.display
    
class SubmissionStatus(models.Model):
    key = models.CharField(max_length=100)
    display = models.CharField(max_length=100)
    def __str__(self):
        return  self.display

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
    GAS = 'gas'
    ELECTRICITY = 'electricity'
    METER_TYPE_CHOICES = (
        (GAS, "GAS"),
        (ELECTRICITY, "Elecricity"),
    )
    source = models.CharField(max_length=200, null=True, blank=True)
    created_on = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='created_leads', on_delete=models.CASCADE,default=None, null=True)
    status = models.CharField(max_length=40, null=True, blank=True)
    submission_status = models.CharField(max_length=40, default='raw')
    assigned_to = models.ForeignKey(User, related_name='assigned_leads', on_delete=models.CASCADE,default=None, null=True)
    assigned_by = models.ForeignKey(User, null=True, blank=True, related_name='have_assigned_leads', on_delete=models.SET_NULL)
    assigned_on = models.DateTimeField(blank=True, null=True, default=timezone.now)
    #lead business deatil fields
    busines_name = models.CharField(max_length=50, null=True, blank=True)
    salutation = models.CharField(choices=SALUTATION_CHOICES, max_length=30, null=True, blank=True)
    first_name = models.CharField(max_length=50, null=True, blank=True)
    middle_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    phone_number = models.CharField(null=True, blank=True, max_length=10)
    email = models.EmailField(null=True, blank=True)
    address_1 = models.CharField(max_length=200, null=True, blank=True)
    address_2 = models.CharField(max_length=200, null=True, blank=True)
    address_3 = models.CharField(max_length=200, null=True, blank=True)
    address_4 = models.CharField(max_length=200, null=True, blank=True)
    city_or_town = models.CharField(max_length=100, null=True, blank=True)
    county = models.CharField(max_length=100, null=True, blank=True)
    postcode = models.CharField(max_length=10, null=True, blank=True)
    
    #supply detail fields
    utility_type = models.CharField(choices=METER_TYPE_CHOICES, max_length=30, null=True, blank=True)
    amr = models.BooleanField(default=True, null=True, blank=True)
    related_meter = models.BooleanField(default=False, null=True, blank=True)
    current_electricity_supplier = models.CharField(max_length=100, null=True, blank=True)
    contract_end_date = models.DateField(null=True, blank=True)
    meter_serial_number = models.CharField(max_length=100, null=True, blank=True)
    supply_number = models.CharField(unique=True, max_length=100, null=True, blank=True) # this is MPRN/MPAN
    
    #new fields as discussed on 10th oct
    can_sell_water = models.BooleanField(default=False)
    initial_disposition_date = models.DateField(blank=True, null=True)
    new_renewal_date = models.DateField(null=True, blank=True)
    agent_name = models.CharField(max_length=200, null=True, blank=True)
    contract_duration = models.IntegerField(null=True, blank=True)
    s_andr3_status = models.CharField(max_length=200, null=True, blank=True)
    bilge_eac = models.CharField(max_length=200, null=True, blank=True)
    new_disposition_date = models.DateField(null=True, blank=True)
    is_locked = models.BooleanField(default=False) # if lead is locked then it assigned_to can not be changed
    @property
    def name(self):
        return "{} {} {}".format(self.first_name, self.middle_name, self.last_name)

class ProspectLead(models.Model):

    QUALITY_STATUS_APPROVED = 'approved'
    QUALITY_STATUS_REJECTED = 'Reject'
    QUALITY_STATUS_HOLD = 'hold'
    QUALITY_STATUS_REQUIRE_AUDITING = 'audit'
    QUALITY_STATUS_CHOICES = (
        (QUALITY_STATUS_APPROVED, 'Approved'),
        (QUALITY_STATUS_REJECTED, 'Rejected'),
        (QUALITY_STATUS_HOLD, 'On Hold'),
        (QUALITY_STATUS_REQUIRE_AUDITING, 'Require Auditing'),
    )
    lead = models.ForeignKey(Lead, related_name='prospect', on_delete=models.CASCADE)
    quality_status = models.CharField(
        choices=QUALITY_STATUS_CHOICES, max_length=30, default=QUALITY_STATUS_REQUIRE_AUDITING)
    submitted_by = models.ForeignKey(User, related_name='submitted_prospects', on_delete=models.CASCADE)
    created_on = models.DateTimeField(auto_now_add=True)
    comment = models.TextField()
    campaign = models.CharField(max_length=100, blank=True, null=True)
    is_hot_transfer = models.BooleanField(default=False)
    
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
    ACTION_SUBMISSION_STATUS_CHANGE = 'submission status changed'
    ACTION_ASSIGN_CHANGED = "lead assign changed"
    ACTION_CALLBACk_SCHEDULED = "lead callback scheduled"
    ACTION_COMMENT = "comment"
    ACTION_PR = "pr"
    ACTION_HT = "ht"
    ACTION_SALE = "sale"
    ACTION_CHOICES = (
        (ACTION_CREATED, "Lead Created"),
        (ACTION_EDIT_LEAD, 'Lead Edited'),
        (ACTION_STATUS_CHANGE, 'Lead Status Changed'),
        (ACTION_ASSIGN_CHANGED, 'Lead Assign Changed'),
        (ACTION_CALLBACk_SCHEDULED, 'Lead Callback Scheduled'),
        (ACTION_DELETE_LEAD, 'Lead Deleted'),
        (ACTION_COMMENT, 'Comment Added'),
        (ACTION_SUBMISSION_STATUS_CHANGE, 'Submission Status Changed'),
        (ACTION_PR, 'PR Submitted'),
        (ACTION_HT, 'Hot Transfer'),
        (ACTION_SALE, 'Sale'),
    )
    lead = models.ForeignKey(Lead, null=True, blank=True, on_delete=models.SET_NULL, related_name='lead_history')
    action = models.CharField(
        choices=ACTION_CHOICES, max_length=30)
    created_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    created_on = models.DateTimeField(auto_now_add=True)
    old_instance_meta = JSONField(blank=True, null=True)
    new_instance_meta = JSONField(blank=True, null=True)

from v1.apps.utils.models import Settings
from django.core.validators import RegexValidator, MinValueValidator
from decimal import Decimal
class LeadSale(models.Model):
    SOLD_AS_UTILITY = "utilities expert"
    SOLD_AS_MV = "mv utilities"
    SOLD_AS_CHOICES = (
        (SOLD_AS_UTILITY, "Utilities Expert"),
        (SOLD_AS_MV, "MV Utilities"),
    )
    COMPANY_TYPE_LIMITED = "limited"
    COMPANY_TYPE_SOLE = "sole-trader"
    COMPANY_TYPE_PARTNERSHIP = "Partnership"
    COMPANY_TYPE_CHOICES = (
        (COMPANY_TYPE_LIMITED, "Limited"),
        (COMPANY_TYPE_SOLE, "Sole Trader"),
        (COMPANY_TYPE_PARTNERSHIP, "Partnership")
    )
    ACQUISITION = "Acquisition"
    RENEWAL = "Renewal"
    RENEWAL_CHOICES = (
        (ACQUISITION, "ACQUISITION"),
        (RENEWAL, RENEWAL)
    )
    QUALITY_STATUS_APPROVED = 'approved'
    QUALITY_STATUS_REJECTED = 'Reject'
    QUALITY_STATUS_HOLD = 'hold'
    QUALITY_STATUS_REQUIRE_AUDITING = 'audit'
    QUALITY_STATUS_CHOICES = (
        (QUALITY_STATUS_APPROVED, 'Approved'),
        (QUALITY_STATUS_REJECTED, 'Rejected'),
        (QUALITY_STATUS_HOLD, 'On Hold'),
        (QUALITY_STATUS_REQUIRE_AUDITING, 'Require Auditing'),
    )
    MANAGEMENT_STATUS_SUBMITTED_TO_SUPPLIER = 'submitted-to-supplier'
    MANAGEMENT_STATUS_CHOICES = (
        (MANAGEMENT_STATUS_SUBMITTED_TO_SUPPLIER, 'Submitted To Supplier'), )
    lead = models.ForeignKey(Lead, null=True, on_delete=models.SET_NULL, related_name='sale')
    quality_status =models.CharField(
        choices=QUALITY_STATUS_CHOICES, max_length=30, default=QUALITY_STATUS_REQUIRE_AUDITING)
    management_status = models.CharField(
        choices=MANAGEMENT_STATUS_CHOICES, max_length=30, null=True, blank=True)
    created_on = models.DateTimeField(auto_now_add=True) 
    date_sold = models.DateField(null=True, blank=True)
    sold_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    sold_as = models.CharField(
        choices=SOLD_AS_CHOICES, max_length=30, null=True, blank=True)
    multi_site = models.BooleanField(default=False)
    company_type = models.CharField(
        choices=COMPANY_TYPE_CHOICES, max_length=30, null=True, blank=True)
    company_reg = models.CharField(max_length=100, blank=True, null=True)
    position_in_company = models.CharField(max_length=100, blank=True, null=True)
    ebilling = models.BooleanField(default=False)
    receive_marketing = models.BooleanField(default=False)
    full_address = models.TextField(null=True, blank=True)
    time_at_address = models.IntegerField(null=True, blank=True)
    sole_trader_dob = models.DateField(null=True, blank=True)
    full_billing_address = models.TextField(null=True, blank=True)
    renewal_acquisition = models.CharField(
        choices=RENEWAL_CHOICES, max_length=30, null=True, blank=True)
    new_supplier = models.CharField(max_length=100, null=True, blank=True)
    top_row = models.CharField(max_length=100, blank=True, null=True)
    bottom_row  =models.CharField(max_length=100, blank=True, null=True)
    start_date = models.DateField(null=True, blank=True)
    days = models.IntegerField(null=True, blank=True)
    eac_submitted = models.IntegerField(null=True, blank=True)
    tariif_code = models.CharField(max_length=100, blank=True, null=True)
    standing_charge = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal('0.00'))])
    standing_charge_uplift = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal('0.00'))])
    unit_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal('0.00'))])
    day_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal('0.00'))])
    night_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal('0.00'))])
    weekday_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal('0.00'))])
    eve_weekened_rate =models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal('0.00'))])
    eve_weekend_night_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal('0.00'))])
    uplift = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal('0.00'))])
    sc_comm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal('0.00'))])
    eac_comm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal('0.00'))])
    total_comm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal('0.00'))])
    total_comm_on_submission = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal('0.00'))])
    agenct_comm_percentage = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal('0.00'))])
    agenct_comm_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal('0.00'))])
    bill_received = models.BooleanField(null=True, blank=True)
    existing_contract_cancelled = models.BooleanField(null=True, blank=True)
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    account_name = models.CharField(max_length=100, blank=True, null=True)
    account_number = models.CharField(max_length=100, blank=True, null=True)
    account_sort_code = models.CharField(max_length=100, blank=True, null=True)
    data_source = models.CharField(max_length=100, blank=True, null=True)
    comment = models.CharField(max_length=100, blank=True, null=True)

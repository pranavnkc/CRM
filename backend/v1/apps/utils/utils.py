import os
import random
import string
from django.utils import timezone
from django.forms.models import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder

def get_file_name(file_type="lead-import", extension='csv'):                                                                                                   
    file_directory = os.path.join('static', 'media', 'reports')                                                                                            
    if not os.path.exists(file_directory):                                                                                                                         
        os.mkdir(file_directory)                                                                                                                                   
    rand = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(5))
    date = timezone.now().strftime('%m-%d-%Y')
    file_name = '{file_type}_{date}_{rand}.{extension}'.format(
        file_type=file_type, date=date, rand=rand, extension=extension)
    output_file = os.path.join(file_directory, file_name)
    return output_file
    
def model_to_dict_v2(instance):
    ret = model_to_dict(instance)
    import json
    json_data = json.loads(json.dumps(
        ret,
        sort_keys=True,
        cls=DjangoJSONEncoder
    ))
    return json_data

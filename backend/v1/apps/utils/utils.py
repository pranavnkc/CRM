import os
import random
import string
from django.utils import timezone


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
    

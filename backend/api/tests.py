from django.test import TestCase

# Create your tests here.

from django.apps import apps
print(apps.get_app_config('api').get_models())

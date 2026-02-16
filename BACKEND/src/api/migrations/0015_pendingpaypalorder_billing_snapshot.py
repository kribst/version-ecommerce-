# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_pendingpaypalorder_order_orderitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='pendingpaypalorder',
            name='billing_snapshot',
            field=models.JSONField(blank=True, default=dict, help_text='{email, first_name, last_name, address, city, country, zip_code, phone}', verbose_name='Snapshot facturation'),
        ),
    ]

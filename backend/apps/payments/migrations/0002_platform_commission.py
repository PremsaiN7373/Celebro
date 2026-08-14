from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='platform_commission_amount',
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                max_digits=10,
                help_text="Celebro's cut of this payment, computed when it's marked paid.",
            ),
        ),
    ]

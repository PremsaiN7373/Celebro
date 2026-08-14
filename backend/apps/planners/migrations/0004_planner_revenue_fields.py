from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('planners', '0003_blockeddate'),
    ]

    operations = [
        migrations.AddField(
            model_name='plannerprofile',
            name='is_featured',
            field=models.BooleanField(
                default=False,
                help_text='Featured planners are boosted to the top of marketplace search results.',
            ),
        ),
        migrations.AddField(
            model_name='plannerprofile',
            name='subscription_tier',
            field=models.CharField(
                choices=[('free', 'Free'), ('premium', 'Premium')],
                default='free',
                max_length=20,
            ),
        ),
    ]

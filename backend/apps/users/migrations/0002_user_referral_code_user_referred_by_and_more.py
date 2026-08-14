import secrets
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def generate_referral_code():
    return secrets.token_hex(4).upper()


def populate_referral_codes(apps, schema_editor):
    User = apps.get_model("users", "User")
    seen = set()
    for user in User.objects.all():
        code = generate_referral_code()
        while code in seen or User.objects.filter(referral_code=code).exists():
            code = generate_referral_code()
        seen.add(code)
        user.referral_code = code
        user.save(update_fields=["referral_code"])


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="two_factor_enabled",
            field=models.BooleanField(default=False),
        ),
        # Step 1: add the field with a harmless temporary placeholder,
        # NOT unique yet — this is what actually avoids the collision.
        migrations.AddField(
            model_name="user",
            name="referral_code",
            field=models.CharField(default="", editable=False, max_length=20),
            preserve_default=False,
        ),
        # Step 2: give every existing user a genuinely unique code.
        migrations.RunPython(populate_referral_codes, migrations.RunPython.noop),
        # Step 3: now that every row has a unique value, it's safe to
        # enforce the constraint and switch to the real generator for
        # future rows.
        migrations.AlterField(
            model_name="user",
            name="referral_code",
            field=models.CharField(
                default=generate_referral_code, editable=False, max_length=20, unique=True
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="referred_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="referrals",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.CreateModel(
            name="EmailOTP",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("code", models.CharField(max_length=6)),
                ("is_used", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="otp_codes",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]

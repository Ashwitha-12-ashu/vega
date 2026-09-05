from django.core.management.base import BaseCommand
from apps.services.models import ServiceCategory


class Command(BaseCommand):
    help = "Seed VEGA service categories with realistic service data"

    def handle(self, *args, **options):

        categories = [
            {
                "name": "Hair Styling",
                "icon": "scissors",
                "description": "Haircuts, styling, grooming and other hair care services.",
            },
            {
                "name": "Makeup & Beauty",
                "icon": "sparkles",
                "description": "Makeup, beauty treatments, bridal makeup and personal grooming.",
            },
            {
                "name": "Photography",
                "icon": "camera",
                "description": "Wedding, event, portrait, product and professional photography.",
            },
            {
                "name": "Plumbing",
                "icon": "wrench",
                "description": "Plumbing repairs, installation, leakage fixing and maintenance.",
            },
            {
                "name": "Electrical",
                "icon": "zap",
                "description": "Electrical repairs, wiring, appliance installation and maintenance.",
            },
            {
                "name": "Cleaning",
                "icon": "sparkles",
                "description": "Home, office, bathroom, kitchen and deep cleaning services.",
            },
            {
                "name": "Painting",
                "icon": "paintbrush",
                "description": "Interior, exterior, wall painting and decorative painting services.",
            },
            {
                "name": "AC & Appliance Repair",
                "icon": "fan",
                "description": "AC, refrigerator, washing machine and other appliance repairs.",
            },
            {
                "name": "Car Repair",
                "icon": "car",
                "description": "Car servicing, mechanical repairs and vehicle maintenance.",
            },
            {
                "name": "Bike Repair",
                "icon": "bike",
                "description": "Motorcycle and scooter servicing, repairs and maintenance.",
            },
            {
                "name": "Home Tutor",
                "icon": "book-open",
                "description": "School, college and competitive-exam tutoring services.",
            },
            {
                "name": "Fitness Trainer",
                "icon": "dumbbell",
                "description": "Personal training, workout planning and fitness coaching.",
            },
            {
                "name": "Yoga Trainer",
                "icon": "heart",
                "description": "Personal and group yoga training sessions.",
            },
            {
                "name": "Computer & IT Services",
                "icon": "laptop",
                "description": "Computer repair, software installation, networking and IT support.",
            },
            {
                "name": "Mobile Repair",
                "icon": "smartphone",
                "description": "Smartphone repair, screen replacement and software troubleshooting.",
            },
            {
                "name": "Photography & Videography",
                "icon": "video",
                "description": "Event videography, reels, weddings and professional video production.",
            },
            {
                "name": "Event Planning",
                "icon": "calendar",
                "description": "Birthday parties, weddings, corporate events and event management.",
            },
            {
                "name": "Catering",
                "icon": "utensils",
                "description": "Home events, parties, weddings and small-event catering services.",
            },
            {
                "name": "Tailoring",
                "icon": "scissors",
                "description": "Clothing alterations, stitching and custom tailoring.",
            },
            {
                "name": "Carpentry",
                "icon": "hammer",
                "description": "Furniture repair, woodwork, installation and custom carpentry.",
            },
            {
                "name": "Pest Control",
                "icon": "bug",
                "description": "Home and office pest control and prevention services.",
            },
            {
                "name": "Gardening",
                "icon": "leaf",
                "description": "Garden maintenance, landscaping and plant care.",
            },
            {
                "name": "Home Shifting",
                "icon": "truck",
                "description": "Packing, moving and transportation services for homes and offices.",
            },
            {
                "name": "Interior Design",
                "icon": "home",
                "description": "Interior planning, decoration and home design services.",
            },
            {
                "name": "Plaster & Masonry",
                "icon": "building",
                "description": "Construction, plastering, brickwork and masonry services.",
            },
            {
                "name": "Laundry",
                "icon": "shirt",
                "description": "Clothes washing, ironing and laundry services.",
            },
            {
                "name": "Beauty & Spa",
                "icon": "flower",
                "description": "Spa, massage, skincare and personal wellness services.",
            },
            {
                "name": "Pet Care",
                "icon": "paw-print",
                "description": "Pet grooming, walking, sitting and basic pet care services.",
            },
            {
                "name": "Delivery Services",
                "icon": "package",
                "description": "Local delivery, pickup and courier services.",
            },
            {
                "name": "Other Services",
                "icon": "wrench",
                "description": "Other local services not covered by the available categories.",
            },
        ]

        created_count = 0
        updated_count = 0

        for category_data in categories:
            category, created = ServiceCategory.objects.update_or_create(
                name=category_data["name"],
                defaults={
                    "icon": category_data["icon"],
                    "description": category_data["description"],
                    "is_active": True,
                },
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Service categories seeded successfully."
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Created: {created_count}"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Updated: {updated_count}"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Total categories: {ServiceCategory.objects.count()}"
            )
        )
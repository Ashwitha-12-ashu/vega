import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.profiles.models import UserProfile
from apps.services.models import ServiceCategory, Talent
from apps.locations.models import UserLocation
from apps.bookings.models import Booking, BookingStatus
from apps.reviews.models import Review

User = get_user_model()


class Command(BaseCommand):
    help = "Seed realistic demo providers, services, locations and bookings around Ongole, Andhra Pradesh, India."

    def handle(self, *args, **options):
        self.stdout.write("Seeding VEGA demo data for Ongole, Andhra Pradesh...")

        # 1. Categories
        categories_data = [
            {"name": "Mehendi", "icon": "sparkles", "description": "Bridal mehendi, Arabic designs, traditional henna artistry."},
            {"name": "Beauty & Makeup", "icon": "sparkles", "description": "Bridal makeover, personal grooming, facials and skin care."},
            {"name": "Cleaning", "icon": "sparkles", "description": "Deep home cleaning, bathroom sanitization, kitchen cleaning."},
            {"name": "Electrician", "icon": "zap", "description": "Wiring, switchboard fixing, fan/light installation, inverter setup."},
            {"name": "Plumber", "icon": "wrench", "description": "Pipe leakage, tap replacement, bathroom fittings, motor repairs."},
            {"name": "Home Tutor", "icon": "book-open", "description": "High school math, science coaching, competitive exam prep."},
            {"name": "Tailor", "icon": "scissors", "description": "Designer blouse stitching, dress alterations, custom tailoring."},
            {"name": "Home Cooking", "icon": "utensils", "description": "Authentic Andhra meals, special occasion catering, snacks."},
            {"name": "Appliance Repair", "icon": "wrench", "description": "Washing machine, refrigerator, AC, microwave repairs."},
            {"name": "Carpentry", "icon": "hammer", "description": "Furniture repairs, custom cupboards, door and lock installations."},
            {"name": "Painting", "icon": "paintbrush", "description": "Interior and exterior wall painting, waterproof coating."},
        ]

        categories_map = {}
        for cat_data in categories_data:
            cat, _ = ServiceCategory.objects.update_or_create(
                name=cat_data["name"],
                defaults={
                    "icon": cat_data["icon"],
                    "description": cat_data["description"],
                    "is_active": True,
                }
            )
            categories_map[cat.name] = cat

        # 2. Demo Customer (for immediate testing)
        customer, created = User.objects.update_or_create(
            username="aditya_customer",
            defaults={
                "email": "customer.ongole@vega.app",
                "first_name": "Aditya",
                "last_name": "Varma",
                "is_active": True,
            }
        )
        if created or not customer.has_usable_password():
            customer.set_password("VegaTest123!")
            customer.save()

        cust_profile, _ = UserProfile.objects.update_or_create(
            user=customer,
            defaults={
                "phone_number": "+91 98480 12345",
                "bio": "Local resident in Ongole looking for reliable home services.",
                "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
                "is_provider": False,
                "is_online": False,
            }
        )

        UserLocation.objects.update_or_create(
            user=customer,
            defaults={
                "latitude": 15.5057,
                "longitude": 80.0499,
                "address": "Opp. Collectorate Office, Trunk Road",
                "city": "Ongole",
                "state": "Andhra Pradesh",
                "postal_code": "523001",
                "country": "India",
            }
        )

        # 3. Demo Providers around Ongole
        # Ongole Center: 15.5057, 80.0499
        demo_providers_data = [
            {
                "username": "priya_mehendi",
                "email": "priya.mehendi@vega.demo",
                "first_name": "Priya",
                "last_name": "Sharma",
                "phone": "+91 98480 23456",
                "bio": "Certified bridal mehendi artist with 6+ years experience in bridal, Arabic, and Rajasthani henna patterns in Ongole.",
                "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
                "is_online": True,
                "lat": 15.5080,
                "lng": 80.0470,
                "address": "Gandhi Road, Santhapeta",
                "category": "Mehendi",
                "talent_title": "Bridal & Arabic Designer Mehendi",
                "talent_desc": "Organic dark-stain organic henna paste with intricate bridal portraits, floral wristbands, and Arabic motifs.",
                "price": 500.00,
                "experience": 6,
                "notes": "Available all days 9 AM - 8 PM. Please book 24h prior for bridal packages.",
                "rating": 4.9,
                "reviews_count": 48,
            },
            {
                "username": "anjali_makeup",
                "email": "anjali.beauty@vega.demo",
                "first_name": "Anjali",
                "last_name": "Devi",
                "phone": "+91 98480 34567",
                "bio": "Professional makeup artist specializing in South Indian bridal looks, HD reception makeup, and party glam.",
                "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
                "is_online": True,
                "lat": 15.5020,
                "lng": 80.0515,
                "address": "Opp. Municipal Stadium, Lawyerpet",
                "category": "Beauty & Makeup",
                "talent_title": "HD Bridal Makeover & Hair Styling",
                "talent_desc": "Complete bridal styling with waterproof HD makeup, saree draping, and customized flower hair design.",
                "price": 800.00,
                "experience": 5,
                "notes": "Home visits across Ongole town. High-end international cosmetic brands used.",
                "rating": 4.8,
                "reviews_count": 36,
            },
            {
                "username": "ramesh_electrician",
                "email": "ramesh.electric@vega.demo",
                "first_name": "Ramesh",
                "last_name": "Kumar",
                "phone": "+91 98480 45678",
                "bio": "Licensed master electrician in Ongole. Expert in house wiring, short-circuit fixes, MCB installations, and inverter maintenance.",
                "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
                "is_online": True,
                "lat": 15.5065,
                "lng": 80.0450,
                "address": "Beside RIMS Road, Trunk Road",
                "category": "Electrician",
                "talent_title": "Emergency Electrical Repairs & Home Wiring",
                "talent_desc": "Quick electrical diagnosis, ceiling fan fitting, LED lighting setup, and emergency short-circuit resolution.",
                "price": 350.00,
                "experience": 8,
                "notes": "Available 8 AM - 9 PM daily. Emergency callouts supported.",
                "rating": 4.9,
                "reviews_count": 62,
            },
            {
                "username": "suresh_cleaning",
                "email": "suresh.cleaning@vega.demo",
                "first_name": "Suresh",
                "last_name": "Reddy",
                "phone": "+91 98480 56789",
                "bio": "Professional cleaning supervisor with team providing residential deep cleaning and office sanitization.",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
                "is_online": True,
                "lat": 15.5180,
                "lng": 80.0380,
                "address": "Main Road, Bhagyanagar 2nd Line",
                "category": "Cleaning",
                "talent_title": "Deep Home & Bathroom Sanitization",
                "talent_desc": "Eco-friendly machine scrubbing, deep kitchen degreasing, tile stain removal, and thorough bathroom disinfection.",
                "price": 400.00,
                "experience": 4,
                "notes": "All cleaning chemicals and vacuum equipment provided by us.",
                "rating": 4.7,
                "reviews_count": 29,
            },
            {
                "username": "venkat_plumber",
                "email": "venkat.plumbing@vega.demo",
                "first_name": "Venkat",
                "last_name": "Rao",
                "phone": "+91 98480 67890",
                "bio": "Experienced plumbing technician for bathroom CPVC pipes, drainage unblocking, and water motor repairs.",
                "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
                "is_online": False,  # INACTIVE / OFFLINE on purpose to test "No active providers found near you"
                "lat": 15.5220,
                "lng": 80.0290,
                "address": "Kurnool Road, Near Bypass Junction",
                "category": "Plumber",
                "talent_title": "Plumbing Sanitary Fittings & Pipe Repair",
                "talent_desc": "Leakage repairs, overhead tank piping, tap & mixer installation, and sewer line clearing.",
                "price": 300.00,
                "experience": 7,
                "notes": "Currently offline for scheduled maintenance.",
                "rating": 4.6,
                "reviews_count": 18,
            },
            {
                "username": "kavitha_tutor",
                "email": "kavitha.tutor@vega.demo",
                "first_name": "Kavitha",
                "last_name": "Raman",
                "phone": "+91 98480 78901",
                "bio": "M.Sc. Mathematics with 9 years tutoring experience. Patient teaching methodology for Classes 8 to 10 CBSE & State boards.",
                "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
                "is_online": True,
                "lat": 15.5040,
                "lng": 80.0480,
                "address": "Gandhi Park Enclave, Court Road",
                "category": "Home Tutor",
                "talent_title": "Secondary School Mathematics & Physics",
                "talent_desc": "Concept-based tutoring, weekly tests, doubt-clearing sessions, and board exam preparation.",
                "price": 450.00,
                "experience": 9,
                "notes": "Evening batches from 4 PM - 8 PM. 1-on-1 home tutoring available.",
                "rating": 5.0,
                "reviews_count": 41,
            },
            {
                "username": "lakshmi_tailor",
                "email": "lakshmi.tailor@vega.demo",
                "first_name": "Lakshmi",
                "last_name": "Prasanna",
                "phone": "+91 98480 89012",
                "bio": "Expert women's fashion tailor. Perfect fitting for designer blouses, Maggam work kurtis, and wedding lehengas.",
                "avatar": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80",
                "is_online": True,
                "lat": 15.4920,
                "lng": 80.0620,
                "address": "Anjaiah Nagar, 4th Cross",
                "category": "Tailor",
                "talent_title": "Custom Designer Blouse & Suit Stitching",
                "talent_desc": "Aari embroidery, neck pattern design, lining attachment, and on-time doorstep delivery.",
                "price": 350.00,
                "experience": 11,
                "notes": "Doorstep measurement collection and delivery within 3 days.",
                "rating": 4.8,
                "reviews_count": 53,
            },
            {
                "username": "padma_cook",
                "email": "padma.cooking@vega.demo",
                "first_name": "Padmavathi",
                "last_name": "Akka",
                "phone": "+91 98480 90123",
                "bio": "Traditional cook with 14 years experience preparing hygienic, delicious South Indian veg & non-veg home food in Ongole.",
                "avatar": "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=400&q=80",
                "is_online": True,
                "lat": 15.5090,
                "lng": 80.0460,
                "address": "Santhapeta, Near Ramalayam Temple",
                "category": "Home Cooking",
                "talent_title": "Traditional Andhra Meals & Party Catering",
                "talent_desc": "Gongura mutton, Chepala pulusu, Avakaya biryani, Pulihora, and multi-course Andhra festive thalis.",
                "price": 300.00,
                "experience": 14,
                "notes": "Healthy home cooking with fresh spices. Daily & weekly meal subscriptions available.",
                "rating": 4.9,
                "reviews_count": 75,
            },
            {
                "username": "babu_appliance",
                "email": "babu.appliance@vega.demo",
                "first_name": "Babu",
                "last_name": "Sekhar",
                "phone": "+91 98480 01234",
                "bio": "Certified appliance technician with 6 years experience in Samsung, LG, Whirlpool washing machines and refrigerators.",
                "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
                "is_online": True,
                "lat": 15.5350,
                "lng": 80.0650,
                "address": "Pellur Ring Road, Near RTO Office",
                "category": "Appliance Repair",
                "talent_title": "Washing Machine & Refrigerator Service",
                "talent_desc": "Genuine spare parts replacement, motor troubleshooting, gas refill, and vibration damping.",
                "price": 400.00,
                "experience": 6,
                "notes": "30-day service warranty on all repair works.",
                "rating": 4.7,
                "reviews_count": 34,
            },
            {
                "username": "ravi_carpenter",
                "email": "ravi.carpentry@vega.demo",
                "first_name": "Ravi",
                "last_name": "Teja",
                "phone": "+91 98480 11223",
                "bio": "Master wood craftsman for modular kitchen assembly, teakwood doors, wardrobe fitting, and sofa repairs.",
                "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
                "is_online": True,
                "lat": 15.4620,
                "lng": 80.1250,
                "address": "Kothapatnam Beach Road, Near Toll Plaza",
                "category": "Carpentry",
                "talent_title": "Woodwork, Furniture & Door Fitting",
                "talent_desc": "Hinges, locks, custom plywood shelving, wardrobe repairs, and sliding door adjustments.",
                "price": 500.00,
                "experience": 10,
                "notes": "Toolbox and hardware parts brought to site.",
                "rating": 4.8,
                "reviews_count": 22,
            },
            {
                "username": "srinivas_painter",
                "email": "srinivas.painting@vega.demo",
                "first_name": "Srinivasulu",
                "last_name": "Reddy",
                "phone": "+91 98480 22334",
                "bio": "Contract painter for interior Asian Paints Royale finish, exterior weather coat, and damp proofing.",
                "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
                "is_online": False,
                "lat": 15.5750,
                "lng": 79.9320,
                "address": "Chimakurthy Road, Near Granites Zone",
                "category": "Painting",
                "talent_title": "Interior Royale Painting & Waterproofing",
                "talent_desc": "Two-coat putty, primer, and dust-free roller painting with color consultation.",
                "price": 350.00,
                "experience": 12,
                "notes": "Available for full home contract projects.",
                "rating": 4.5,
                "reviews_count": 12,
            },
        ]

        created_providers = []
        for p_data in demo_providers_data:
            user, u_created = User.objects.update_or_create(
                username=p_data["username"],
                defaults={
                    "email": p_data["email"],
                    "first_name": p_data["first_name"],
                    "last_name": p_data["last_name"],
                    "is_active": True,
                }
            )
            if u_created or not user.has_usable_password():
                user.set_password("VegaTest123!")
                user.save()

            profile, _ = UserProfile.objects.update_or_create(
                user=user,
                defaults={
                    "phone_number": p_data["phone"],
                    "bio": p_data["bio"],
                    "avatar": p_data["avatar"],
                    "is_provider": True,
                    "is_online": p_data["is_online"],
                    "average_rating": p_data["rating"],
                    "total_reviews": p_data["reviews_count"],
                }
            )

            UserLocation.objects.update_or_create(
                user=user,
                defaults={
                    "latitude": p_data["lat"],
                    "longitude": p_data["lng"],
                    "address": p_data["address"],
                    "city": "Ongole",
                    "state": "Andhra Pradesh",
                    "postal_code": "523001",
                    "country": "India",
                }
            )

            category = categories_map.get(p_data["category"])
            if category:
                # Deactivate other talents for user first
                Talent.objects.filter(user=user).update(is_active=False)
                talent, _ = Talent.objects.update_or_create(
                    user=user,
                    category=category,
                    title=p_data["talent_title"],
                    defaults={
                        "description": p_data["talent_desc"],
                        "price_per_hour": p_data["price"],
                        "experience_years": p_data["experience"],
                        "availability_notes": p_data["notes"],
                        "is_active": True,
                    }
                )
                created_providers.append((user, talent))

        # 4. Create sample demo reviews
        sample_reviews = [
            ("priya_mehendi", 5, "Priya did an exceptional job for our family function! The henna stain was so rich and dark. Everyone appreciated the intricate designs."),
            ("anjali_makeup", 5, "Very polite and punctual. Makeup stayed fresh all evening without any smudging. Highly recommended in Ongole!"),
            ("ramesh_electrician", 5, "Ramesh arrived within 15 minutes and fixed the inverter switchboard wiring quickly. Very reasonable charge."),
            ("suresh_cleaning", 4, "Great deep cleaning service. Kitchen stains and bathroom scale were cleaned thoroughly."),
            ("padma_cook", 5, "Authentic taste! The Andhra meals felt just like grandmother's cooking. Will book regularly."),
        ]

        # 5. Create sample bookings (demonstrating all tracking states)
        if created_providers:
            priya_user, priya_talent = created_providers[0]
            ramesh_user, ramesh_talent = created_providers[2]

            # Completed booking with Review
            b1, _ = Booking.objects.update_or_create(
                customer=customer,
                provider=priya_user,
                talent=priya_talent,
                scheduled_date=timezone.now().date(),
                defaults={
                    "category": priya_talent.category,
                    "location_address": "Opp. Collectorate Office, Trunk Road, Ongole",
                    "latitude": 15.5057,
                    "longitude": 80.0499,
                    "provider_latitude": 15.5080,
                    "provider_longitude": 80.0470,
                    "provider_location_updated_at": timezone.now(),
                    "scheduled_time": "14:00:00",
                    "price": priya_talent.price_per_hour,
                    "notes": "Bridal mehendi trial session",
                    "status": BookingStatus.CLOSED,
                    "customer_reviewed": True,
                }
            )
            Review.objects.update_or_create(
                booking=b1,
                defaults={
                    "customer": customer,
                    "provider": priya_user,
                    "rating": 5,
                    "comment": "Priya did an exceptional job for our family function! The henna stain was so rich and dark. Highly recommended!",
                }
            )

            # Active In-Progress / On The Way Booking (Ready for Live Tracking test!)
            b2, _ = Booking.objects.update_or_create(
                customer=customer,
                provider=ramesh_user,
                talent=ramesh_talent,
                scheduled_date=timezone.now().date(),
                defaults={
                    "category": ramesh_talent.category,
                    "location_address": "Opp. Collectorate Office, Trunk Road, Ongole",
                    "latitude": 15.5057,
                    "longitude": 80.0499,
                    "provider_latitude": 15.5065,
                    "provider_longitude": 80.0450,
                    "provider_location_updated_at": timezone.now(),
                    "scheduled_time": "16:00:00",
                    "price": ramesh_talent.price_per_hour,
                    "notes": "Main MCB switch trip repair",
                    "status": BookingStatus.ON_THE_WAY,
                }
            )

        self.stdout.write(self.style.SUCCESS("✓ Successfully seeded Ongole demo providers, categories, locations, and bookings."))
        self.stdout.write(self.style.SUCCESS(f"✓ Total providers: {len(demo_providers_data)} | Customer login: aditya_customer / VegaTest123!"))
